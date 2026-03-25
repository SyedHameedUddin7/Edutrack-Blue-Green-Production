const express = require('express');
const { Op } = require('sequelize');
const { Quiz, QuizAttempt, Student, Faculty, Admin } = require('../models');
const { auth, isAdmin } = require('../middleware/auth');
const axios = require('axios');

const router = express.Router();

const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const generateQuestionsWithAI = async (subject, chapter) => {
  const prompt = `You are an expert teacher creating exam questions for Class 10 SSC Telangana Board students.

Generate exactly 15 multiple-choice questions on:
Subject: ${subject}
Chapter: ${chapter}

CRITICAL REQUIREMENTS:
1. The correctAnswer MUST be verified and accurate
2. Only one option should be correct
3. Double-check all numerical calculations
4. Ensure scientific/historical facts are accurate
5. For mathematical questions, verify the answer by solving it

IMPORTANT: Return ONLY a valid JSON array. Do not include any other text, explanations, or markdown formatting.

Use this exact format:
[
  {
    "question": "What is the value of sin 90 degrees?",
    "options": ["0", "1", "√3/2", "1/2"],
    "correctAnswer": 1,
    "explanation": "sin 90° = 1, which is the maximum value of the sine function."
  }
]

Requirements:
- Exactly 15 questions
- Each question must have 4 distinct options
- correctAnswer is the index (0, 1, 2, or 3)
- Mix easy, medium, and hard difficulty
- Questions must be relevant to SSC Telangana Board syllabus`;

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 6000,
        temperature: 0.3
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        }
      }
    );

    const content = response.data.choices[0].message.content;
    let jsonMatch = content.match(/\[[\s\S]*\]/) || content.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) jsonMatch[0] = jsonMatch[1];
    if (!jsonMatch) throw new Error('Invalid response format from AI');

    const generated = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(generated) || generated.length === 0) throw new Error('No questions generated');

    return generated.map(q => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || 'No explanation provided'
    }));
  } catch (error) {
    throw new Error(`Failed to generate questions: ${error.message}`);
  }
};

// Admin: Create quiz
router.post('/create', auth, isAdmin, async (req, res) => {
  try {
    const { title, subject, chapter, classSection, duration, numberOfQuestions } = req.body;
    if (!title || !subject || !chapter || !classSection) {
      return res.status(400).json({ message: 'Please provide title, subject, chapter, and classSection' });
    }
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ message: 'Groq API key not configured' });
    }

    const questionPool = await generateQuestionsWithAI(subject, chapter);
    const quiz = await Quiz.create({
      title, subject, chapter, classSection,
      duration: duration || 1800,
      numberOfQuestions: numberOfQuestions || 10,
      questionPool,
      createdBy: req.user.id
    });

    res.status(201).json({
      message: 'Quiz created successfully with AI-generated questions',
      quiz: { _id: quiz.id, title: quiz.title, subject: quiz.subject, chapter: quiz.chapter, classSection: quiz.classSection, questionPoolSize: quiz.questionPool.length }
    });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ message: 'Failed to create quiz', error: error.message });
  }
});

// Admin: Get all quizzes
router.get('/all', auth, isAdmin, async (req, res) => {
  try {
    const quizzes = await Quiz.findAll({
      include: [{ model: Admin, as: 'creator', attributes: ['username'] }],
      order: [['createdAt', 'DESC']]
    });
    const response = quizzes.map(q => ({ ...q.toJSON(), _id: q.id, createdBy: q.creator }));
    res.json(response);
  } catch (error) {
    console.error('Error fetching all quizzes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Delete quiz
router.delete('/:quizId', auth, isAdmin, async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findByPk(quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    await QuizAttempt.destroy({ where: { quizId } });
    await quiz.destroy();
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Student: Get available quizzes
router.get('/available', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ message: 'Access denied. Students only.' });

    const student = await Student.findByPk(req.user.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const quizzes = await Quiz.findAll({
      where: { classSection: student.classSection, isActive: true },
      attributes: { exclude: ['questionPool'] }
    });

    const attempts = await QuizAttempt.findAll({
      where: { studentId: req.user.id, isCompleted: true },
      attributes: ['quizId']
    });
    const attemptedQuizIds = attempts.map(a => a.quizId);

    const response = quizzes.map(quiz => ({
      _id: quiz.id, title: quiz.title, subject: quiz.subject, chapter: quiz.chapter,
      classSection: quiz.classSection, duration: quiz.duration, numberOfQuestions: quiz.numberOfQuestions,
      createdAt: quiz.createdAt, attempted: attemptedQuizIds.includes(quiz.id)
    }));

    res.json(response);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Student: Start quiz
router.post('/start/:quizId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ message: 'Access denied. Students only.' });
    const { quizId } = req.params;

    const existingAttempt = await QuizAttempt.findOne({ where: { quizId, studentId: req.user.id } });
    if (existingAttempt) return res.status(400).json({ message: 'You have already attempted this quiz' });

    const quiz = await Quiz.findByPk(quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (!quiz.isActive) return res.status(400).json({ message: 'Quiz is not active' });

    const shuffledPool = shuffleArray(quiz.questionPool);
    const selectedQuestions = shuffledPool.slice(0, quiz.numberOfQuestions);

    const attempt = await QuizAttempt.create({
      quizId, studentId: req.user.id,
      questions: selectedQuestions.map(q => ({ question: q.question, options: q.options, correctAnswer: q.correctAnswer, explanation: q.explanation }))
    });

    const questionsForStudent = selectedQuestions.map(q => ({ question: q.question, options: q.options }));
    res.json({ attemptId: attempt.id, questions: questionsForStudent, duration: quiz.duration, title: quiz.title, subject: quiz.subject, chapter: quiz.chapter });
  } catch (error) {
    console.error('Error starting quiz:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Student: Submit answer
router.post('/answer/:attemptId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ message: 'Access denied. Students only.' });
    const { attemptId } = req.params;
    const { questionIndex, answer } = req.body;

    const attempt = await QuizAttempt.findByPk(attemptId);
    if (!attempt) return res.status(404).json({ message: 'Quiz attempt not found' });
    if (attempt.studentId !== req.user.id) return res.status(403).json({ message: 'Access denied' });
    if (attempt.isCompleted) return res.status(400).json({ message: 'Quiz already completed' });

    const answers = attempt.answers || {};
    answers[questionIndex.toString()] = answer;
    attempt.answers = answers;
    attempt.changed('answers', true);
    await attempt.save();

    res.json({ message: 'Answer saved' });
  } catch (error) {
    console.error('Error saving answer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Student: Submit quiz
router.post('/submit/:attemptId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ message: 'Access denied. Students only.' });
    const { attemptId } = req.params;

    const attempt = await QuizAttempt.findByPk(attemptId, {
      include: [{ model: Quiz, as: 'quiz', attributes: ['title', 'subject', 'chapter'] }]
    });
    if (!attempt) return res.status(404).json({ message: 'Quiz attempt not found' });
    if (attempt.studentId !== req.user.id) return res.status(403).json({ message: 'Access denied' });
    if (attempt.isCompleted) return res.status(400).json({ message: 'Quiz already completed' });

    let correctAnswers = 0;
    attempt.questions.forEach((question, index) => {
      const studentAnswer = attempt.answers[index.toString()];
      if (studentAnswer === question.correctAnswer) correctAnswers++;
    });

    const score = (correctAnswers / attempt.questions.length) * 100;
    const timeTaken = Math.floor((Date.now() - new Date(attempt.startedAt).getTime()) / 1000);

    attempt.score = score;
    attempt.completedAt = new Date();
    attempt.timeTaken = timeTaken;
    attempt.isCompleted = true;
    await attempt.save();

    res.json({
      message: 'Quiz submitted successfully', score: score.toFixed(1),
      correctAnswers, totalQuestions: attempt.questions.length, timeTaken, quiz: attempt.quiz
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Student: Get quiz results
router.get('/results/:attemptId', auth, async (req, res) => {
  try {
    const { attemptId } = req.params;
    const attempt = await QuizAttempt.findByPk(attemptId, {
      include: [
        { model: Quiz, as: 'quiz', attributes: ['title', 'subject', 'chapter'] },
        { model: Student, as: 'student', attributes: ['name', 'rollNumber'] }
      ]
    });
    if (!attempt) return res.status(404).json({ message: 'Quiz attempt not found' });
    if (req.user.role === 'student' && attempt.studentId !== req.user.id) return res.status(403).json({ message: 'Access denied' });
    if (!attempt.isCompleted) return res.status(400).json({ message: 'Quiz not completed yet' });

    const results = attempt.questions.map((question, index) => {
      const studentAnswer = attempt.answers[index.toString()];
      return {
        question: question.question, options: question.options, correctAnswer: question.correctAnswer,
        studentAnswer: studentAnswer !== undefined ? studentAnswer : null,
        isCorrect: studentAnswer === question.correctAnswer, explanation: question.explanation
      };
    });

    const studentResponse = attempt.student ? { ...attempt.student.toJSON(), _id: attempt.student.id } : null;
    res.json({ quiz: attempt.quiz, student: studentResponse, score: attempt.score, timeTaken: attempt.timeTaken, completedAt: attempt.completedAt, results });
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Student: Get my quiz history
router.get('/my-attempts', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ message: 'Access denied. Students only.' });
    const attempts = await QuizAttempt.findAll({
      where: { studentId: req.user.id, isCompleted: true },
      include: [{ model: Quiz, as: 'quiz', attributes: ['title', 'subject', 'chapter'] }],
      order: [['completedAt', 'DESC']]
    });
    const response = attempts.map(a => ({ ...a.toJSON(), _id: a.id }));
    res.json(response);
  } catch (error) {
    console.error('Error fetching attempts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get all quiz attempts
router.get('/attempts/all', auth, isAdmin, async (req, res) => {
  try {
    const attempts = await QuizAttempt.findAll({
      where: { isCompleted: true },
      include: [
        { model: Student, as: 'student', attributes: ['name', 'rollNumber', 'classSection'] },
        { model: Quiz, as: 'quiz', attributes: ['title', 'subject', 'chapter'] }
      ],
      order: [['completedAt', 'DESC']]
    });
    const response = attempts.map(a => ({ ...a.toJSON(), _id: a.id }));
    res.json(response);
  } catch (error) {
    console.error('Error fetching attempts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Faculty: Get quiz results
router.get('/faculty-results', auth, async (req, res) => {
  try {
    if (req.user.role !== 'faculty') return res.status(403).json({ message: 'Access denied. Faculty only.' });

    const faculty = await Faculty.findByPk(req.user.id);
    if (!faculty) return res.status(404).json({ message: 'Faculty not found' });

    const quizzes = await Quiz.findAll({
      where: { subject: faculty.subject, classSection: { [Op.in]: faculty.classes }, isActive: true },
      attributes: ['id', 'title', 'subject', 'chapter', 'classSection']
    });

    if (quizzes.length === 0) {
      return res.json({ faculty: { name: faculty.name, subject: faculty.subject, classes: faculty.classes }, quizzes: [], attempts: [] });
    }

    const quizIds = quizzes.map(q => q.id);
    const attempts = await QuizAttempt.findAll({
      where: { quizId: { [Op.in]: quizIds }, isCompleted: true },
      include: [
        { model: Student, as: 'student', attributes: ['name', 'rollNumber', 'classSection'] },
        { model: Quiz, as: 'quiz', attributes: ['title', 'subject', 'chapter', 'classSection'] }
      ],
      order: [['completedAt', 'DESC']]
    });

    const statistics = {
      totalAttempts: attempts.length, totalQuizzes: quizzes.length,
      averageScore: attempts.length > 0 ? (attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length).toFixed(2) : 0,
      byClass: {}
    };

    faculty.classes.forEach(cls => {
      const classAttempts = attempts.filter(a => a.student && a.student.classSection === cls);
      statistics.byClass[cls] = {
        totalAttempts: classAttempts.length,
        averageScore: classAttempts.length > 0 ? (classAttempts.reduce((sum, a) => sum + a.score, 0) / classAttempts.length).toFixed(2) : 0
      };
    });

    const quizzesResponse = quizzes.map(q => ({ ...q.toJSON(), _id: q.id }));
    const attemptsResponse = attempts.map(a => ({ ...a.toJSON(), _id: a.id }));

    res.json({ faculty: { name: faculty.name, subject: faculty.subject, classes: faculty.classes }, quizzes: quizzesResponse, attempts: attemptsResponse, statistics });
  } catch (error) {
    console.error('Error fetching faculty quiz results:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;