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
import { Login01Icon } from "@hugeicons/core-free-icons";
import { Link } from "react-router-dom";

interface LoginCardProps {
  children: React.ReactNode;
}

export function LoginCard({ children }: LoginCardProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-black">
          <HugeiconsIcon
            icon={Login01Icon}
            strokeWidth={2}
            className="text-white"
            size={32}
          />
        </div>
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>Sign in to your account to continue</CardDescription>
      </CardHeader>

      <CardContent>{children}</CardContent>

      <CardFooter className="flex-col gap-2">
        <Button variant="ghost" size="sm" className="text-sm" asChild>
          <a href="/password-reset">Forgot password?</a>
        </Button>
        <div className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Button
            variant="link"
            size="sm" 
            className="p-0 h-auto font-semibold"
            asChild
          >
            <Link to="/register">Sign up</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
