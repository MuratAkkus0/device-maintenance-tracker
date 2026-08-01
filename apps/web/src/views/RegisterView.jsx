import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import RegisterForm from "../components/forms/RegisterForm";

function RegisterView() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  async function handleSubmit(details) {
    setIsSubmitting(true);
    setSubmitError("");
    const result = await register(details);
    setIsSubmitting(false);
    if (result.ok) {
      navigate("/", { replace: true });
    } else {
      setSubmitError(result.message);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create an account</h1>
        <p className="auth-card__subtitle">
          New accounts are created with the technician role.
        </p>
        <RegisterForm onSubmit={handleSubmit} isSubmitting={isSubmitting} submitError={submitError} />
        <p className="auth-card__footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterView;
