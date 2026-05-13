import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DollarCircleIcon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  Shield,
  UserIcon,
  Phone,
  Mail01Icon,
} from "@hugeicons/core-free-icons";
import api from "@/services/api";
import { useNavigate } from "react-router-dom";

interface GigPaymentDialogProps {
  gigId: number;
  gigTitle: string;
  teacherName: string;
  proposedRate: number;
  sessionsPerWeek: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentSuccess: () => void;
}

export function GigPaymentDialog({
  gigId,
  gigTitle,
  teacherName,
  proposedRate,
  sessionsPerWeek,
  open,
  onOpenChange,
}: GigPaymentDialogProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const platformFee = proposedRate * 0.1 * sessionsPerWeek * 4;

  const navigate = useNavigate();

  const handleInitiatePayment = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.gigPayments.initiate(gigId);

      // Redirect to Khalti payment page
      if (response.payment_url) {
        navigate(response.payment_url);
      } else {
        setError("Payment URL not received. Please try again.");
      }
    } catch (err: any) {
      console.error("Payment initiation failed:", err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.detail ||
          "Failed to initiate payment. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[40vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={Shield} size={24} />
            Payment Required
          </DialogTitle>
          <DialogDescription>
            Complete payment to unlock teacher contact details and start your
            gig
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <HugeiconsIcon icon={AlertCircleIcon} className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Gig Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Gig Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Title:</span>
                <span className="font-medium">{gigTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Teacher:</span>
                <span className="font-medium">{teacherName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rate:</span>
                <span className="font-medium">Rs. {proposedRate}/hour</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sessions/Week:</span>
                <span className="font-medium">{sessionsPerWeek}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <HugeiconsIcon icon={DollarCircleIcon} size={20} />
                Payment Breakdown
              </CardTitle>
              <CardDescription>One Time Payment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Platform Fee (Rs. {proposedRate} × 10% × 4 weeks ):
                </span>
                <span className="font-medium">
                  Rs. {platformFee.toFixed(2)}
                </span>
              </div>

              <Separator />
              <div className="flex justify-between">
                <span className="font-semibold">Total Amount:</span>
                <span className="font-bold text-primary text-lg">
                  Rs. {platformFee.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* What You'll Get */}
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-green-800">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} />
                After Payment, You'll Get:
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-start gap-2 text-green-800">
                <HugeiconsIcon icon={Phone} size={16} className="mt-1" />
                <span className="text-sm">Teacher's phone number</span>
              </div>
              <div className="flex items-start gap-2 text-green-800">
                <HugeiconsIcon icon={Mail01Icon} size={16} className="mt-1" />
                <span className="text-sm">Teacher's email address</span>
              </div>
              <div className="flex items-start gap-2 text-green-800">
                <HugeiconsIcon icon={UserIcon} size={16} className="mt-1" />
                <span className="text-sm">Full contact information</span>
              </div>
              <div className="flex items-start gap-2 text-green-800">
                <HugeiconsIcon
                  icon={CheckmarkCircle01Icon}
                  size={16}
                  className="mt-1"
                />
                <span className="text-sm">
                  Direct communication with your teacher
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Security Note */}
          <Alert>
            <HugeiconsIcon icon={AlertCircleIcon} className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Secure Payment:</strong> Your payment is processed through
              Khalti, Nepal's most trusted payment gateway. Your financial
              information is encrypted and secure.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleInitiatePayment}
            disabled={loading}
            size="lg"
            className="min-w-50"
          >
            {loading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Processing...
              </>
            ) : (
              <>
                <HugeiconsIcon
                  icon={DollarCircleIcon}
                  data-icon="inline-start"
                />
                Pay Rs. {platformFee.toFixed(2)}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Component to show payment required banner
export function PaymentRequiredBanner({
  gigId,
  gigTitle,
  teacherName,
  proposedRate,
  sessionsPerWeek,
  pendingRateProposal = false,
  onPaymentSuccess,
}: {
  gigId: number;
  gigTitle: string;
  teacherName: string;
  proposedRate: number;
  sessionsPerWeek: number;
  pendingRateProposal?: boolean;
  onPaymentSuccess: () => void;
}) {
  const [showDialog, setShowDialog] = React.useState(false);

  return (
    <>
      <Alert className="border-yellow-300 bg-yellow-50">
        <HugeiconsIcon
          icon={AlertCircleIcon}
          className="h-5 w-5 text-yellow-600"
        />
        <div className="ml-4">
          <h4 className="font-semibold text-yellow-900 mb-1">
            Payment Required
          </h4>
          <p className="text-sm text-yellow-800 mb-3">
            Complete payment to unlock teacher contact details and start your
            tutoring gig. The teacher has accepted your selection!
          </p>
          <p className="mb-3 text-xs text-yellow-800">
            If you agreed on a different hourly rate in chat, ask the teacher to
            propose the new rate before you pay. Payment uses the rate only after
            you approve the proposal.
          </p>
          {pendingRateProposal && (
            <p className="mb-3 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-900">
              A rate proposal is waiting for approval. Approve or reject it
              before payment.
            </p>
          )}
          <Button
            onClick={() => setShowDialog(true)}
            variant="default"
            size="sm"
            className="bg-yellow-600 hover:bg-yellow-700"
            disabled={pendingRateProposal}
          >
            <HugeiconsIcon icon={DollarCircleIcon} data-icon="inline-start" />
            Complete Payment
          </Button>
        </div>
      </Alert>

      <GigPaymentDialog
        gigId={gigId}
        gigTitle={gigTitle}
        teacherName={teacherName}
        proposedRate={proposedRate}
        sessionsPerWeek={sessionsPerWeek}
        open={showDialog}
        onOpenChange={setShowDialog}
        onPaymentSuccess={onPaymentSuccess}
      />
    </>
  );
}
