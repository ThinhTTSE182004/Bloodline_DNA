import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OAuthSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionStorage.getItem('token')) {
      navigate('/');
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    console.log("Token FE:", token);

    if (token) {
      window.history.replaceState({}, document.title, "/oauth-success");
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('isLoggedIn', 'true');
      try {
        const payload = parseJwt(token);
        const userName =
          payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
          payload['name'] ||
          payload['unique_name'] ||
          payload['sub'];
        const userRole =
          payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
          payload['role'];
        sessionStorage.setItem('userName', userName);
        sessionStorage.setItem('userRole', userRole);

        const loginEvent = new CustomEvent('userLogin', {
          detail: { userName, userRole }
        });
        window.dispatchEvent(loginEvent);

        if (userRole === 'Staff') {
          navigate('/staff');
        } else {
          navigate('/');
        }
      } catch {
        alert('Token không hợp lệ!');
        navigate('/login');
      }
    } else {
      alert('Không nhận được token từ Google');
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div>Đang đăng nhập bằng Google...</div>
    </div>
  );
};

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

export default OAuthSuccess;