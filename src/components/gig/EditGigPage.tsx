import * as React from "react";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Briefcase01Icon,
  DollarCircleIcon,
  Location01Icon,
  Calendar03Icon,
  ArrowLeft01Icon,
  Add01Icon,
  Delete02Icon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  ClockIcon,
} from "@hugeicons/core-free-icons";
import api from "@/services/api";
import type { Subject, Grade } from "@/services/api";
import { useNavigate, useParams } from "react-router-dom";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

interface TimeSlot {
  day: string;
  slots: string[];
}

interface FormData {
  title: string;
  subject: string;
  grade: string;
  description: string;
  budget_min: string;
  budget_max: string;
  location: string;
  duration_weeks: string;
  sessions_per_week: string;
  schedule: Record<string, string[]>;
}

export default function EditGigPage() {
  const { id } = useParams<{ id: string }>();
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [grades, setGrades] = React.useState<Grade[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = React.useState("");

  const navigate = useNavigate();

  const [formData, setFormData] = React.useState<FormData>({
    title: "",
    subject: "",
    grade: "",
    description: "",
    budget_min: "",
    budget_max: "",
    location: "",
    duration_weeks: "",
    sessions_per_week: "",
    schedule: {},
  });

  const [scheduleData, setScheduleData] = React.useState<TimeSlot[]>([]);
  const [newSlot, setNewSlot] = React.useState({ day: "", time: "" });

  React.useEffect(() => {
    if (id && window.location.pathname.startsWith("/gigs/")) {
      navigate(`/parent/gigs/${id}/edit`, { replace: true });
    }
  }, [id, navigate]);

  React.useEffect(() => {
    loadInitialData();
  }, [id]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [subjectsData, gradesData, gigData] = await Promise.all([
        api.profiles.subjects(),
        api.profiles.grades(),
        api.gigs.get(parseInt(id!)),
      ]);

      setSubjects(subjectsData);
      setGrades(gradesData);

      // Populate form with existing gig data
      setFormData({
        title: gigData.title || "",
        subject: gigData.subject || "",
        grade: gigData.grade || "",
        description: gigData.description || "",
        budget_min: gigData.budget_min?.toString() || "",
        budget_max: gigData.budget_max?.toString() || "",
        location: gigData.location || "",
        duration_weeks: gigData.duration_weeks?.toString() || "",
        sessions_per_week: gigData.sessions_per_week?.toString() || "",
        schedule: gigData.schedule || {},
      });

      // Convert schedule to TimeSlot format
      if (gigData.schedule) {
        const slots: TimeSlot[] = Object.entries(gigData.schedule).map(
          ([day, times]) => ({
            day,
            slots: times as string[],
          })
        );
        setScheduleData(slots);
      }
    } catch (error) {
      console.error("Failed to load data", error);
      setErrors({
        general: "Failed to load gig data. Please refresh the page.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const addTimeSlot = () => {
    if (!newSlot.day || !newSlot.time) {
      setErrors({ schedule: "Please select both day and time" });
      return;
    }

    const existingDayIndex = scheduleData.findIndex(
      (slot) => slot.day === newSlot.day
    );

    if (existingDayIndex >= 0) {
      const updatedSchedule = [...scheduleData];
      if (!updatedSchedule[existingDayIndex].slots.includes(newSlot.time)) {
        updatedSchedule[existingDayIndex].slots.push(newSlot.time);
        setScheduleData(updatedSchedule);
      }
    } else {
      setScheduleData([
        ...scheduleData,
        { day: newSlot.day, slots: [newSlot.time] },
      ]);
    }

    setNewSlot({ day: "", time: "" });
    if (errors.schedule) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.schedule;
        return newErrors;
      });
    }
  };

  const removeTimeSlot = (day: string, time: string) => {
    const updatedSchedule = scheduleData
      .map((slot) => {
        if (slot.day === day) {
          return {
            ...slot,
            slots: slot.slots.filter((t) => t !== time),
          };
        }
        return slot;
      })
      .filter((slot) => slot.slots.length > 0);

    setScheduleData(updatedSchedule);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.subject) {
      newErrors.subject = "Subject is required";
    }
    if (!formData.grade) {
      newErrors.grade = "Grade is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!formData.budget_min || parseFloat(formData.budget_min) <= 0) {
      newErrors.budget_min = "Valid minimum budget is required";
    }
    if (!formData.budget_max || parseFloat(formData.budget_max) <= 0) {
      newErrors.budget_max = "Valid maximum budget is required";
    }
    if (
      formData.budget_min &&
      formData.budget_max &&
      parseFloat(formData.budget_min) > parseFloat(formData.budget_max)
    ) {
      newErrors.budget_max = "Maximum budget must be greater than minimum";
    }
    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }
    if (!formData.duration_weeks || parseInt(formData.duration_weeks) <= 0) {
      newErrors.duration_weeks = "Valid duration is required";
    }
    if (
      !formData.sessions_per_week ||
      parseInt(formData.sessions_per_week) <= 0
    ) {
      newErrors.sessions_per_week = "Valid sessions per week is required";
    }
    if (scheduleData.length === 0) {
      newErrors.schedule = "At least one time slot is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (status?: "draft" | "open") => {
    setSuccessMessage("");

    if (status === "open" && !validateForm()) {
      return;
    }

    if (!status && !validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      const schedule: Record<string, string[]> = {};
      scheduleData.forEach((slot) => {
        schedule[slot.day] = slot.slots;
      });

      const gigData: any = {
        title: formData.title,
        subject: formData.subject,
        grade: formData.grade,
        description: formData.description,
        budget_min: parseFloat(formData.budget_min),
        budget_max: parseFloat(formData.budget_max),
        location: formData.location,
        duration_weeks: parseInt(formData.duration_weeks),
        sessions_per_week: parseInt(formData.sessions_per_week),
        schedule,
      };

      if (status) {
        gigData.status = status;
      }

      await api.gigs.update(parseInt(id!), gigData);

      setSuccessMessage("Gig updated successfully!");

      setTimeout(() => {
        navigate(`/parent/gigs/${id}`);
      }, 1500);
    } catch (error: any) {
      console.error("Failed to update gig", error);

      if (error.response?.data) {
        const apiErrors: Record<string, string> = {};
        Object.keys(error.response.data).forEach((key) => {
          const errorValue = error.response.data[key];
          apiErrors[key] = Array.isArray(errorValue)
            ? errorValue[0]
            : errorValue;
        });
        setErrors(apiErrors);
      } else {
        setErrors({ general: "Failed to update gig. Please try again." });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(`/parent/gigs/${id}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-muted-foreground">Loading gig data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-50 to-neutral-100">
      <div className="container mx-auto p-6 max-w-4xl">
        <Button variant="ghost" className="mb-4" onClick={handleBack}>
          <HugeiconsIcon icon={ArrowLeft01Icon} data-icon="inline-start" />
          Back to Gig
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={Briefcase01Icon} size={24} />
              Edit Gig
            </CardTitle>
            <CardDescription>
              Update your tutoring opportunity details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-center gap-2">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} />
                {successMessage}
              </div>
            )}

            {errors.general && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center gap-2">
                <HugeiconsIcon icon={AlertCircleIcon} size={20} />
                {errors.general}
              </div>
            )}

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Basic Information</h3>

              <div className="space-y-2">
                <Label htmlFor="title">Gig Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Math Tutor Needed for Grade 10"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && (
                  <p className="text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Select
                    value={formData.subject}
                    onValueChange={(value) =>
                      handleInputChange("subject", value)
                    }
                  >
                    <SelectTrigger
                      className={errors.subject ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.name}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.subject && (
                    <p className="text-sm text-red-600">{errors.subject}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grade">Grade Level *</Label>
                  <Select
                    value={formData.grade}
                    onValueChange={(value) => handleInputChange("grade", value)}
                  >
                    <SelectTrigger
                      className={errors.grade ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {grades.map((grade) => (
                        <SelectItem key={grade.id} value={grade.name}>
                          {grade.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.grade && (
                    <p className="text-sm text-red-600">{errors.grade}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what you're looking for in a tutor, learning goals, and any specific requirements..."
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={6}
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description}</p>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <HugeiconsIcon icon={DollarCircleIcon} size={20} />
                Budget
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget_min">Minimum Rate (Rs./hour) *</Label>
                  <Input
                    id="budget_min"
                    type="number"
                    placeholder="500"
                    value={formData.budget_min}
                    onChange={(e) =>
                      handleInputChange("budget_min", e.target.value)
                    }
                    min="0"
                    step="50"
                    className={errors.budget_min ? "border-red-500" : ""}
                  />
                  {errors.budget_min && (
                    <p className="text-sm text-red-600">{errors.budget_min}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget_max">Maximum Rate (Rs./hour) *</Label>
                  <Input
                    id="budget_max"
                    type="number"
                    placeholder="1500"
                    value={formData.budget_max}
                    onChange={(e) =>
                      handleInputChange("budget_max", e.target.value)
                    }
                    min="0"
                    step="50"
                    className={errors.budget_max ? "border-red-500" : ""}
                  />
                  {errors.budget_max && (
                    <p className="text-sm text-red-600">{errors.budget_max}</p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <HugeiconsIcon icon={Location01Icon} size={20} />
                Location & Duration
              </h3>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  placeholder="e.g., Thamel, Kathmandu"
                  value={formData.location}
                  onChange={(e) =>
                    handleInputChange("location", e.target.value)
                  }
                  className={errors.location ? "border-red-500" : ""}
                />
                {errors.location && (
                  <p className="text-sm text-red-600">{errors.location}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration_weeks">Duration (weeks) *</Label>
                  <Input
                    id="duration_weeks"
                    type="number"
                    placeholder="12"
                    value={formData.duration_weeks}
                    onChange={(e) =>
                      handleInputChange("duration_weeks", e.target.value)
                    }
                    min="1"
                    className={errors.duration_weeks ? "border-red-500" : ""}
                  />
                  {errors.duration_weeks && (
                    <p className="text-sm text-red-600">
                      {errors.duration_weeks}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sessions_per_week">Sessions per Week *</Label>
                  <Input
                    id="sessions_per_week"
                    type="number"
                    placeholder="3"
                    value={formData.sessions_per_week}
                    onChange={(e) =>
                      handleInputChange("sessions_per_week", e.target.value)
                    }
                    min="1"
                    className={errors.sessions_per_week ? "border-red-500" : ""}
                  />
                  {errors.sessions_per_week && (
                    <p className="text-sm text-red-600">
                      {errors.sessions_per_week}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <HugeiconsIcon icon={Calendar03Icon} size={20} />
                Preferred Schedule *
              </h3>

              <div className="bg-muted/50 p-4 rounded-lg space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="day">Day</Label>
                    <Select
                      value={newSlot.day}
                      onValueChange={(value) =>
                        setNewSlot((prev) => ({ ...prev, day: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS_OF_WEEK.map((day) => (
                          <SelectItem key={day} value={day}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="time">Time Slot</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newSlot.time}
                      onChange={(e) =>
                        setNewSlot((prev) => ({
                          ...prev,
                          time: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>&nbsp;</Label>
                    <Button
                      type="button"
                      onClick={addTimeSlot}
                      className="w-full"
                    >
                      <HugeiconsIcon
                        icon={Add01Icon}
                        data-icon="inline-start"
                      />
                      Add Slot
                    </Button>
                  </div>
                </div>

                {errors.schedule && (
                  <p className="text-sm text-red-600">{errors.schedule}</p>
                )}

                {scheduleData.length > 0 && (
                  <div className="space-y-3 pt-2">
                    {scheduleData.map((slot) => (
                      <div key={slot.day} className="space-y-2">
                        <p className="font-medium text-sm">{slot.day}:</p>
                        <div className="flex flex-wrap gap-2">
                          {slot.slots.map((time) => (
                            <Badge
                              key={`${slot.day}-${time}`}
                              variant="secondary"
                              className="flex items-center gap-2"
                            >
                              <HugeiconsIcon icon={ClockIcon} size={14} />
                              {time}
                              <button
                                type="button"
                                onClick={() => removeTimeSlot(slot.day, time)}
                                className="ml-1 hover:text-red-600"
                              >
                                <HugeiconsIcon icon={Delete02Icon} size={14} />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => handleSubmit("draft")}
                disabled={submitting}
                className="flex-1"
              >
                Save as Draft
              </Button>
              <Button
                onClick={() => handleSubmit()}
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? (
                  "Saving..."
                ) : (
                  <>
                    <HugeiconsIcon
                      icon={CheckmarkCircle01Icon}
                      data-icon="inline-start"
                    />
                    Update Gig
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
