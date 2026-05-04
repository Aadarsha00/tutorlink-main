import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Briefcase01Icon,
  DollarCircleIcon,
  ClockIcon,
  CheckmarkCircle01Icon,
  CancelCircleIcon,
  Calendar03Icon,
  LocationIcon,
  UserIcon,
  Location01Icon,
  BookOpen01Icon,
  StarIcon,
  Search01Icon,
  Filter,
  ArrowDown01Icon,
} from "@hugeicons/core-free-icons";
import api from "@/services/api";
import type { Application } from "@/services/api";
import { toast } from "sonner";

interface ParentProfile {
  id: number;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
    role: string;
  };
  full_name: string;
  phone: string;
  location: string;
  address: string;
  average_rating: number;
  total_reviews: number;
}

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

function GigDetailsDialog({ application }: { application: Application }) {
  const [details, setDetails] = React.useState<ApplicationDetails | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const loadDetails = async () => {
    try {
      setLoading(true);
      const data = await api.applications.get(application.id);
      setDetails(data);
    } catch (error) {
      console.error("Failed to load details", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (open && !details) {
      loadDetails();
    }
  }, [open]);

  const parent = details?.parent_profile;
  const gig = details?.gig_details;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className=" max-h-[90vh] min-w-[40vw] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin text-4xl mb-4">⏳</div>
              <p className="text-muted-foreground">Loading details...</p>
            </div>
          </div>
        ) : details && gig && parent ? (
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
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <HugeiconsIcon icon={UserIcon} size={18} />
                  Parent Information
                </h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <HugeiconsIcon
                          icon={StarIcon}
                          className="text-yellow-500"
                          size={20}
                        />
                      </div>
                      <p className="text-2xl font-bold">
                        {parent.average_rating.toFixed(1)}
                      </p>
                      <p className="text-xs text-muted-foreground">Rating</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <HugeiconsIcon
                          icon={UserIcon}
                          className="text-blue-500"
                          size={20}
                        />
                      </div>
                      <p className="text-2xl font-bold">
                        {parent.total_reviews}
                      </p>
                      <p className="text-xs text-muted-foreground">Reviews</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <HugeiconsIcon
                          icon={Location01Icon}
                          className="text-green-500"
                          size={20}
                        />
                      </div>
                      <p className="text-lg font-bold truncate">
                        {parent.location}
                      </p>
                      <p className="text-xs text-muted-foreground">Location</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon
                      icon={UserIcon}
                      size={16}
                      className="text-muted-foreground"
                    />
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{parent.full_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon
                      icon={Location01Icon}
                      size={16}
                      className="text-muted-foreground"
                    />
                    <span className="text-muted-foreground">Address:</span>
                    <span className="font-medium">{parent.address}</span>
                  </div>
                </div>
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
                      Rs. {details.proposed_rate}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">
                      Your Cover Letter:
                    </p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {details.cover_letter}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Status:</p>
                    <Badge
                      variant={
                        details.status === "selected" ||
                        details.status === "accepted"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {details.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Failed to load application details
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function getStatusBadge(status: string) {
  const statusConfig = {
    pending: {
      variant: "secondary" as const,
      label: "Pending",
      color: "bg-yellow-100 text-yellow-800",
    },
    selected: {
      variant: "default" as const,
      label: "Selected",
      color: "bg-blue-100 text-blue-800",
    },
    accepted: {
      variant: "default" as const,
      label: "Accepted",
      color: "bg-green-100 text-green-800",
    },
    rejected: {
      variant: "destructive" as const,
      label: "Rejected",
      color: "bg-red-100 text-red-800",
    },
    withdrawn: {
      variant: "secondary" as const,
      label: "Withdrawn",
      color: "bg-gray-100 text-gray-800",
    },
  };

  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}
    >
      {config.label}
    </span>
  );
}

export default function TeacherApplicationsPage() {
  const [applications, setApplications] = React.useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = React.useState<
    Application[]
  >([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [sortBy, setSortBy] = React.useState<string>("date-desc");

  React.useEffect(() => {
    loadApplications();
  }, []);

  React.useEffect(() => {
    filterAndSortApplications();
  }, [applications, searchQuery, statusFilter, sortBy]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await api.applications.list();
      const appArray = Array.isArray(data) ? data : [];
      setApplications(appArray);
    } catch (error) {
      console.error("Failed to load applications", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortApplications = () => {
    let filtered = [...applications];

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((app) => {
        const gig = typeof app.gig === "object" ? app.gig : null;
        if (!gig) return false;

        const searchLower = searchQuery.toLowerCase();
        return (
          gig.title.toLowerCase().includes(searchLower) ||
          gig.subject.toLowerCase().includes(searchLower) ||
          gig.grade.toLowerCase().includes(searchLower) ||
          gig.location.toLowerCase().includes(searchLower)
        );
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        case "date-asc":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case "rate-desc":
          return b.proposed_rate - a.proposed_rate;
        case "rate-asc":
          return a.proposed_rate - b.proposed_rate;
        default:
          return 0;
      }
    });

    setFilteredApplications(filtered);
  };

  const handleWithdraw = async (id: number) => {
    if (!confirm("Are you sure you want to withdraw this application?")) return;

    try {
      await api.applications.withdraw(id);
      await loadApplications();
    } catch (error) {
      console.error("Failed to withdraw application", error);
      toast.error("Failed to withdraw application");
    }
  };

  const handleAccept = async (id: number) => {
    try {
      await api.applications.accept(id);
      await loadApplications();
    } catch (error) {
      console.error("Failed to accept application", error);
      toast.error("Failed to accept application");
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm("Are you sure you want to reject this selection?")) return;

    try {
      await api.applications.reject(id);
      await loadApplications();
    } catch (error) {
      console.error("Failed to reject application", error);
      toast.error("Failed to reject application");
    }
  };

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    selected: applications.filter((a) => a.status === "selected").length,
    accepted: applications.filter((a) => a.status === "accepted").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

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

  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-50 to-neutral-100">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Applications</h1>
          <p className="text-muted-foreground">
            Track and manage all your gig applications
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.pending}
                </p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {stats.selected}
                </p>
                <p className="text-xs text-muted-foreground">Selected</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {stats.accepted}
                </p>
                <p className="text-xs text-muted-foreground">Accepted</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {stats.rejected}
                </p>
                <p className="text-xs text-muted-foreground">Rejected</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <HugeiconsIcon
                  icon={Search01Icon}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  size={18}
                />
                <Input
                  placeholder="Search applications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <HugeiconsIcon
                    icon={Filter}
                    data-icon="inline-start"
                    size={18}
                  />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="selected">Selected</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <HugeiconsIcon
                    icon={ArrowDown01Icon}
                    data-icon="inline-start"
                    size={18}
                  />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Newest First</SelectItem>
                  <SelectItem value="date-asc">Oldest First</SelectItem>
                  <SelectItem value="rate-desc">Highest Rate</SelectItem>
                  <SelectItem value="rate-asc">Lowest Rate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                  <HugeiconsIcon
                    icon={Briefcase01Icon}
                    className="text-neutral-400"
                    size={32}
                  />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  No applications found
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Start applying to gigs to see them here"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredApplications.map((application) => {
              const gig =
                typeof application.gig === "object" ? application.gig : null;
              const isSelected = application.status === "selected";
              const isPending = application.status === "pending";

              return (
                <Card
                  key={application.id}
                  className={isSelected ? "border-blue-200 bg-blue-50/30" : ""}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold mb-1">
                              {gig?.title || "Gig"}
                            </h3>
                            {isSelected && application.response_deadline && (
                              <div className="flex items-center gap-2 text-sm text-red-600 mb-2">
                                <HugeiconsIcon icon={ClockIcon} size={16} />
                                <span className="font-medium">
                                  Respond by{" "}
                                  {new Date(
                                    application.response_deadline
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                          </div>
                          {getStatusBadge(application.status)}
                        </div>

                        {gig && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-muted-foreground mb-4">
                            <div className="flex items-center gap-2">
                              <HugeiconsIcon icon={BookOpen01Icon} size={16} />
                              <span>
                                {gig.subject} - {gig.grade}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <HugeiconsIcon icon={LocationIcon} size={16} />
                              <span>{gig.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <HugeiconsIcon
                                icon={DollarCircleIcon}
                                size={16}
                              />
                              <span>
                                Rs. {gig.budget_min} - Rs. {gig.budget_max}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <HugeiconsIcon icon={Calendar03Icon} size={16} />
                              <span>
                                Applied{" "}
                                {new Date(
                                  application.created_at
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="bg-muted/50 p-3 rounded-lg mb-3 inline-block">
                          <p className="text-sm">
                            <span className="text-muted-foreground">
                              Your proposed rate:
                            </span>{" "}
                            <strong className="text-foreground">
                              Rs. {application.proposed_rate}
                            </strong>
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <GigDetailsDialog application={application} />
                          {isPending && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleWithdraw(application.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Withdraw
                            </Button>
                          )}
                          {isSelected && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleAccept(application.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <HugeiconsIcon
                                  icon={CheckmarkCircle01Icon}
                                  data-icon="inline-start"
                                />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReject(application.id)}
                                className="border-red-300 text-red-600 hover:bg-red-50"
                              >
                                <HugeiconsIcon
                                  icon={CancelCircleIcon}
                                  data-icon="inline-start"
                                />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
