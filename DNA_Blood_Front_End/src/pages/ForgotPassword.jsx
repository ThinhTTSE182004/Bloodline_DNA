import React, { useState } from "react";
import { FaEnvelopeOpenText, FaArrowLeft, FaQuestionCircle } from "react-icons/fa";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/Auth/ForgotPassword", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("Please check your email to reset your password.");
    } else {
      setMessage(data.message || "An error occurred.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md flex flex-col items-center animate-fade-in">
        <div className="bg-blue-100 rounded-full p-4 mb-4">
          <FaEnvelopeOpenText className="text-blue-600 text-4xl" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-center text-blue-800">Forgot your password?</h2>
        <p className="text-gray-600 text-center mb-2">If you can't log in, follow these steps to regain access to your account.</p>
        <ol className="text-gray-700 text-sm mb-6 w-full list-decimal list-inside space-y-1">
          <li>Enter the email address you used to register your account.</li>
          <li>Click <span className="font-semibold text-blue-700">Send password reset email</span>.</li>
          <li>Check your inbox (and Spam/Junk folder) for the reset email.</li>
          <li>Follow the instructions in the email to set a new password.</li>
        </ol>
        <form onSubmit={handleSubmit} className="w-full">
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            required
          />
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-700 to-blue-500 text-white py-3 rounded-lg font-semibold shadow hover:from-blue-800 hover:to-blue-600 transition"
          >
            Send password reset email
          </button>
        </form>
        {message && <p className="mt-6 text-center text-green-600 font-medium animate-fade-in-slow">{message}</p>}
        <div className="w-full mt-8">
          <div className="flex items-center mb-2 text-blue-700 font-semibold">
            <FaQuestionCircle className="mr-2" /> Help & Frequently Asked Questions
          </div>
          <ul className="text-gray-600 text-sm space-y-1 pl-1">
            <li><span className="font-semibold">Didn't receive the email?</span> Check your Spam/Junk folder or try again after a few minutes.</li>
            <li><span className="font-semibold">Entered the wrong email?</span> Make sure you use the email you registered with.</li>
            <li><span className="font-semibold">Still need help?</span> Contact our support team for further assistance.</li>
          </ul>
        </div>
        <Link to="/login" className="mt-8 flex items-center text-blue-700 hover:underline text-sm font-medium transition">
          <FaArrowLeft className="mr-1" /> Back to login
        </Link>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.7s cubic-bezier(.4,0,.2,1) both; }
        .animate-fade-in-slow { animation: fade-in 1.2s cubic-bezier(.4,0,.2,1) both; }
      `}</style>
    </div>
  );
};

export default ForgotPassword;