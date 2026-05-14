/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Briefcase01Icon,
  Calendar03Icon,
  DollarCircleIcon,
  FileCheck,
  Location01Icon,
  SchoolIcon,
} from "@hugeicons/core-free-icons";
import api from "@/services/api";
import type { Job, JobApplication } from "@/services/api";
import { toast } from "sonner";

function moneyRange(job: Job) {
  if (job.salary_min && job.salary_max) {
    return `Rs. ${job.salary_min} - Rs. ${job.salary_max}`;
  }
  if (job.salary_min) return `From Rs. ${job.salary_min}`;
  if (job.salary_max) return `Up to Rs. ${job.salary_max}`;
  return "Salary not specified";
}

function statusBadge(status: string) {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    reviewed: "bg-blue-100 text-blue-800",
    shortlisted: "bg-emerald-100 text-emerald-800",
    accepted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    withdrawn: "bg-gray-100 text-gray-800",
  };

  return (
    <Badge className={`capitalize ${colors[status] || "bg-gray-100 text-gray-800"}`}>
      {status.replace(/_/g, " ")}
    </Badge>
  );
}

export default function TeacherJobDetailPage({
  applyMode = false,
}: {
  applyMode?: boolean;
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = React.useState<Job | null>(null);
  const [application, setApplication] = React.useState<JobApplication | null>(
    null
  );
  const [coverLetter, setCoverLetter] = React.useState("");
  const [cvFile, setCvFile] = React.useState<File | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");

  const jobId = Number(id);

  const loadData = React.useCallback(async () => {
    if (!jobId) return;

    try {
      setLoading(true);
      const [jobData, applications] = await Promise.all([
        api.jobs.get(jobId),
        api.jobApplications.list(),
      ]);
      setJob(jobData);
      const existing = applications.find((item) => {
        const itemJobId =
          typeof item.job === "number" ? item.job : item.job_details?.id;
        return itemJobId === jobId;
      });
      setApplication(existing || null);
    } catch (err) {
      console.error("Failed to load job", err);
      toast.error("Failed to load job.");
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApply = async () => {
    if (!job) return;

    try {
      setSubmitting(true);
      setError("");
      const applicationData = cvFile
        ? (() => {
            const formData = new FormData();
            formData.append("job", String(job.id));
            formData.append("cover_letter", coverLetter);
            formData.append("cv_file", cvFile);
            return formData;
          })()
        : {
            job: job.id,
            cover_letter: coverLetter,
          };

      await api.jobApplications.create(applicationData);
      toast.success(
        cvFile
          ? "Job application submitted with your uploaded CV."
          : "Job application submitted with your profile CV."
      );
      navigate(`/jobs/${job.id}`);
      await loadData();
    } catch (err: any) {
      const message =
        err.response?.data?.non_field_errors?.[0] ||
        err.response?.data?.detail ||
        err.response?.data?.error ||
        "Failed to apply for this job.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-gray-300 border-t-teal-600" />
          <p className="text-muted-foreground">Loading job...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold">Job not found</h2>
          <Button onClick={() => navigate("/jobs")}>Back to Jobs</Button>
        </div>
      </div>
    );
  }

  const canApply = job.status === "open" && !application;

  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-50 to-neutral-100">
      <div className="container mx-auto max-w-6xl p-6">
        <Button variant="ghost" className="mb-4" onClick={() => navigate("/jobs")}>
          <HugeiconsIcon icon={ArrowLeft01Icon} data-icon="inline-start" />
          Back to Jobs
        </Button>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge variant={job.status === "open" ? "default" : "secondary"}>
                        {job.status}
                      </Badge>
                      <Badge variant="outline">
                        {job.employment_type.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl">{job.title}</CardTitle>
                    <CardDescription>{job.school_name}</CardDescription>
                  </div>
                  {application && statusBadge(application.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 text-sm md:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={SchoolIcon} size={16} />
                    <span className="text-muted-foreground">School:</span>
                    <span className="font-medium">{job.school_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={Location01Icon} size={16} />
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-medium">{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={FileCheck} size={16} />
                    <span className="text-muted-foreground">Subject:</span>
                    <span className="font-medium">
                      {job.subject}
                      {job.grade ? `, ${job.grade}` : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={DollarCircleIcon} size={16} />
                    <span className="text-muted-foreground">Salary:</span>
                    <span className="font-medium">{moneyRange(job)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={Calendar03Icon} size={16} />
                    <span className="text-muted-foreground">Deadline:</span>
                    <span className="font-medium">
                      {job.deadline
                        ? new Date(job.deadline).toLocaleDateString()
                        : "No deadline"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={Briefcase01Icon} size={16} />
                    <span className="text-muted-foreground">Posted:</span>
                    <span className="font-medium">
                      {new Date(job.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="mb-2 font-semibold">School Details</h3>
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {job.school_address}
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 font-semibold">Description</h3>
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {job.description}
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 font-semibold">Requirements</h3>
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {job.requirements}
                  </p>
                </div>
              </CardContent>
            </Card>

            {applyMode && canApply && (
              <Card>
                <CardHeader>
                  <CardTitle>Apply for this Job</CardTitle>
                  <CardDescription>
                    Your latest verified CV from your teacher profile will be attached automatically.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {error && (
                    <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="cover-letter">Cover Letter</Label>
                    <Textarea
                      id="cover-letter"
                      rows={7}
                      className="resize-none"
                      placeholder="Add a short note for the school or admin..."
                      value={coverLetter}
                      onChange={(event) => setCoverLetter(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cv-file">CV</Label>
                    <Input
                      id="cv-file"
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(event) => {
                        setCvFile(event.target.files?.[0] || null);
                        if (error) setError("");
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave empty to use the CV from your teacher profile.
                    </p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => navigate(`/jobs/${job.id}`)}>
                      Cancel
                    </Button>
                    <Button onClick={handleApply} disabled={submitting}>
                      {submitting ? "Submitting..." : "Submit Application"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <aside className="space-y-6">
            {application ? (
              <Card className="border-emerald-200 bg-emerald-50">
                <CardHeader>
                  <CardTitle className="text-lg">Your Application</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Status</span>
                    {statusBadge(application.status)}
                  </div>
                  <div>
                    <p className="mb-1 text-muted-foreground">Applied</p>
                    <p className="font-medium">
                      {new Date(application.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {application.cv_document?.file_url && (
                    <a
                      href={application.cv_document.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex text-sm font-medium text-teal-700 hover:underline"
                    >
                      View attached CV
                    </a>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <Button
                    className="w-full"
                    disabled={!canApply}
                    onClick={() => navigate(`/jobs/${job.id}/apply`)}
                  >
                    Apply for this Job
                  </Button>
                  {!canApply && (
                    <p className="mt-3 text-center text-sm text-muted-foreground">
                      This job is not accepting applications.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Job Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Applications</span>
                  <span className="font-medium">
                    {job.applications_count || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={job.status === "open" ? "default" : "secondary"}>
                    {job.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
