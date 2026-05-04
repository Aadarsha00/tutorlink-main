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
import { LockPasswordIcon } from "@hugeicons/core-free-icons";

interface PasswordResetConfirmCardProps {
  children: React.ReactNode;
}

export function PasswordResetConfirmCard({
  children,
}: PasswordResetConfirmCardProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-black">
          <HugeiconsIcon
            icon={LockPasswordIcon}
            strokeWidth={2}
            className="text-white"
            size={32}
          />
        </div>
        <CardTitle className="text-2xl">Create new password</CardTitle>
        <CardDescription>
          Enter and confirm a new password for your account.
        </CardDescription>
      </CardHeader>

      <CardContent>{children}</CardContent>

      <CardFooter className="justify-center">
        <Button asChild variant="ghost">
          <a href="/login">Back to Login</a>
        </Button>
      </CardFooter>
    </Card>
  );
}
