import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import api, { type CreateReportData, type User } from "@/services/api";
import { toast } from "sonner";

interface ReportDialogProps {
  user?: User | null;
  target?: Partial<CreateReportData>;
  trigger?: React.ReactNode;
}

export function ReportDialog({ user, target, trigger }: ReportDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [form, setForm] = React.useState<CreateReportData>({
    reporter_email: user?.email || "",
    category: target?.category || "bug",
    target_type: target?.target_type || "bug",
    target_id: target?.target_id ?? null,
    target_label: target?.target_label || "",
    page_url: target?.page_url || window.location.href,
    title: target?.title || "",
    description: target?.description || "",
  });

  React.useEffect(() => {
    if (!open) return;
    setForm((current) => ({
      ...current,
      reporter_email: user?.email || current.reporter_email || "",
      page_url: target?.page_url || window.location.href,
    }));
  }, [open, target?.page_url, user?.email]);

  const update = <K extends keyof CreateReportData>(
    key: K,
    value: CreateReportData[K]
  ) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Add a title and description");
      return;
    }

    try {
      setSubmitting(true);
      await api.reports.create(form);
      toast.success("Report sent to admin");
      setOpen(false);
      setForm((current) => ({ ...current, title: "", description: "" }));
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to submit report");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Report</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Report an issue</DialogTitle>
          <DialogDescription>
            Send admins a bug, dispute, safety issue, or report about user-created content.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {!user && (
            <div className="space-y-2">
              <Label htmlFor="report-email">Email</Label>
              <Input
                id="report-email"
                type="email"
                value={form.reporter_email || ""}
                onChange={(event) => update("reporter_email", event.target.value)}
              />
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(value) => update("category", value as UserReportCategory)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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
            </div>

            <div className="space-y-2">
              <Label>Target</Label>
              <Select
                value={form.target_type}
                onValueChange={(value) => update("target_type", value as UserReportTarget)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">Bug</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="profile">Profile</SelectItem>
                  <SelectItem value="gig">Gig</SelectItem>
                  <SelectItem value="job">Job</SelectItem>
                  <SelectItem value="application">Application</SelectItem>
                  <SelectItem value="message">Message</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-title">Title</Label>
            <Input
              id="report-title"
              value={form.title}
              onChange={(event) => update("title", event.target.value)}
              placeholder="Short summary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-description">Description</Label>
            <Textarea
              id="report-description"
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
              className="min-h-32 resize-none"
              placeholder="What happened? Include names, dates, or links if useful."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="target-label">Related item</Label>
              <Input
                id="target-label"
                value={form.target_label || ""}
                onChange={(event) => update("target_label", event.target.value)}
                placeholder="Optional name or title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="page-url">Page URL</Label>
              <Input
                id="page-url"
                value={form.page_url || ""}
                onChange={(event) => update("page_url", event.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={submitting}>
            {submitting ? "Sending..." : "Send Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type UserReportCategory = CreateReportData["category"];
type UserReportTarget = CreateReportData["target_type"];
