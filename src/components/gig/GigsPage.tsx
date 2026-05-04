import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Briefcase01Icon,
  DollarCircleIcon,
  Location01Icon,
  BookOpen01Icon,
  Calendar03Icon,
  UserIcon,
  Search01Icon,
  PlusSignIcon,
  FileCheck,
  ClockIcon,
  FilterIcon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons";
import api from "@/services/api";
import type {
  Gig,
  User,
  Subject,
  Gigs,
  Application,
  ParentDocumentType,
  ParentVerificationDocument,
} from "@/services/api";
import { useNavigate } from "react-router-dom";

const REQUIRED_PARENT_DOCUMENT_TYPES: ParentDocumentType[] = [
  "citizenship_front",
  "citizenship_back",
];

function GigCard({
  gig,
  user,
  onViewDetails,
  application,
}: {
  gig: Gig;
  user: User;
  onViewDetails: (id: number) => void;
  application?: Application;
}) {
  const isOwner = user.role === "parent" && user.id === gig.parent;
  const hasApplied = user.role === "teacher" && Boolean(application);
  const applicationStatus = application?.status?.replace(/_/g, " ");

  return (
    <Card
      className={`transition-shadow hover:shadow-lg ${
        hasApplied ? "border-green-200 bg-green-50/30" : ""
      }`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold">{gig.title}</h3>
              <div className="flex flex-wrap justify-end gap-2">
                {hasApplied && (
                  <Badge className="bg-green-100 text-green-800 capitalize">
                    Already applied
                    {applicationStatus ? `: ${applicationStatus}` : ""}
                  </Badge>
                )}
                <Badge variant={gig.status === "open" ? "default" : "secondary"}>
                  {gig.status}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={BookOpen01Icon} size={16} />
                <span>
                  {gig.subject} - Grade {gig.grade}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Location01Icon} size={16} />
                <span>{gig.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={DollarCircleIcon} size={16} />
                <span>
                  Rs. {gig.budget_min} - Rs. {gig.budget_max}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Calendar03Icon} size={16} />
                <span>{gig.duration_weeks} weeks</span>
              </div>
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={ClockIcon} size={16} />
                <span>{gig.sessions_per_week}x per week</span>
              </div>
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={FileCheck} size={16} />
                <span>{gig.applications_count || 0} applications</span>
              </div>
            </div>

            {gig.parent_profile && !isOwner && (
              <div className="flex items-center gap-2 text-sm mb-4 p-3 bg-neutral-50 rounded-lg">
                <HugeiconsIcon
                  icon={UserIcon}
                  size={16}
                  className="text-muted-foreground"
                />
                <span className="font-medium">
                  {gig.parent_profile.full_name}
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">
                  {gig.parent_profile.location}
                </span>
              </div>
            )}

            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {gig.description}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onViewDetails(gig.id)}
          >
            View Details
          </Button>
          {user.role === "teacher" && gig.status === "open" && (
            <Button
              className="flex-1"
              variant={hasApplied ? "secondary" : "default"}
              onClick={() => onViewDetails(gig.id)}
            >
              {hasApplied ? "Already Applied" : "Apply Now"}
            </Button>
          )}
          {isOwner && (
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onViewDetails(gig.id)}
            >
              Edit Gig
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function GigsPage() {
  const [gigs, setGigs] = React.useState<Gigs>({
    results: [],
    count: 0,
    next: null,
    previous: null,
  });
  const [user, setUser] = React.useState<User | null>(null);
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [applicationsByGigId, setApplicationsByGigId] = React.useState<
    Record<number, Application>
  >({});
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [subjectFilter, setSubjectFilter] = React.useState<string>("all");
  const [locationFilter, setLocationFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [budgetFilter, setBudgetFilter] = React.useState<string>("all");
  const [durationFilter, setDurationFilter] = React.useState<string>("all");
  const [sessionsFilter, setSessionsFilter] = React.useState<string>("all");
  const [showFilters, setShowFilters] = React.useState(false);
  const [createGigBlocked, setCreateGigBlocked] = React.useState(false);

  const navigate = useNavigate();

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [userData, gigsData, subjectsData] = await Promise.all([
        api.auth.getCurrentUser(),
        api.gigs.list(),
        api.profiles.subjects(),
      ]);
      setUser(userData);
      setGigs(gigsData);
      setSubjects(subjectsData);

      if (userData.role === "teacher") {
        const applications = await api.applications.list();
        const nextApplicationsByGigId = applications.reduce<
          Record<number, Application>
        >((acc, application) => {
          const gigId =
            typeof application.gig === "object"
              ? application.gig.id
              : application.gig;
          acc[gigId] = application;
          return acc;
        }, {});
        setApplicationsByGigId(nextApplicationsByGigId);
      } else {
        setApplicationsByGigId({});
      }
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGigs = React.useMemo(() => {
    return gigs.results.filter((gig) => {
      const matchesSearch =
        gig.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gig.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSubject =
        subjectFilter === "all" || gig.subject === subjectFilter;

      const matchesLocation =
        locationFilter === "all" || gig.location === locationFilter;

      const matchesStatus =
        statusFilter === "all" || gig.status === statusFilter;

      const matchesBudget =
        budgetFilter === "all" ||
        (() => {
          const avgBudget = (gig.budget_min + gig.budget_max) / 2;
          switch (budgetFilter) {
            case "low":
              return avgBudget < 10000;
            case "medium":
              return avgBudget >= 10000 && avgBudget < 25000;
            case "high":
              return avgBudget >= 25000;
            default:
              return true;
          }
        })();

      const matchesDuration =
        durationFilter === "all" ||
        (() => {
          switch (durationFilter) {
            case "short":
              return gig.duration_weeks <= 4;
            case "medium":
              return gig.duration_weeks > 4 && gig.duration_weeks <= 12;
            case "long":
              return gig.duration_weeks > 12;
            default:
              return true;
          }
        })();

      const matchesSessions =
        sessionsFilter === "all" ||
        (() => {
          switch (sessionsFilter) {
            case "1-2":
              return gig.sessions_per_week >= 1 && gig.sessions_per_week <= 2;
            case "3-4":
              return gig.sessions_per_week >= 3 && gig.sessions_per_week <= 4;
            case "5+":
              return gig.sessions_per_week >= 5;
            default:
              return true;
          }
        })();

      return (
        matchesSearch &&
        matchesSubject &&
        matchesLocation &&
        matchesStatus &&
        matchesBudget &&
        matchesDuration &&
        matchesSessions
      );
    });
  }, [
    gigs,
    searchTerm,
    subjectFilter,
    locationFilter,
    statusFilter,
    budgetFilter,
    durationFilter,
    sessionsFilter,
  ]);

  const uniqueLocations = React.useMemo(() => {
    return Array.from(new Set(gigs.results.map((g) => g.location))).filter(
      Boolean
    );
  }, [gigs]);

  const handleViewDetails = (gigId: number) => {
    navigate(`/gigs/${gigId}`);
  };

  const hasVerifiedParentDocuments = (
    documents: ParentVerificationDocument[]
  ) => {
    const latestByType = documents.reduce<
      Partial<Record<ParentDocumentType, ParentVerificationDocument>>
    >((latest, document) => {
      if (!REQUIRED_PARENT_DOCUMENT_TYPES.includes(document.document_type)) {
        return latest;
      }

      latest[document.document_type] ??= document;
      return latest;
    }, {});

    return REQUIRED_PARENT_DOCUMENT_TYPES.every(
      (documentType) => latestByType[documentType]?.verified === true
    );
  };

  const handleCreateGig = async () => {
    setCreateGigBlocked(false);

    try {
      const documents = await api.documents.listMyParent();
      if (!hasVerifiedParentDocuments(documents)) {
        setCreateGigBlocked(true);
        return;
      }

      navigate("/parent/create-gig");
    } catch (error) {
      console.error("Failed to check document verification", error);
      setCreateGigBlocked(true);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSubjectFilter("all");
    setLocationFilter("all");
    setStatusFilter("all");
    setBudgetFilter("all");
    setDurationFilter("all");
    setSessionsFilter("all");
  };

  const activeFiltersCount = [
    searchTerm !== "",
    subjectFilter !== "all",
    locationFilter !== "all",
    statusFilter !== "all",
    budgetFilter !== "all",
    durationFilter !== "all",
    sessionsFilter !== "all",
  ].filter(Boolean).length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-muted-foreground">Loading gigs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-50 to-neutral-100">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {user?.role === "parent" ? "My Gigs" : "Available Gigs"}
              </h1>
              <p className="text-muted-foreground">
                {user?.role === "parent"
                  ? "Manage your tutoring requests"
                  : "Find tutoring opportunities that match your skills"}
              </p>
            </div>
            {user?.role === "parent" && (
              <Button size="lg" onClick={handleCreateGig}>
                <HugeiconsIcon icon={PlusSignIcon} data-icon="inline-start" />
                Create New Gig
              </Button>
            )}
          </div>

          {createGigBlocked && (
            <Card className="mb-4 border-yellow-200 bg-yellow-50">
              <CardContent className="flex flex-col gap-4 p-4 text-yellow-900 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-3">
                  <HugeiconsIcon
                    icon={AlertCircleIcon}
                    size={22}
                    className="mt-0.5 shrink-0"
                  />
                  <div>
                    <p className="font-semibold">
                      Gigs can be created only after documents are verified.
                    </p>
                    <p className="text-sm text-yellow-800">
                      Please verify your citizenship front and citizenship back
                      before creating a gig.
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="border-yellow-300 bg-white hover:bg-yellow-100"
                  onClick={() => navigate("/parent/documents")}
                >
                  Go to Documents
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              {/* Search and Toggle Filters */}
              <div className="flex gap-4 mb-4">
                <div className="relative flex-1">
                  <HugeiconsIcon
                    icon={Search01Icon}
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    placeholder="Search gigs by title or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="relative"
                >
                  <HugeiconsIcon icon={FilterIcon} data-icon="inline-start" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" onClick={clearFilters}>
                    Clear All
                  </Button>
                )}
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-4 border-t">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Subject
                    </label>
                    <Select
                      value={subjectFilter}
                      onValueChange={setSubjectFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Subjects" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Subjects</SelectItem>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.name}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Location
                    </label>
                    <Select
                      value={locationFilter}
                      onValueChange={setLocationFilter}
                    >
                      <SelectTrigger>
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
                  </div>

                  {user?.role === "teacher" && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Status
                      </label>
                      <Select
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="selection_pending">
                            Selection Pending
                          </SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Budget Range
                    </label>
                    <Select
                      value={budgetFilter}
                      onValueChange={setBudgetFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Budgets" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Budgets</SelectItem>
                        <SelectItem value="low">
                          Low (&lt; Rs. 10,000)
                        </SelectItem>
                        <SelectItem value="medium">
                          Medium (Rs. 10,000 - 25,000)
                        </SelectItem>
                        <SelectItem value="high">
                          High (&gt; Rs. 25,000)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Duration
                    </label>
                    <Select
                      value={durationFilter}
                      onValueChange={setDurationFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Durations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Durations</SelectItem>
                        <SelectItem value="short">Short (≤ 4 weeks)</SelectItem>
                        <SelectItem value="medium">
                          Medium (5-12 weeks)
                        </SelectItem>
                        <SelectItem value="long">
                          Long (&gt; 12 weeks)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Sessions/Week
                    </label>
                    <Select
                      value={sessionsFilter}
                      onValueChange={setSessionsFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Sessions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sessions</SelectItem>
                        <SelectItem value="1-2">1-2 sessions</SelectItem>
                        <SelectItem value="3-4">3-4 sessions</SelectItem>
                        <SelectItem value="5+">5+ sessions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Summary */}
          {activeFiltersCount > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredGigs.length} of {gigs.results.length} gigs
            </div>
          )}
        </div>

        {/* Stats for Parents */}
        {user?.role === "parent" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Total Gigs
                    </p>
                    <p className="text-2xl font-bold">{gigs.results.length}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <HugeiconsIcon
                      icon={Briefcase01Icon}
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
                      Open Gigs
                    </p>
                    <p className="text-2xl font-bold">
                      {gigs.results.filter((g) => g.status === "open").length}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <HugeiconsIcon
                      icon={FileCheck}
                      className="text-green-600"
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
                      Total Applications
                    </p>
                    <p className="text-2xl font-bold">
                      {gigs.results.reduce(
                        (sum, g) => sum + (g.applications_count || 0),
                        0
                      )}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <HugeiconsIcon
                      icon={UserIcon}
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
                    <p className="text-sm text-muted-foreground mb-1">Active</p>
                    <p className="text-2xl font-bold">
                      {gigs.results.filter((g) => g.status === "active").length}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                    <HugeiconsIcon
                      icon={ClockIcon}
                      className="text-yellow-600"
                      size={24}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Gigs List */}
        {filteredGigs.length === 0 ? (
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
                <h3 className="text-lg font-semibold mb-2">No gigs found</h3>
                <p className="text-muted-foreground mb-4">
                  {activeFiltersCount > 0
                    ? "No gigs match your current filters. Try adjusting your search criteria."
                    : user?.role === "parent"
                    ? "Create your first gig to find a tutor"
                    : "No gigs are currently available. Check back soon!"}
                </p>
                {activeFiltersCount > 0 ? (
                  <Button onClick={clearFilters} variant="outline">
                    Clear Filters
                  </Button>
                ) : user?.role === "parent" ? (
                  <Button onClick={handleCreateGig}>
                    <HugeiconsIcon
                      icon={PlusSignIcon}
                      data-icon="inline-start"
                    />
                    Create Your First Gig
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredGigs.map((gig) => (
              <GigCard
                key={gig.id}
                gig={gig}
                user={user!}
                onViewDetails={handleViewDetails}
                application={applicationsByGigId[gig.id]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
