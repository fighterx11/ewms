import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const userId = sessionStorage.getItem("easypay_user_id");
    if (userId) {
      navigate("/dashboard");
    } else {
      navigate("/welcome");
    }
  }, [navigate]);

  return null;
};

export default Index;
