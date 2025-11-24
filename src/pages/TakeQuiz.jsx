import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AISuggestions from '../components/AISuggestions';

export default function TakeQuiz() {
  const { assignmentId } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [quizStartTime, setQuizStartTime] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [tabSwitchTimestamps, setTabSwitchTimestamps] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [warningShown, setWarningShown] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchAssignment();
  }, []);

  useEffect(() => {
    if (!assignment) return;

    // Tab switch detection
    const handleVisibilityChange = () => {
      if (document.hidden && !assignment.allowTabSwitch) {
        const newCount = tabSwitches + 1;
        setTabSwitches(newCount);
        setTabSwitchTimestamps([...tabSwitchTimestamps, new Date()]);
        
        if (newCount >= 3 && !warningShown) {
          alert('⚠️ WARNING: Multiple tab switches detected! Your teacher will be notified.');
          setWarningShown(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [assignment, tabSwitches, tabSwitchTimestamps, warningShown]);

  useEffect(() => {
    if (!assignment || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [assignment, timeRemaining]);

  const fetchAssignment = async () => {
    try {
      console.log('Fetching assignment:', assignmentId);
      const response = await fetch(`http://localhost:3000/api/assignments/get/${assignmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to load quiz');
      }

      const data = await response.json();
      console.log('Loaded assignment:', data);
      
      setAssignment(data);
      setQuizStartTime(Date.now());
      setTimeRemaining(data.totalTime * 60);
      setAnswers(new Array(data.questions.length).fill({ answer: '', timeTaken: 0 }));
    } catch (error) {
      console.error('Failed to load quiz:', error);
      alert('Failed to load quiz. Please try again.');
      navigate('/student-assignments');
    }
  };

  const handleAnswerChange = (answer) => {
    const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = {
      questionIndex: currentQuestionIndex,
      answer,
      timeTaken
    };
    setAnswers(newAnswers);

    // Optional: Show quick feedback for correct answers (only for MCQ/True-False)
    const currentQ = assignment.questions[currentQuestionIndex];
    if (currentQ.questionType === 'mcq' || currentQ.questionType === 'true-false') {
      if (answer === currentQ.correctAnswer) {
        showQuickFeedback('✓ Correct!', '#28a745');
      }
    }
  };

  const showQuickFeedback = (message, color) => {
    const feedback = document.createElement('div');
    feedback.textContent = message;
    feedback.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: ${color};
      color: white;
      padding: 20px 40px;
      border-radius: 10px;
      font-size: 24px;
      font-weight: bold;
      z-index: 9999;
      animation: quickFade 1s forwards;
      box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    `;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes quickFade {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
        20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(feedback);

    setTimeout(() => {
      feedback.remove();
      style.remove();
    }, 1000);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < assignment.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setQuestionStartTime(Date.now());
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setQuestionStartTime(Date.now());
    }
  };

  const handleSubmit = async () => {
    if (!confirm('Are you sure you want to submit? You cannot change answers after submission.')) {
      return;
    }

    setIsSubmitting(true);
    const totalTimeTaken = Math.floor((Date.now() - quizStartTime) / 1000);

    try {
      const response = await fetch(`http://localhost:3000/api/assignments/submit/${assignmentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          answers: answers.filter(a => a.answer),
          totalTimeTaken,
          tabSwitches,
          tabSwitchTimestamps,
          startedAt: new Date(quizStartTime)
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      // Show celebration based on score
      showCelebration(data.score, data.accuracy);
      
      // Show results with explanations after celebration
      setTimeout(() => {
        setResults(data);
        setShowResults(true);
        setIsSubmitting(false);
      }, 5000);
    } catch (error) {
      alert(error.message);
      setIsSubmitting(false);
    }
  };

  const showCelebration = (score, accuracy) => {
    const celebrationDiv = document.createElement('div');
    celebrationDiv.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      animation: fadeIn 0.5s;
    `;

    let emoji = '🎉';
    let message = 'Good Job!';
    let color = '#ffc107';

    if (score >= 90) {
      emoji = '🏆';
      message = 'Outstanding! Perfect Score!';
      color = '#ffd700';
      createConfetti();
    } else if (score >= 75) {
      emoji = '🌟';
      message = 'Excellent Work!';
      color = '#28a745';
      createConfetti();
    } else if (score >= 60) {
      emoji = '👍';
      message = 'Good Effort!';
      color = '#17a2b8';
    } else {
      emoji = '📚';
      message = 'Keep Learning!';
      color = '#6c757d';
    }

    celebrationDiv.innerHTML = `
      <style>
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes bounce { 
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        @keyframes slideUp {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      </style>
      <div style="text-align: center; animation: slideUp 0.5s;">
        <div style="font-size: 120px; animation: bounce 1s infinite;">${emoji}</div>
        <h1 style="color: ${color}; font-size: 48px; margin: 20px 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
          ${message}
        </h1>
        <div style="background: white; padding: 30px; border-radius: 20px; margin: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
          <div style="font-size: 72px; font-weight: bold; color: ${color}; margin-bottom: 10px;">
            ${score.toFixed(1)}%
          </div>
          <div style="font-size: 24px; color: #666; margin-bottom: 20px;">
            Accuracy: ${accuracy.toFixed(1)}%
          </div>
          <div style="font-size: 18px; color: #999;">
            Redirecting to assignments...
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(celebrationDiv);

    setTimeout(() => {
      celebrationDiv.remove();
    }, 5000);
  };

  const createConfetti = () => {
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#ff1493'];
    const confettiCount = 100;

    for (let i = 0; i < confettiCount; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
          position: fixed;
          width: 10px;
          height: 10px;
          background: ${colors[Math.floor(Math.random() * colors.length)]};
          top: -10px;
          left: ${Math.random() * 100}%;
          opacity: 1;
          z-index: 10001;
          border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
          animation: confettiFall ${2 + Math.random() * 3}s linear forwards;
        `;

        const style = document.createElement('style');
        style.textContent = `
          @keyframes confettiFall {
            to {
              transform: translateY(100vh) rotate(${Math.random() * 360}deg);
              opacity: 0;
            }
          }
        `;
        document.head.appendChild(style);

        document.body.appendChild(confetti);

        setTimeout(() => {
          confetti.remove();
          style.remove();
        }, 5000);
      }, i * 30);
    }
  };

  const handleAutoSubmit = () => {
    alert('Time is up! Auto-submitting your quiz...');
    handleSubmit();
  };

  if (!assignment) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading quiz...</div>;

  // Show results screen after submission
  if (showResults && results) {
    return (
      <div style={{ maxWidth: '900px', margin: '30px auto', padding: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2>Quiz Results</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', margin: '20px 0' }}>
            <div style={{ padding: '20px', backgroundColor: '#007bff', color: 'white', borderRadius: '8px' }}>
              <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{results.score.toFixed(1)}%</div>
              <div>Score</div>
            </div>
            <div style={{ padding: '20px', backgroundColor: '#28a745', color: 'white', borderRadius: '8px' }}>
              <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{results.accuracy.toFixed(1)}%</div>
              <div>Accuracy</div>
            </div>
            <div style={{ padding: '20px', backgroundColor: '#17a2b8', color: 'white', borderRadius: '8px' }}>
              <div style={{ fontSize: '36px', fontWeight: 'bold' }}>
                {Math.floor(results.submission.totalTimeTaken / 60)}:{(results.submission.totalTimeTaken % 60).toString().padStart(2, '0')}
              </div>
              <div>Time</div>
            </div>
          </div>
        </div>

        <h3>Review Your Answers</h3>
        <div style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
          {results.results.map((result, idx) => (
            <div key={idx} style={{ 
              border: `2px solid ${result.isCorrect ? '#28a745' : '#dc3545'}`,
              padding: '20px',
              borderRadius: '8px',
              backgroundColor: result.isCorrect ? '#d4edda' : '#f8d7da'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                <h4 style={{ margin: 0, flex: 1 }}>Question {idx + 1}</h4>
                <span style={{ 
                  padding: '6px 16px', 
                  backgroundColor: result.isCorrect ? '#28a745' : '#dc3545',
                  color: 'white',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  {result.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                </span>
              </div>

              <p style={{ fontSize: '16px', marginBottom: '15px', fontWeight: 'bold' }}>{result.questionText}</p>

              <div style={{ marginBottom: '10px' }}>
                <p style={{ margin: '5px 0', fontSize: '14px' }}>
                  <strong>Your Answer:</strong> <span style={{ color: result.isCorrect ? '#28a745' : '#dc3545' }}>{result.studentAnswer || 'Not answered'}</span>
                </p>
                {!result.isCorrect && result.questionType !== 'descriptive' && (
                  <p style={{ margin: '5px 0', fontSize: '14px' }}>
                    <strong>Correct Answer:</strong> <span style={{ color: '#28a745' }}>{result.correctAnswer}</span>
                  </p>
                )}
              </div>

              {result.explanation && (
                <div style={{ 
                  marginTop: '15px', 
                  padding: '15px', 
                  backgroundColor: 'white', 
                  borderRadius: '8px',
                  borderLeft: '4px solid #17a2b8'
                }}>
                  <p style={{ margin: '0 0 5px 0', fontSize: '14px', fontWeight: 'bold', color: '#17a2b8' }}>
                    💡 Explanation:
                  </p>
                  <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>{result.explanation}</p>
                </div>
              )}

              <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#666' }}>
                Time taken: {result.timeTaken} seconds
              </p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '30px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
          {results.score < 80 && (
            <button
              onClick={() => setShowAISuggestions(true)}
              style={{ 
                padding: '12px 30px', 
                backgroundColor: '#9c27b0', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>🤖</span>
              Get AI Study Tips
            </button>
          )}
          <button 
            onClick={() => navigate('/student-assignments')}
            style={{ 
              padding: '12px 30px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Back to Assignments
          </button>
        </div>

        {/* AI Suggestions Modal */}
        {showAISuggestions && (
          <AISuggestions
            assignment={assignment}
            submission={results}
            onClose={() => setShowAISuggestions(false)}
          />
        )}
      </div>
    );
  }

  const currentQuestion = assignment.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / assignment.questions.length) * 100;

  return (
    <div style={{ maxWidth: '900px', margin: '30px auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ position: 'sticky', top: 0, backgroundColor: 'white', padding: '20px 0', borderBottom: '2px solid #17a2b8', marginBottom: '20px', zIndex: 100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h2 style={{ margin: 0 }}>{assignment.title}</h2>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: timeRemaining < 300 ? '#dc3545' : '#28a745' }}>
            ⏱️ {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#666' }}>
          <span>Question {currentQuestionIndex + 1} of {assignment.questions.length}</span>
          <span>Tab Switches: {tabSwitches} {tabSwitches > 0 && '⚠️'}</span>
        </div>
        <div style={{ width: '100%', height: '8px', backgroundColor: '#e9ecef', borderRadius: '4px', marginTop: '10px' }}>
          <div style={{ width: `${progress}%`, height: '100%', backgroundColor: '#17a2b8', borderRadius: '4px', transition: 'width 0.3s' }} />
        </div>
      </div>

      {!assignment.allowTabSwitch && tabSwitches === 0 && (
        <div style={{ padding: '15px', backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px', marginBottom: '20px' }}>
          <strong>⚠️ Warning:</strong> Do not switch tabs or minimize this window. Tab switches are being monitored and will be reported to your teacher.
        </div>
      )}

      {/* Question */}
      <div style={{ padding: '30px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '20px', minHeight: '400px' }}>
        <div style={{ marginBottom: '20px' }}>
          <span style={{ padding: '4px 12px', backgroundColor: '#17a2b8', color: 'white', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
            {currentQuestion.questionType.toUpperCase()}
          </span>
          <span style={{ marginLeft: '10px', color: '#666', fontSize: '14px' }}>
            {currentQuestion.points} {currentQuestion.points === 1 ? 'point' : 'points'}
          </span>
        </div>

        <h3 style={{ marginBottom: '30px' }}>{currentQuestion.questionText}</h3>

        {currentQuestion.questionType === 'mcq' && (
          <div style={{ display: 'grid', gap: '15px' }}>
            {currentQuestion.options.map((option, idx) => (
              <label key={idx} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '15px', 
                backgroundColor: answers[currentQuestionIndex]?.answer === option ? '#d4edda' : 'white',
                border: `2px solid ${answers[currentQuestionIndex]?.answer === option ? '#28a745' : '#ddd'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}>
                <input 
                  type="radio" 
                  name="answer" 
                  value={option}
                  checked={answers[currentQuestionIndex]?.answer === option}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  style={{ marginRight: '15px', width: '20px', height: '20px' }}
                />
                <span style={{ fontSize: '16px' }}>{option}</span>
              </label>
            ))}
          </div>
        )}

        {currentQuestion.questionType === 'true-false' && (
          <div style={{ display: 'grid', gap: '15px' }}>
            {['True', 'False'].map((option) => (
              <label key={option} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '15px', 
                backgroundColor: answers[currentQuestionIndex]?.answer === option ? '#d4edda' : 'white',
                border: `2px solid ${answers[currentQuestionIndex]?.answer === option ? '#28a745' : '#ddd'}`,
                borderRadius: '8px',
                cursor: 'pointer'
              }}>
                <input 
                  type="radio" 
                  name="answer" 
                  value={option}
                  checked={answers[currentQuestionIndex]?.answer === option}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  style={{ marginRight: '15px', width: '20px', height: '20px' }}
                />
                <span style={{ fontSize: '16px' }}>{option}</span>
              </label>
            ))}
          </div>
        )}

        {currentQuestion.questionType === 'descriptive' && (
          <textarea 
            value={answers[currentQuestionIndex]?.answer || ''}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder="Type your answer here..."
            rows="10"
            style={{ width: '100%', padding: '15px', fontSize: '16px', borderRadius: '8px', border: '2px solid #ddd', resize: 'vertical' }}
          />
        )}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button 
          onClick={previousQuestion}
          disabled={currentQuestionIndex === 0}
          style={{ 
            padding: '12px 24px', 
            backgroundColor: currentQuestionIndex === 0 ? '#6c757d' : '#007bff',
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            opacity: currentQuestionIndex === 0 ? 0.5 : 1
          }}
        >
          ← Previous
        </button>

        <div style={{ display: 'flex', gap: '10px' }}>
          {currentQuestionIndex < assignment.questions.length - 1 ? (
            <button 
              onClick={nextQuestion}
              style={{ 
                padding: '12px 24px', 
                backgroundColor: '#007bff',
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Next →
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{ 
                padding: '12px 24px', 
                backgroundColor: '#28a745',
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          )}
        </div>
      </div>

      {/* Question Navigator */}
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h4 style={{ marginTop: 0 }}>Question Navigator</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {assignment.questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentQuestionIndex(idx);
                setQuestionStartTime(Date.now());
              }}
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: answers[idx]?.answer ? '#28a745' : idx === currentQuestionIndex ? '#17a2b8' : 'white',
                color: answers[idx]?.answer || idx === currentQuestionIndex ? 'white' : '#333',
                border: `2px solid ${idx === currentQuestionIndex ? '#17a2b8' : '#ddd'}`,
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              {idx + 1}
            </button>
          ))}
        </div>
        <p style={{ marginTop: '15px', marginBottom: 0, fontSize: '12px', color: '#666' }}>
          <span style={{ color: '#28a745' }}>● Answered</span> | 
          <span style={{ color: '#17a2b8' }}> ● Current</span> | 
          <span style={{ color: '#666' }}> ○ Not Answered</span>
        </p>
      </div>
    </div>
  );
}
