import * as React from "react";
import { SignupForm, SignupCard, SignupSuccess, AuthLayout } from "@/components/auth";

export function RegisterPage() {
  const [success, setSuccess] = React.useState(false);
  const [email, setEmail] = React.useState("");

  const handleSignupSuccess = (registeredEmail: string) => {
    setEmail(registeredEmail);
    setSuccess(true);
  };

  if (success) {
    return <SignupSuccess email={email} />;
  }

  return (
    <AuthLayout>
      <SignupCard>
        <SignupForm onSuccess={handleSignupSuccess} />
      </SignupCard>
    </AuthLayout>
  );
}
