// src/pages/ParentGigApplicationsPage.tsx - With Payment Integration
import * as React from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  UserIcon,
  StarIcon,
  LocationIcon,
  MoneyBag01Icon,
  Calendar03Icon,
  CheckmarkCircle01Icon,
  Cancel01Icon,
  BookIcon,
  TimeIcon,
  CreditCardIcon,
  Shield,
  Phone,
  Mail01Icon,
  MessageIcon,
} from "@hugeicons/core-free-icons";
import api from "@/services/api";
import type { Application, Gig } from "@/services/api";
import { PaymentRequiredBanner } from "@/components/payments/gig-payment";
import { toast } from "sonner";

export default function ParentGigApplicationsPage() {
  const { gigId } = useParams<{ gigId: string }>();
  const navigate = useNavigate();

  const [gig, setGig] = React.useState<Gig | null>(null);
  const [applications, setApplications] = React.useState<Application[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] =
    React.useState<Application | null>(null);
  const [cancelApplication, setCancelApplication] =
    React.useState<Application | null>(null);
  const [showSelectDialog, setShowSelectDialog] = React.useState(false);
  const [showCancelDialog, setShowCancelDialog] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState("");
  const [actionLoading, setActionLoading] = React.useState(false);
  const [filter, setFilter] = React.useState<"all" | "pending" | "selected">(
    "all"
  );
  const [paymentStatus, setPaymentStatus] = React.useState<any>(null);

  React.useEffect(() => {
    if (gigId) {
      loadData();
    }
  }, [gigId]);

  React.useEffect(() => {
    const refreshOnNotification = (event: Event) => {
      const notification = (event as CustomEvent<any>).detail;
      if (
        [
          "rate_change_requested",
          "rate_change_approved",
          "rate_change_rejected",
          "match_cancelled",
          "selection_accepted",
        ].includes(
          notification?.notification_type
        )
      ) {
        loadData();
      }
    };

    window.addEventListener("tutorlink:notification", refreshOnNotification);
    return () => {
      window.removeEventListener("tutorlink:notification", refreshOnNotification);
    };
  }, [gigId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load gig details
      const gigData = await api.gigs.get(parseInt(gigId!));
      setGig(gigData);

      // Load applications for this gig
      const allApplications = await api.applications.list();
      const gigApplications = allApplications.filter((app) => {
        const appGigId = typeof app.gig === "number" ? app.gig : app.gig.id;
        return appGigId === parseInt(gigId!);
      });

      setApplications(gigApplications);

      // Check payment status if payment is required
      if (gigData.status === "payment_pending" || gigData.status === "active") {
        try {
          const paymentData = await api.gigPayments.status(parseInt(gigId!));
          setPaymentStatus(paymentData);
        } catch (err) {
          console.error("Failed to load payment status:", err);
        }
      }
    } catch (err: any) {
      console.error("Failed to load data:", err);
      setError(err.response?.data?.detail || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTeacher = (application: Application) => {
    setSelectedApplication(application);
    setShowSelectDialog(true);
  };

  const handleCancelMatch = (application: Application) => {
    setCancelApplication(application);
    setCancelReason("");
    setShowCancelDialog(true);
  };

  const confirmSelectTeacher = async () => {
    if (!selectedApplication) return;

    try {
      setActionLoading(true);
      await api.applications.select(selectedApplication.id);

      // Reload data
      await loadData();

      setShowSelectDialog(false);
      setSelectedApplication(null);
    } catch (err: any) {
      console.error("Failed to select teacher:", err);
      toast.error(err.response?.data?.detail || "Failed to select teacher");
    } finally {
      setActionLoading(false);
    }
  };

  const confirmCancelMatch = async () => {
    if (!cancelApplication) return;

    try {
      setActionLoading(true);
      await api.applications.cancelMatch(cancelApplication.id, cancelReason);
      toast.success("Match cancelled. Your gig is open again.");
      await loadData();
      setShowCancelDialog(false);
      setCancelApplication(null);
      setCancelReason("");
    } catch (err: any) {
      console.error("Failed to cancel match:", err);
      toast.error(err.response?.data?.error || "Failed to cancel match");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRespondRate = async (
    application: Application,
    decision: "approve" | "reject"
  ) => {
    try {
      setActionLoading(true);
      await api.applications.respondRate(application.id, decision);
      toast.success(
        decision === "approve" ? "Rate change approved." : "Rate change rejected."
      );
      await loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to respond to rate change");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (filter === "all") return true;
    if (filter === "pending") return app.status === "pending";
    if (filter === "selected")
      return app.status === "selected" || app.status === "accepted";
    return true;
  });

  const pendingCount = applications.filter(
    (app) => app.status === "pending"
  ).length;
  const selectedCount = applications.filter(
    (app) => app.status === "selected" || app.status === "accepted"
  ).length;

  // Find accepted application for payment
  const acceptedApplication = applications.find(
    (app) => app.status === "accepted"
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-muted-foreground">Loading applications...</p>
        </div>
      </div>
    );
  }

  if (error || !gig) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>{error || "Gig not found"}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/parent/gigs")}>
              Back to Gigs
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-50 to-neutral-100">
      <div className="container mx-auto p-6 max-w-6xl">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate(`/parent/gigs/${gigId}`)}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} data-icon="inline-start" />
          Back to Gig Details
        </Button>

        {/* Payment Required Banner */}
        {gig.status === "payment_pending" &&
          acceptedApplication &&
          acceptedApplication.teacher_profile && (
            <div className="mb-6">
              <PaymentRequiredBanner
                gigId={gig.id}
                gigTitle={gig.title}
                teacherName={acceptedApplication.teacher_profile.full_name}
                proposedRate={acceptedApplication.proposed_rate}
                sessionsPerWeek={gig.sessions_per_week}
                pendingRateProposal={Boolean(
                  acceptedApplication.rate_change_proposed_rate
                )}
                onPaymentSuccess={() => {
                  loadData();
                }}
              />
            </div>
          )}

        {/* Contact Hidden Notice */}
        {gig.status === "payment_pending" && (
          <Alert className="mb-6 border-blue-300 bg-blue-50">
            <HugeiconsIcon icon={Shield} className="h-5 w-5 text-blue-600" />
            <div className="ml-4">
              <h4 className="font-semibold text-blue-900 mb-1">
                Direct Contact Details Protected
              </h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>
                  Complete payment to unlock full teacher contact information:
                </p>
                <ul className="list-disc list-inside ml-2 mt-2">
                  <li>Phone number</li>
                  <li>Email address</li>
                  <li>Full address</li>
                </ul>
                <p className="mt-2">
                  In-site messages are available after the teacher accepts your
                  selection, but sharing phone numbers or addresses in chat is
                  blocked.
                </p>
              </div>
            </div>
          </Alert>
        )}

        {/* Payment Completed Notice */}
        {gig.status === "active" && paymentStatus?.payment_completed && (
          <Alert className="mb-6 border-green-300 bg-green-50">
            <HugeiconsIcon
              icon={CheckmarkCircle01Icon}
              className="h-5 w-5 text-green-600"
            />
            <div className="ml-4">
              <h4 className="font-semibold text-green-900 mb-1">
                Payment Completed
              </h4>
              <p className="text-sm text-green-800">
                You can now access teacher contact details and start your
                tutoring sessions.
              </p>
            </div>
          </Alert>
        )}

        {/* Gig Summary */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{gig.title}</CardTitle>
                <CardDescription className="mt-2 flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <HugeiconsIcon icon={BookIcon} size={16} />
                    {gig.subject} - {gig.grade}
                  </span>
                  <span className="flex items-center gap-1">
                    <HugeiconsIcon icon={LocationIcon} size={16} />
                    {gig.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <HugeiconsIcon icon={MoneyBag01Icon} size={16} />
                    Rs. {gig.budget_min} - Rs. {gig.budget_max}/hour
                  </span>
                </CardDescription>
              </div>
              <Badge variant={gig.status === "open" ? "default" : "secondary"}>
                {gig.status.replace(/_/g, " ")}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Applications Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Applications
                  <Badge variant="secondary">{applications.length} total</Badge>
                </CardTitle>
                <CardDescription>
                  Review and select teachers for your gig
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">
                  All ({applications.length})
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pending ({pendingCount})
                </TabsTrigger>
                <TabsTrigger value="selected">
                  Selected ({selectedCount})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={filter} className="space-y-4">
                {filteredApplications.length === 0 ? (
                  <div className="py-12 text-center">
                    <HugeiconsIcon
                      icon={UserIcon}
                      size={64}
                      className="text-muted-foreground mx-auto mb-4 opacity-50"
                    />
                    <p className="text-lg font-medium mb-1">
                      No applications yet
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {filter === "all"
                        ? "Teachers will see your gig and can apply"
                        : `No ${filter} applications`}
                    </p>
                  </div>
                ) : (
                  filteredApplications.map((application) => (
                    <ApplicationCard
                      key={application.id}
                      application={application}
                      onSelect={() => handleSelectTeacher(application)}
                      onCancelMatch={() => handleCancelMatch(application)}
                      onRespondRate={(decision) =>
                        handleRespondRate(application, decision)
                      }
                      disabled={
                        gig.status !== "open" ||
                        application.status !== "pending"
                      }
                      gigStatus={gig.status}
                      paymentCompleted={
                        paymentStatus?.payment_completed || false
                      }
                    />
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Select Teacher Confirmation Dialog */}
        <Dialog open={showSelectDialog} onOpenChange={setShowSelectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select this teacher?</DialogTitle>
              <DialogDescription>
                This will notify the teacher and give them 48 hours to accept or
                reject your selection. Once accepted, you'll need to complete
                payment before accessing their contact details.
              </DialogDescription>
            </DialogHeader>
            {selectedApplication?.teacher_profile && (
              <div className="py-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {selectedApplication.teacher_profile.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">
                      {selectedApplication.teacher_profile.full_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Proposed Rate: Rs. {selectedApplication.proposed_rate}
                      /hour
                    </p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowSelectDialog(false)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button onClick={confirmSelectTeacher} disabled={actionLoading}>
                {actionLoading ? "Selecting..." : "Confirm Selection"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel this match?</DialogTitle>
              <DialogDescription>
                This will close the chat, reopen your gig, and let you select
                another teacher. Use this only before payment is completed.
              </DialogDescription>
            </DialogHeader>
            <div className="py-2">
              <Textarea
                value={cancelReason}
                onChange={(event) => setCancelReason(event.target.value)}
                maxLength={300}
                placeholder="Optional reason, for example: teacher not responding"
                className="min-h-24 resize-none"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowCancelDialog(false)}
                disabled={actionLoading}
              >
                Keep Match
              </Button>
              <Button
                variant="destructive"
                onClick={confirmCancelMatch}
                disabled={actionLoading}
              >
                {actionLoading ? "Cancelling..." : "Cancel Match"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Application Card Component with Contact Hiding
function ApplicationCard({
  application,
  onSelect,
  onCancelMatch,
  onRespondRate,
  disabled,
  gigStatus,
  paymentCompleted,
}: {
  application: Application;
  onSelect: () => void;
  onCancelMatch: () => void;
  onRespondRate: (decision: "approve" | "reject") => void;
  disabled: boolean;
  gigStatus: string;
  paymentCompleted: boolean;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const profile = application.teacher_profile;
  const status = getApplicationStatus(application.status);

  if (!profile) {
    return null;
  }

  const applicationGigId =
    typeof application.gig === "number" ? application.gig : application.gig.id;

  const openConversation = async () => {
    try {
      const conversation = await api.messaging.conversationForGig(applicationGigId);
      if (!conversation) {
        toast.error("Messages unlock after the teacher accepts your selection.");
        return;
      }

      navigate(`/messages?conversation=${conversation.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to open messages");
    }
  };

  // Check if contacts should be shown
  const showContacts =
    gigStatus === "active" &&
    paymentCompleted &&
    application.status === "accepted";

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex gap-4">
          {/* Avatar */}
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg">
              {profile.full_name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

          {/* Main Content */}
          <div className="flex-1 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{profile.full_name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    <HugeiconsIcon
                      icon={StarIcon}
                      size={16}
                      className="text-yellow-500"
                    />
                    <span className="text-sm font-medium">
                      {profile.average_rating.toFixed(1)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ({profile.total_reviews} reviews)
                    </span>
                  </div>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">
                    {profile.experience_years} years exp.
                  </span>
                </div>
              </div>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>

            {/* Contact Information - Conditional Display */}
            {application.status === "accepted" && (
              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <p className="text-sm font-medium mb-2">Contact Information:</p>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon
                      icon={Phone}
                      size={14}
                      className="text-muted-foreground"
                    />
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-medium">
                      {showContacts
                        ? profile.phone || "Not provided"
                        : "****** (Hidden)"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon
                      icon={Mail01Icon}
                      size={14}
                      className="text-muted-foreground"
                    />
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">
                      {showContacts
                        ? profile.user?.email || "Not provided"
                        : "****** (Hidden)"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon
                      icon={LocationIcon}
                      size={14}
                      className="text-muted-foreground"
                    />
                    <span className="text-muted-foreground">Address:</span>
                    <span className="font-medium">
                      {showContacts
                        ? profile.address
                        : "****** (Complete payment to unlock)"}
                    </span>
                  </div>
                </div>
                {!showContacts && gigStatus === "payment_pending" && (
                  <Alert className="mt-2 border-orange-300 bg-orange-50">
                    <HugeiconsIcon
                      icon={CreditCardIcon}
                      className="h-4 w-4 text-orange-600"
                    />
                    <AlertDescription className="text-xs text-orange-800 ml-6">
                      Complete payment to unlock teacher's contact details
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Details */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={LocationIcon}
                  size={16}
                  className="text-muted-foreground"
                />
                <span>{profile.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={MoneyBag01Icon}
                  size={16}
                  className="text-muted-foreground"
                />
                <span>Rs. {application.proposed_rate}/hour</span>
              </div>
              <div className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={BookIcon}
                  size={16}
                  className="text-muted-foreground"
                />
                <span>
                  {profile.subjects
                    .map((s) => s.name)
                    .slice(0, 2)
                    .join(", ")}
                  {profile.subjects.length > 2 &&
                    ` +${profile.subjects.length - 2}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={Calendar03Icon}
                  size={16}
                  className="text-muted-foreground"
                />
                <span>
                  Applied{" "}
                  {new Date(application.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Cover Letter */}
            {application.cover_letter && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm font-medium mb-1">Cover Letter:</p>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {application.cover_letter}
                </p>
              </div>
            )}

            {application.rate_change_proposed_rate && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <p className="text-sm font-medium text-blue-950">
                  Rate change proposed
                </p>
                <p className="mt-1 text-sm text-blue-800">
                  New rate: Rs. {application.rate_change_proposed_rate}/session.
                  Both sides must accept before this affects payment.
                </p>
                {gigStatus === "payment_pending" &&
                  application.rate_change_proposed_by === profile.user.id && (
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" onClick={() => onRespondRate("approve")}>
                        Approve Rate
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onRespondRate("reject")}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  navigate(`/tutor/${profile.id}`, {
                    state: {
                      returnTo: `${location.pathname}${location.search}`,
                      returnLabel: "Back to applications",
                    },
                  })
                }
              >
                <HugeiconsIcon icon={UserIcon} data-icon="inline-start" />
                View Profile
              </Button>
              {application.status === "pending" && (
                <Button size="sm" onClick={onSelect} disabled={disabled}>
                  <HugeiconsIcon
                    icon={CheckmarkCircle01Icon}
                    data-icon="inline-start"
                  />
                  Select Teacher
                </Button>
              )}
              {application.status === "selected" &&
                !application.responded_at && (
                  <>
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <HugeiconsIcon icon={TimeIcon} size={14} />
                      Waiting for response
                      {application.response_deadline && (
                        <span className="text-xs">
                          (Expires:{" "}
                          {new Date(
                            application.response_deadline
                          ).toLocaleDateString()}
                          )
                        </span>
                      )}
                    </Badge>
                    <span className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-800">
                      Messages open after the teacher accepts.
                    </span>
                  </>
                )}
              {application.status === "accepted" && (
                <>
                  <Button variant="outline" size="sm" onClick={openConversation}>
                    <HugeiconsIcon icon={MessageIcon} data-icon="inline-start" />
                    Message
                  </Button>
                  {gigStatus === "payment_pending" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={onCancelMatch}
                    >
                      Cancel Match
                    </Button>
                  )}
                  <Badge variant="default" className="flex items-center gap-1">
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} />
                    Teacher Accepted
                  </Badge>
                </>
              )}
              {application.status === "rejected" && (
                <Badge
                  variant="destructive"
                  className="flex items-center gap-1"
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={14} />
                  Teacher Declined
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getApplicationStatus(status: string) {
  const statusMap: Record<
    string,
    {
      label: string;
      variant: "default" | "secondary" | "outline" | "destructive";
    }
  > = {
    pending: { label: "Pending", variant: "secondary" },
    selected: { label: "Selected", variant: "default" },
    accepted: { label: "Accepted", variant: "default" },
    rejected: { label: "Rejected", variant: "destructive" },
    withdrawn: { label: "Withdrawn", variant: "outline" },
    cancelled: { label: "Cancelled", variant: "destructive" },
  };
  return statusMap[status] || { label: status, variant: "secondary" };
}
