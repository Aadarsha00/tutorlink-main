import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  LoaderCircle,
} from "@hugeicons/core-free-icons";
import api from "@/services/api";

export function ActivationForm() {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = React.useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = React.useState("");

  React.useEffect(() => {
    if (!uid || !token) {
      setStatus("error");
      setMessage(
        "Invalid activation link. Please check your email and try again."
      );
      return;
    }

    const activate = async () => {
      try {
        const decodedToken = decodeURIComponent(token);
        const decodedUid = decodeURIComponent(uid);

        await api.auth.activateAccount({
          uid: decodedUid,
          token: decodedToken,
        });
        setStatus("success");
        setMessage("Your account has been successfully activated!");

        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (err: any) {
        setStatus("error");
        setMessage(
          err.response?.data?.detail ||
            err.response?.data?.uid?.[0] ||
            err.response?.data?.token?.[0] ||
            "Activation failed. The link may have expired or already been used."
        );
      }
    };

    activate();
  }, [uid, token, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-neutral-50 to-neutral-100 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          {status === "loading" && (
            <>
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-neutral-200 animate-pulse">
                <HugeiconsIcon
                  icon={LoaderCircle}
                  strokeWidth={2}
                  className="text-neutral-600 animate-spin"
                  size={40}
                />
              </div>
              <CardTitle className="text-2xl">
                Activating your account...
              </CardTitle>
              <CardDescription>
                Please wait while we verify your email
              </CardDescription>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-500 animate-bounce">
                <HugeiconsIcon
                  icon={CheckmarkCircle01Icon}
                  strokeWidth={2}
                  className="text-white"
                  size={40}
                />
              </div>
              <CardTitle className="text-2xl">Account Activated!</CardTitle>
              <CardDescription className="text-base">
                {message}
                <br />
                <br />
                Redirecting you to login...
              </CardDescription>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/20 animate-shake">
                <HugeiconsIcon
                  icon={AlertCircleIcon}
                  strokeWidth={2}
                  className="text-destructive"
                  size={40}
                />
              </div>
              <CardTitle className="text-2xl">Activation Failed</CardTitle>
              <CardDescription className="text-base text-destructive">
                {message}
              </CardDescription>
            </>
          )}
        </CardHeader>

        {status === "error" && (
          <CardFooter className="flex-col gap-2">
            <Button asChild className="w-full">
              <a href="/login">Go to Login</a>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <a href="/register">Create New Account</a>
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
