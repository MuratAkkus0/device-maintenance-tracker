import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import LoginForm from "../components/forms/LoginForm";

function LoginView() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  async function handleSubmit(credentials) {
    setIsSubmitting(true);
    setSubmitError("");
    const result = await login(credentials);
    setIsSubmitting(false);
    if (result.ok) {
      navigate(location.state?.from?.pathname ?? "/", { replace: true });
    } else {
      setSubmitError(result.message);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Sign in</h1>
        <p className="auth-card__subtitle">Access the IT maintenance tracker.</p>
        <LoginForm onSubmit={handleSubmit} isSubmitting={isSubmitting} submitError={submitError} />
        <p className="auth-card__footer">
          Need an account? <Link to="/register">Register</Link>
        </p>
        <div className="auth-demo-hint">
          Demo admin: admin@nordlicht-it.example / ChangeMe123! (after seeding).
        </div>
      </div>
    </div>
  );
}

export default LoginView;
