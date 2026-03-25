const express = require('express');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const { auth, isAdmin } = require('../middleware/auth');
const axios = require('axios');

const router = express.Router();

// Shuffle array utility
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Generate questions using Groq AI
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
    "explanation": "sin 90° = 1, which is the maximum value of the sine function. This can be verified using the unit circle."
  }
]

Requirements:
- Exactly 15 questions
- Each question must have 4 distinct options
- correctAnswer is the index (0, 1, 2, or 3) - VERIFY THIS IS CORRECT
- Mix easy, medium, and hard difficulty
- Include numerical problems where applicable
- Questions must be relevant to SSC Telangana Board syllabus
- Ensure all answers are factually correct and verified`;

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [{
          role: 'user',
          content: prompt
        }],
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
    console.log('AI Response received, parsing...');
    
    let jsonMatch = content.match(/\[[\s\S]*\]/);
    
    if (!jsonMatch) {
      jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonMatch[0] = jsonMatch[1];
      }
    }
    
    if (!jsonMatch) {
      jsonMatch = content.match(/\[\s*\{[\s\S]*\}\s*\]/);
    }
    
    if (!jsonMatch) {
      console.error('Could not parse AI response:', content);
      throw new Error('Invalid response format from AI');
    }

    const generatedQuestions = JSON.parse(jsonMatch[0]);
    
    if (!Array.isArray(generatedQuestions) || generatedQuestions.length === 0) {
      throw new Error('No questions were generated');
    }
    
    console.log(`Successfully generated ${generatedQuestions.length} questions`);
    
    return generatedQuestions.map(q => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || 'No explanation provided'
    }));

  } catch (error) {
    console.error('Error generating questions:', error.message);
    throw new Error(`Failed to generate questions: ${error.message}`);
  }
};

// Admin: Create quiz with AI-generated questions
router.post('/create', auth, isAdmin, async (req, res) => {
  try {
    const { title, subject, chapter, classSection, duration, numberOfQuestions } = req.body;

    console.log('Creating quiz with data:', { title, subject, chapter, classSection });

    // Validate input
    if (!title || !subject || !chapter || !classSection) {
      return res.status(400).json({ 
        message: 'Please provide title, subject, chapter, and classSection' 
      });
    }

    // Check for Groq API key
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        message: 'Groq API key not configured. Please add GROQ_API_KEY to .env file'
      });
    }

    // Generate questions using AI
    console.log(`Generating questions for ${subject} - ${chapter}...`);
    const questionPool = await generateQuestionsWithAI(subject, chapter);

    const quiz = new Quiz({
      title,
      subject,
      chapter,
      classSection,
      duration: duration || 1800,
      numberOfQuestions: numberOfQuestions || 10,
      questionPool,
      createdBy: req.user.id
    });

    await quiz.save();
    console.log('Quiz saved successfully:', quiz._id);

    res.status(201).json({
      message: 'Quiz created successfully with AI-generated questions',
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        subject: quiz.subject,
        chapter: quiz.chapter,
        classSection: quiz.classSection,
        questionPoolSize: quiz.questionPool.length
      }
    });

  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ 
      message: 'Failed to create quiz', 
      error: error.message 
    });
  }
});

// Admin: Get all quizzes
router.get('/all', auth, isAdmin, async (req, res) => {
  try {
    const quizzes = await Quiz.find()
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });

    console.log(`Fetched ${quizzes.length} quizzes for admin`);
    res.json(quizzes);
  } catch (error) {
    console.error('Error fetching all quizzes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Delete quiz
router.delete('/:quizId', auth, isAdmin, async (req, res) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findByIdAndDelete(quizId);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Also delete all attempts for this quiz
    await QuizAttempt.deleteMany({ quiz: quizId });

    console.log(`Quiz ${quizId} deleted successfully`);
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Student: Get available quizzes for their class
router.get('/available', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied. Students only.' });
    }

    const student = await Student.findById(req.user.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    console.log('Student classSection:', student.classSection);

    // Find all active quizzes for this student's class
    const quizzes = await Quiz.find({
      classSection: student.classSection,
      isActive: true
    }).select('-questionPool'); // Don't send question pool to frontend

    console.log(`Found ${quizzes.length} quizzes for classSection: ${student.classSection}`);

    // Check which quizzes student has already attempted
    const attempts = await QuizAttempt.find({
      student: req.user.id,
      isCompleted: true
    }).select('quiz');

    const attemptedQuizIds = attempts.map(a => a.quiz.toString());
    console.log(`Student has attempted ${attemptedQuizIds.length} quizzes`);

    const quizzesWithStatus = quizzes.map(quiz => ({
      _id: quiz._id,
      title: quiz.title,
      subject: quiz.subject,
      chapter: quiz.chapter,
      classSection: quiz.classSection,
      duration: quiz.duration,
      numberOfQuestions: quiz.numberOfQuestions,
      createdAt: quiz.createdAt,
      attempted: attemptedQuizIds.includes(quiz._id.toString())
    }));

    res.json(quizzesWithStatus);

  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Student: Start quiz attempt
router.post('/start/:quizId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied. Students only.' });
    }

    const { quizId } = req.params;
    console.log(`Student ${req.user.id} attempting to start quiz ${quizId}`);

    // Check if student has already attempted this quiz
    const existingAttempt = await QuizAttempt.findOne({
      quiz: quizId,
      student: req.user.id
    });

    if (existingAttempt) {
      console.log('Student has already attempted this quiz');
      return res.status(400).json({ 
        message: 'You have already attempted this quiz' 
      });
    }

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      console.log('Quiz not found');
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (!quiz.isActive) {
      console.log('Quiz is not active');
      return res.status(400).json({ message: 'Quiz is not active' });
    }

    console.log(`Quiz has ${quiz.questionPool.length} questions in pool`);

    // Shuffle and select random questions for this student
    const shuffledPool = shuffleArray(quiz.questionPool);
    const selectedQuestions = shuffledPool.slice(0, quiz.numberOfQuestions);

    console.log(`Selected ${selectedQuestions.length} questions for student`);

    // Create quiz attempt with student-specific questions
    const attempt = new QuizAttempt({
      quiz: quizId,
      student: req.user.id,
      questions: selectedQuestions.map(q => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation
      }))
    });

    await attempt.save();
    console.log('Quiz attempt created:', attempt._id);

    // Return questions without correct answers
    const questionsForStudent = selectedQuestions.map(q => ({
      question: q.question,
      options: q.options
    }));

    res.json({
      attemptId: attempt._id,
      questions: questionsForStudent,
      duration: quiz.duration,
      title: quiz.title,
      subject: quiz.subject,
      chapter: quiz.chapter
    });

  } catch (error) {
    console.error('Error starting quiz:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Student: Submit answer for a question
router.post('/answer/:attemptId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied. Students only.' });
    }

    const { attemptId } = req.params;
    const { questionIndex, answer } = req.body;

    const attempt = await QuizAttempt.findById(attemptId);

    if (!attempt) {
      return res.status(404).json({ message: 'Quiz attempt not found' });
    }

    if (attempt.student.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (attempt.isCompleted) {
      return res.status(400).json({ message: 'Quiz already completed' });
    }

    // Store the answer
    attempt.answers.set(questionIndex.toString(), answer);
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
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied. Students only.' });
    }

    const { attemptId } = req.params;

    const attempt = await QuizAttempt.findById(attemptId);

    if (!attempt) {
      return res.status(404).json({ message: 'Quiz attempt not found' });
    }

    if (attempt.student.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (attempt.isCompleted) {
      return res.status(400).json({ message: 'Quiz already completed' });
    }

    // Calculate score
    let correctAnswers = 0;
    attempt.questions.forEach((question, index) => {
      const studentAnswer = attempt.answers.get(index.toString());
      if (studentAnswer === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = (correctAnswers / attempt.questions.length) * 100;
    const timeTaken = Math.floor((Date.now() - attempt.startedAt) / 1000);

    attempt.score = score;
    attempt.completedAt = new Date();
    attempt.timeTaken = timeTaken;
    attempt.isCompleted = true;

    await attempt.save();

    // Populate quiz details for response
    await attempt.populate('quiz', 'title subject chapter');

    console.log(`Quiz submitted - Score: ${score}%, Time: ${timeTaken}s`);

    res.json({
      message: 'Quiz submitted successfully',
      score: score.toFixed(1),
      correctAnswers,
      totalQuestions: attempt.questions.length,
      timeTaken,
      quiz: attempt.quiz
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

    const attempt = await QuizAttempt.findById(attemptId)
      .populate('quiz', 'title subject chapter')
      .populate('student', 'name rollNumber');

    if (!attempt) {
      return res.status(404).json({ message: 'Quiz attempt not found' });
    }

    // Students can only see their own results, admins can see all
    if (req.user.role === 'student' && attempt.student._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!attempt.isCompleted) {
      return res.status(400).json({ message: 'Quiz not completed yet' });
    }

    // Prepare detailed results
    const results = attempt.questions.map((question, index) => {
      const studentAnswer = attempt.answers.get(index.toString());
      return {
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        studentAnswer: studentAnswer !== undefined ? studentAnswer : null,
        isCorrect: studentAnswer === question.correctAnswer,
        explanation: question.explanation
      };
    });

    res.json({
      quiz: attempt.quiz,
      student: attempt.student,
      score: attempt.score,
      timeTaken: attempt.timeTaken,
      completedAt: attempt.completedAt,
      results
    });

  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Student: Get my quiz history
router.get('/my-attempts', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied. Students only.' });
    }

    const attempts = await QuizAttempt.find({
      student: req.user.id,
      isCompleted: true
    })
      .populate('quiz', 'title subject chapter')
      .sort({ completedAt: -1 });

    console.log(`Fetched ${attempts.length} quiz attempts for student ${req.user.id}`);
    res.json(attempts);

  } catch (error) {
    console.error('Error fetching attempts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Get all quiz attempts with statistics
router.get('/attempts/all', auth, isAdmin, async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ isCompleted: true })
      .populate('student', 'name rollNumber classSection')
      .populate('quiz', 'title subject chapter')
      .sort({ completedAt: -1 });

    console.log(`Fetched ${attempts.length} total quiz attempts`);
    res.json(attempts);

  } catch (error) {
    console.error('Error fetching attempts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Faculty: Get quiz results for my subject and classes
router.get('/faculty-results', auth, async (req, res) => {
  try {
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Access denied. Faculty only.' });
    }

    const faculty = await Faculty.findById(req.user.id);
    
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    console.log(`Fetching quiz results for faculty: ${faculty.name}, Subject: ${faculty.subject}`);

    // Get all quizzes for this faculty's subject and classes
    const quizzes = await Quiz.find({
      subject: faculty.subject,
      classSection: { $in: faculty.classes },
      isActive: true
    }).select('_id title subject chapter classSection');

    if (quizzes.length === 0) {
      return res.json({
        faculty: {
          name: faculty.name,
          subject: faculty.subject,
          classes: faculty.classes
        },
        quizzes: [],
        attempts: []
      });
    }

    const quizIds = quizzes.map(q => q._id);

    // Get all completed attempts for these quizzes
    const attempts = await QuizAttempt.find({
      quiz: { $in: quizIds },
      isCompleted: true
    })
      .populate('student', 'name rollNumber classSection')
      .populate('quiz', 'title subject chapter classSection')
      .sort({ completedAt: -1 });

    // Calculate statistics
    const statistics = {
      totalAttempts: attempts.length,
      totalQuizzes: quizzes.length,
      averageScore: attempts.length > 0 
        ? (attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length).toFixed(2)
        : 0,
      byClass: {}
    };

    // Group by class
    faculty.classes.forEach(cls => {
      const classAttempts = attempts.filter(a => a.student.classSection === cls);
      statistics.byClass[cls] = {
        totalAttempts: classAttempts.length,
        averageScore: classAttempts.length > 0
          ? (classAttempts.reduce((sum, a) => sum + a.score, 0) / classAttempts.length).toFixed(2)
          : 0
      };
    });

    console.log(`Found ${attempts.length} quiz attempts across ${quizzes.length} quizzes`);

    res.json({
      faculty: {
        name: faculty.name,
        subject: faculty.subject,
        classes: faculty.classes
      },
      quizzes,
      attempts,
      statistics
    });

  } catch (error) {
    console.error('Error fetching faculty quiz results:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;