import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function SocialLoginSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const user = params.get("user");

    if (token && user) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", user);

      // ✅ Xóa query params mà không reload trang
      window.history.replaceState({}, document.title, "/");

      // Sau khi lưu vào localStorage, chuyển hướng đến trang dashboard
      navigate("/",  { replace: true });
    }
  }, [navigate]);

  return <div>Đang xử lý đăng nhập...</div>;
}

export default SocialLoginSuccess;
