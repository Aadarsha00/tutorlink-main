// pages/TeacherProfileSetupPage.tsx
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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserIcon,
  CheckmarkCircle01Icon,
  FileUploadIcon,
} from "@hugeicons/core-free-icons";
import api, {
  type Subject,
  type Grade,
  type VerificationDocument,
} from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { FileUpload } from "@/components/ui/file-upload";

type TeacherDocumentType =
  | "citizenship_front"
  | "citizenship_back"
  | "academic"
  | "cv";
type TeacherDocumentMap = Partial<
  Record<TeacherDocumentType, VerificationDocument>
>;
type ApiError = {
  response?: {
    status?: number;
    data?: {
      detail?: string;
      message?: string;
      error?: string;
      [key: string]: unknown;
    };
  };
};

type TeacherProfileFormFields = {
  full_name: string;
  phone: string;
  education: string;
  experience_years: number;
  location: string;
  address: string;
  hourly_rate_min: number;
  hourly_rate_max: number;
  bio: string;
};

const isTeacherDocumentType = (value: string): value is TeacherDocumentType =>
  [
    "citizenship_front",
    "citizenship_back",
    "academic",
    "cv",
  ].includes(value);

const formatApiError = (err: unknown) => {
  const data = (err as ApiError).response?.data;
  if (!data) {
    return "Failed to save profile. Please check all fields and try again.";
  }

  if (typeof data === "string") {
    return data;
  }

  if (data.detail || data.message || data.error) {
    return data.detail || data.message || data.error || "";
  }

  const fieldErrors = Object.entries(data)
    .flatMap(([field, value]) => {
      const messages = Array.isArray(value) ? value : [value];
      return messages.map((message) => `${field}: ${String(message)}`);
    })
    .join(". ");

  return (
    fieldErrors ||
    "Failed to save profile. Please check all fields and try again."
  );
};

const buildTeacherProfileFormData = (
  formData: TeacherProfileFormFields,
  selectedSubjects: number[],
  selectedGrades: number[],
  kycPhoto?: File | null,
) => {
  const formDataToSend = new FormData();

  Object.entries(formData).forEach(([key, value]) => {
    formDataToSend.append(key, String(value));
  });

  selectedSubjects.forEach((id) =>
    formDataToSend.append("subject_ids", String(id)),
  );
  selectedGrades.forEach((id) =>
    formDataToSend.append("grade_ids", String(id)),
  );

  if (kycPhoto) {
    formDataToSend.append("kyc_photo", kycPhoto);
  }

  return formDataToSend;
};

export function TeacherProfileSetupPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [initialLoading, setInitialLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [grades, setGrades] = React.useState<Grade[]>([]);
  const [selectedSubjects, setSelectedSubjects] = React.useState<number[]>([]);
  const [selectedGrades, setSelectedGrades] = React.useState<number[]>([]);
  const [documents, setDocuments] = React.useState<TeacherDocumentMap>({});

  const [pendingFiles, setPendingFiles] = React.useState<{
    citizenship_front?: File;
    citizenship_back?: File;
    academic?: File;
    cv?: File;
  }>({});

  const [isEdit, setIsEdit] = React.useState(false);
  const [kycPhoto, setKycPhoto] = React.useState<File | null>(null);
  const [kycPhotoPreview, setKycPhotoPreview] = React.useState<string>("");

  const [formData, setFormData] = React.useState({
    full_name: "",
    phone: "",
    education: "",
    experience_years: 0,
    location: "",
    address: "",
    hourly_rate_min: 0,
    hourly_rate_max: 0,
    bio: "",
  });

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [subjectsData, gradesData] = await Promise.all([
          api.profiles.subjects(),
          api.profiles.grades(),
        ]);
        setSubjects(subjectsData);
        setGrades(gradesData);

        try {
          const profile = await api.profiles.teacher.get();

          setIsEdit(true);
          setFormData({
            full_name: profile.full_name,
            phone: profile.phone,
            education: profile.education,
            experience_years: profile.experience_years,
            location: profile.location,
            address: profile.address,
            hourly_rate_min: Number(profile.hourly_rate_min),
            hourly_rate_max: Number(profile.hourly_rate_max),
            bio: profile.bio,
          });

          setSelectedSubjects(profile.subjects.map((s) => s.id));
          setSelectedGrades(profile.grades.map((g) => g.id));

          const docs = profile.documents || [];
          const docMap: TeacherDocumentMap = {};
          docs.forEach((doc) => {
            if (isTeacherDocumentType(doc.document_type)) {
              docMap[doc.document_type] = doc;
            }
          });
          setDocuments(docMap);
        } catch (err: unknown) {
          const apiError = err as ApiError;
          if (apiError.response?.status === 404) {
            setIsEdit(false);
            if (user) {
              setFormData((prev) => ({
                ...prev,
                full_name: `${user.first_name} ${user.last_name}`.trim() || "",
              }));
            }
          } else {
            console.error("Error loading profile:", err);
          }
        }
      } catch (err) {
        console.error("Failed to load options:", err);
        setError("Failed to load form data");
      } finally {
        setInitialLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const toggleSubject = (subjectId: number) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId],
    );
    if (error) setError("");
  };

  const toggleGrade = (gradeId: number) => {
    setSelectedGrades((prev) =>
      prev.includes(gradeId)
        ? prev.filter((id) => id !== gradeId)
        : [...prev, gradeId],
    );
    if (error) setError("");
  };

  const handleDocumentUpload = (type: string, doc: VerificationDocument) => {
    setDocuments((prev) => ({ ...prev, [type]: doc }));
  };

  const handleFileSelect = (type: string, file: File) => {
    setPendingFiles((prev) => ({ ...prev, [type]: file }));
    if (error) setError("");
  };

  const handleKycPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("KYC photo must be less than 5MB");
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setError("KYC photo must be JPG or PNG format");
      return;
    }

    setKycPhoto(file);
    setKycPhotoPreview(URL.createObjectURL(file));
    setError("");
  };

  const validateForm = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Basic field validation
    if (!formData.full_name.trim()) errors.push("Full Name is required");
    if (!formData.phone.trim()) errors.push("Phone Number is required");
    if (!formData.education.trim())
      errors.push("Education Background is required");
    if (formData.experience_years < 0)
      errors.push("Experience Years must be 0 or more");
    if (!formData.location.trim()) errors.push("Location is required");
    if (!formData.address.trim()) errors.push("Address is required");
    if (!formData.bio.trim()) errors.push("Bio is required");

    // Rate validation
    if (formData.hourly_rate_min <= 0)
      errors.push("Minimum Hourly Rate must be greater than 0");
    if (formData.hourly_rate_max <= 0)
      errors.push("Maximum Hourly Rate must be greater than 0");
    if (formData.hourly_rate_min > formData.hourly_rate_max) {
      errors.push("Minimum rate cannot be greater than maximum rate");
    }

    // Subjects and grades
    if (selectedSubjects.length === 0)
      errors.push("Please select at least one subject");
    if (selectedGrades.length === 0)
      errors.push("Please select at least one grade");

    // Document validation (only for new profiles)
    if (!isEdit) {
      if (!kycPhoto) {
        errors.push("KYC verification photo is required");
      }
      if (!pendingFiles.citizenship_front && !documents.citizenship_front) {
        errors.push("Citizenship/ID Card front document is required");
      }
      if (!pendingFiles.citizenship_back && !documents.citizenship_back) {
        errors.push("Citizenship/ID Card back document is required");
      }
      if (!pendingFiles.academic && !documents.academic) {
        errors.push("Academic Certificate document is required");
      }
      if (!pendingFiles.cv && !documents.cv) {
        errors.push("CV document is required");
      }
    }

    return { valid: errors.length === 0, errors };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate form
      const validation = validateForm();
      if (!validation.valid) {
        setError(validation.errors.join(". "));
        setLoading(false);
        return;
      }

      if (isEdit) {
        // Update existing profile
        const profileData = kycPhoto
          ? buildTeacherProfileFormData(
              formData,
              selectedSubjects,
              selectedGrades,
              kycPhoto,
            )
          : {
              ...formData,
              subject_ids: selectedSubjects,
              grade_ids: selectedGrades,
            };

        await api.profiles.teacher.update(profileData);

        // Upload any new documents
        if (pendingFiles.citizenship_front) {
          await api.documents.uploadTeacher(
            pendingFiles.citizenship_front,
            "citizenship_front",
          );
        }
        if (pendingFiles.citizenship_back) {
          await api.documents.uploadTeacher(
            pendingFiles.citizenship_back,
            "citizenship_back",
          );
        }
        if (pendingFiles.academic) {
          await api.documents.uploadTeacher(pendingFiles.academic, "academic");
        }
        if (pendingFiles.cv) {
          await api.documents.uploadTeacher(
            pendingFiles.cv,
            "cv",
          );
        }
      } else {
        // Create new profile with KYC photo
        const formDataToSend = buildTeacherProfileFormData(
          formData,
          selectedSubjects,
          selectedGrades,
          kycPhoto,
        );

        await api.profiles.teacher.create(formDataToSend);

        // Upload documents after profile is created
        const uploadPromises: Promise<VerificationDocument>[] = [];

        if (pendingFiles.citizenship_front) {
          uploadPromises.push(
            api.documents.uploadTeacher(
              pendingFiles.citizenship_front,
              "citizenship_front",
            ),
          );
        }
        if (pendingFiles.citizenship_back) {
          uploadPromises.push(
            api.documents.uploadTeacher(
              pendingFiles.citizenship_back,
              "citizenship_back",
            ),
          );
        }
        if (pendingFiles.academic) {
          uploadPromises.push(
            api.documents.uploadTeacher(pendingFiles.academic, "academic"),
          );
        }
        if (pendingFiles.cv) {
          uploadPromises.push(
            api.documents.uploadTeacher(pendingFiles.cv, "cv"),
          );
        }

        // Wait for all uploads to complete
        await Promise.all(uploadPromises);
      }

      navigate("/dashboard");
    } catch (err: unknown) {
      console.error("Profile save error:", err);
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-50 to-neutral-100 p-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-black">
              <HugeiconsIcon
                icon={UserIcon}
                strokeWidth={2}
                className="text-white"
                size={32}
              />
            </div>
            <CardTitle className="text-2xl">
              {isEdit
                ? "Update Your Teacher Profile"
                : "Complete Your Teacher Profile"}
            </CardTitle>
            <CardDescription>
              {isEdit
                ? "Update your information and upload any missing verification documents"
                : "Please provide your information and upload verification documents to start applying for teaching opportunities"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                {/* KYC Photo Upload */}
                {!isEdit && (
                  <div className="border-t pt-6 mt-2">
                    <h3 className="text-lg font-semibold mb-2">
                      KYC Verification Photo *
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload a clear photo of yourself for identity
                      verification. This photo must meet the following
                      requirements:
                    </p>
                    <ul className="text-sm text-muted-foreground mb-4 space-y-1 ml-4 list-disc">
                      <li>Your face must be clearly visible and centered</li>
                      <li>Both eyes must be clearly visible (no sunglasses)</li>
                      <li>
                        Both ears must be clearly visible (no hair covering
                        ears)
                      </li>
                      <li>
                        Looking directly at the camera with neutral expression
                      </li>
                      <li>Good lighting with no harsh shadows</li>
                      <li>Plain background preferred</li>
                      <li>JPG or PNG format, max 5MB</li>
                    </ul>

                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      {kycPhotoPreview ? (
                        <div className="space-y-3">
                          <div className="mx-auto w-32 h-32 rounded-full overflow-hidden border-2 border-green-500">
                            <img
                              src={kycPhotoPreview}
                              alt="KYC Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="text-sm font-medium text-green-600">
                            KYC photo uploaded successfully!
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setKycPhoto(null);
                              setKycPhotoPreview("");
                            }}
                          >
                            Upload Different Photo
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="mx-auto w-24 h-24 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                            <HugeiconsIcon
                              icon={UserIcon}
                              className="text-muted-foreground"
                              size={40}
                            />
                          </div>
                          <div>
                            <Label htmlFor="kyc-photo-upload">
                              <Button
                                type="button"
                                variant="outline"
                                disabled={loading}
                                onClick={() =>
                                  document
                                    .getElementById("kyc-photo-upload")
                                    ?.click()
                                }
                              >
                                <HugeiconsIcon
                                  icon={FileUploadIcon}
                                  data-icon="inline-start"
                                />
                                Choose Photo
                              </Button>
                            </Label>
                            <input
                              id="kyc-photo-upload"
                              type="file"
                              className="hidden"
                              accept=".jpg,.jpeg,.png"
                              onChange={handleKycPhotoSelect}
                              disabled={loading}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Supported formats: JPG, PNG • Max size: 5MB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Basic Information */}
                <Field>
                  <FieldLabel htmlFor="full_name">Full Name *</FieldLabel>
                  <Input
                    id="full_name"
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => handleChange("full_name", e.target.value)}
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="phone">Phone Number *</FieldLabel>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+977-9812345678"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="education">
                    Education Background *
                  </FieldLabel>
                  <Textarea
                    id="education"
                    placeholder="E.g., Bachelor's in Mathematics, Master's in Education..."
                    value={formData.education}
                    onChange={(e) => handleChange("education", e.target.value)}
                    rows={3}
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="experience_years">
                    Years of Experience *
                  </FieldLabel>
                  <Input
                    id="experience_years"
                    type="number"
                    min="0"
                    value={formData.experience_years}
                    onChange={(e) =>
                      handleChange(
                        "experience_years",
                        parseInt(e.target.value) || 0,
                      )
                    }
                    required
                  />
                </Field>

                {/* Subjects */}
                <div>
                  <FieldLabel>Subjects You Teach *</FieldLabel>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {subjects.map((subject) => (
                      <button
                        key={subject.id}
                        type="button"
                        onClick={() => toggleSubject(subject.id)}
                        className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                          selectedSubjects.includes(subject.id)
                            ? "border-black bg-black text-white"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {subject.name}
                      </button>
                    ))}
                  </div>
                  {selectedSubjects.length === 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      Please select at least one subject
                    </p>
                  )}
                </div>

                {/* Grades */}
                <div>
                  <FieldLabel>Grades You Teach *</FieldLabel>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mt-2">
                    {grades.map((grade) => (
                      <button
                        key={grade.id}
                        type="button"
                        onClick={() => toggleGrade(grade.id)}
                        className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                          selectedGrades.includes(grade.id)
                            ? "border-black bg-black text-white"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {grade.name}
                      </button>
                    ))}
                  </div>
                  {selectedGrades.length === 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      Please select at least one grade
                    </p>
                  )}
                </div>

                {/* Location */}
                <Field>
                  <FieldLabel htmlFor="location">Location/City *</FieldLabel>
                  <Input
                    id="location"
                    type="text"
                    placeholder="E.g., Kathmandu, Lalitpur..."
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="address">Full Address *</FieldLabel>
                  <Textarea
                    id="address"
                    placeholder="Your complete address..."
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    rows={2}
                    required
                  />
                </Field>

                {/* Rates */}
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="hourly_rate_min">
                      Minimum Hourly Rate (NPR) *
                    </FieldLabel>
                    <Input
                      id="hourly_rate_min"
                      type="number"
                      min="0"
                      step="100"
                      value={formData.hourly_rate_min}
                      onChange={(e) =>
                        handleChange(
                          "hourly_rate_min",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      required
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="hourly_rate_max">
                      Maximum Hourly Rate (NPR) *
                    </FieldLabel>
                    <Input
                      id="hourly_rate_max"
                      type="number"
                      min="0"
                      step="100"
                      value={formData.hourly_rate_max}
                      onChange={(e) =>
                        handleChange(
                          "hourly_rate_max",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                      required
                    />
                  </Field>
                </div>

                {/* Bio */}
                <Field>
                  <FieldLabel htmlFor="bio">Bio/About You *</FieldLabel>
                  <Textarea
                    id="bio"
                    placeholder="Tell parents about your teaching style, approach, and what makes you a great teacher..."
                    value={formData.bio}
                    onChange={(e) => handleChange("bio", e.target.value)}
                    rows={4}
                    required
                  />
                </Field>

                {/* Document Uploads */}
                <div className="border-t pt-6 mt-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Verification Documents
                  </h3>
                  <div className="space-y-4">
                    <FileUpload
                      documentType="citizenship_front"
                      documentLabel="Citizenship/ID Card Front *"
                      userRole="teacher"
                      deferUpload={!isEdit}
                      existingDocument={documents.citizenship_front}
                      onFileSelected={(file) =>
                        handleFileSelect("citizenship_front", file)
                      }
                      onFileRemoved={() =>
                        setPendingFiles((prev) => ({
                          ...prev,
                          citizenship_front: undefined,
                        }))
                      }
                      onUploadSuccess={(doc) =>
                        handleDocumentUpload("citizenship_front", doc)
                      }
                    />

                    <FileUpload
                      documentType="citizenship_back"
                      documentLabel="Citizenship/ID Card Back *"
                      userRole="teacher"
                      deferUpload={!isEdit}
                      existingDocument={documents.citizenship_back}
                      onFileSelected={(file) =>
                        handleFileSelect("citizenship_back", file)
                      }
                      onFileRemoved={() =>
                        setPendingFiles((prev) => ({
                          ...prev,
                          citizenship_back: undefined,
                        }))
                      }
                      onUploadSuccess={(doc) =>
                        handleDocumentUpload("citizenship_back", doc)
                      }
                    />

                    <FileUpload
                      documentType="academic"
                      documentLabel="Academic Certificate *"
                      userRole="teacher"
                      deferUpload={!isEdit}
                      existingDocument={documents.academic}
                      onFileSelected={(file) =>
                        handleFileSelect("academic", file)
                      }
                      onFileRemoved={() =>
                        setPendingFiles((prev) => ({
                          ...prev,
                          academic: undefined,
                        }))
                      }
                      onUploadSuccess={(doc) =>
                        handleDocumentUpload("academic", doc)
                      }
                    />

                    <FileUpload
                      documentType="cv"
                      documentLabel="CV *"
                      userRole="teacher"
                      deferUpload={!isEdit}
                      existingDocument={documents.cv}
                      onFileSelected={(file) =>
                        handleFileSelect("cv", file)
                      }
                      onFileRemoved={() =>
                        setPendingFiles((prev) => ({
                          ...prev,
                          cv: undefined,
                        }))
                      }
                      onUploadSuccess={(doc) =>
                        handleDocumentUpload("cv", doc)
                      }
                    />
                  </div>

                  {!isEdit && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> Files will be uploaded after you
                        submit the form. Make sure all required documents are
                        selected before submitting.
                      </p>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20">
                    <strong>Error:</strong> {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                  size="lg"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      {isEdit ? "Updating Profile..." : "Creating Profile..."}
                    </>
                  ) : (
                    <>
                      <HugeiconsIcon
                        icon={CheckmarkCircle01Icon}
                        strokeWidth={2}
                        data-icon="inline-start"
                      />
                      {isEdit ? "Update Profile" : "Complete Profile"}
                    </>
                  )}
                </Button>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
