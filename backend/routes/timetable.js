const express = require('express');
const { Op } = require('sequelize');
const { Timetable, Faculty, Student, Admin } = require('../models');
const { auth, isAdmin } = require('../middleware/auth');

const router = express.Router();

const DEFAULT_TIME_SLOTS = [
  { periodNumber: 1, startTime: '09:00', endTime: '09:45' },
  { periodNumber: 2, startTime: '09:45', endTime: '10:30' },
  { periodNumber: 3, startTime: '10:30', endTime: '11:15' },
  { periodNumber: 4, startTime: '11:30', endTime: '12:15' },
  { periodNumber: 5, startTime: '12:15', endTime: '13:00' },
  { periodNumber: 6, startTime: '14:00', endTime: '14:45' },
  { periodNumber: 7, startTime: '14:45', endTime: '15:30' }
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const isFacultyAvailable = (allSchedules, facultyId, day, periodNumber) => {
  for (const schedule of allSchedules) {
    const daySchedule = schedule.find(s => s.day === day);
    if (daySchedule) {
      const period = daySchedule.periods.find(p => p.periodNumber === periodNumber);
      if (period && period.faculty && period.faculty.toString() === facultyId.toString()) return false;
    }
  }
  return true;
};

const createSubjectDistribution = (subjectAllocation) => {
  const distribution = [];
  subjectAllocation.forEach(alloc => {
    for (let i = 0; i < alloc.periodsPerWeek; i++) {
      distribution.push({ facultyId: alloc.faculty, facultyName: alloc.facultyName, subject: alloc.subject });
    }
  });
  for (let i = distribution.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [distribution[i], distribution[j]] = [distribution[j], distribution[i]];
  }
  return distribution;
};

// Admin: Get faculties for a class
router.get('/faculties/:classSection', auth, isAdmin, async (req, res) => {
  try {
    const { classSection } = req.params;

    const faculties = await Faculty.findAll({
      where: {
        classes: { [Op.contains]: [classSection] }
      },
      attributes: ['id', 'name', 'subject', 'classes']
    });

    if (faculties.length === 0) {
      return res.status(404).json({ message: 'No faculty assigned to this class' });
    }

    const facultyList = faculties.map(f => ({ facultyId: f.id, facultyName: f.name, subject: f.subject }));
    res.json(facultyList);
  } catch (error) {
    console.error('Error fetching faculties:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Generate timetable
router.post('/generate', auth, isAdmin, async (req, res) => {
  try {
    const { classSection, subjectAllocation, academicYear } = req.body;

    if (!classSection || !subjectAllocation || subjectAllocation.length === 0) {
      return res.status(400).json({ message: 'Please provide classSection and subjectAllocation' });
    }

    const totalAllocatedPeriods = subjectAllocation.reduce((sum, alloc) => sum + alloc.periodsPerWeek, 0);
    const maxPeriods = DAYS.length * DEFAULT_TIME_SLOTS.length;

    if (totalAllocatedPeriods > maxPeriods) {
      return res.status(400).json({ message: `Total periods (${totalAllocatedPeriods}) exceeds maximum available (${maxPeriods})` });
    }

    const existing = await Timetable.findOne({
      where: { classSection, academicYear: academicYear || '2024-2025', isActive: true }
    });

    if (existing) {
      return res.status(400).json({ message: `Timetable already exists for ${classSection}. Delete existing one first.` });
    }

    const existingTimetables = await Timetable.findAll({ where: { isActive: true } });
    const allExistingSchedules = existingTimetables.map(t => t.schedule);

    const subjectDistribution = createSubjectDistribution(subjectAllocation);

    const schedule = [];
    for (const day of DAYS) {
      const dayPeriods = DEFAULT_TIME_SLOTS.map(slot => ({
        periodNumber: slot.periodNumber, startTime: slot.startTime, endTime: slot.endTime,
        subject: null, faculty: null, facultyName: null
      }));
      schedule.push({ day, periods: dayPeriods });
    }

    const facultyAvailability = {};
    subjectAllocation.forEach(alloc => {
      facultyAvailability[alloc.faculty.toString()] = [];
      for (let dayIdx = 0; dayIdx < DAYS.length; dayIdx++) {
        for (let periodIdx = 0; periodIdx < DEFAULT_TIME_SLOTS.length; periodIdx++) {
          if (isFacultyAvailable(allExistingSchedules, alloc.faculty, DAYS[dayIdx], DEFAULT_TIME_SLOTS[periodIdx].periodNumber)) {
            facultyAvailability[alloc.faculty.toString()].push({ day: DAYS[dayIdx], dayIdx, periodIdx, periodNumber: DEFAULT_TIME_SLOTS[periodIdx].periodNumber });
          }
        }
      }
    });

    const sortedAllocations = subjectDistribution.sort((a, b) => {
      return (facultyAvailability[a.facultyId.toString()]?.length || 0) - (facultyAvailability[b.facultyId.toString()]?.length || 0);
    });

    let assignedCount = 0;
    const unassignedPeriods = [];

    for (const allocation of sortedAllocations) {
      const availableSlots = facultyAvailability[allocation.facultyId.toString()] || [];
      let assigned = false;

      for (const slot of availableSlots) {
        const daySchedule = schedule.find(s => s.day === slot.day);
        const period = daySchedule.periods[slot.periodIdx];
        if (!period.subject) {
          period.subject = allocation.subject;
          period.faculty = allocation.facultyId;
          period.facultyName = allocation.facultyName;
          allExistingSchedules.push([{ day: slot.day, periods: [period] }]);
          Object.keys(facultyAvailability).forEach(fId => {
            facultyAvailability[fId] = facultyAvailability[fId].filter(s => !(s.day === slot.day && s.periodNumber === slot.periodNumber));
          });
          assignedCount++;
          assigned = true;
          break;
        }
      }
      if (!assigned) unassignedPeriods.push(allocation);
    }

    for (const daySchedule of schedule) {
      for (const period of daySchedule.periods) {
        if (!period.subject) {
          period.subject = 'Free Period';
          period.faculty = subjectAllocation[0].faculty;
          period.facultyName = 'Free';
        }
      }
    }

    const timetable = await Timetable.create({
      classSection, subjectAllocation, schedule,
      academicYear: academicYear || '2024-2025',
      createdBy: req.user.id
    });

    res.status(201).json({
      message: assignedCount === totalAllocatedPeriods
        ? 'Timetable generated successfully'
        : `Timetable generated. ${unassignedPeriods.length} period(s) could not be assigned.`,
      timetable: {
        _id: timetable.id, classSection: timetable.classSection,
        requestedPeriods: totalAllocatedPeriods, assignedPeriods: assignedCount,
        unassignedPeriods: unassignedPeriods.length,
        freePeriods: maxPeriods - assignedCount, maxPeriods,
        fullyAssigned: assignedCount === totalAllocatedPeriods
      }
    });
  } catch (error) {
    console.error('Generate timetable error:', error);
    res.status(500).json({ message: 'Failed to generate timetable', error: error.message });
  }
});

// Admin: Get all timetables
router.get('/all', auth, isAdmin, async (req, res) => {
  try {
    const timetables = await Timetable.findAll({
      include: [{ model: Admin, as: 'creator', attributes: ['username'] }],
      order: [['classSection', 'ASC']]
    });
    const response = timetables.map(t => ({ ...t.toJSON(), _id: t.id, createdBy: t.creator }));
    res.json(response);
  } catch (error) {
    console.error('Error fetching all timetables:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get timetable for specific class
router.get('/class/:classSection', auth, async (req, res) => {
  try {
    const { classSection } = req.params;
    const timetable = await Timetable.findOne({ where: { classSection, isActive: true } });
    if (!timetable) return res.status(404).json({ message: 'Timetable not found for this class' });
    const response = { ...timetable.toJSON(), _id: timetable.id };
    res.json(response);
  } catch (error) {
    console.error('Error fetching timetable:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Student: Get my timetable
router.get('/my-timetable', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ message: 'Access denied. Students only.' });
    const student = await Student.findByPk(req.user.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const timetable = await Timetable.findOne({ where: { classSection: student.classSection, isActive: true } });
    if (!timetable) return res.status(404).json({ message: 'Timetable not available for your class' });
    const response = { ...timetable.toJSON(), _id: timetable.id };
    res.json(response);
  } catch (error) {
    console.error('Error fetching student timetable:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Faculty: Get my schedule
router.get('/faculty-schedule', auth, async (req, res) => {
  try {
    if (req.user.role !== 'faculty') return res.status(403).json({ message: 'Access denied. Faculty only.' });
    const faculty = await Faculty.findByPk(req.user.id);
    if (!faculty) return res.status(404).json({ message: 'Faculty not found' });

    const timetables = await Timetable.findAll({ where: { isActive: true } });

    const relevantTimetables = timetables.filter(t =>
      t.schedule.some(day => day.periods.some(p => p.faculty && p.faculty.toString() === req.user.id && p.subject !== 'Free Period'))
    );

    const facultySchedule = [];
    DAYS.forEach(day => {
      const daySchedule = { day, periods: [] };
      DEFAULT_TIME_SLOTS.forEach(timeSlot => {
        let periodInfo = null;
        for (const timetable of relevantTimetables) {
          const dayData = timetable.schedule.find(s => s.day === day);
          if (dayData) {
              const period = dayData.periods.find(p => p.periodNumber === timeSlot.periodNumber && p.faculty && p.faculty.toString() === req.user.id && p.subject !== 'Free Period');            if (period) {
              periodInfo = { periodNumber: period.periodNumber, startTime: period.startTime, endTime: period.endTime, subject: period.subject, classSection: timetable.classSection };
              break;
            }
          }
        }
        daySchedule.periods.push(periodInfo || { periodNumber: timeSlot.periodNumber, startTime: timeSlot.startTime, endTime: timeSlot.endTime, free: true });
      });
      facultySchedule.push(daySchedule);
    });

    res.json({ facultyName: faculty.name, subject: faculty.subject, classes: faculty.classes, schedule: facultySchedule });
  } catch (error) {
    console.error('Error fetching faculty schedule:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Delete timetable
router.delete('/:timetableId', auth, isAdmin, async (req, res) => {
  try {
    const { timetableId } = req.params;
    const timetable = await Timetable.findByPk(timetableId);
    if (!timetable) return res.status(404).json({ message: 'Timetable not found' });
    await timetable.destroy();
    res.json({ message: 'Timetable deleted successfully' });
  } catch (error) {
    console.error('Error deleting timetable:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get available classes
router.get('/available-classes', auth, isAdmin, async (req, res) => {
  try {
    const faculties = await Faculty.findAll({ attributes: ['classes'] });
    const classesSet = new Set();
    faculties.forEach(f => { if (f.classes) f.classes.forEach(cls => classesSet.add(cls)); });
    const availableClasses = Array.from(classesSet).sort();

    const existingTimetables = await Timetable.findAll({ where: { isActive: true }, attributes: ['classSection'] });
    const classesWithTimetables = existingTimetables.map(t => t.classSection);

    res.json({ availableClasses, classesWithTimetables });
  } catch (error) {
    console.error('Error fetching available classes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;