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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, Briefcase01Icon } from "@hugeicons/core-free-icons";
import api from "@/services/api";
import type { Job, JobStatus } from "@/services/api";
import { toast } from "sonner";

type JobFormState = {
  title: string;
  school_name: string;
  school_address: string;
  school_contact_email: string;
  school_contact_phone: string;
  subject: string;
  grade: string;
  employment_type: string;
  description: string;
  requirements: string;
  salary_min: string;
  salary_max: string;
  location: string;
  deadline: string;
  status: JobStatus;
};

const emptyForm: JobFormState = {
  title: "",
  school_name: "",
  school_address: "",
  school_contact_email: "",
  school_contact_phone: "",
  subject: "",
  grade: "",
  employment_type: "full_time",
  description: "",
  requirements: "",
  salary_min: "",
  salary_max: "",
  location: "",
  deadline: "",
  status: "open",
};

const jobStatuses: JobStatus[] = ["draft", "open", "closed", "cancelled"];

function toPayload(form: JobFormState): Partial<Job> {
  return {
    title: form.title,
    school_name: form.school_name,
    school_address: form.school_address,
    school_contact_email: form.school_contact_email,
    school_contact_phone: form.school_contact_phone,
    subject: form.subject,
    grade: form.grade,
    employment_type: form.employment_type,
    description: form.description,
    requirements: form.requirements,
    salary_min: form.salary_min ? Number(form.salary_min) : null,
    salary_max: form.salary_max ? Number(form.salary_max) : null,
    location: form.location,
    deadline: form.deadline || null,
    status: form.status,
  };
}

function formFromJob(job: Job): JobFormState {
  return {
    title: job.title,
    school_name: job.school_name,
    school_address: job.school_address,
    school_contact_email: job.school_contact_email || "",
    school_contact_phone: job.school_contact_phone || "",
    subject: job.subject,
    grade: job.grade || "",
    employment_type: job.employment_type,
    description: job.description,
    requirements: job.requirements,
    salary_min: job.salary_min?.toString() || "",
    salary_max: job.salary_max?.toString() || "",
    location: job.location,
    deadline: job.deadline || "",
    status: job.status,
  };
}

export default function AdminJobFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);
  const [form, setForm] = React.useState<JobFormState>(emptyForm);
  const [loading, setLoading] = React.useState(editing);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!id) return;

    const loadJob = async () => {
      try {
        setLoading(true);
        const job = await api.jobs.get(Number(id));
        setForm(formFromJob(job));
      } catch (error) {
        console.error("Failed to load job", error);
        toast.error("Failed to load job.");
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [id]);

  const saveJob = async () => {
    if (
      !form.title ||
      !form.school_name ||
      !form.school_address ||
      !form.subject ||
      !form.location
    ) {
      toast.error("Title, school, address, subject, and location are required.");
      return;
    }

    try {
      setSaving(true);
      if (id) {
        await api.jobs.update(Number(id), toPayload(form));
        toast.success("Job updated.");
      } else {
        await api.jobs.create(toPayload(form));
        toast.success("Job created.");
      }
      navigate("/admin/jobs");
    } catch (error: any) {
      console.error("Failed to save job", error);
      const message =
        error.response?.data?.non_field_errors?.[0] ||
        error.response?.data?.detail ||
        "Failed to save job.";
      toast.error(message);
    } finally {
      setSaving(false);
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

  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-50 to-neutral-100 p-6">
      <div className="container mx-auto max-w-5xl">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate("/admin/jobs")}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} data-icon="inline-start" />
          Back to Job Management
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={Briefcase01Icon} size={24} />
              {editing ? "Edit Job" : "Create Job"}
            </CardTitle>
            <CardDescription>
              Add school details, requirements, salary, deadline, and publishing
              status.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Job Title *</Label>
                <Input
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>School Name *</Label>
                <Input
                  value={form.school_name}
                  onChange={(event) =>
                    setForm({ ...form, school_name: event.target.value })
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>School Address *</Label>
                <Textarea
                  rows={3}
                  value={form.school_address}
                  onChange={(event) =>
                    setForm({ ...form, school_address: event.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>School Contact Email</Label>
                <Input
                  type="email"
                  value={form.school_contact_email}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      school_contact_email: event.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>School Contact Phone</Label>
                <Input
                  value={form.school_contact_phone}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      school_contact_phone: event.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Subject *</Label>
                <Input
                  value={form.subject}
                  onChange={(event) =>
                    setForm({ ...form, subject: event.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Grade</Label>
                <Input
                  value={form.grade}
                  onChange={(event) =>
                    setForm({ ...form, grade: event.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Employment Type</Label>
                <Select
                  value={form.employment_type}
                  onValueChange={(value) =>
                    setForm({ ...form, employment_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">Full Time</SelectItem>
                    <SelectItem value="part_time">Part Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="temporary">Temporary</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location *</Label>
                <Input
                  value={form.location}
                  onChange={(event) =>
                    setForm({ ...form, location: event.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Salary Min</Label>
                <Input
                  type="number"
                  value={form.salary_min}
                  onChange={(event) =>
                    setForm({ ...form, salary_min: event.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Salary Max</Label>
                <Input
                  type="number"
                  value={form.salary_max}
                  onChange={(event) =>
                    setForm({ ...form, salary_max: event.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Deadline</Label>
                <Input
                  type="date"
                  value={form.deadline}
                  onChange={(event) =>
                    setForm({ ...form, deadline: event.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(value) =>
                    setForm({ ...form, status: value as JobStatus })
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
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Description</Label>
                <Textarea
                  rows={5}
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Requirements</Label>
                <Textarea
                  rows={5}
                  value={form.requirements}
                  onChange={(event) =>
                    setForm({ ...form, requirements: event.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-5">
              <Button variant="outline" onClick={() => navigate("/admin/jobs")}>
                Cancel
              </Button>
              <Button onClick={saveJob} disabled={saving}>
                {saving ? "Saving..." : "Save Job"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
