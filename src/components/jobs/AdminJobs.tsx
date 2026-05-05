import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Calendar03Icon,
  DollarCircleIcon,
  FileCheck,
  Location01Icon,
  PlusSignIcon,
  RefreshIcon,
  Search01Icon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import api from "@/services/api";
import type { Job, JobStatus } from "@/services/api";
import { toast } from "sonner";

type JobFilter = JobStatus | "all";

const jobStatuses: JobStatus[] = ["draft", "open", "closed", "cancelled"];

function moneyRange(job: Job) {
  if (job.salary_min && job.salary_max) {
    return `Rs. ${job.salary_min} - Rs. ${job.salary_max}`;
  }
  if (job.salary_min) return `From Rs. ${job.salary_min}`;
  if (job.salary_max) return `Up to Rs. ${job.salary_max}`;
  return "Salary not specified";
}

function statusClass(status: string) {
  const map: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800 border-gray-300",
    open: "bg-blue-100 text-blue-800 border-blue-300",
    closed: "bg-green-100 text-green-800 border-green-300",
    cancelled: "bg-red-100 text-red-800 border-red-300",
  };
  return map[status] || "bg-gray-100 text-gray-800 border-gray-300";
}

export default function AdminJobs() {
  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState<JobFilter>("open");
  const navigate = useNavigate();

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await api.jobs.list();
      setJobs(response.results || []);
    } catch (error) {
      console.error("Failed to load jobs", error);
      toast.error("Failed to load jobs.");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadJobs();
  }, []);

  const counts = React.useMemo(
    () => ({
      all: jobs.length,
      draft: jobs.filter((job) => job.status === "draft").length,
      open: jobs.filter((job) => job.status === "open").length,
      closed: jobs.filter((job) => job.status === "closed").length,
      cancelled: jobs.filter((job) => job.status === "cancelled").length,
      applications: jobs.reduce(
        (sum, job) => sum + (job.applications_count || 0),
        0
      ),
    }),
    [jobs]
  );

  const visibleJobs = React.useMemo(() => {
    const term = search.toLowerCase();
    return jobs.filter((job) => {
      const matchesFilter = filter === "all" || job.status === filter;
      const matchesSearch =
        !term ||
        job.title.toLowerCase().includes(term) ||
        job.school_name.toLowerCase().includes(term) ||
        job.subject.toLowerCase().includes(term) ||
        job.location.toLowerCase().includes(term);
      return matchesFilter && matchesSearch;
    });
  }, [filter, jobs, search]);

  const updateJobStatus = async (job: Job, status: JobStatus) => {
    try {
      const updated = await api.jobs.patch(job.id, { status });
      setJobs((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      );
      toast.success("Job status updated.");
    } catch (error) {
      console.error("Failed to update job status", error);
      toast.error("Failed to update job status.");
    }
  };

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
    <div className="min-h-screen bg-linear-to-br from-neutral-50 to-neutral-100 p-6">
      <div className="container mx-auto max-w-7xl">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <HugeiconsIcon icon={Briefcase01Icon} size={24} />
                  Job Management
                </CardTitle>
                <CardDescription>
                  Manage school jobs as queues by status, then open dedicated
                  pages to create jobs or review applicants.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={loadJobs}>
                  <HugeiconsIcon icon={RefreshIcon} data-icon="inline-start" />
                  Refresh
                </Button>
                <Button onClick={() => navigate("/admin/jobs/new")}>
                  <HugeiconsIcon icon={PlusSignIcon} data-icon="inline-start" />
                  Create Job
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          {[
            ["Total Jobs", counts.all],
            ["Open", counts.open],
            ["Drafts", counts.draft],
            ["Applications", counts.applications],
          ].map(([label, value]) => (
            <Card key={label}>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </CardContent>
            </Card>
          ))}
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
                placeholder="Search by title, school, subject, or location..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Tabs value={filter} onValueChange={(value) => setFilter(value as JobFilter)}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
            <TabsTrigger value="open">Open ({counts.open})</TabsTrigger>
            <TabsTrigger value="draft">Draft ({counts.draft})</TabsTrigger>
            <TabsTrigger value="closed">Closed ({counts.closed})</TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled ({counts.cancelled})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={filter}>
            {visibleJobs.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <HugeiconsIcon
                    icon={Briefcase01Icon}
                    size={44}
                    className="mx-auto mb-4 text-muted-foreground"
                  />
                  <h3 className="mb-2 text-lg font-semibold">No jobs found</h3>
                  <p className="mb-4 text-muted-foreground">
                    {search
                      ? "Try adjusting your search."
                      : "Create a school job to start receiving applications."}
                  </p>
                  <Button onClick={() => navigate("/admin/jobs/new")}>
                    Create Job
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {visibleJobs.map((job) => (
                  <Card key={job.id} className="transition-shadow hover:shadow-md">
                    <CardContent className="grid gap-6 p-6 xl:grid-cols-[1fr_220px]">
                      <section className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            ID: {job.id}
                          </span>
                          <Badge variant="outline" className={statusClass(job.status)}>
                            {job.status}
                          </Badge>
                          <Badge variant="secondary">
                            {job.employment_type.replace(/_/g, " ")}
                          </Badge>
                        </div>
                        <h2 className="mb-1 text-xl font-semibold">{job.title}</h2>
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
                                ? `Deadline ${new Date(
                                    job.deadline
                                  ).toLocaleDateString()}`
                                : "No deadline"}
                            </span>
                          </div>
                        </div>
                      </section>

                      <aside className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          onClick={() => navigate(`/admin/jobs/${job.id}/edit`)}
                        >
                          Edit Job
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() =>
                            navigate(`/admin/jobs/${job.id}/applications`)
                          }
                        >
                          <HugeiconsIcon
                            icon={UserMultiple02Icon}
                            data-icon="inline-start"
                          />
                          Applicants ({job.applications_count || 0})
                        </Button>
                        <Select
                          value={job.status}
                          onValueChange={(value) =>
                            updateJobStatus(job, value as JobStatus)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {jobStatuses.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </aside>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
