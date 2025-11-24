import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function CreateQuiz() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [totalTime, setTotalTime] = useState(60);
  const [allowTabSwitch, setAllowTabSwitch] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: '',
    questionType: 'mcq',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: '',
    matchPairs: [{ left: '', right: '' }],
    points: 1,
    timeLimit: 60
  });

  const navigate = useNavigate();
  const location = useLocation();
  const courseId = location.state?.courseId;
  const token = localStorage.getItem('token');

  const addQuestion = () => {
    if (!currentQuestion.questionText.trim()) {
      alert('Please enter question text');
      return;
    }

    setQuestions([...questions, { ...currentQuestion }]);
    setCurrentQuestion({
      questionText: '',
      questionType: 'mcq',
      options: ['', '', '', ''],
      correctAnswer: '',
      explanation: '',
      matchPairs: [{ left: '', right: '' }],
      points: 1,
      timeLimit: 60
    });
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title || !description || !deadline || questions.length === 0) {
      alert('Please fill all fields and add at least one question');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/assignments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          courseId,
          deadline,
          type: 'quiz',
          questions,
          totalTime,
          allowTabSwitch
        })
      });

      if (!response.ok) throw new Error('Failed to create quiz');

      alert('Quiz created successfully!');
      navigate('/teacher-assignments');
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '30px auto', padding: '20px' }}>
      <h2>Create Quiz/Test</h2>
      
      <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3>Quiz Settings</h3>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Title:</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: '100%', padding: '8px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ddd' }} />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Description:</label>
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: '100%', padding: '8px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ddd' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Deadline:</label>
            <input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} style={{ width: '100%', padding: '8px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ddd' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Total Time (minutes):</label>
            <input type="number" value={totalTime} onChange={(e) => setTotalTime(parseInt(e.target.value))} style={{ width: '100%', padding: '8px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ddd' }} />
          </div>
        </div>
        <div style={{ marginTop: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input type="checkbox" checked={allowTabSwitch} onChange={(e) => setAllowTabSwitch(e.target.checked)} style={{ marginRight: '8px' }} />
            <span>Allow students to switch tabs (Not recommended for tests)</span>
          </label>
        </div>
      </div>

      <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#fff', border: '2px solid #17a2b8', borderRadius: '8px' }}>
        <h3>Add Question</h3>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Question Type:</label>
          <select value={currentQuestion.questionType} onChange={(e) => setCurrentQuestion({ ...currentQuestion, questionType: e.target.value })} style={{ width: '100%', padding: '8px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ddd' }}>
            <option value="mcq">Multiple Choice (MCQ)</option>
            <option value="true-false">True/False</option>
            <option value="match-column">Match the Column</option>
            <option value="descriptive">Descriptive</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Question Text:</label>
          <textarea value={currentQuestion.questionText} onChange={(e) => setCurrentQuestion({ ...currentQuestion, questionText: e.target.value })} rows="3" style={{ width: '100%', padding: '8px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ddd' }} />
        </div>

        {currentQuestion.questionType === 'mcq' && (
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Options:</label>
            {currentQuestion.options.map((opt, idx) => (
              <input key={idx} type="text" value={opt} onChange={(e) => {
                const newOpts = [...currentQuestion.options];
                newOpts[idx] = e.target.value;
                setCurrentQuestion({ ...currentQuestion, options: newOpts });
              }} placeholder={`Option ${idx + 1}`} style={{ width: '100%', padding: '8px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ddd', marginBottom: '8px' }} />
            ))}
            <label style={{ display: 'block', marginTop: '10px', marginBottom: '5px', fontWeight: 'bold' }}>Correct Answer:</label>
            <select value={currentQuestion.correctAnswer} onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })} style={{ width: '100%', padding: '8px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ddd' }}>
              <option value="">Select correct answer</option>
              {currentQuestion.options.map((opt, idx) => opt && <option key={idx} value={opt}>{opt}</option>)}
            </select>
          </div>
        )}

        {currentQuestion.questionType === 'true-false' && (
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Correct Answer:</label>
            <select value={currentQuestion.correctAnswer} onChange={(e) => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })} style={{ width: '100%', padding: '8px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ddd' }}>
              <option value="">Select</option>
              <option value="True">True</option>
              <option value="False">False</option>
            </select>
          </div>
        )}

        {currentQuestion.questionType === 'match-column' && (
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Match Pairs:</label>
            {currentQuestion.matchPairs.map((pair, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '8px' }}>
                <input type="text" value={pair.left} onChange={(e) => {
                  const newPairs = [...currentQuestion.matchPairs];
                  newPairs[idx].left = e.target.value;
                  setCurrentQuestion({ ...currentQuestion, matchPairs: newPairs });
                }} placeholder="Left column" style={{ padding: '8px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ddd' }} />
                <input type="text" value={pair.right} onChange={(e) => {
                  const newPairs = [...currentQuestion.matchPairs];
                  newPairs[idx].right = e.target.value;
                  setCurrentQuestion({ ...currentQuestion, matchPairs: newPairs });
                }} placeholder="Right column" style={{ padding: '8px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ddd' }} />
              </div>
            ))}
            <button onClick={() => setCurrentQuestion({ ...currentQuestion, matchPairs: [...currentQuestion.matchPairs, { left: '', right: '' }] })} style={{ padding: '6px 12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
              + Add Pair
            </button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Points:</label>
            <input type="number" value={currentQuestion.points} onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: parseInt(e.target.value) })} style={{ width: '100%', padding: '8px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ddd' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Time Limit (seconds):</label>
            <input type="number" value={currentQuestion.timeLimit} onChange={(e) => setCurrentQuestion({ ...currentQuestion, timeLimit: parseInt(e.target.value) })} style={{ width: '100%', padding: '8px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ddd' }} />
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Explanation (Why is this the correct answer?):</label>
          <textarea 
            value={currentQuestion.explanation} 
            onChange={(e) => setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })} 
            placeholder="Explain the correct answer to help students learn..."
            rows="3"
            style={{ width: '100%', padding: '8px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ddd', resize: 'vertical' }} 
          />
        </div>

        <button onClick={addQuestion} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}>
          Add Question to Quiz
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Questions Added ({questions.length})</h3>
        {questions.map((q, idx) => (
          <div key={idx} style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '10px', border: '1px solid #ddd' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>Q{idx + 1}. {q.questionText}</p>
                <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>Type: {q.questionType} | Points: {q.points} | Time: {q.timeLimit}s</p>
              </div>
              <button onClick={() => removeQuestion(idx)} style={{ padding: '4px 8px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={() => navigate('/teacher-assignments')} style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Cancel
        </button>
        <button onClick={handleSubmit} style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Create Quiz
        </button>
      </div>
    </div>
  );
}
