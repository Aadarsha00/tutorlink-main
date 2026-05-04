import * as React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle01Icon,
  Crown02Icon,
  Loading03Icon,
  AlertCircleIcon,
  CancelCircleIcon,
  Calendar03Icon,
  ClockIcon,
} from "@hugeicons/core-free-icons";

import api from "@/services/api";

type VerificationStatus = "verifying" | "success" | "failed" | "error";

export default function PremiumVerifyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = React.useState<VerificationStatus>("verifying");
  const [subscription, setSubscription] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [retrying, setRetrying] = React.useState(false);

  const pidx = searchParams.get("pidx");
  const statusParam = searchParams.get("status");

  React.useEffect(() => {
    if (!pidx) {
      setStatus("error");
      setError("No payment reference found. Please try again.");
      return;
    }

    // Check if payment was cancelled by user
    if (statusParam === "failed" || statusParam === "cancelled") {
      setStatus("failed");
      setError("Payment was cancelled. Please try again when ready.");
      return;
    }

    verifyPayment();
  }, [pidx]);

  const verifyPayment = async () => {
    if (!pidx) return;

    try {
      setStatus("verifying");
      setError(null);
      setRetrying(false);

      // Verify payment with backend
      const response = await api.premium.verifyPayment(pidx);

      if (response.success) {
        setStatus("success");
        setSubscription(response.subscription);
      } else {
        setStatus("failed");
        setError(
          response.message ||
            "Payment verification failed. Please contact support if the amount was deducted."
        );
      }
    } catch (err: any) {
      console.error("Verification error:", err);

      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err.message ||
        "Failed to verify payment. Please try again.";

      // Check if it's a "still pending" error
      if (errorMessage.toLowerCase().includes("pending")) {
        setStatus("verifying");
        setError(
          "Payment is still being processed. This may take a few moments..."
        );

        // Retry after 3 seconds
        setTimeout(() => {
          setRetrying(true);
          verifyPayment();
        }, 3000);
      } else {
        setStatus("error");
        setError(errorMessage);
      }
    }
  };

  const handleRetry = () => {
    verifyPayment();
  };

  const handleGoToPremium = () => {
    navigate("/premium");
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const getDaysRemaining = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diff = expiry.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  /* ================= VERIFYING STATE ================= */
  if (status === "verifying") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
              <HugeiconsIcon
                icon={Loading03Icon}
                className="animate-spin text-blue-600"
                size={32}
              />
            </div>
            <CardTitle className="text-2xl">
              {retrying ? "Retrying Verification..." : "Verifying Payment..."}
            </CardTitle>
            <CardDescription>
              Please wait while we confirm your payment with Khalti
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="border-blue-200 bg-blue-50">
                <HugeiconsIcon icon={ClockIcon} className="h-4 w-4" />
                <AlertTitle className="text-blue-700">Processing</AlertTitle>
                <AlertDescription className="text-blue-600">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            {!error && (
              <div className="text-center text-sm text-muted-foreground">
                <p>This usually takes just a few seconds...</p>
                <p className="mt-2">Do not close this window.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ================= SUCCESS STATE ================= */
  if (status === "success") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full border-green-200 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
              <HugeiconsIcon
                icon={CheckmarkCircle01Icon}
                className="text-green-600"
                size={48}
              />
            </div>
            <CardTitle className="text-3xl text-green-700">
              Payment Successful!
            </CardTitle>
            <CardDescription className="text-base">
              Your Premium subscription is now active
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Success Message */}
            <Alert className="border-green-200 bg-green-50">
              <HugeiconsIcon
                icon={Crown02Icon}
                className="h-5 w-5 text-green-600"
              />
              <AlertTitle className="text-green-700 text-lg">
                Welcome to Premium!
              </AlertTitle>
              <AlertDescription className="text-green-600">
                You now have access to all premium features including priority
                listing, featured badge, unlimited applications, and more.
              </AlertDescription>
            </Alert>

            {/* Subscription Details */}
            {subscription && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <HugeiconsIcon
                    icon={Crown02Icon}
                    className="text-amber-600"
                    size={24}
                  />
                  <h3 className="text-lg font-semibold">
                    Subscription Details
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Plan Duration
                      </p>
                      <p className="font-semibold">
                        {subscription.duration_days} Days
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Amount Paid
                      </p>
                      <p className="font-semibold text-lg">
                        Rs. {subscription.amount}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <HugeiconsIcon
                        icon={Calendar03Icon}
                        size={16}
                        className="text-muted-foreground mt-1"
                      />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Start Date
                        </p>
                        <p className="font-medium">
                          {new Date(subscription.starts_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <HugeiconsIcon
                        icon={Calendar03Icon}
                        size={16}
                        className="text-muted-foreground mt-1"
                      />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Expiry Date
                        </p>
                        <p className="font-medium">
                          {new Date(subscription.expires_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-amber-300">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Days Remaining
                    </p>
                    <p className="text-2xl font-bold text-amber-600">
                      {getDaysRemaining(subscription.expires_at)} days
                    </p>
                  </div>
                </div>

                {subscription.khalti_transaction_id && (
                  <div className="mt-4 pt-4 border-t border-amber-300">
                    <p className="text-xs text-muted-foreground">
                      Transaction ID: {subscription.khalti_transaction_id}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Premium Features */}
            <div className="bg-neutral-50 border rounded-lg p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} />
                Your Premium Benefits
              </h3>
              <ul className="space-y-2">
                {[
                  "Priority listing in search results",
                  "Featured badge on your profile",
                  "Unlimited gig applications",
                  "Advanced analytics and insights",
                  "Priority customer support",
                  "Enhanced profile visibility",
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <HugeiconsIcon
                      icon={CheckmarkCircle01Icon}
                      className="text-green-600 shrink-0 mt-0.5"
                      size={16}
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleGoToPremium} className="flex-1" size="lg">
                <HugeiconsIcon icon={Crown02Icon} className="mr-2" size={18} />
                View Premium Dashboard
              </Button>
              <Button
                onClick={handleGoHome}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                Go to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ================= FAILED/ERROR STATE ================= */
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-md w-full border-red-200">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
            <HugeiconsIcon
              icon={status === "failed" ? CancelCircleIcon : AlertCircleIcon}
              className="text-red-600"
              size={48}
            />
          </div>
          <CardTitle className="text-2xl text-red-700">
            {status === "failed" ? "Payment Failed" : "Verification Error"}
          </CardTitle>
          <CardDescription>
            {status === "failed"
              ? "Your payment could not be completed"
              : "We encountered an error verifying your payment"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error Message */}
          <Alert variant="destructive">
            <HugeiconsIcon icon={AlertCircleIcon} className="h-4 w-4" />
            <AlertTitle>Error Details</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>

          {/* Help Text */}
          <div className="bg-neutral-50 border rounded-lg p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-2">What to do next:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Check if the amount was deducted from your account</li>
              <li>If deducted, please contact our support team</li>
              <li>If not deducted, you can try subscribing again</li>
              <li>
                Keep your transaction reference (pidx) for support:{" "}
                <span className="font-mono text-xs break-all">{pidx}</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {status === "error" && (
              <Button
                onClick={handleRetry}
                className="w-full"
                variant="default"
              >
                <HugeiconsIcon
                  icon={Loading03Icon}
                  className="mr-2"
                  size={18}
                />
                Retry Verification
              </Button>
            )}
            <Button
              onClick={handleGoToPremium}
              variant={status === "error" ? "outline" : "default"}
              className="w-full"
            >
              Try Another Payment
            </Button>
            <Button onClick={handleGoHome} variant="outline" className="w-full">
              Go to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
