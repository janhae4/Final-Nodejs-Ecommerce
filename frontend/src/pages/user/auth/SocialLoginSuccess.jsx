import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function SocialLoginSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const user = params.get("user");
    console.log(user);
    if (user) {
      localStorage.setItem("user", {
        id: user.googleId,
      });
      window.history.replaceState({}, document.title, "/");
      navigate("/", { replace: true });
    }
  }, [navigate]);

  return <div>Processing...</div>;
}

export default SocialLoginSuccess;
