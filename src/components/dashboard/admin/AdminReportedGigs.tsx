import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Briefcase01Icon,
  DollarCircleIcon,
  Location01Icon,
  Calendar03Icon,
  ClockIcon,
  UserMultiple02Icon,
  Search01Icon,
  EyeIcon,
  RefreshIcon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  BookOpen01Icon,
  UserIcon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  TimeScheduleIcon,
} from "@hugeicons/core-free-icons";
import api from "@/services/api";
import type { Gig } from "@/services/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type SortField =
  | "created_at"
  | "updated_at"
  | "budget_max"
  | "duration_weeks"
  | "sessions_per_week";
type SortOrder = "asc" | "desc";

interface DisputedGigStats {
  totalDisputed: number;
  avgDuration: number;
  completingSoon: number;
}

export default function AdminDisputedGigs() {
  const [gigs, setGigs] = React.useState<Gig[]>([]);
  const [filteredGigs, setFilteredGigs] = React.useState<Gig[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [subjectFilter, setSubjectFilter] = React.useState<string>("all");
  const [locationFilter, setLocationFilter] = React.useState<string>("all");
  const [sortField, setSortField] = React.useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("desc");
  const [selectedGig, setSelectedGig] = React.useState<Gig | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = React.useState(false);

  const navigate = useNavigate();

  const stats = React.useMemo<DisputedGigStats>(() => {
    const disputedGigs = gigs.filter((g) => g.status === "disputed");

    const avgDuration =
      disputedGigs.length > 0
        ? disputedGigs.reduce((sum, gig) => sum + gig.duration_weeks, 0) /
          disputedGigs.length
        : 0;

    // Gigs completing in next 2 weeks (simplified - would need start date in real app)
    const completingSoon = disputedGigs.filter(
      (gig) => gig.duration_weeks <= 2
    ).length;

    return {
      totalDisputed: disputedGigs.length,

      avgDuration: Math.round(avgDuration * 10) / 10,
      completingSoon,
    };
  }, [gigs]);

  const uniqueSubjects = React.useMemo(() => {
    return Array.from(new Set(gigs.map((g) => g.subject))).filter(Boolean);
  }, [gigs]);

  const uniqueLocations = React.useMemo(() => {
    return Array.from(new Set(gigs.map((g) => g.location))).filter(Boolean);
  }, [gigs]);

  React.useEffect(() => {
    loadGigs();
  }, []);

  React.useEffect(() => {
    filterAndSortGigs();
  }, [gigs, searchTerm, subjectFilter, locationFilter, sortField, sortOrder]);

  const loadGigs = async () => {
    try {
      setLoading(true);
      const response = await api.gigs.list();
      const gigsData = response.results || [];
      // Filter only disputed gigs
      const disputedGigs = gigsData.filter((gig) => gig.status === "disputed");
      setGigs(disputedGigs);
    } catch (error) {
      console.error("Failed to load disputed gigs", error);
      toast.warning("Failed to load disputed gigs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortGigs = () => {
    let filtered = [...gigs];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (gig) =>
          gig.title.toLowerCase().includes(term) ||
          gig.subject.toLowerCase().includes(term) ||
          gig.grade.toLowerCase().includes(term) ||
          gig.location.toLowerCase().includes(term) ||
          gig.id.toString().includes(term) ||
          gig.parent_profile?.full_name.toLowerCase().includes(term)
      );
    }

    // Subject filter
    if (subjectFilter !== "all") {
      filtered = filtered.filter((gig) => gig.subject === subjectFilter);
    }

    // Location filter
    if (locationFilter !== "all") {
      filtered = filtered.filter((gig) => gig.location === locationFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === "created_at" || sortField === "updated_at") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredGigs(filtered);
  };

  const handleViewDetails = (gig: Gig) => {
    setSelectedGig(gig);
    setShowDetailsDialog(true);
  };

  const navigateToGig = (gigId: number) => {
    navigate(`/gigs/${gigId}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-muted-foreground">Loading disputed gigs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-50 to-neutral-100">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Disputed Gigs</h1>
            <p className="text-muted-foreground">
              Monitor all currently disputed tutoring sessions
            </p>
          </div>
          <Button onClick={loadGigs} variant="outline">
            <HugeiconsIcon icon={RefreshIcon} data-icon="inline-start" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Disputed
                  </p>
                  <p className="text-3xl font-bold">{stats.totalDisputed}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <HugeiconsIcon
                    icon={Briefcase01Icon}
                    className="text-purple-600"
                    size={24}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Avg Duration
                  </p>
                  <p className="text-3xl font-bold">{stats.avgDuration}w</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <HugeiconsIcon
                    icon={TimeScheduleIcon}
                    className="text-blue-600"
                    size={24}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Completing Soon
                  </p>
                  <p className="text-3xl font-bold">{stats.completingSoon}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <HugeiconsIcon
                    icon={AlertCircleIcon}
                    className="text-orange-600"
                    size={24}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Sort */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <HugeiconsIcon
                    icon={Search01Icon}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    size={18}
                  />
                  <Input
                    placeholder="Search by title, subject, location, parent..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <HugeiconsIcon
                    icon={BookOpen01Icon}
                    size={16}
                    className="mr-2"
                  />
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {uniqueSubjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <HugeiconsIcon
                    icon={Location01Icon}
                    size={16}
                    className="mr-2"
                  />
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {uniqueLocations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={sortField}
                onValueChange={(v) => setSortField(v as SortField)}
              >
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Start Date</SelectItem>
                  <SelectItem value="updated_at">Last Updated</SelectItem>
                  <SelectItem value="budget_max">Budget</SelectItem>
                  <SelectItem value="duration_weeks">Duration</SelectItem>
                  <SelectItem value="sessions_per_week">
                    Sessions/Week
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                title={sortOrder === "asc" ? "Ascending" : "Descending"}
              >
                <HugeiconsIcon
                  icon={sortOrder === "asc" ? ArrowUp01Icon : ArrowDown01Icon}
                  size={18}
                />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Disputed Gigs List */}
        {filteredGigs.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <div className="mb-4">
                  <HugeiconsIcon
                    icon={Briefcase01Icon}
                    className="mx-auto text-muted-foreground"
                    size={48}
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  No disputed gigs found
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm ||
                  subjectFilter !== "all" ||
                  locationFilter !== "all"
                    ? "Try adjusting your filters"
                    : "There are currently no disputed gigs"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredGigs.map((gig) => {
              const progress = gig.progress_percentage;
              const daysRemaining = gig.days_remaining;

              return (
                <Card
                  key={gig.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Main Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs text-muted-foreground">
                                ID: {gig.id}
                              </span>
                              <Badge
                                variant="default"
                                className="bg-purple-600"
                              >
                                Disputed
                              </Badge>
                            </div>
                            <h3 className="text-xl font-semibold mb-2 truncate">
                              {gig.title}
                            </h3>
                            <div className="flex flex-wrap gap-2 mb-3">
                              <Badge variant="secondary">{gig.subject}</Badge>
                              <Badge variant="outline">Grade {gig.grade}</Badge>
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-muted-foreground">
                              Progress
                            </span>
                            <span className="font-medium">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                          <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                            <span>
                              {gig.duration_weeks} weeks total duration
                            </span>
                            <span>{daysRemaining} days remaining</span>
                          </div>
                        </div>

                        {/* Parent & Teacher Info */}
                        {gig.parent_profile && (
                          <div className="flex items-center gap-2 text-sm mb-3 p-3 bg-blue-50 rounded-lg">
                            <HugeiconsIcon
                              icon={UserIcon}
                              size={16}
                              className="text-blue-600"
                            />
                            <span className="font-medium text-blue-900">
                              Parent: {gig.parent_profile.full_name}
                            </span>
                            <span className="text-blue-600">•</span>
                            <span className="text-blue-600">
                              {gig.parent_profile.location}
                            </span>
                          </div>
                        )}

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <HugeiconsIcon icon={DollarCircleIcon} size={16} />
                            <span>
                              Budget: Rs. {gig.budget_min.toLocaleString()} -
                              Rs. {gig.budget_max.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <HugeiconsIcon icon={Location01Icon} size={16} />
                            <span className="truncate">{gig.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <HugeiconsIcon icon={ClockIcon} size={16} />
                            <span>{gig.sessions_per_week} sessions/week</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <HugeiconsIcon
                              icon={UserMultiple02Icon}
                              size={16}
                            />
                            <span>
                              {gig.applications_count || 0} applications
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <HugeiconsIcon icon={Calendar03Icon} size={16} />
                            <span>
                              Started:{" "}
                              {new Date(gig.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <HugeiconsIcon
                              icon={CheckmarkCircle02Icon}
                              size={16}
                            />
                            <span>
                              {progress
                                ? progress < 30
                                  ? "Just Started"
                                  : progress < 70
                                  ? "In Progress"
                                  : "Near Completion"
                                : "Not Started"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap lg:flex-col gap-2 lg:w-40">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 lg:flex-none"
                          onClick={() => navigateToGig(gig.id)}
                        >
                          <HugeiconsIcon
                            icon={EyeIcon}
                            data-icon="inline-start"
                          />
                          View Details
                        </Button>

                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1 lg:flex-none"
                          onClick={() => handleViewDetails(gig)}
                        >
                          <HugeiconsIcon
                            icon={CheckmarkCircle02Icon}
                            data-icon="inline-start"
                          />
                          Quick View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick View Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedGig?.title}</DialogTitle>
            <DialogDescription>
              Disputed gig details and progress information
            </DialogDescription>
          </DialogHeader>
          {selectedGig && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Subject & Grade
                  </p>
                  <p className="text-sm">
                    {selectedGig.subject} - Grade {selectedGig.grade}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Location
                  </p>
                  <p className="text-sm">{selectedGig.location}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Budget
                  </p>
                  <p className="text-sm">
                    Rs. {selectedGig.budget_min.toLocaleString()} - Rs.{" "}
                    {selectedGig.budget_max.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Duration & Sessions
                  </p>
                  <p className="text-sm">
                    {selectedGig.duration_weeks} weeks,{" "}
                    {selectedGig.sessions_per_week}x/week
                  </p>
                </div>
              </div>

              {selectedGig.parent_profile && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Parent
                  </p>
                  <p className="text-sm">
                    {selectedGig.parent_profile.full_name} •{" "}
                    {selectedGig.parent_profile.location}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Description
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedGig.description}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Progress
                </p>
                <Progress value={selectedGig.progress_percentage} />
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedGig.days_remaining} days remaining
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDetailsDialog(false)}
            >
              Close
            </Button>
            <Button onClick={() => navigateToGig(selectedGig?.id || 0)}>
              View Full Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
