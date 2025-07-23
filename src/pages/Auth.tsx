import { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

type AuthMode = "login" | "register" | "forgot-password";

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>("login");

  const handleAuthSuccess = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary-light/10 to-accent-light/20 flex items-center justify-center p-6">
      {mode === "login" && (
        <LoginForm
          onSwitchToRegister={() => setMode("register")}
          onSwitchToForgotPassword={() => setMode("forgot-password")}
          onLoginSuccess={handleAuthSuccess}
        />
      )}
      {mode === "register" && (
        <RegisterForm
          onSwitchToLogin={() => setMode("login")}
          onRegisterSuccess={handleAuthSuccess}
        />
      )}
      {mode === "forgot-password" && (
        <ForgotPasswordForm
          onBackToLogin={() => setMode("login")}
        />
      )}
    </div>
  );
};

export default Auth;