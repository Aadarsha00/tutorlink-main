import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Briefcase01Icon,
  FileCheck,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import api from "@/services/api";
import type { Job, JobApplication, JobApplicationStatus } from "@/services/api";
import { toast } from "sonner";

const applicationStatuses: JobApplicationStatus[] = [
  "pending",
  "reviewed",
  "shortlisted",
  "accepted",
  "rejected",
  "withdrawn",
];

function statusClass(status: string) {
  const map: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    reviewed: "bg-blue-100 text-blue-800 border-blue-300",
    shortlisted: "bg-emerald-100 text-emerald-800 border-emerald-300",
    accepted: "bg-green-100 text-green-800 border-green-300",
    rejected: "bg-red-100 text-red-800 border-red-300",
    withdrawn: "bg-gray-100 text-gray-800 border-gray-300",
  };
  return map[status] || "bg-gray-100 text-gray-800 border-gray-300";
}

export default function AdminJobApplicationsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = React.useState<Job | null>(null);
  const [applications, setApplications] = React.useState<JobApplication[]>([]);
  const [notesById, setNotesById] = React.useState<Record<number, string>>({});
  const [loading, setLoading] = React.useState(true);
  const [savingId, setSavingId] = React.useState<number | null>(null);

  const jobId = Number(id);

  const loadData = React.useCallback(async () => {
    if (!jobId) return;

    try {
      setLoading(true);
      const [jobData, applicationData] = await Promise.all([
        api.jobs.get(jobId),
        api.jobs.applications(jobId),
      ]);
      setJob(jobData);
      setApplications(applicationData);
      setNotesById(
        applicationData.reduce<Record<number, string>>((acc, application) => {
          acc[application.id] = application.admin_notes || "";
          return acc;
        }, {})
      );
    } catch (error) {
      console.error("Failed to load applicants", error);
      toast.error("Failed to load applicants.");
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const updateApplication = async (
    application: JobApplication,
    nextStatus = application.status
  ) => {
    try {
      setSavingId(application.id);
      const updated = await api.jobApplications.patch(application.id, {
        status: nextStatus,
        admin_notes: notesById[application.id] || "",
      });
      setApplications((current) =>
        current.map((item) =>
          item.id === application.id ? { ...item, ...updated } : item
        )
      );
      toast.success("Application updated.");
    } catch (error) {
      console.error("Failed to update application", error);
      toast.error("Failed to update application.");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-gray-300 border-t-teal-600" />
          <p className="text-muted-foreground">Loading applicants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-50 to-neutral-100 p-6">
      <div className="container mx-auto max-w-7xl">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate("/admin/jobs")}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} data-icon="inline-start" />
          Back to Job Management
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={UserMultiple02Icon} size={24} />
              Job Applicants
            </CardTitle>
            <CardDescription>
              {job ? `${job.title} at ${job.school_name}` : "Review applicants"}
            </CardDescription>
          </CardHeader>
        </Card>

        {applications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <HugeiconsIcon
                icon={Briefcase01Icon}
                size={44}
                className="mx-auto mb-4 text-muted-foreground"
              />
              <h3 className="mb-2 text-lg font-semibold">No applications yet</h3>
              <p className="text-muted-foreground">
                Applicants will appear here after teachers apply.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {applications.map((application) => (
              <Card key={application.id}>
                <CardContent className="grid gap-6 p-6 xl:grid-cols-[1fr_300px]">
                  <section className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-semibold">
                        {application.teacher_profile?.full_name || "Teacher"}
                      </h3>
                      <Badge
                        variant="outline"
                        className={statusClass(application.status)}
                      >
                        {application.status}
                      </Badge>
                    </div>
                    {application.teacher_profile && (
                      <div className="mb-4 grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
                        <span>{application.teacher_profile.education}</span>
                        <span>
                          {application.teacher_profile.experience_years} years exp.
                        </span>
                        <span>{application.teacher_profile.location}</span>
                      </div>
                    )}
                    {application.cover_letter && (
                      <div className="mb-4">
                        <p className="mb-1 text-sm font-medium">Cover Letter</p>
                        <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                          {application.cover_letter}
                        </p>
                      </div>
                    )}
                    {application.cv_document?.file_url && (
                      <a
                        href={application.cv_document.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium text-teal-700 hover:underline"
                      >
                        <HugeiconsIcon icon={FileCheck} size={16} />
                        View CV: {application.cv_document.file_name}
                      </a>
                    )}
                  </section>

                  <aside className="space-y-3">
                    <Select
                      value={application.status}
                      onValueChange={(value) =>
                        updateApplication(
                          application,
                          value as JobApplicationStatus
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {applicationStatuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Textarea
                      rows={5}
                      placeholder="Admin notes..."
                      value={notesById[application.id] || ""}
                      onChange={(event) =>
                        setNotesById((current) => ({
                          ...current,
                          [application.id]: event.target.value,
                        }))
                      }
                    />
                    <Button
                      className="w-full"
                      onClick={() => updateApplication(application)}
                      disabled={savingId === application.id}
                    >
                      {savingId === application.id ? "Saving..." : "Save Notes"}
                    </Button>
                  </aside>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
