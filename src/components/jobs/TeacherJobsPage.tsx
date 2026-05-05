import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Briefcase01Icon,
  Calendar03Icon,
  DollarCircleIcon,
  FileCheck,
  Location01Icon,
  Search01Icon,
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

function applicationBadge(status?: string) {
  if (!status) return null;
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    reviewed: "bg-blue-100 text-blue-800",
    shortlisted: "bg-emerald-100 text-emerald-800",
    accepted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    withdrawn: "bg-gray-100 text-gray-800",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${
        colors[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

export default function TeacherJobsPage() {
  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [applications, setApplications] = React.useState<JobApplication[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setLoading(true);
      const [jobsResponse, applicationsResponse] = await Promise.all([
        api.jobs.list(),
        api.jobApplications.list(),
      ]);
      setJobs(jobsResponse.results || []);
      setApplications(
        Array.isArray(applicationsResponse) ? applicationsResponse : []
      );
    } catch (error) {
      console.error("Failed to load jobs", error);
      toast.error("Failed to load jobs.");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const applicationsByJob = React.useMemo(() => {
    return applications.reduce<Record<number, JobApplication>>(
      (acc, application) => {
        const jobId =
          typeof application.job === "number"
            ? application.job
            : application.job_details?.id;
        if (jobId) acc[jobId] = application;
        return acc;
      },
      {}
    );
  }, [applications]);

  const filteredJobs = React.useMemo(() => {
    const term = search.toLowerCase();
    return jobs.filter((job) => {
      if (!term) return true;
      return (
        job.title.toLowerCase().includes(term) ||
        job.school_name.toLowerCase().includes(term) ||
        job.subject.toLowerCase().includes(term) ||
        job.location.toLowerCase().includes(term)
      );
    });
  }, [jobs, search]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-gray-300 border-t-teal-600" />
          <p className="text-muted-foreground">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-50 to-neutral-100">
      <div className="container mx-auto max-w-7xl p-6">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Available Jobs</h1>
          <p className="text-muted-foreground">
            Apply to school job openings using the verified CV from your profile.
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <HugeiconsIcon
                icon={Search01Icon}
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                className="pl-10"
                placeholder="Search jobs by title, school, subject, or location..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <HugeiconsIcon
                icon={Briefcase01Icon}
                size={44}
                className="mx-auto mb-4 text-muted-foreground"
              />
              <h3 className="mb-2 text-lg font-semibold">No jobs found</h3>
              <p className="text-muted-foreground">
                New school job openings will appear here when admins publish them.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredJobs.map((job) => {
              const application = applicationsByJob[job.id];
              return (
                <Card key={job.id} className="transition-shadow hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <Badge
                            variant={
                              job.status === "open" ? "default" : "secondary"
                            }
                          >
                            {job.status}
                          </Badge>
                          <Badge variant="outline">
                            {job.employment_type.replace(/_/g, " ")}
                          </Badge>
                          {application && applicationBadge(application.status)}
                        </div>
                        <h2 className="mb-1 text-xl font-semibold">
                          {job.title}
                        </h2>
                        <p className="mb-4 text-sm text-muted-foreground">
                          {job.school_name}
                        </p>
                        <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2 lg:grid-cols-4">
                          <div className="flex items-center gap-2">
                            <HugeiconsIcon icon={FileCheck} size={16} />
                            <span>
                              {job.subject}
                              {job.grade ? `, ${job.grade}` : ""}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <HugeiconsIcon icon={Location01Icon} size={16} />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <HugeiconsIcon icon={DollarCircleIcon} size={16} />
                            <span>{moneyRange(job)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <HugeiconsIcon icon={Calendar03Icon} size={16} />
                            <span>
                              {job.deadline
                                ? `Apply by ${new Date(
                                    job.deadline
                                  ).toLocaleDateString()}`
                                : "No deadline"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 lg:w-44 lg:flex-col">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => navigate(`/jobs/${job.id}`)}
                        >
                          View Details
                        </Button>
                        <Button
                          className="flex-1"
                          disabled={job.status !== "open" || Boolean(application)}
                          onClick={() => navigate(`/jobs/${job.id}/apply`)}
                        >
                          {application ? "Applied" : "Apply"}
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
    </div>
  );
}
