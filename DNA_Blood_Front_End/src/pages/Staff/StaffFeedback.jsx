import React, { useEffect, useState } from 'react';
import StaffNavbar from '../../components/StaffNavbar';

const SUGGESTIONS = [
  "Thank you for your valuable feedback!",
  "We appreciate your trust in our service.",
  "Your satisfaction is our happiness!",
  "We are always here to support you.",
  "Your presence is our joy!",
  "We hope to serve you again soon.",
  "Thank you for choosing us!"
];

const StaffFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [responseModal, setResponseModal] = useState({ open: false, feedbackId: null });
  const [responseContent, setResponseContent] = useState('');
  const [responseLoading, setResponseLoading] = useState(false);
  const [responseMsg, setResponseMsg] = useState('');
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('https://localhost:7113/api/Staff/feedback-list', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!res.ok) {
          throw new Error(await res.text());
        }
        const data = await res.json();
        setFeedbacks(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch feedback.');
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, [refresh]);

  const openResponseModal = (feedbackId) => {
    setResponseModal({ open: true, feedbackId });
    setResponseContent('');
    setResponseMsg('');
  };

  const handleSuggestion = (suggestion) => {
    setResponseContent(suggestion);
  };

  const handleResponse = async (e) => {
    e.preventDefault();
    setResponseLoading(true);
    setResponseMsg('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://localhost:7113/api/Staff/feedback-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          feedbackId: responseModal.feedbackId,
          contentResponse: responseContent,
          createAt: new Date().toISOString()
        })
      });
      if (res.ok) {
        setResponseMsg('Response sent successfully!');
        setTimeout(() => {
          setResponseModal({ open: false, feedbackId: null });
          setRefresh(r => !r);
        }, 1200);
      } else {
        const err = await res.text();
        setResponseMsg('Error: ' + err);
      }
    } catch (err) {
      setResponseMsg('Error: ' + err.message);
    }
    setResponseLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      <StaffNavbar />
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white shadow-2xl rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-blue-800">Customer Feedback</h1>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-600 py-8">{error}</div>
          ) : feedbacks.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No feedback found.</div>
          ) : (
            <div className="space-y-8">
              {feedbacks.map(fb => (
                <div key={fb.feedbackId} className="bg-gradient-to-r from-white to-blue-50 rounded-xl p-6 shadow hover:shadow-lg transition-all border border-blue-100">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2">
                    <div className="flex flex-col md:flex-row md:items-center gap-2">
                      <span className="text-sm text-gray-500">Feedback ID: <span className="font-semibold text-gray-700">{fb.feedbackId}</span></span>
                      <span className="text-sm text-gray-500 md:ml-4">Order ID: <span className="font-semibold text-gray-700">{fb.orderId}</span></span>
                      <span className="text-sm text-gray-500 md:ml-4">By: <span className="font-semibold text-blue-700">{fb.name}</span></span>
                    </div>
                    <div className="flex items-center gap-1 mt-2 md:mt-0">
                      {[1,2,3,4,5].map(star => (
                        <span key={star} className={`text-xl ${fb.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-gray-800 mb-2 text-lg font-medium">{fb.comment}</div>
                  <div className="text-xs text-gray-500 text-right mb-2">{fb.createAt ? new Date(fb.createAt).toLocaleString() : ''}</div>
                  {/* Responses */}
                  {fb.contentResponses && fb.contentResponses.length > 0 && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4 mb-2">
                      <div className="font-semibold text-blue-700 mb-1">Staff Response:</div>
                      <ul className="space-y-1">
                        {fb.contentResponses.map((resp, idx) => (
                          <li key={idx} className="text-gray-700 flex items-center">
                            <span className="mr-2">-</span> {resp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <button
                    className="mt-2 px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-semibold shadow"
                    onClick={() => openResponseModal(fb.feedbackId)}
                  >
                    Respond
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      {/* Response Modal */}
      {responseModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative animate-fade-in">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={() => setResponseModal({ open: false, feedbackId: null })}>&times;</button>
            <h2 className="text-xl font-bold mb-4 text-center text-blue-700">Respond to Feedback</h2>
            <form onSubmit={handleResponse} className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Sample Suggestions</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {SUGGESTIONS.map((s, idx) => (
                    <button
                      type="button"
                      key={idx}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-xs"
                      onClick={() => handleSuggestion(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block mb-1 font-medium">Your Response</label>
                <textarea
                  className="w-full border p-2 rounded"
                  rows={3}
                  value={responseContent}
                  onChange={e => setResponseContent(e.target.value)}
                  placeholder="Write your response..."
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition font-semibold disabled:opacity-60"
                disabled={responseLoading || !responseContent.trim()}
              >
                {responseLoading ? 'Sending...' : 'Send Response'}
              </button>
              {responseMsg && <div className="mt-2 text-center text-blue-700">{responseMsg}</div>}
            </form>
          </div>
          <style>{`
            @keyframes fade-in {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in { animation: fade-in 0.7s cubic-bezier(.4,0,.2,1) both; }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default StaffFeedback; 