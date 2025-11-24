// AI-powered study suggestions based on quiz performance
export const generateStudySuggestions = (assignment, submission) => {
  const score = submission.score || 0;
  const accuracy = submission.accuracy || 0;
  const courseName = assignment.course?.name || 'this subject';
  const assignmentTitle = assignment.title;
  
  const suggestions = [];
  
  // Score-based suggestions
  if (score < 40) {
    suggestions.push({
      icon: '📚',
      title: 'Review Fundamentals',
      description: `Your score of ${score.toFixed(1)}% indicates you need to strengthen your foundation in ${courseName}. Start by reviewing the basic concepts and notes provided by your teacher.`,
      priority: 'high',
      actions: [
        'Re-read course notes and materials',
        'Watch tutorial videos on the topic',
        'Create flashcards for key concepts',
        'Ask your teacher for clarification on difficult topics'
      ]
    });
    
    suggestions.push({
      icon: '👥',
      title: 'Study Group',
      description: 'Consider forming a study group with classmates who performed well. Collaborative learning can help you understand concepts better.',
      priority: 'high',
      actions: [
        'Find 2-3 study partners',
        'Schedule regular study sessions',
        'Teach each other difficult concepts',
        'Share notes and resources'
      ]
    });
  } else if (score < 60) {
    suggestions.push({
      icon: '🎯',
      title: 'Focus on Weak Areas',
      description: `You scored ${score.toFixed(1)}%. You're on the right track, but there's room for improvement. Identify the topics you struggled with and focus your study efforts there.`,
      priority: 'medium',
      actions: [
        'Review questions you got wrong',
        'Practice similar problems',
        'Create a study schedule focusing on weak topics',
        'Use online resources for additional practice'
      ]
    });
  } else if (score < 80) {
    suggestions.push({
      icon: '⭐',
      title: 'Almost There!',
      description: `Good job! You scored ${score.toFixed(1)}%. With a bit more practice, you can achieve excellence. Focus on perfecting your understanding.`,
      priority: 'low',
      actions: [
        'Review incorrect answers carefully',
        'Practice advanced problems',
        'Help others to reinforce your knowledge',
        'Take practice tests to improve speed and accuracy'
      ]
    });
  }
  
  // Time-based suggestions
  if (submission.totalTimeTaken) {
    const timeInMinutes = Math.floor(submission.totalTimeTaken / 60);
    const totalTime = assignment.totalTime || 60;
    
    if (timeInMinutes < totalTime * 0.3) {
      suggestions.push({
        icon: '⏱️',
        title: 'Take Your Time',
        description: `You completed this in ${timeInMinutes} minutes. While speed is good, make sure you're reading questions carefully and not rushing through answers.`,
        priority: 'medium',
        actions: [
          'Read each question twice before answering',
          'Double-check your answers before submitting',
          'Use the full time available',
          'Practice mindful test-taking'
        ]
      });
    } else if (timeInMinutes > totalTime * 0.9) {
      suggestions.push({
        icon: '🏃',
        title: 'Improve Speed',
        description: `You used ${timeInMinutes} out of ${totalTime} minutes. Practice more to improve your speed while maintaining accuracy.`,
        priority: 'medium',
        actions: [
          'Practice timed quizzes regularly',
          'Learn to identify key information quickly',
          'Skip difficult questions and return later',
          'Improve your reading speed'
        ]
      });
    }
  }
  
  // Tab switching warning
  if (submission.tabSwitches > 0) {
    suggestions.push({
      icon: '⚠️',
      title: 'Stay Focused',
      description: `You switched tabs ${submission.tabSwitches} times during the quiz. This can affect your concentration and score. Try to stay focused on the task.`,
      priority: 'high',
      actions: [
        'Find a quiet study environment',
        'Turn off notifications during quizzes',
        'Close unnecessary browser tabs',
        'Practice mindfulness and concentration exercises'
      ]
    });
  }
  
  // Accuracy-based suggestions
  if (accuracy < score - 10) {
    suggestions.push({
      icon: '🎲',
      title: 'Avoid Guessing',
      description: 'Your accuracy is lower than your score, suggesting some lucky guesses. Focus on understanding concepts rather than guessing.',
      priority: 'medium',
      actions: [
        'Study the material thoroughly before attempting quizzes',
        'Eliminate obviously wrong answers first',
        'Use logical reasoning instead of guessing',
        'Ask for help when concepts are unclear'
      ]
    });
  }
  
  // General improvement suggestions
  suggestions.push({
    icon: '💡',
    title: 'Study Tips',
    description: 'General strategies to improve your performance in future assessments.',
    priority: 'low',
    actions: [
      'Create a consistent study schedule',
      'Use active recall and spaced repetition',
      'Take regular breaks during study sessions',
      'Get adequate sleep before exams',
      'Practice past papers and sample questions',
      'Maintain a healthy diet and exercise routine'
    ]
  });
  
  // Resource recommendations
  suggestions.push({
    icon: '🔗',
    title: 'Recommended Resources',
    description: 'Additional learning resources to help you improve.',
    priority: 'low',
    actions: [
      'Khan Academy - Free online courses',
      'YouTube educational channels',
      'Course textbooks and reference materials',
      'Online practice quiz platforms',
      'Teacher office hours for one-on-one help'
    ]
  });
  
  return suggestions;
};

// Generate motivational message based on score
export const getMotivationalMessage = (score) => {
  if (score >= 90) {
    return {
      message: "Outstanding! You're mastering this subject! 🌟",
      color: 'green',
      emoji: '🎉'
    };
  } else if (score >= 80) {
    return {
      message: "Great work! You're doing really well! Keep it up! 💪",
      color: 'blue',
      emoji: '👏'
    };
  } else if (score >= 70) {
    return {
      message: "Good job! You're on the right track. A bit more practice will get you to excellence! 📈",
      color: 'teal',
      emoji: '👍'
    };
  } else if (score >= 60) {
    return {
      message: "You're making progress! Focus on your weak areas and you'll improve quickly! 🎯",
      color: 'yellow',
      emoji: '💪'
    };
  } else if (score >= 40) {
    return {
      message: "Don't give up! Every expert was once a beginner. Review the material and try again! 🌱",
      color: 'orange',
      emoji: '🌟'
    };
  } else {
    return {
      message: "This is a learning opportunity! Review the basics, ask for help, and you'll improve! 📚",
      color: 'red',
      emoji: '💡'
    };
  }
};

// Generate personalized study plan
export const generateStudyPlan = (assignment, submission) => {
  const score = submission.score || 0;
  const daysUntilNextAssessment = 7; // Default to 1 week
  
  const plan = {
    duration: `${daysUntilNextAssessment} days`,
    dailyTasks: []
  };
  
  if (score < 60) {
    plan.dailyTasks = [
      { day: 1, task: 'Review all course notes and identify difficult topics', duration: '1-2 hours' },
      { day: 2, task: 'Watch tutorial videos on weak areas', duration: '1 hour' },
      { day: 3, task: 'Create flashcards for key concepts', duration: '1 hour' },
      { day: 4, task: 'Practice problems from textbook', duration: '1-2 hours' },
      { day: 5, task: 'Join study group or ask teacher for help', duration: '1 hour' },
      { day: 6, task: 'Take practice quiz and review mistakes', duration: '1 hour' },
      { day: 7, task: 'Final review and rest well', duration: '30 minutes' }
    ];
  } else if (score < 80) {
    plan.dailyTasks = [
      { day: 1, task: 'Review incorrect answers from quiz', duration: '30 minutes' },
      { day: 2, task: 'Practice similar problems', duration: '1 hour' },
      { day: 3, task: 'Study advanced concepts', duration: '1 hour' },
      { day: 4, task: 'Take practice test', duration: '1 hour' },
      { day: 5, task: 'Review and clarify doubts', duration: '30 minutes' },
      { day: 6, task: 'Quick revision of all topics', duration: '1 hour' },
      { day: 7, task: 'Light review and relax', duration: '30 minutes' }
    ];
  } else {
    plan.dailyTasks = [
      { day: 1, task: 'Review any mistakes made', duration: '20 minutes' },
      { day: 2, task: 'Explore advanced topics', duration: '30 minutes' },
      { day: 3, task: 'Help others understand concepts', duration: '30 minutes' },
      { day: 4, task: 'Take challenging practice problems', duration: '30 minutes' },
      { day: 5, task: 'Quick review of key concepts', duration: '20 minutes' },
      { day: 6, task: 'Light revision', duration: '20 minutes' },
      { day: 7, task: 'Stay confident and relaxed', duration: '10 minutes' }
    ];
  }
  
  return plan;
};
