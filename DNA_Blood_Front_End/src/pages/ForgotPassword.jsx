import React, { useState } from "react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("https://localhost:7113/api/Auth/ForgotPassword", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
    const data = await res.json();
    if (res.ok) {
      setMessage("Vui lòng kiểm tra email để đặt lại mật khẩu.");
    } else {
      setMessage(data.message || "Có lỗi xảy ra.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-200">
      <div className="bg-white p-8 rounded-lg shadow-md w-[400px]">
        <h2 className="text-xl font-bold mb-4 text-center">Quên mật khẩu</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Nhập email của bạn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-800 text-white py-2 rounded-md hover:bg-blue-700"
          >
            Gửi email đặt lại mật khẩu
          </button>
        </form>
        {message && <p className="mt-4 text-center text-green-600">{message}</p>}
      </div>
    </div>
  );
};

export default ForgotPassword;