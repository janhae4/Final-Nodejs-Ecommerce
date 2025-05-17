import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function SocialLoginSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const user = JSON.parse(params.get("user"));
    console.log(params, user);
    if (user) {
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: user._id,
        })
      );
      window.history.replaceState({}, document.title, "/");
      navigate("/", { replace: true });
    }
  }, [navigate]);

  return <div>Processing...</div>;
}

export default SocialLoginSuccess;
