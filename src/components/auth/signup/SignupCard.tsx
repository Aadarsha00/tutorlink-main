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
import { UserAdd01Icon } from "@hugeicons/core-free-icons";
import { Link } from "react-router-dom";

interface SignupCardProps {
  children: React.ReactNode;
}

export function SignupCard({ children }: SignupCardProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-black">
          <HugeiconsIcon
            icon={UserAdd01Icon}
            strokeWidth={2}
            className="text-white"
            size={32}
          />
        </div>
        <CardTitle className="text-2xl">Create Account</CardTitle>
        <CardDescription>Join our platform today</CardDescription>
      </CardHeader>

      <CardContent>{children}</CardContent>

      <CardFooter className="justify-center">
        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Button
            variant="link"
            size="sm"
            className="p-0 h-auto font-semibold"
            asChild
          >
            <Link to="/login">Sign in</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
