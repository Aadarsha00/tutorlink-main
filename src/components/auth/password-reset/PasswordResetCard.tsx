import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, MailSend01Icon } from "@hugeicons/core-free-icons";

interface PasswordResetCardProps {
  children: React.ReactNode;
}

export function PasswordResetCard({ children }: PasswordResetCardProps) {
  return (
    <Card className="w-full max-w-md border-gray-200 shadow-lg">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-600">
          <HugeiconsIcon
            icon={MailSend01Icon}
            strokeWidth={2}
            className="text-white"
            size={30}
          />
        </div>
        <CardTitle className="text-2xl">Reset Password</CardTitle>
        <CardDescription className="leading-6">
          Enter your account email and we will send a secure link to create a
          new password.
        </CardDescription>
      </CardHeader>

      <CardContent>{children}</CardContent>

      <CardFooter className="justify-center">
        <Button asChild variant="ghost">
          <Link to="/login">
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              strokeWidth={2}
              data-icon="inline-start"
            />
            Back to Login
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
