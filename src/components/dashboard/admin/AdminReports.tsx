import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import api, { type UserReport } from "@/services/api";
import { toast } from "sonner";

const statusClass: Record<UserReport["status"], string> = {
  open: "bg-red-50 text-red-700 border-red-200",
  in_review: "bg-amber-50 text-amber-700 border-amber-200",
  resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  dismissed: "bg-neutral-100 text-neutral-700 border-neutral-200",
};

const priorityClass: Record<UserReport["priority"], string> = {
  low: "bg-neutral-100 text-neutral-700",
  medium: "bg-sky-50 text-sky-700",
  high: "bg-orange-50 text-orange-700",
  urgent: "bg-red-50 text-red-700",
};

const formatLabel = (value?: string | null) =>
  value ? value.replace(/_/g, " ") : "Not provided";

const formatDateTime = (value?: string | null) =>
  value ? new Date(value).toLocaleString() : "Not provided";

export default function AdminReportsPage() {
  const [reports, setReports] = React.useState<UserReport[]>([]);
  const [status, setStatus] = React.useState("all");
  const [category, setCategory] = React.useState("all");
  const [loading, setLoading] = React.useState(true);
  const [selected, setSelected] = React.useState<UserReport | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [draft, setDraft] = React.useState({
    status: "open" as UserReport["status"],
    priority: "medium" as UserReport["priority"],
    resolution_note: "",
  });

  const loadReports = async () => {
    try {
      setLoading(true);
      setReports(await api.reports.adminList({ status, category }));
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadReports();
  }, [status, category]);

  const openDetails = (report: UserReport) => {
    setSelected(report);
    setDraft({
      status: report.status,
      priority: report.priority,
      resolution_note: report.resolution_note || "",
    });
  };

  const save = async () => {
    if (!selected) return;
    try {
      setSaving(true);
      const updated = await api.reports.adminUpdate(selected.id, draft);
      setReports((current) =>
        current.map((report) => (report.id === updated.id ? updated : report))
      );
      setSelected(updated);
      toast.success("Report updated");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update report");
    } finally {
      setSaving(false);
    }
  };

  const disputeCount = reports.filter((report) => report.category === "dispute").length;
  const openCount = reports.filter((report) => report.status === "open").length;

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-950">Reports & Disputes</h1>
            <p className="text-muted-foreground">
              Review bugs, disputes, safety issues, messages, gigs, users, and other reported content.
            </p>
          </div>
          <Button variant="outline" onClick={loadReports}>Refresh</Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Open</p>
              <p className="text-3xl font-bold">{openCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Disputes</p>
              <p className="text-3xl font-bold">{disputeCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-3xl font-bold">{reports.length}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="flex flex-col gap-3 p-4 md:flex-row">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_review">In Review</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                <SelectItem value="bug">Bug</SelectItem>
                <SelectItem value="content">Content</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="message">Message</SelectItem>
                <SelectItem value="payment">Payment</SelectItem>
                <SelectItem value="dispute">Dispute</SelectItem>
                <SelectItem value="safety">Safety</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inbox</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading && <p className="text-sm text-muted-foreground">Loading reports...</p>}
            {!loading && reports.length === 0 && (
              <p className="text-sm text-muted-foreground">No reports match these filters.</p>
            )}
            {reports.map((report) => (
              <button
                key={report.id}
                onClick={() => openDetails(report)}
                className="w-full rounded-lg border bg-white p-4 text-left transition-colors hover:bg-neutral-50"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap gap-2">
                      <Badge className={statusClass[report.status]}>{report.status.replace("_", " ")}</Badge>
                      <Badge className={priorityClass[report.priority]}>{report.priority}</Badge>
                      <Badge variant="outline">{report.category}</Badge>
                      <Badge variant="outline">{report.target_type}</Badge>
                    </div>
                    <p className="font-semibold text-neutral-950">{report.title}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{report.description}</p>
                  </div>
                  <div className="shrink-0 text-sm text-muted-foreground">
                    {new Date(report.created_at).toLocaleString()}
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[90vh] min-w-1/2 max-w-5xl overflow-hidden p-0">
          {selected && (
            <>
              <div className="border-b bg-white px-6 py-5">
                <DialogHeader className="space-y-3">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <Badge className={statusClass[selected.status]}>
                          {formatLabel(selected.status)}
                        </Badge>
                        <Badge className={priorityClass[selected.priority]}>
                          {formatLabel(selected.priority)}
                        </Badge>
                        <Badge variant="outline">{formatLabel(selected.category)}</Badge>
                        <Badge variant="outline">{formatLabel(selected.target_type)}</Badge>
                      </div>
                      <DialogTitle className="text-2xl leading-tight">
                        {selected.title}
                      </DialogTitle>
                      <DialogDescription>
                        Report #{selected.id} from{" "}
                        {selected.reporter?.full_name ||
                          selected.reporter_email ||
                          "Guest"}
                      </DialogDescription>
                    </div>
                    <div className="rounded-lg border bg-neutral-50 px-3 py-2 text-sm">
                      <p className="text-muted-foreground">Created</p>
                      <p className="font-medium">{formatDateTime(selected.created_at)}</p>
                    </div>
                  </div>
                </DialogHeader>
              </div>

              <div className="max-h-[calc(90vh-190px)] overflow-y-auto px-6 py-5">
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="space-y-5">
                    <section className="rounded-lg border bg-neutral-50 p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-neutral-950">
                          Report Description
                        </p>
                        <Badge variant="outline">
                          {formatLabel(selected.category)}
                        </Badge>
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-6 text-neutral-800">
                        {selected.description}
                      </p>
                    </section>

                    <section className="grid gap-3 text-sm sm:grid-cols-2">
                      <div className="rounded-lg border p-4">
                        <p className="text-muted-foreground">Reported item</p>
                        <p className="mt-1 font-medium capitalize">
                          {formatLabel(selected.target_type)}
                          {selected.target_id ? ` #${selected.target_id}` : ""}
                        </p>
                      </div>
                      <div className="rounded-lg border p-4">
                        <p className="text-muted-foreground">Related label</p>
                        <p className="mt-1 font-medium">
                          {selected.target_label || "Not provided"}
                        </p>
                      </div>
                      <div className="rounded-lg border p-4">
                        <p className="text-muted-foreground">Reporter</p>
                        <p className="mt-1 font-medium">
                          {selected.reporter?.full_name ||
                            selected.reporter_email ||
                            "Guest"}
                        </p>
                        {selected.reporter?.email && (
                          <p className="mt-1 break-all text-muted-foreground">
                            {selected.reporter.email}
                          </p>
                        )}
                      </div>
                      <div className="rounded-lg border p-4">
                        <p className="text-muted-foreground">Assigned to</p>
                        <p className="mt-1 font-medium">
                          {selected.assigned_to?.full_name || "Unassigned"}
                        </p>
                        {selected.assigned_to?.email && (
                          <p className="mt-1 break-all text-muted-foreground">
                            {selected.assigned_to.email}
                          </p>
                        )}
                      </div>
                    </section>

                    <section className="rounded-lg border p-4 text-sm">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-muted-foreground">Page URL</p>
                          <p className="mt-1 break-all font-medium">
                            {selected.page_url || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Last updated</p>
                          <p className="mt-1 font-medium">
                            {formatDateTime(selected.updated_at)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Resolved at</p>
                          <p className="mt-1 font-medium">
                            {formatDateTime(selected.resolved_at)}
                          </p>
                        </div>
                      </div>
                    </section>
                  </div>

                  <aside className="space-y-4">
                    <div className="rounded-lg border bg-white p-4 shadow-sm">
                      <p className="mb-4 text-sm font-semibold text-neutral-950">
                        Admin Review
                      </p>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Status</p>
                          <Select
                            value={draft.status}
                            onValueChange={(value) =>
                              setDraft((current) => ({
                                ...current,
                                status: value as UserReport["status"],
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open">Open</SelectItem>
                              <SelectItem value="in_review">In Review</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                              <SelectItem value="dismissed">Dismissed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Priority</p>
                          <Select
                            value={draft.priority}
                            onValueChange={(value) =>
                              setDraft((current) => ({
                                ...current,
                                priority: value as UserReport["priority"],
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Resolution note</p>
                          <Textarea
                            value={draft.resolution_note}
                            onChange={(event) =>
                              setDraft((current) => ({
                                ...current,
                                resolution_note: event.target.value,
                              }))
                            }
                            placeholder="Add internal resolution notes for this report..."
                            className="min-h-36 resize-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border bg-neutral-50 p-4 text-sm">
                      <p className="mb-3 font-semibold text-neutral-950">
                        Quick Actions
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setDraft((current) => ({
                              ...current,
                              status: "in_review",
                            }))
                          }
                        >
                          Review
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setDraft((current) => ({
                              ...current,
                              status: "resolved",
                            }))
                          }
                        >
                          Resolve
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setDraft((current) => ({
                              ...current,
                              priority: "urgent",
                            }))
                          }
                        >
                          Urgent
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setDraft((current) => ({
                              ...current,
                              status: "dismissed",
                            }))
                          }
                        >
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </aside>
                </div>
              </div>

              <DialogFooter className="border-t bg-white px-6 py-4">
                <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
                  <Button variant="outline" onClick={() => setSelected(null)}>
                    Close
                  </Button>
                  <Button onClick={save} disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
