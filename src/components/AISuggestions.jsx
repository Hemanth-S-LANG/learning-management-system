import { useState } from 'react';
import { generateStudySuggestions, getMotivationalMessage, generateStudyPlan } from '../utils/aiSuggestions';

export default function AISuggestions({ assignment, submission, onClose }) {
  const [activeTab, setActiveTab] = useState('suggestions');
  
  const suggestions = generateStudySuggestions(assignment, submission);
  const motivation = getMotivationalMessage(submission.score);
  const studyPlan = generateStudyPlan(assignment, submission);
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-400 bg-red-50';
      case 'medium': return 'border-yellow-400 bg-yellow-50';
      case 'low': return 'border-blue-400 bg-blue-50';
      default: return 'border-gray-400 bg-gray-50';
    }
  };
  
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className={`p-6 rounded-t-2xl bg-gradient-to-r ${
          submission.score >= 70 ? 'from-green-500 to-emerald-600' : 
          submission.score >= 50 ? 'from-yellow-500 to-orange-500' : 
          'from-red-500 to-pink-600'
        }`}>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {motivation.emoji} AI Study Assistant
              </h2>
              <p className="text-white text-opacity-90">
                {motivation.message}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Score Display */}
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
              <div className="text-3xl font-bold text-white">{submission.score.toFixed(1)}%</div>
              <div className="text-sm text-white text-opacity-80">Score</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
              <div className="text-3xl font-bold text-white">{submission.accuracy.toFixed(1)}%</div>
              <div className="text-sm text-white text-opacity-80">Accuracy</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
              <div className="text-3xl font-bold text-white">
                {Math.floor(submission.totalTimeTaken / 60)}:{(submission.totalTimeTaken % 60).toString().padStart(2, '0')}
              </div>
              <div className="text-sm text-white text-opacity-80">Time</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`flex-1 py-4 px-6 font-semibold transition ${
              activeTab === 'suggestions'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            💡 Suggestions
          </button>
          <button
            onClick={() => setActiveTab('studyPlan')}
            className={`flex-1 py-4 px-6 font-semibold transition ${
              activeTab === 'studyPlan'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            📅 Study Plan
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'suggestions' && (
            <div className="space-y-4">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={`border-l-4 rounded-lg p-4 ${getPriorityColor(suggestion.priority)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{suggestion.icon}</span>
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">{suggestion.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityBadge(suggestion.priority)}`}>
                          {suggestion.priority.toUpperCase()} PRIORITY
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-3">{suggestion.description}</p>
                  <div className="bg-white rounded-lg p-3">
                    <p className="font-semibold text-sm text-gray-700 mb-2">Action Steps:</p>
                    <ul className="space-y-1">
                      {suggestion.actions.map((action, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-green-500 mt-1">✓</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'studyPlan' && (
            <div>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  📚 Your Personalized {studyPlan.duration} Study Plan
                </h3>
                <p className="text-gray-600">
                  Follow this plan to improve your understanding and boost your score!
                </p>
              </div>

              <div className="space-y-3">
                {studyPlan.dailyTasks.map((task, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                        {task.day}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 mb-1">Day {task.day}</h4>
                      <p className="text-gray-700 mb-2">{task.task}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{task.duration}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>💡 Pro Tip:</strong> Consistency is key! Try to study at the same time each day to build a habit. 
                  Don't forget to take breaks and stay hydrated!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-2xl">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              💪 Remember: Every mistake is a learning opportunity!
            </p>
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-2 rounded-lg font-semibold transition shadow-md hover:shadow-lg"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
