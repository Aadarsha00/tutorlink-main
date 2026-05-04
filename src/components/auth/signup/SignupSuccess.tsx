import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";
import { Link } from "react-router-dom";
import * as React from "react";
import api from "@/services/api";

interface SignupSuccessProps {
  email: string;
}

export function SignupSuccess({ email }: SignupSuccessProps) {
  const [resending, setResending] = React.useState(false);
  const [message, setMessage] = React.useState("");

  const handleResendActivation = async () => {
    setResending(true);
    setMessage("");

    try {
      await api.auth.resendActivation(email);
      setMessage("Activation email sent again. Please check your inbox and spam folder.");
    } catch (err: any) {
      setMessage(
        err.response?.data?.email?.[0] ||
          err.response?.data?.detail ||
          "Could not resend activation email. Please try again."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-neutral-50 to-neutral-100 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-500 animate-bounce">
            <HugeiconsIcon
              icon={CheckmarkCircle01Icon}
              strokeWidth={2}
              className="text-white"
              size={40}
            />
          </div>
          <CardTitle className="text-2xl">Check your email!</CardTitle>
          <CardDescription>
            We've sent an activation link to{" "}
            <strong className="text-foreground">{email}</strong>
            <br />
            <br />
            Please check your inbox and click the link to activate your
            account. After activation, you'll be prompted to complete your
            profile.
          </CardDescription>
        </CardHeader>
        {message && (
          <p className="px-6 pb-3 text-sm text-muted-foreground">{message}</p>
        )}
        <CardFooter className="flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleResendActivation}
            disabled={resending}
          >
            {resending ? "Sending..." : "Resend Activation Email"}
          </Button>
          <Button asChild>
            <Link to="/login">Back to Login</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
