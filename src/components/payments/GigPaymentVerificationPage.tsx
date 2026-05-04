import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import api from "@/services/api";
import {
  AlertCircleIcon,
  CheckmarkCircle01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import React from "react";
import { useNavigate } from "react-router-dom";

export function PaymentVerificationPage() {
  const [verifying, setVerifying] = React.useState(true);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [retryCount, setRetryCount] = React.useState(0);
  const [statusMessage, setStatusMessage] = React.useState(
    "Verifying payment..."
  );
  const [debugInfo, setDebugInfo] = React.useState<string>("");

  const navigate = useNavigate();

  React.useEffect(() => {
    // Get pidx from URL params
    const params = new URLSearchParams(window.location.search);
    const pidx = params.get("pidx");

    if (pidx) {
      setDebugInfo(`PIDX from URL: ${pidx}`);
      verifyPaymentWithRetry(pidx);
    } else {
      setError("Invalid payment reference - no pidx parameter found in URL");
      setVerifying(false);
      setDebugInfo(`Full URL: ${window.location.href}`);
    }
  }, []);

  const verifyPaymentWithRetry = async (pidx: string, attempt = 0) => {
    const maxAttempts = 6;
    const delayMs = Math.min(1000 * Math.pow(1.5, attempt), 10000);

    try {
      setRetryCount(attempt + 1);
      setStatusMessage(
        attempt === 0
          ? "Verifying payment..."
          : `Still verifying... (Attempt ${attempt + 1}/${maxAttempts})`
      );

      const response = await api.gigPayments.verify(pidx);

      if (response.success) {
        setSuccess(true);
        setVerifying(false);
      } else if (response.status === "pending" && attempt < maxAttempts - 1) {
        setStatusMessage("Payment is processing, please wait...");
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        verifyPaymentWithRetry(pidx, attempt + 1);
      } else {
        setError(
          response.message ||
            "Payment verification is taking longer than expected. Please check your payment status in 'My Gigs'."
        );
        setVerifying(false);
      }
    } catch (err: any) {
      console.error("Payment verification error:", err);
      console.error("Error response:", err.response);

      const errorData = err.response?.data;
      const errorStatus = err.response?.status;

      // Update debug info
      setDebugInfo(
        `PIDX: ${pidx}\n` +
          `Error Status: ${errorStatus}\n` +
          `Error Message: ${
            errorData?.error || errorData?.detail || err.message
          }\n` +
          `Full Error: ${JSON.stringify(errorData, null, 2)}`
      );

      // Handle 404 specifically
      if (errorStatus === 404) {
        setError(
          `Payment record not found. This could mean:\n` +
            `• The payment wasn't properly initiated\n` +
            `• You're not logged in as the correct user\n` +
            `• The pidx doesn't match our records\n\n` +
            `PIDX: ${pidx}\n\n` +
            `Please go back to your gigs and try initiating the payment again.`
        );
        setVerifying(false);
        return;
      }

      const isStillPending =
        errorData?.status === "pending" ||
        errorData?.message?.toLowerCase().includes("pending");

      if (isStillPending && attempt < maxAttempts - 1) {
        setStatusMessage("Payment is still processing...");
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        verifyPaymentWithRetry(pidx, attempt + 1);
      } else {
        setError(
          errorData?.error ||
            errorData?.detail ||
            errorData?.message ||
            `Payment verification failed. Please check your payment status in 'My Gigs'.`
        );
        setVerifying(false);
      }
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-12 text-center">
            <div className="relative inline-block mb-4">
              <div className="animate-spin text-4xl">⏳</div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Verifying Payment</h3>
            <p className="text-muted-foreground mb-4">{statusMessage}</p>
            {retryCount > 1 && (
              <div className="text-sm text-gray-500">
                <p>This may take a few moments...</p>
                <p className="mt-2">Attempt {retryCount} of 6</p>
              </div>
            )}
            {debugInfo && (
              <details className="mt-4 text-left text-xs">
                <summary className="cursor-pointer text-gray-500">
                  Debug Info
                </summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto whitespace-pre-wrap">
                  {debugInfo}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-12 text-center">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <HugeiconsIcon
                icon={CheckmarkCircle01Icon}
                className="text-green-600"
                size={32}
              />
            </div>
            <h3 className="text-2xl font-bold mb-2 text-green-800">
              Payment Successful!
            </h3>
            <p className="text-muted-foreground mb-6">
              Your payment has been confirmed. You can now access the teacher's
              contact details.
            </p>
            <Button
              onClick={() => navigate("/parent/gigs")}
              size="lg"
              className="w-full"
            >
              View My Gigs
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="max-w-md w-full border-red-200">
        <CardContent className="p-12 text-center">
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <HugeiconsIcon
              icon={AlertCircleIcon}
              className="text-red-600"
              size={32}
            />
          </div>
          <h3 className="text-2xl font-bold mb-2 text-red-800">
            Verification Issue
          </h3>
          <div className="text-left text-sm text-muted-foreground mb-6 bg-gray-50 p-4 rounded whitespace-pre-wrap">
            {error || "There was an issue verifying your payment."}
          </div>
          {debugInfo && (
            <details className="mb-6 text-left text-xs">
              <summary className="cursor-pointer text-gray-500">
                Technical Details
              </summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto whitespace-pre-wrap">
                {debugInfo}
              </pre>
            </details>
          )}
          <div className="flex gap-2">
            <Button
              onClick={() => navigate("/parent/gigs")}
              variant="outline"
              className="flex-1"
            >
              Back to Gigs
            </Button>
            <Button onClick={() => window.location.reload()} className="flex-1">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
