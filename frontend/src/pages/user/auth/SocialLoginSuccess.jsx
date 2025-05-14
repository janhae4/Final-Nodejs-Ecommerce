import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import Cookies from "js-cookie";

function SocialLoginSuccess() {
  const navigate = useNavigate();
  const { setIsLoggedIn, setUser } = useAuth();

    useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userId = params.get("userId");

    if (token && userId) {
      // Lưu token và userId vào cookie
      Cookies.set("token", token, { expires: 7, sameSite: "Strict", path: "/" });
      Cookies.set("userId", userId, { expires: 7, sameSite: "Strict", path: "/" });
      console.log("Token and UserId saved to cookies", token, userId);
      // Chuyển hướng đến trang chủ hoặc dashboard sau khi đăng nhập thành công
      navigate("/");  // Chuyển đến homepage
    }
  }, [navigate]);

  return <div>Đang xử lý đăng nhập...</div>;
}
 

export default SocialLoginSuccess;
