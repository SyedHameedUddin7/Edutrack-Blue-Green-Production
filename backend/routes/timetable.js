const express = require('express');
const Timetable = require('../models/Timetable');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');
const { auth, isAdmin } = require('../middleware/auth');
 
const router = express.Router();
 
// Default time slots configuration
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
 
// Helper function to check if a faculty is already assigned at a specific time
const isFacultyAvailable = (allSchedules, facultyId, day, periodNumber) => {
  for (const schedule of allSchedules) {
    const daySchedule = schedule.find(s => s.day === day);
    if (daySchedule) {
      const period = daySchedule.periods.find(p => p.periodNumber === periodNumber);
      if (period && period.faculty && period.faculty.toString() === facultyId.toString()) {
        return false;
      }
    }
  }
  return true;
};
 
// Helper function to create subject distribution based on allocation
const createSubjectDistribution = (subjectAllocation) => {
  const distribution = [];
 
  subjectAllocation.forEach(allocation => {
    for (let i = 0; i < allocation.periodsPerWeek; i++) {
      distribution.push({
        facultyId: allocation.faculty,
        facultyName: allocation.facultyName,
        subject: allocation.subject
      });
    }
  });
 
  // Shuffle to avoid same subject consecutively
  for (let i = distribution.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [distribution[i], distribution[j]] = [distribution[j], distribution[i]];
  }
 
  return distribution;
};
 
// Admin: Get faculties for a specific class
router.get('/faculties/:classSection', auth, isAdmin, async (req, res) => {
  try {
    const { classSection } = req.params;
 
    console.log('Fetching faculties for class:', classSection);
 
    const faculties = await Faculty.find({
      classes: classSection
    }).select('name subject');
 
    if (faculties.length === 0) {
      return res.status(404).json({
        message: 'No faculty assigned to this class'
      });
    }
 
    const facultyList = faculties.map(f => ({
      facultyId: f._id,
      facultyName: f.name,
      subject: f.subject
    }));
 
    res.json(facultyList);
 
  } catch (error) {
    console.error('Error fetching faculties:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
 
// Admin: Generate timetable with custom subject allocation
router.post('/generate', auth, isAdmin, async (req, res) => {
  try {
    const { classSection, subjectAllocation, academicYear } = req.body;
 
    console.log('\n========================================');
    console.log(`Generating timetable for: ${classSection}`);
    console.log('========================================');
 
    // Validate input
    if (!classSection || !subjectAllocation || subjectAllocation.length === 0) {
      return res.status(400).json({
        message: 'Please provide classSection and subjectAllocation'
      });
    }
 
    // Validate total periods
    const totalAllocatedPeriods = subjectAllocation.reduce(
      (sum, alloc) => sum + alloc.periodsPerWeek, 0
    );
    const maxPeriods = DAYS.length * DEFAULT_TIME_SLOTS.length;
 
    if (totalAllocatedPeriods > maxPeriods) {
      return res.status(400).json({
        message: `Total periods (${totalAllocatedPeriods}) exceeds maximum available (${maxPeriods})`
      });
    }
 
    // Check if timetable already exists
    const existing = await Timetable.findOne({
      classSection,
      academicYear: academicYear || '2024-2025',
      isActive: true
    });
 
    if (existing) {
      return res.status(400).json({
        message: `Timetable already exists for ${classSection}. Delete existing one first.`
      });
    }
 
    // Get ALL existing active timetables' schedules to check for conflicts
    const existingTimetables = await Timetable.find({ isActive: true });
    const allExistingSchedules = existingTimetables.map(t => t.schedule);
 
    console.log(`Found ${existingTimetables.length} existing timetables for collision checking`);
 
    // Create subject distribution based on allocation
    const subjectDistribution = createSubjectDistribution(subjectAllocation);
    console.log(`Total periods to allocate: ${subjectDistribution.length}\n`);
 
    // Initialize empty schedule
    const schedule = [];
    for (const day of DAYS) {
      const dayPeriods = DEFAULT_TIME_SLOTS.map(slot => ({
        periodNumber: slot.periodNumber,
        startTime: slot.startTime,
        endTime: slot.endTime,
        subject: null,
        faculty: null,
        facultyName: null
      }));
      schedule.push({ day, periods: dayPeriods });
    }
 
    // Build availability matrix for each faculty
    const facultyAvailability = {};
    subjectAllocation.forEach(alloc => {
      facultyAvailability[alloc.faculty.toString()] = [];
     
      for (let dayIdx = 0; dayIdx < DAYS.length; dayIdx++) {
        const day = DAYS[dayIdx];
        for (let periodIdx = 0; periodIdx < DEFAULT_TIME_SLOTS.length; periodIdx++) {
          const period = DEFAULT_TIME_SLOTS[periodIdx];
         
          if (isFacultyAvailable(allExistingSchedules, alloc.faculty, day, period.periodNumber)) {
            facultyAvailability[alloc.faculty.toString()].push({
              day,
              dayIdx,
              periodIdx,
              periodNumber: period.periodNumber
            });
          }
        }
      }
     
      console.log(`${alloc.facultyName} (${alloc.subject}): ${facultyAvailability[alloc.faculty.toString()].length} available slots`);
    });
 
    // Sort allocations by scarcity (least available slots first)
    const sortedAllocations = subjectDistribution.sort((a, b) => {
      const availA = facultyAvailability[a.facultyId.toString()].length;
      const availB = facultyAvailability[b.facultyId.toString()].length;
      return availA - availB; // Assign scarce teachers first
    });
 
    console.log('\n--- Starting Smart Allocation ---\n');
 
    let assignedCount = 0;
    const unassignedPeriods = [];
 
    // SMART ALLOCATION: Prioritize teachers with fewer available slots
    for (const allocation of sortedAllocations) {
      const availableSlots = facultyAvailability[allocation.facultyId.toString()];
     
      if (availableSlots.length === 0) {
        console.log(`✗ ${allocation.facultyName} (${allocation.subject}) - No available slots!`);
        unassignedPeriods.push(allocation);
        continue;
      }
 
      // Find an available slot that's not already filled
      let assigned = false;
      for (const slot of availableSlots) {
        const daySchedule = schedule.find(s => s.day === slot.day);
        const period = daySchedule.periods[slot.periodIdx];
       
        if (!period.subject) {
          // Slot is empty, assign it
          period.subject = allocation.subject;
          period.faculty = allocation.facultyId;
          period.facultyName = allocation.facultyName;
 
          console.log(`✓ Assigned ${allocation.facultyName} (${allocation.subject}) to ${slot.day} Period ${slot.periodNumber}`);
 
          // Mark this slot as used for future allocations
          allExistingSchedules.push([{
            day: slot.day,
            periods: [period]
          }]);
 
          // Remove this slot from all faculty availability
          Object.keys(facultyAvailability).forEach(facultyId => {
            facultyAvailability[facultyId] = facultyAvailability[facultyId].filter(
              s => !(s.day === slot.day && s.periodNumber === slot.periodNumber)
            );
          });
 
          assignedCount++;
          assigned = true;
          break;
        }
      }
 
      if (!assigned) {
        console.log(`✗ ${allocation.facultyName} (${allocation.subject}) - All available slots already filled`);
        unassignedPeriods.push(allocation);
      }
    }
 
    // Fill remaining empty slots with Free Periods
    for (const daySchedule of schedule) {
      for (const period of daySchedule.periods) {
        if (!period.subject) {
          period.subject = 'Free Period';
          period.faculty = subjectAllocation[0].faculty;
          period.facultyName = 'Free';
        }
      }
    }
 
    const freePeriods = maxPeriods - assignedCount;
 
    console.log('\n========================================');
    console.log(`Generation Summary for ${classSection}:`);
    console.log(`- Requested periods: ${totalAllocatedPeriods}`);
    console.log(`- Successfully assigned: ${assignedCount}`);
    console.log(`- Unassigned (conflicts): ${unassignedPeriods.length}`);
    console.log(`- Free periods: ${freePeriods}`);
    console.log('========================================\n');
 
    if (unassignedPeriods.length > 0) {
      console.log('⚠️ Unassigned periods due to teacher conflicts:');
      const unassignedSummary = {};
      unassignedPeriods.forEach(p => {
        const key = `${p.facultyName} (${p.subject})`;
        unassignedSummary[key] = (unassignedSummary[key] || 0) + 1;
      });
      Object.entries(unassignedSummary).forEach(([teacher, count]) => {
        console.log(`   - ${teacher}: ${count} period(s)`);
      });
    }
 
    // Create timetable document
    const timetable = new Timetable({
      classSection,
      subjectAllocation,
      schedule,
      academicYear: academicYear || '2024-2025',
      createdBy: req.user.id
    });
 
    await timetable.save();
 
    console.log(`✅ Timetable saved successfully for ${classSection}\n`);
 
    res.status(201).json({
      message: assignedCount === totalAllocatedPeriods
        ? 'Timetable generated successfully'
        : `Timetable generated. ${unassignedPeriods.length} period(s) could not be assigned due to teacher conflicts.`,
      timetable: {
        _id: timetable._id,
        classSection: timetable.classSection,
        requestedPeriods: totalAllocatedPeriods,
        assignedPeriods: assignedCount,
        unassignedPeriods: unassignedPeriods.length,
        freePeriods: freePeriods,
        maxPeriods,
        fullyAssigned: assignedCount === totalAllocatedPeriods
      }
    });
 
  } catch (error) {
    console.error('Generate timetable error:', error);
    res.status(500).json({
      message: 'Failed to generate timetable',
      error: error.message
    });
  }
});
 
// Admin: Get all timetables
router.get('/all', auth, isAdmin, async (req, res) => {
  try {
    const timetables = await Timetable.find()
      .populate('createdBy', 'username')
      .populate('schedule.periods.faculty', 'name subject')
      .sort({ classSection: 1 });
 
    console.log(`Fetched ${timetables.length} timetables for admin`);
    res.json(timetables);
  } catch (error) {
    console.error('Error fetching all timetables:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
 
// Admin: Get timetable for specific class
router.get('/class/:classSection', auth, async (req, res) => {
  try {
    const { classSection } = req.params;
 
    const timetable = await Timetable.findOne({
      classSection,
      isActive: true
    }).populate('schedule.periods.faculty', 'name subject');
 
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found for this class' });
    }
 
    res.json(timetable);
  } catch (error) {
    console.error('Error fetching timetable:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
 
// Student: Get my timetable
router.get('/my-timetable', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied. Students only.' });
    }
 
    const student = await Student.findById(req.user.id);
   
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
 
    const timetable = await Timetable.findOne({
      classSection: student.classSection,
      isActive: true
    }).populate('schedule.periods.faculty', 'name subject');
 
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not available for your class' });
    }
 
    res.json(timetable);
  } catch (error) {
    console.error('Error fetching student timetable:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
 
// Faculty: Get my timetable
router.get('/faculty-schedule', auth, async (req, res) => {
  try {
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Access denied. Faculty only.' });
    }
 
    const faculty = await Faculty.findById(req.user.id);
   
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }
 
    // Get all timetables where this faculty is assigned
    const timetables = await Timetable.find({
      'schedule.periods.faculty': req.user.id,
      isActive: true
    });
 
    // Build faculty's schedule
    const facultySchedule = [];
 
    DAYS.forEach(day => {
      const daySchedule = {
        day,
        periods: []
      };
 
      DEFAULT_TIME_SLOTS.forEach(timeSlot => {
        let periodInfo = null;
 
        // Check each timetable for this faculty at this time
        for (const timetable of timetables) {
          const dayData = timetable.schedule.find(s => s.day === day);
          if (dayData) {
            const period = dayData.periods.find(p =>
              p.periodNumber === timeSlot.periodNumber &&
              p.faculty.toString() === req.user.id
            );
            if (period) {
              periodInfo = {
                periodNumber: period.periodNumber,
                startTime: period.startTime,
                endTime: period.endTime,
                subject: period.subject,
                classSection: timetable.classSection
              };
              break;
            }
          }
        }
 
        daySchedule.periods.push(periodInfo || {
          periodNumber: timeSlot.periodNumber,
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime,
          free: true
        });
      });
 
      facultySchedule.push(daySchedule);
    });
 
    res.json({
      facultyName: faculty.name,
      subject: faculty.subject,
      classes: faculty.classes,
      schedule: facultySchedule
    });
 
  } catch (error) {
    console.error('Error fetching faculty schedule:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
 
// Admin: Delete timetable
router.delete('/:timetableId', auth, isAdmin, async (req, res) => {
  try {
    const { timetableId } = req.params;
 
    const timetable = await Timetable.findByIdAndDelete(timetableId);
 
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable not found' });
    }
 
    console.log(`Timetable deleted for ${timetable.classSection}`);
    res.json({ message: 'Timetable deleted successfully' });
  } catch (error) {
    console.error('Error deleting timetable:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
 
// Admin: Get available classes for timetable generation
router.get('/available-classes', auth, isAdmin, async (req, res) => {
  try {
    // Get all unique class-sections from Faculty model
    const faculties = await Faculty.find().select('classes');
   
    const classesSet = new Set();
    faculties.forEach(faculty => {
      faculty.classes.forEach(cls => classesSet.add(cls));
    });
 
    const availableClasses = Array.from(classesSet).sort();
 
    // Get classes that already have timetables
    const existingTimetables = await Timetable.find({ isActive: true }).select('classSection');
    const classesWithTimetables = existingTimetables.map(t => t.classSection);
 
    res.json({
      availableClasses,
      classesWithTimetables
    });
 
  } catch (error) {
    console.error('Error fetching available classes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
 
module.exports = router;
 