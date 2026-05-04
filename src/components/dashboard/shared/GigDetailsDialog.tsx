import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  StarIcon,
  UserIcon,
  Location01Icon,
  BookOpen01Icon,
  DollarCircleIcon,
  ClockIcon,
  Calendar03Icon,
  Briefcase01Icon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons";
import api from "@/services/api";
import type { Application, ParentProfile } from "@/services/api";

interface GigDetails {
  id: number;
  title: string;
  subject: string;
  grade: string;
  description: string;
  budget_min: number;
  budget_max: number;
  schedule: Record<string, any>;
  location: string;
  duration_weeks: number;
  sessions_per_week: number;
  status: string;
  created_at: string;
}

interface ApplicationDetails extends Application {
  parent_profile?: ParentProfile;
  gig_details?: GigDetails;
}

interface GigDetailsDialogProps {
  applicationId: number;
}

export function GigDetailsDialog({ applicationId }: GigDetailsDialogProps) {
  const [application, setApplication] =
    React.useState<ApplicationDetails | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadApplicationDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.applications.get(applicationId);
      setApplication(data);
    } catch (err: any) {
      console.error("Failed to load application details", err);
      setError(
        err.response?.data?.detail || "Failed to load application details"
      );
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (open && !application) {
      loadApplicationDetails();
    }
  }, [open]);

  const parent = application?.parent_profile;
  const gig = application?.gig_details;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin text-4xl mb-4">⏳</div>
              <p className="text-muted-foreground">Loading details...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <Alert variant="destructive">
              <HugeiconsIcon icon={AlertCircleIcon} className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        ) : application && gig && parent ? (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div>
                  <DialogTitle className="text-2xl mb-2 font-semibold">
                    {gig.title}
                  </DialogTitle>
                  <DialogDescription>
                    Posted on {new Date(gig.created_at).toLocaleDateString()}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white border rounded-lg p-4 text-center">
                  <HugeiconsIcon
                    icon={StarIcon}
                    className="text-yellow-500 mx-auto mb-2"
                    size={20}
                  />
                  <p className="text-2xl font-bold">
                    {parent.average_rating.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Parent Rating
                  </p>
                </div>
                <div className="bg-white border rounded-lg p-4 text-center">
                  <HugeiconsIcon
                    icon={UserIcon}
                    className="text-blue-500 mx-auto mb-2"
                    size={20}
                  />
                  <p className="text-2xl font-bold">{parent.total_reviews}</p>
                  <p className="text-xs text-muted-foreground">Reviews</p>
                </div>
                <div className="bg-white border rounded-lg p-4 text-center">
                  <HugeiconsIcon
                    icon={Location01Icon}
                    className="text-green-500 mx-auto mb-2"
                    size={20}
                  />
                  <p className="text-lg font-bold truncate">
                    {parent.location}
                  </p>
                  <p className="text-xs text-muted-foreground">Location</p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <HugeiconsIcon icon={Briefcase01Icon} size={18} />
                  Gig Overview
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon
                      icon={BookOpen01Icon}
                      size={16}
                      className="text-muted-foreground"
                    />
                    <span className="text-muted-foreground">Subject:</span>
                    <span className="font-medium">{gig.subject}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon
                      icon={BookOpen01Icon}
                      size={16}
                      className="text-muted-foreground"
                    />
                    <span className="text-muted-foreground">Grade:</span>
                    <span className="font-medium">{gig.grade}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon
                      icon={Location01Icon}
                      size={16}
                      className="text-muted-foreground"
                    />
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-medium">{gig.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon
                      icon={DollarCircleIcon}
                      size={16}
                      className="text-muted-foreground"
                    />
                    <span className="text-muted-foreground">Budget:</span>
                    <span className="font-medium">
                      Rs. {gig.budget_min} - Rs. {gig.budget_max}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon
                      icon={ClockIcon}
                      size={16}
                      className="text-muted-foreground"
                    />
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">
                      {gig.duration_weeks} weeks
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon
                      icon={Calendar03Icon}
                      size={16}
                      className="text-muted-foreground"
                    />
                    <span className="text-muted-foreground">Sessions:</span>
                    <span className="font-medium">
                      {gig.sessions_per_week} per week
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">Description</h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {gig.description}
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">Your Application</h3>
                <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-1">
                      Your Proposed Rate:
                    </p>
                    <p className="text-lg font-bold text-primary">
                      Rs. {application.proposed_rate}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">
                      Your Cover Letter:
                    </p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {application.cover_letter}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Status:</p>
                    <Badge
                      variant={
                        application.status === "selected" ||
                        application.status === "accepted"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {application.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No application data available
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
