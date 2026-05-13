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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Briefcase01Icon,
  DollarCircleIcon,
  Location01Icon,
  BookOpen01Icon,
  Calendar03Icon,
  UserIcon,
  ClockIcon,
  StarIcon,
  Edit02Icon,
  Delete02Icon,
  CheckmarkCircle01Icon,
  ArrowLeft01Icon,
  FileCheck,
  MessageIcon,
} from "@hugeicons/core-free-icons";
import api from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import type { Gig, User, Application, Rating } from "@/services/api";
import { toast } from "sonner";
import { useLocation, useNavigate } from "react-router-dom";

interface RatingDialogProps {
  gig: Gig;
  existingRating: Rating | null;
  onSuccess: () => void;
  isTeacher?: boolean;
}

function RatingDialog({
  gig,
  existingRating,
  onSuccess,
  isTeacher = false,
}: RatingDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [rating, setRating] = React.useState(existingRating?.score || 0);
  const [hoveredRating, setHoveredRating] = React.useState(0);
  const [review, setReview] = React.useState(existingRating?.review || "");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");

  const targetName = isTeacher ? "Parent" : "Teacher";

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    if (!review.trim()) {
      setError("Please provide a review");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      if (existingRating) {
        await api.ratings.update(existingRating.id, {
          score: rating,
          review: review,
        });
      } else {
        await api.ratings.create({
          gig: gig.id,
          score: rating,
          review: review,
        });
      }

      setOpen(false);
      onSuccess();
    } catch (err: any) {
      console.error("Failed to submit rating", err);
      setError(
        err.response?.data?.detail ||
          err.response?.data?.non_field_errors?.[0] ||
          "Failed to submit rating. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={existingRating ? "outline" : "default"}
          className="w-full"
        >
          <HugeiconsIcon icon={StarIcon} data-icon="inline-start" />
          {existingRating ? "Update Rating" : `Rate ${targetName}`}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {existingRating ? "Update Your Rating" : `Rate ${targetName}`}
          </DialogTitle>
          <DialogDescription>
            Share your experience with this {targetName.toLowerCase()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label>Rating *</Label>
            <div className="flex gap-2 items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <HugeiconsIcon
                    icon={StarIcon}
                    size={40}
                    className={
                      star <= (hoveredRating || rating)
                        ? "text-yellow-500"
                        : "text-gray-300"
                    }
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm font-medium text-muted-foreground">
                  {rating} out of 5
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="review">Review *</Label>
            <Textarea
              id="review"
              placeholder={`Share your experience working with this ${targetName.toLowerCase()}...`}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Your honest feedback helps others make informed decisions
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting
              ? "Submitting..."
              : existingRating
              ? "Update Rating"
              : "Submit Rating"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ExistingRatingCardProps {
  rating: Rating;
}

function ExistingRatingCard({ rating }: ExistingRatingCardProps) {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <HugeiconsIcon
            icon={CheckmarkCircle01Icon}
            className="text-blue-600"
            size={20}
          />
          <h4 className="font-semibold text-blue-900">Your Rating</h4>
        </div>

        <div className="flex gap-1 mb-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <HugeiconsIcon
              key={star}
              icon={StarIcon}
              size={20}
              className={
                star <= rating.score ? "text-yellow-500" : "text-gray-300"
              }
            />
          ))}
          <span className="ml-2 text-sm font-medium">
            {rating.score} out of 5
          </span>
        </div>

        <p className="text-sm text-gray-700 whitespace-pre-wrap">
          {rating.review}
        </p>

        <p className="text-xs text-muted-foreground mt-2">
          Rated on {new Date(rating.created_at).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
}

function ApplyDialog({ gig, onSuccess }: { gig: Gig; onSuccess: () => void }) {
  const [open, setOpen] = React.useState(false);
  const [coverLetter, setCoverLetter] = React.useState("");
  const [proposedRate, setProposedRate] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmit = async () => {
    if (!coverLetter.trim()) {
      setError("Please provide a cover letter");
      return;
    }
    if (!proposedRate || parseFloat(proposedRate) <= 0) {
      setError("Please provide a valid proposed rate");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await api.applications.create({
        gig: gig.id,
        cover_letter: coverLetter,
        proposed_rate: parseFloat(proposedRate),
      });
      setOpen(false);
      setCoverLetter("");
      setProposedRate("");
      onSuccess();
    } catch (err: any) {
      console.error("Failed to apply", err);
      setError(
        err.response?.data?.detail ||
          err.response?.data?.non_field_errors?.[0] ||
          "Failed to submit application. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full">
          <HugeiconsIcon
            icon={CheckmarkCircle01Icon}
            data-icon="inline-start"
          />
          Apply for this Gig
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Apply for {gig.title}</DialogTitle>
          <DialogDescription>
            Submit your application with a cover letter and proposed rate
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="cover-letter">Cover Letter *</Label>
            <Textarea
              id="cover-letter"
              placeholder="Explain why you're the right fit for this gig..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Highlight your experience and why you're suitable for this
              position
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rate">Proposed Hourly Rate (Rs.) *</Label>
            <Input
              id="rate"
              type="number"
              placeholder="1000"
              value={proposedRate}
              onChange={(e) => setProposedRate(e.target.value)}
              min="0"
              step="50"
            />
            <p className="text-xs text-muted-foreground">
              Budget range: Rs. {gig.budget_min} - Rs. {gig.budget_max}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Application"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ApplicationCard({
  application,
  isOwner,
  gigStatus,
}: {
  application: Application;
  isOwner: boolean;
  gigStatus: string;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const teacherProfile = application.teacher_profile;
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

  const cancelMatch = async () => {
    const reason = window.prompt(
      "Optional reason for cancelling this match, for example: teacher not responding"
    );

    if (reason === null) return;

    try {
      await api.applications.cancelMatch(application.id, reason);
      toast.success("Match cancelled. Your gig is open again.");
      window.location.reload();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to cancel match");
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h4 className="font-semibold mb-2">
              {teacherProfile?.full_name || "Teacher"}
            </h4>
            {teacherProfile && (
              <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={BookOpen01Icon} size={16} />
                  <span>{teacherProfile.education}</span>
                </div>
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={ClockIcon} size={16} />
                  <span>{teacherProfile.experience_years} years exp.</span>
                </div>
                <div className="flex items-center gap-2">
                  <HugeiconsIcon
                    icon={StarIcon}
                    size={16}
                    className="text-yellow-500"
                  />
                  <span>
                    {teacherProfile.average_rating.toFixed(1)} (
                    {teacherProfile.total_reviews} reviews)
                  </span>
                </div>
              </div>
            )}
            <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap">
              {application.cover_letter}
            </p>
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 px-3 py-1 rounded-lg">
                <span className="text-sm font-semibold text-primary">
                  Rs. {application.proposed_rate}/hr
                </span>
              </div>
              <Badge
                variant={
                  application.status === "pending" ? "secondary" : "default"
                }
              >
                {application.status}
              </Badge>
            </div>
          </div>
        </div>
        {isOwner && application.status === "pending" && (
          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() =>
                teacherProfile &&
                navigate(`/tutor/${teacherProfile.id}`, {
                  state: {
                    returnTo: `${location.pathname}${location.search}`,
                    returnLabel: "Back to gig",
                  },
                })
              }
              disabled={!teacherProfile}
            >
              View Profile
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              disabled
              title="Messages unlock after the teacher accepts your selection."
            >
              <HugeiconsIcon icon={MessageIcon} data-icon="inline-start" />
              Opens after accept
            </Button>
            <Button
              className="flex-1"
              onClick={async () => {
                try {
                  await api.applications.select(application.id);
                  window.location.reload();
                } catch (error) {
                  console.error("Failed to select application", error);
                }
              }}
            >
              Select Applicant
            </Button>
          </div>
        )}
        {isOwner && application.status === "accepted" && (
          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() =>
                teacherProfile &&
                navigate(`/tutor/${teacherProfile.id}`, {
                  state: {
                    returnTo: `${location.pathname}${location.search}`,
                    returnLabel: "Back to gig",
                  },
                })
              }
              disabled={!teacherProfile}
            >
              View Profile
            </Button>
            <Button variant="outline" className="flex-1" onClick={openConversation}>
              <HugeiconsIcon icon={MessageIcon} data-icon="inline-start" />
              Message
            </Button>
            {gigStatus === "payment_pending" && (
              <Button
                variant="outline"
                className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                onClick={cancelMatch}
              >
                Cancel Match
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function GigDetailPage() {
  const { user: authUser } = useAuth();
  const [gig, setGig] = React.useState<Gig | null>(null);
  const [applications, setApplications] = React.useState<Application[]>([]);
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [hasApplied, setHasApplied] = React.useState(false);
  const [canRate, setCanRate] = React.useState(false);
  const [existingRating, setExistingRating] = React.useState<Rating | null>(
    null
  );
  const [teacherCanRate, setTeacherCanRate] = React.useState(false);
  const [teacherExistingRating, setTeacherExistingRating] =
    React.useState<Rating | null>(null);

  const navigate = useNavigate();

  React.useEffect(() => {
    loadData(authUser);
  }, [authUser?.id, authUser?.role]);

  const loadData = async (currentUser: User | null) => {
    try {
      setLoading(true);
      const gigId = getGigIdFromUrl();

      const gigData = currentUser
        ? await api.gigs.get(gigId).catch(() => api.public.gig(gigId))
        : await api.public.gig(gigId);

      setUser(currentUser);
      setGig(gigData);

      if (
        currentUser?.role === "parent" &&
        currentUser.id === gigData.parent &&
        window.location.pathname.startsWith("/gigs/")
      ) {
        navigate(`/parent/gigs/${gigId}`, { replace: true });
        return;
      }

      // Load applications if parent
      if (currentUser?.role === "parent" && currentUser.id === gigData.parent) {
        const allApplications = await api.applications.list();
        const gigApplications = allApplications.filter((app: Application) => {
          const appGigId = typeof app.gig === "object" ? app.gig.id : app.gig;
          return appGigId === gigId;
        });
        setApplications(gigApplications);

        // Check if parent can rate and get existing rating
        if (gigData.hired_teacher) {
          try {
            const [canRateResponse, ratingResponse] = await Promise.all([
              api.ratings.canRate(gigId),
              api.ratings.getForGig(gigId),
            ]);

            setCanRate(canRateResponse.can_rate);
            if (ratingResponse.exists) {
              setExistingRating(ratingResponse.rating);
            }
          } catch (error) {
            console.error("Failed to check rating status", error);
          }
        }
      }

      // Check if teacher has already applied
      if (currentUser?.role === "teacher") {
        const myApplications = await api.applications.list();
        const alreadyApplied = myApplications.some((app: Application) => {
          const appGigId = typeof app.gig === "object" ? app.gig.id : app.gig;
          return appGigId === gigId;
        });
        setHasApplied(alreadyApplied);

        // Check if teacher can rate parent and get existing rating
        if (gigData.hired_teacher === currentUser.id) {
          try {
            const [canRateResponse, ratingResponse] = await Promise.all([
              api.ratings.canRate(gigId),
              api.ratings.getForGig(gigId),
            ]);

            setTeacherCanRate(canRateResponse.can_rate);
            if (ratingResponse.exists) {
              setTeacherExistingRating(ratingResponse.rating);
            }
          } catch (error) {
            console.error("Failed to check rating status", error);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setLoading(false);
    }
  };

  const getGigIdFromUrl = (): number => {
    const pathParts = window.location.pathname.split("/");
    return parseInt(pathParts[pathParts.length - 1]);
  };

  const handleApplicationSuccess = () => {
    toast.success("Application submitted successfully!");
    loadData(authUser);
  };

  const handleRatingSuccess = () => {
    toast.success(
      existingRating || teacherExistingRating
        ? "Rating updated successfully!"
        : "Rating submitted successfully!"
    );
    loadData(authUser);
  };

  const handleBack = () => {
    navigate(user?.role === "parent" ? "/parent/gigs" : "/gigs");
  };

  const handleEdit = () => {
    navigate(`/parent/gigs/${gig?.id}/edit`);
  };

  const handleDelete = async () => {
    if (!gig) return;
    if (!confirm("Are you sure you want to delete this gig?")) return;

    try {
      await api.gigs.delete(gig.id);
      navigate(user?.role === "parent" ? "/parent/gigs" : "/gigs");
    } catch (error) {
      console.error("Failed to delete gig", error);
      toast.error("Failed to delete gig");
    }
  };

  const handleOpenGigConversation = async () => {
    if (!gig) return;

    try {
      const conversation = await api.messaging.conversationForGig(gig.id);
      if (!conversation) {
        toast.error("Messages unlock after both sides accept the gig.");
        return;
      }

      navigate(`/messages?conversation=${conversation.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to open messages");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-muted-foreground">Loading gig details...</p>
        </div>
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Gig not found</h2>
          <p className="text-muted-foreground mb-4">
            The gig you're looking for doesn't exist
          </p>
          <Button onClick={handleBack}>Go Back</Button>
        </div>
      </div>
    );
  }

  const isOwner = user?.role === "parent" && user.id === gig.parent;
  const isTeacher = user?.role === "teacher";
  const canApply = isTeacher && gig.status === "open" && !hasApplied;
  const isRateable = ["active", "completed", "disputed"].includes(gig.status);
  const canMessageParent =
    isTeacher &&
    gig.hired_teacher === user?.id &&
    ["payment_pending", "active", "completed", "disputed"].includes(gig.status);

  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-50 to-neutral-100">
      <div className="container mx-auto p-6 max-w-6xl">
        <Button variant="ghost" className="mb-4" onClick={handleBack}>
          <HugeiconsIcon icon={ArrowLeft01Icon} data-icon="inline-start" />
          Back to Gigs
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <CardTitle className="text-2xl">{gig.title}</CardTitle>
                      <Badge
                        variant={
                          gig.status === "open" ? "default" : "secondary"
                        }
                      >
                        {gig.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      Posted on {new Date(gig.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  {isOwner && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleEdit}>
                        <HugeiconsIcon
                          icon={Edit02Icon}
                          data-icon="inline-start"
                        />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDelete}
                      >
                        <HugeiconsIcon
                          icon={Delete02Icon}
                          data-icon="inline-start"
                        />
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <HugeiconsIcon icon={Briefcase01Icon} size={18} />
                    Overview
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

                {gig.schedule && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <HugeiconsIcon icon={Calendar03Icon} size={18} />
                        Schedule
                      </h3>

                      <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                        {Object.entries(gig.schedule).map(
                          ([day, timeSlots]: [string, any]) => (
                            <div key={day} className="text-sm">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium capitalize">
                                  {day}:
                                </span>
                              </div>

                              <div className="flex flex-wrap gap-2 ml-2">
                                {(Array.isArray(timeSlots)
                                  ? timeSlots
                                  : [timeSlots]
                                ).map((slot: string, idx: number) => (
                                  <Badge
                                    key={`${slot}-${idx}`}
                                    variant="secondary"
                                  >
                                    {slot}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Applications for Parents */}
            {isOwner && applications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HugeiconsIcon icon={FileCheck} size={20} />
                    Applications ({applications.length})
                  </CardTitle>
                  <CardDescription>
                    Review and manage applications for this gig
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {applications.map((application) => (
                    <ApplicationCard
                      key={application.id}
                      application={application}
                      isOwner={isOwner}
                      gigStatus={gig.status}
                    />
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Button for Teachers */}
            {canApply && (
              <ApplyDialog gig={gig} onSuccess={handleApplicationSuccess} />
            )}

            {!user && gig.status === "open" && (
              <Card className="border-teal-200 bg-teal-50">
                <CardContent className="p-6 text-center">
                  <HugeiconsIcon
                    icon={CheckmarkCircle01Icon}
                    className="mx-auto mb-2 text-teal-700"
                    size={32}
                  />
                  <p className="mb-1 font-semibold text-teal-950">
                    Log in to apply
                  </p>
                  <p className="mb-4 text-sm text-teal-800">
                    Teacher applications are available after signing in.
                  </p>
                  <div className="grid gap-2">
                    <Button onClick={() => navigate("/login")}>Log In</Button>
                    <Button
                      variant="outline"
                      className="border-teal-300 bg-white hover:bg-teal-100"
                      onClick={() => navigate("/register")}
                    >
                      Register as Teacher
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Application Status for Teachers */}
            {isTeacher && hasApplied && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-6 text-center">
                  <HugeiconsIcon
                    icon={CheckmarkCircle01Icon}
                    className="text-green-600 mx-auto mb-2"
                    size={32}
                  />
                  <p className="font-semibold text-green-900 mb-1">
                    Application Submitted
                  </p>
                  <p className="text-sm text-green-700">
                    You've already applied to this gig
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Parent Info */}
            {gig.parent_profile && !isOwner && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HugeiconsIcon icon={UserIcon} size={18} />
                    Posted By
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <HugeiconsIcon
                        icon={UserIcon}
                        className="text-primary"
                        size={32}
                      />
                    </div>
                    <h3 className="font-semibold">
                      {gig.parent_profile.full_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {gig.parent_profile.location}
                    </p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <HugeiconsIcon
                          icon={StarIcon}
                          className="text-yellow-500"
                          size={18}
                        />
                      </div>
                      <p className="text-lg font-bold">
                        {gig.parent_profile.average_rating.toFixed(1)}
                      </p>
                      <p className="text-xs text-muted-foreground">Rating</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <HugeiconsIcon
                          icon={FileCheck}
                          className="text-blue-500"
                          size={18}
                        />
                      </div>
                      <p className="text-lg font-bold">
                        {gig.parent_profile.total_reviews}
                      </p>
                      <p className="text-xs text-muted-foreground">Reviews</p>
                    </div>
                  </div>

                  {user && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleOpenGigConversation}
                      disabled={!canMessageParent}
                      title={
                        canMessageParent
                          ? undefined
                          : "Messages unlock after both sides accept the gig."
                      }
                    >
                      <HugeiconsIcon
                        icon={MessageIcon}
                        data-icon="inline-start"
                      />
                      Message Parent
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Gig Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Applications</span>
                  <span className="font-semibold">
                    {gig.applications_count || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <Badge
                    variant={gig.status === "open" ? "default" : "secondary"}
                  >
                    {gig.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Posted</span>
                  <span className="font-medium">
                    {new Date(gig.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Rating Section for Parents */}
            {isOwner &&
              isRateable &&
              gig.hired_teacher &&
              gig.status === "completed" && (
                <div className="space-y-4">
                  {existingRating ? (
                    <ExistingRatingCard rating={existingRating} />
                  ) : (
                    <Card className="bg-yellow-50 border-yellow-200">
                      <CardContent className="p-6 text-center">
                        <HugeiconsIcon
                          icon={StarIcon}
                          className="text-yellow-600 mx-auto mb-2"
                          size={32}
                        />
                        <p className="font-semibold text-yellow-900 mb-1">
                          Rate Your Teacher
                        </p>
                        <p className="text-sm text-yellow-700 mb-3">
                          Share your experience to help others
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {canRate && (
                    <RatingDialog
                      gig={gig}
                      existingRating={existingRating}
                      onSuccess={handleRatingSuccess}
                      isTeacher={false}
                    />
                  )}
                </div>
              )}

            {/* Rating Section for Teachers */}
            {isTeacher &&
              isRateable &&
              user &&
              gig.hired_teacher === user.id &&
              gig.status === "completed" && (
                <div className="space-y-4">
                  {teacherExistingRating ? (
                    <ExistingRatingCard rating={teacherExistingRating} />
                  ) : (
                    <Card className="bg-yellow-50 border-yellow-200">
                      <CardContent className="p-6 text-center">
                        <HugeiconsIcon
                          icon={StarIcon}
                          className="text-yellow-600 mx-auto mb-2"
                          size={32}
                        />
                        <p className="font-semibold text-yellow-900 mb-1">
                          Rate Your Parent
                        </p>
                        <p className="text-sm text-yellow-700 mb-3">
                          Share your experience to help others
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {teacherCanRate && (
                    <RatingDialog
                      gig={gig}
                      existingRating={teacherExistingRating}
                      onSuccess={handleRatingSuccess}
                      isTeacher={true}
                    />
                  )}
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
