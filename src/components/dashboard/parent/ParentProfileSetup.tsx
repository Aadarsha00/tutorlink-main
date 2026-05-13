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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserIcon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  FileUploadIcon,
} from "@hugeicons/core-free-icons";
import api from "@/services/api";
import { useNavigate } from "react-router-dom";

type ParentProfileFormFields = {
  full_name: string;
  phone: string;
  citizenship_number: string;
  location: string;
  address: string;
};

const buildParentProfileFormData = (
  fields: ParentProfileFormFields,
  kycPhoto?: File | null,
) => {
  const formDataToSend = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    formDataToSend.append(key, value);
  });

  if (kycPhoto) {
    formDataToSend.append("kyc_photo", kycPhoto);
  }

  return formDataToSend;
};

const formatApiError = (err: any) => {
  const data = err.response?.data;
  if (!data) {
    return "Failed to save profile. Please try again.";
  }

  if (typeof data === "string") {
    return data;
  }

  if (data.detail || data.message || data.error) {
    return data.detail || data.message || data.error;
  }

  return (
    Object.entries(data)
      .flatMap(([field, value]) => {
        const messages = Array.isArray(value) ? value : [value];
        return messages.map((message) => `${field}: ${String(message)}`);
      })
      .join(", ") || "Failed to save profile. Please try again."
  );
};

export default function ParentProfileSetup() {
  const [loading, setLoading] = React.useState(false);
  const [initialLoading, setInitialLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const [isEdit, setIsEdit] = React.useState(false);
  const [documentUploaded, setDocumentUploaded] = React.useState(false);
  const [pendingDocument, setPendingDocument] = React.useState<File | null>(
    null,
  );
  const [kycPhoto, setKycPhoto] = React.useState<File | null>(null);
  const [kycPhotoPreview, setKycPhotoPreview] = React.useState<string>("");

  const navigate = useNavigate();

  const [formData, setFormData] = React.useState({
    full_name: "",
    phone: "",
    citizenship_number: "",
    location: "",
    address: "",
  });

  React.useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setInitialLoading(true);

      // Try to load existing profile
      try {
        const profile = await api.profiles.parent.get();

        setIsEdit(true);
        setFormData({
          full_name: profile.full_name || "",
          phone: profile.phone || "",
          citizenship_number: profile.citizenship_number || "",
          location: profile.location || "",
          address: profile.address || "",
        });

        // Check if documents exist
        try {
          const docs = await api.documents.listMyParent();
          setDocumentUploaded(docs.length > 0);
        } catch {
          setDocumentUploaded(false);
        }
      } catch (profileErr: any) {
        // Profile doesn't exist, try to get user data for pre-fill
        if (profileErr.response?.status === 404) {
          setIsEdit(false);
          try {
            const user = await api.auth.getCurrentUser();
            setFormData((prev) => ({
              ...prev,
              full_name: `${user.first_name || ""} ${
                user.last_name || ""
              }`.trim(),
            }));
          } catch (userErr) {
            console.error("Failed to load user data", userErr);
          }
        } else {
          throw profileErr;
        }
      }
    } catch (err) {
      console.error("Failed to load profile data", err);
      setError("Failed to load profile data");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File size must be less than 10MB");
      return;
    }

    const validTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];
    if (!validTypes.includes(file.type)) {
      setError("Only PDF, JPG, and PNG files are allowed");
      return;
    }

    setPendingDocument(file);
    setDocumentUploaded(true);
    setError("");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!formData.full_name.trim()) {
      setError("Full name is required");
      return;
    }

    if (!formData.phone.trim()) {
      setError("Phone number is required");
      return;
    }

    if (!formData.citizenship_number.trim()) {
      setError("Citizenship No. / NID is required");
      return;
    }

    if (!formData.location.trim()) {
      setError("Location is required");
      return;
    }

    if (!formData.address.trim()) {
      setError("Address is required");
      return;
    }

    if (!isEdit && !kycPhoto) {
      setError("KYC verification photo is required");
      return;
    }

    try {
      setLoading(true);

      if (isEdit) {
        const profileData = kycPhoto
          ? buildParentProfileFormData(formData, kycPhoto)
          : formData;
        await api.profiles.parent.update(profileData);
        setSuccess("Profile updated successfully!");
        setTimeout(() => navigate("/parent/documents"), 1500);
      } else {
        // Create new profile with KYC photo
        const formDataToSend = buildParentProfileFormData(formData, kycPhoto);

        await api.profiles.parent.create(formDataToSend);

        if (pendingDocument) {
          await api.documents.uploadParent(
            pendingDocument,
            "citizenship_front",
          );
        }

        setSuccess("Profile created successfully! Redirecting to dashboard...");
        setTimeout(() => navigate("/dashboard"), 2000);
      }
    } catch (err: any) {
      console.error("Failed to save profile", err);
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  if (initialLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-neutral-50 to-neutral-100">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-50 to-neutral-100 p-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-black">
              <HugeiconsIcon icon={UserIcon} className="text-white" size={32} />
            </div>
            <CardTitle className="text-2xl">
              {isEdit
                ? "Update Your Parent Profile"
                : "Complete Your Parent Profile"}
            </CardTitle>
            <CardDescription>
              {isEdit
                ? "Update your information to keep your profile current"
                : "Please provide your information to start posting teaching gigs"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => handleChange("full_name", e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+977-9812345678"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="citizenship_number">
                  Citizenship No. / NID *
                </Label>
                <Input
                  id="citizenship_number"
                  type="text"
                  value={formData.citizenship_number}
                  onChange={(e) =>
                    handleChange("citizenship_number", e.target.value)
                  }
                  placeholder="Enter your citizenship number or NID"
                  required
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location/City *</Label>
                <Input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  placeholder="E.g., Kathmandu, Lalitpur..."
                  required
                />
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Full Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Your complete address..."
                  rows={3}
                  required
                />
              </div>

              {/* KYC Photo Upload - Required for new profiles */}
              {!isEdit && (
                <div className="border-t pt-6 space-y-4">
                  <div>
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
                  </div>

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

              {/* Document Upload - Optional for new profiles */}
              {!isEdit && (
                <div className="border-t pt-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Verification Document (Optional)
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload the front side of your citizenship document. You
                      can upload additional documents (back side, ID card,
                      supporting documents) from the Documents page anytime.
                    </p>
                  </div>

                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    {documentUploaded ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center">
                          <HugeiconsIcon
                            icon={CheckmarkCircle01Icon}
                            className="text-green-600"
                            size={48}
                          />
                        </div>
                        <p className="text-sm font-medium text-green-600">
                          Document uploaded successfully!
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setDocumentUploaded(false);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = "";
                            }
                          }}
                        >
                          Upload Different Document
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-center">
                          <HugeiconsIcon
                            icon={FileUploadIcon}
                            className="text-muted-foreground"
                            size={48}
                          />
                        </div>
                        <div>
                          <Label htmlFor="document-upload">
                            <Button
                              type="button"
                              variant="outline"
                              disabled={loading}
                              onClick={() =>
                                document
                                  .getElementById("document-upload")
                                  ?.click()
                              }
                            >
                              <HugeiconsIcon
                                icon={FileUploadIcon}
                                data-icon="inline-start"
                              />
                              Choose File
                            </Button>
                          </Label>
                          <input
                            id="document-upload"
                            type="file"
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleDocumentUpload}
                            disabled={loading}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Supported formats: PDF, JPG, PNG • Max size: 10MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <HugeiconsIcon icon={AlertCircleIcon} size={18} />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Success Alert */}
              {success && (
                <Alert className="bg-green-50 text-green-900 border-green-200">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={18} />
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
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
                      data-icon="inline-start"
                    />
                    {isEdit ? "Update Profile" : "Complete Profile"}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
