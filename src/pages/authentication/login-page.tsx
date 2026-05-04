import { useNavigate } from "react-router-dom";
import { LoginForm, LoginCard, AuthLayout } from "@/components/auth";

export default function LoginPage() {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate("/dashboard");
  };

  return (
    <AuthLayout>
      <LoginCard>
        <LoginForm onSuccess={handleLoginSuccess} />
      </LoginCard>
    </AuthLayout>
  );
}
