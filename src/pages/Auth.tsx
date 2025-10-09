import { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import heroImage from "@/assets/hero-image.jpg";

type AuthMode = "login" | "register" | "forgot-password";

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>("login");

  const handleAuthSuccess = () => {
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Subtle overlay for better readability */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
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
    </div>
  );
};

export default Auth;