// src/pages/ParentMyGigs.tsx - Updated with Payment Status
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Add01Icon,
  Edit02Icon,
  Delete02Icon,
  EyeIcon,
  AlertCircleIcon,
  CreditCardIcon,
} from "@hugeicons/core-free-icons";
import api from "@/services/api";
import { Link, useNavigate } from "react-router-dom";
import type {
  Gig,
  GigBoostPlan,
  GigStatus,
  ParentDocumentType,
  ParentVerificationDocument,
} from "@/services/api";
import { toast } from "sonner";

const statusColors: Record<GigStatus, string> = {
  draft: "bg-gray-100 text-gray-800 border-gray-300",
  open: "bg-blue-100 text-blue-800 border-blue-300",
  selection_pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  confirmation_pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  payment_pending: "bg-orange-100 text-orange-800 border-orange-300",
  active: "bg-purple-100 text-purple-800 border-purple-300",
  completed: "bg-green-100 text-green-800 border-green-300",
  cancelled: "bg-red-100 text-red-800 border-red-300",
  disputed: "bg-red-100 text-red-800 border-red-300",
};

const statusLabels: Record<GigStatus, string> = {
  draft: "Draft",
  open: "Open",
  selection_pending: "Selection Pending",
  confirmation_pending: "Confirmation Pending",
  payment_pending: "Payment Pending",
  active: "Active",
  completed: "Completed",
  cancelled: "Cancelled",
  disputed: "Disputed",
};

const REQUIRED_PARENT_DOCUMENT_TYPES: ParentDocumentType[] = [
  "citizenship_front",
  "citizenship_back",
];

export default function ParentMyGigs() {
  const [gigs, setGigs] = React.useState<Gig[]>([]);
  const [filteredGigs, setFilteredGigs] = React.useState<Gig[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [deleteLoading, setDeleteLoading] = React.useState<number | null>(null);
  const [createGigBlocked, setCreateGigBlocked] = React.useState(false);
  const [boostPlans, setBoostPlans] = React.useState<GigBoostPlan[]>([]);
  const [selectedBoostPlans, setSelectedBoostPlans] = React.useState<
    Record<number, string>
  >({});
  const [boostingGigId, setBoostingGigId] = React.useState<number | null>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    loadGigs();
  }, []);

  React.useEffect(() => {
    filterGigs();
  }, [gigs, searchTerm, statusFilter]);

  const loadGigs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.gigs.list();
      const gigsData = response.results || [];
      setGigs(gigsData);
      if (!boostPlans.length) {
        api.gigBoost
          .plans()
          .then((data) => {
            setBoostPlans(data.plans);
            const defaultPlan = data.plans.find((plan) => plan.popular) || data.plans[0];
            if (defaultPlan) {
              setSelectedBoostPlans((current) => {
                const next = { ...current };
                gigsData.forEach((gig) => {
                  next[gig.id] ||= defaultPlan.id;
                });
                return next;
              });
            }
          })
          .catch(() => undefined);
      }
    } catch (err: any) {
      console.error("Failed to load gigs", err);
      setError(err.response?.data?.detail || "Failed to load gigs");
    } finally {
      setLoading(false);
    }
  };

  const filterGigs = () => {
    let filtered = [...gigs];

    if (searchTerm) {
      filtered = filtered.filter(
        (gig) =>
          gig.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          gig.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          gig.grade.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((gig) => gig.status === statusFilter);
    }

    setFilteredGigs(filtered);
  };

  const handleDeleteGig = async (gigId: number) => {
    if (!confirm("Are you sure you want to delete this gig?")) return;

    try {
      setDeleteLoading(gigId);
      await api.gigs.delete(gigId);
      setGigs(gigs.filter((g) => g.id !== gigId));
    } catch (err: any) {
      console.error("Failed to delete gig", err);
      toast.error(err.response?.data?.detail || "Failed to delete gig");
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleBoostGig = async (gigId: number) => {
    const planId = selectedBoostPlans[gigId] || boostPlans[0]?.id;
    if (!planId) {
      toast.error("No boost plans available right now");
      return;
    }

    try {
      setBoostingGigId(gigId);
      const response = await api.gigBoost.initiate(gigId, planId);
      if (!response.payment_url) {
        throw new Error("Payment URL not returned");
      }
      navigate(response.payment_url);
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || "Failed to boost gig");
    } finally {
      setBoostingGigId(null);
    }
  };

  const getStatusCount = (status: string) => {
    if (status === "all") return gigs.length;
    return gigs.filter((g) => g.status === status).length;
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

  // Count payment pending gigs
  const paymentPendingCount = gigs.filter(
    (g) => g.status === "payment_pending"
  ).length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-muted-foreground">Loading your gigs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Alert variant="destructive" className="max-w-md">
          <HugeiconsIcon icon={AlertCircleIcon} className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-50 to-neutral-100">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Gigs</h1>
            <p className="text-muted-foreground">
              Manage all your tutor gig postings
            </p>
          </div>
          <Button size="lg" onClick={handleCreateGig}>
            <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" />
            Post New Gig
          </Button>
        </div>

        {createGigBlocked && (
          <Alert className="mb-6 border-yellow-300 bg-yellow-50">
            <HugeiconsIcon
              icon={AlertCircleIcon}
              className="h-5 w-5 text-yellow-700"
            />
            <div className="ml-4 flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-yellow-900">
                  Gigs can be created only after documents are verified.
                </p>
                <p className="text-sm text-yellow-800">
                  Please verify your citizenship front and citizenship back
                  before creating a gig.
                </p>
              </div>
              <Button
                variant="outline"
                className="border-yellow-300 bg-white hover:bg-yellow-100"
                onClick={() => navigate("/parent/documents")}
              >
                Go to Documents
              </Button>
            </div>
          </Alert>
        )}

        {/* Payment Pending Alert */}
        {paymentPendingCount > 0 && (
          <Alert className="mb-6 border-orange-300 bg-orange-50">
            <HugeiconsIcon
              icon={CreditCardIcon}
              className="h-5 w-5 text-orange-600"
            />
            <div className="ml-4">
              <h4 className="font-semibold text-orange-900 mb-1">
                Payment Required
              </h4>
              <p className="text-sm text-orange-800">
                You have {paymentPendingCount} gig
                {paymentPendingCount > 1 ? "s" : ""} waiting for payment.
                Complete payment to unlock teacher contact details and start
                your gig.
              </p>
            </div>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold mb-1">
                  {getStatusCount("all")}
                </p>
                <p className="text-xs text-muted-foreground">Total Gigs</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold mb-1 text-blue-600">
                  {getStatusCount("open")}
                </p>
                <p className="text-xs text-muted-foreground">Open</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold mb-1 text-orange-600">
                  {getStatusCount("payment_pending")}
                </p>
                <p className="text-xs text-muted-foreground">Need Payment</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold mb-1 text-purple-600">
                  {getStatusCount("active")}
                </p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold mb-1 text-green-600">
                  {getStatusCount("completed")}
                </p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
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
                    placeholder="Search by title, subject, or grade..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-50">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="selection_pending">
                    Selection Pending
                  </SelectItem>
                  <SelectItem value="payment_pending">
                    Payment Pending
                  </SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Gigs List */}
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
                  {searchTerm || statusFilter !== "all"
                    ? "No gigs found"
                    : "No gigs yet"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Create your first gig to find the perfect tutor"}
                </p>
                {!searchTerm && statusFilter === "all" && (
                  <Button size="lg" onClick={handleCreateGig}>
                    <HugeiconsIcon icon={Add01Icon} data-icon="inline-start" />
                    Post Your First Gig
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredGigs.map((gig) => (
              <Card
                key={gig.id}
                className={`hover:shadow-lg transition-shadow ${
                  gig.status === "payment_pending"
                    ? "border-orange-300 bg-orange-50/30"
                    : ""
                }`}
              >
                <CardContent className="p-6">
                  {/* Payment Required Banner */}
                  {gig.status === "payment_pending" && (
                    <Alert className="mb-4 border-orange-300 bg-orange-50">
                      <HugeiconsIcon
                        icon={CreditCardIcon}
                        className="h-4 w-4 text-orange-600"
                      />
                      <div className="ml-4 flex items-center justify-between flex-1">
                        <div>
                          <p className="text-sm font-semibold text-orange-900">
                            Payment Required
                          </p>
                          <p className="text-xs text-orange-800">
                            Complete payment to unlock teacher contact and start
                            the gig
                          </p>
                        </div>
                        <Button
                          size="sm"
                          className="bg-orange-600 hover:bg-orange-700"
                          onClick={() =>
                            navigate(`/parent/gig/${gig.id}/applications`)
                          }
                        >
                          <HugeiconsIcon
                            icon={CreditCardIcon}
                            size={16}
                            className="mr-2"
                          />
                          Pay Now
                        </Button>
                      </div>
                    </Alert>
                  )}

                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-semibold mb-2 truncate">
                            {gig.title}
                          </h3>
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge
                              className={statusColors[gig.status] || ""}
                              variant="outline"
                            >
                              {statusLabels[gig.status] || gig.status}
                            </Badge>
                            <Badge variant="secondary">{gig.subject}</Badge>
                            <Badge variant="outline">Grade {gig.grade}</Badge>
                            {gig.is_boosted && (
                              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">
                                Boosted
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <HugeiconsIcon icon={DollarCircleIcon} size={16} />
                          <span>
                            Budget: Rs. {gig.budget_min} - Rs. {gig.budget_max}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <HugeiconsIcon icon={Location01Icon} size={16} />
                          <span className="truncate">{gig.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <HugeiconsIcon icon={ClockIcon} size={16} />
                          <span>
                            {gig.duration_weeks} weeks, {gig.sessions_per_week}{" "}
                            sessions/week
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <HugeiconsIcon icon={UserMultiple02Icon} size={16} />
                          <span>
                            {gig.applications_count || 0} applications
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <HugeiconsIcon icon={Calendar03Icon} size={16} />
                          <span>
                            Posted{" "}
                            {new Date(gig.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex lg:flex-col gap-2 lg:w-32">
                      {gig.status === "open" && (
                        <div className="flex flex-1 gap-2 lg:flex-none lg:flex-col">
                          <Select
                            value={selectedBoostPlans[gig.id] || boostPlans[0]?.id || ""}
                            onValueChange={(value) =>
                              setSelectedBoostPlans((current) => ({
                                ...current,
                                [gig.id]: value,
                              }))
                            }
                          >
                            <SelectTrigger className="h-9 flex-1 lg:w-full">
                              <SelectValue placeholder="Boost plan" />
                            </SelectTrigger>
                            <SelectContent>
                              {boostPlans.map((plan) => (
                                <SelectItem key={plan.id} value={plan.id}>
                                  {plan.name} - Rs. {plan.amount}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50 lg:flex-none"
                            onClick={() => handleBoostGig(gig.id)}
                            disabled={boostingGigId === gig.id || boostPlans.length === 0}
                          >
                            <HugeiconsIcon
                              icon={CreditCardIcon}
                              data-icon="inline-start"
                            />
                            {boostingGigId === gig.id ? "..." : "Boost"}
                          </Button>
                        </div>
                      )}
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="flex-1 lg:flex-none"
                      >
                        <Link to={`/parent/gigs/${gig.id}`}>
                          <HugeiconsIcon
                            icon={EyeIcon}
                            data-icon="inline-start"
                          />
                          View
                        </Link>
                      </Button>
                      {gig.status !== "payment_pending" &&
                        gig.status !== "active" &&
                        gig.status !== "completed" && (
                          <>
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="flex-1 lg:flex-none"
                            >
                              <Link to={`/parent/gigs/${gig.id}/edit`}>
                                <HugeiconsIcon
                                  icon={Edit02Icon}
                                  data-icon="inline-start"
                                />
                                Edit
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 lg:flex-none text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteGig(gig.id)}
                              disabled={deleteLoading === gig.id}
                            >
                              <HugeiconsIcon
                                icon={Delete02Icon}
                                data-icon="inline-start"
                              />
                              {deleteLoading === gig.id ? "..." : "Delete"}
                            </Button>
                          </>
                        )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
