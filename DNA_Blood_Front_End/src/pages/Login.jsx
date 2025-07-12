import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('https://localhost:7113/api/Auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (response.ok) {
        const token = await response.text();
        
        // Lưu token vào sessionStorage
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('isLoggedIn', 'true');
        
        // Phân tích token để lấy thông tin người dùng
        const payload = parseJwt(token);
        // Lấy tên từ claim chuẩn của Microsoft
        let userName = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
        if (!userName) {
          userName = 'User';
        }
        const userRole = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        
        // Lưu thông tin người dùng vào sessionStorage
        sessionStorage.setItem('userName', userName);
        sessionStorage.setItem('userRole', userRole);

        // Dispatch custom event để thông báo đăng nhập thành công
        const loginEvent = new CustomEvent('userLogin', {
          detail: { userName, userRole }
        });
        window.dispatchEvent(loginEvent);

        // Chuyển hướng dựa trên role
        if (userRole === 'Staff') {
          navigate('/staff');
        } else if (userRole === 'Admin') {
          navigate('/admin');
        } else if (userRole === 'Medical Staff') {
          navigate('/medical-staff');
        } else {
          navigate('/');
        }
      } else {
        const errorText = await response.text();
        alert(errorText);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred during login. Please try again.');
    }
  };

  // Hàm giải mã JWT đúng chuẩn Unicode
  function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  }


  return (
    <div className="min-h-screen bg-blue-200 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-[450px]">
        <div className="flex justify-center mb-6">
          <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          <h4 className="text-2xl font-bold text-center mb-2">DNA Testing</h4>
        </div>
        <h2 className="text-gray-700 text-center mb-1 font-bold text-xl">Welcome to DNA Testing's new authentication platform</h2>
        <p className="text-gray-600 text-center mb-6">Log in to continue to DNA Testing. For existing users, you will need to reset your password before logging in for the first time.</p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <div className="mt-2 flex justify-between items-center">
  <span className="text-sm text-gray-600">
    Don't have an account?{" "}
    <a href="/register" className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-300">
      Register
    </a>
  </span>
  <a
    href="/forgot-password"
    className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-300"
  >
    Forgot password?
  </a>
</div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-800 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors duration-300"
          >
            Login
          </button>
        </form>
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>
          <button
            type="button"
            className="mt-4 w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-50 transition-colors duration-300"
            onClick={() => {
              window.location.href = 'https://localhost:7113/api/Auth/google-login';
            }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Login with Google
          </button>
          
        </div>
      </div>
    </div>
  );
};

export default Login; 