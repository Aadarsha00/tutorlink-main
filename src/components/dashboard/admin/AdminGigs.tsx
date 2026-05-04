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
  Delete02Icon,
  EyeIcon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
  FilterIcon,
  RefreshIcon,
  ArrowDown01Icon,
  ArrowUp01Icon,
} from "@hugeicons/core-free-icons";
import api from "@/services/api";
import { Link } from "react-router-dom";
import type { Gig, GigStatus } from "@/services/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const statusColors: Record<GigStatus, string> = {
  draft: "bg-gray-100 text-gray-800 border-gray-300",
  open: "bg-blue-100 text-blue-800 border-blue-300",
  selection_pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  confirmation_pending: "bg-orange-100 text-orange-800 border-orange-300",
  payment_pending: "bg-amber-100 text-amber-800 border-amber-300",
  active: "bg-purple-100 text-purple-800 border-purple-300",
  completed: "bg-green-100 text-green-800 border-green-300",
  cancelled: "bg-red-100 text-red-800 border-red-300",
  disputed: "bg-rose-100 text-rose-800 border-rose-300",
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

type SortField =
  | "created_at"
  | "updated_at"
  | "budget_max"
  | "applications_count";
type SortOrder = "asc" | "desc";

export default function AdminGigs() {
  const [gigs, setGigs] = React.useState<Gig[]>([]);
  const [filteredGigs, setFilteredGigs] = React.useState<Gig[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [sortField, setSortField] = React.useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = React.useState<SortOrder>("desc");
  const [actionLoading, setActionLoading] = React.useState<number | null>(null);

  // Dialog states
  const [deleteDialog, setDeleteDialog] = React.useState<{
    open: boolean;
    gigId: number | null;
  }>({ open: false, gigId: null });
  const [statusDialog, setStatusDialog] = React.useState<{
    open: boolean;
    gig: Gig | null;
    newStatus: GigStatus | null;
  }>({ open: false, gig: null, newStatus: null });
  const [cancelDialog, setCancelDialog] = React.useState<{
    open: boolean;
    gigId: number | null;
  }>({ open: false, gigId: null });
  const [cancelReason, setCancelReason] = React.useState("");

  React.useEffect(() => {
    loadGigs();
  }, []);

  React.useEffect(() => {
    filterAndSortGigs();
  }, [gigs, searchTerm, statusFilter, sortField, sortOrder]);

  const loadGigs = async () => {
    try {
      setLoading(true);
      const response = await api.gigs.list();
      const gigsData = response.results || [];
      setGigs(gigsData);
    } catch (error) {
      console.error("Failed to load gigs", error);
      toast.error("Failed to load gigs. Please try again.");
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
          gig.id.toString().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((gig) => gig.status === statusFilter);
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

  const handleDeleteGig = async () => {
    if (!deleteDialog.gigId) return;

    try {
      setActionLoading(deleteDialog.gigId);
      await api.gigs.delete(deleteDialog.gigId);
      setGigs(gigs.filter((g) => g.id !== deleteDialog.gigId));
      setDeleteDialog({ open: false, gigId: null });
    } catch (error) {
      console.error("Failed to delete gig", error);
      toast.warning("Failed to delete gig. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleChangeStatus = async () => {
    if (!statusDialog.gig || !statusDialog.newStatus) return;

    try {
      setActionLoading(statusDialog.gig.id);
      const updated = await api.gigs.patch(statusDialog.gig.id, {
        status: statusDialog.newStatus,
      });
      setGigs(gigs.map((g) => (g.id === updated.id ? updated : g)));
      setStatusDialog({ open: false, gig: null, newStatus: null });
    } catch (error) {
      console.error("Failed to update status", error);
      toast.error("Failed to update gig status. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelGig = async () => {
    if (!cancelDialog.gigId) return;

    try {
      setActionLoading(cancelDialog.gigId);
      const updated = await api.gigs.patch(cancelDialog.gigId, {
        status: "cancelled",
        // Note: You might want to add a cancellation_reason field to your model
      });
      setGigs(gigs.map((g) => (g.id === updated.id ? updated : g)));
      setCancelDialog({ open: false, gigId: null });
      setCancelReason("");
    } catch (error) {
      console.error("Failed to cancel gig", error);
      toast.error("Failed to cancel gig. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusCount = (status: string) => {
    if (status === "all") return gigs.length;
    return gigs.filter((g) => g.status === status).length;
  };

  const getAvailableStatusTransitions = (
    currentStatus: GigStatus
  ): GigStatus[] => {
    const transitions: Record<GigStatus, GigStatus[]> = {
      draft: ["open", "cancelled"],
      open: ["selection_pending", "cancelled"],
      selection_pending: ["confirmation_pending", "open", "cancelled"],
      confirmation_pending: ["payment_pending", "cancelled"],
      payment_pending: ["active", "cancelled"],
      active: ["completed", "disputed", "cancelled"],
      completed: [],
      cancelled: [],
      disputed: ["active", "cancelled", "completed"],
    };
    return transitions[currentStatus] || [];
  };

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gig Management</h1>
            <p className="text-muted-foreground">
              Manage all gigs across the platform
            </p>
          </div>
          <Button onClick={loadGigs} variant="outline">
            <HugeiconsIcon icon={RefreshIcon} data-icon="inline-start" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setStatusFilter("all")}
          >
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold mb-1">
                  {getStatusCount("all")}
                </p>
                <p className="text-xs text-muted-foreground">Total Gigs</p>
              </div>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setStatusFilter("open")}
          >
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold mb-1 text-blue-600">
                  {getStatusCount("open")}
                </p>
                <p className="text-xs text-muted-foreground">Open</p>
              </div>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setStatusFilter("active")}
          >
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold mb-1 text-purple-600">
                  {getStatusCount("active")}
                </p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setStatusFilter("completed")}
          >
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold mb-1 text-green-600">
                  {getStatusCount("completed")}
                </p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </CardContent>
          </Card>
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setStatusFilter("disputed")}
          >
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold mb-1 text-rose-600">
                  {getStatusCount("disputed")}
                </p>
                <p className="text-xs text-muted-foreground">Disputed</p>
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
                    placeholder="Search by ID, title, subject, grade, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <HugeiconsIcon icon={FilterIcon} size={16} className="mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="selection_pending">
                    Selection Pending
                  </SelectItem>
                  <SelectItem value="confirmation_pending">
                    Confirmation Pending
                  </SelectItem>
                  <SelectItem value="payment_pending">
                    Payment Pending
                  </SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="disputed">Disputed</SelectItem>
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
                  <SelectItem value="created_at">Created Date</SelectItem>
                  <SelectItem value="updated_at">Updated Date</SelectItem>
                  <SelectItem value="budget_max">Budget</SelectItem>
                  <SelectItem value="applications_count">
                    Applications
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
                <h3 className="text-xl font-semibold mb-2">No gigs found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your filters"
                    : "No gigs have been created yet"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredGigs.map((gig) => (
              <Card key={gig.id} className="hover:shadow-lg transition-shadow">
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
                            {gig.parent_profile && (
                              <span className="text-xs text-muted-foreground">
                                • Parent: {gig.parent_profile.full_name}
                              </span>
                            )}
                          </div>
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
                            {gig.hired_teacher && (
                              <Badge variant="default" className="bg-green-600">
                                Hired
                              </Badge>
                            )}
                            {gig.selected_teacher && !gig.hired_teacher && (
                              <Badge
                                variant="default"
                                className="bg-yellow-600"
                              >
                                Selected
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
                            Created:{" "}
                            {new Date(gig.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <HugeiconsIcon icon={Calendar03Icon} size={16} />
                          <span>
                            Updated:{" "}
                            {new Date(gig.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap lg:flex-col gap-2 lg:w-40">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="flex-1 lg:flex-none"
                      >
                        <Link to={`/gigs/${gig.id}`}>
                          <HugeiconsIcon
                            icon={EyeIcon}
                            data-icon="inline-start"
                          />
                          View Details
                        </Link>
                      </Button>

                      {getAvailableStatusTransitions(gig.status).length > 0 && (
                        <Select
                          value=""
                          onValueChange={(value) =>
                            setStatusDialog({
                              open: true,
                              gig,
                              newStatus: value as GigStatus,
                            })
                          }
                        >
                          <SelectTrigger
                            className="flex-1 lg:flex-none"
                            size="sm"
                          >
                            <HugeiconsIcon
                              icon={CheckmarkCircle02Icon}
                              size={16}
                              className="mr-2"
                            />
                            <SelectValue placeholder="Change Status" />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableStatusTransitions(gig.status).map(
                              (status) => (
                                <SelectItem key={status} value={status}>
                                  {statusLabels[status]}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      )}

                      {gig.status !== "cancelled" &&
                        gig.status !== "completed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 lg:flex-none text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                            onClick={() =>
                              setCancelDialog({ open: true, gigId: gig.id })
                            }
                            disabled={actionLoading === gig.id}
                          >
                            <HugeiconsIcon
                              icon={Cancel01Icon}
                              data-icon="inline-start"
                            />
                            Cancel
                          </Button>
                        )}

                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 lg:flex-none text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() =>
                          setDeleteDialog({ open: true, gigId: gig.id })
                        }
                        disabled={actionLoading === gig.id}
                      >
                        <HugeiconsIcon
                          icon={Delete02Icon}
                          data-icon="inline-start"
                        />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, gigId: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Gig</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this gig? This action cannot be
              undone. All associated applications and data will be permanently
              removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, gigId: null })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteGig}
              disabled={actionLoading !== null}
            >
              {actionLoading ? "Deleting..." : "Delete Gig"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Change Dialog */}
      <Dialog
        open={statusDialog.open}
        onOpenChange={(open) =>
          setStatusDialog({ open, gig: null, newStatus: null })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Gig Status</DialogTitle>
            <DialogDescription>
              Are you sure you want to change the status of "
              {statusDialog.gig?.title}" from{" "}
              <strong>{statusDialog.gig?.status}</strong> to{" "}
              <strong>{statusDialog.newStatus}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setStatusDialog({ open: false, gig: null, newStatus: null })
              }
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangeStatus}
              disabled={actionLoading !== null}
            >
              {actionLoading ? "Updating..." : "Change Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Gig Dialog */}
      <Dialog
        open={cancelDialog.open}
        onOpenChange={(open) => {
          setCancelDialog({ open, gigId: null });
          if (!open) setCancelReason("");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Gig</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this gig? This will notify the
              parent and any teachers who applied.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="cancel-reason">
                Cancellation Reason (Optional)
              </Label>
              <Textarea
                id="cancel-reason"
                placeholder="Provide a reason for cancellation..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCancelDialog({ open: false, gigId: null });
                setCancelReason("");
              }}
            >
              Go Back
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelGig}
              disabled={actionLoading !== null}
            >
              {actionLoading ? "Cancelling..." : "Cancel Gig"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
