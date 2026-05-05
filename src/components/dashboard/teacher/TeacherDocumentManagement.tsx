import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  FileUploadIcon,
  FileRemoveIcon,
  AlertCircleIcon,
  CheckmarkCircle01Icon,
  ClockIcon,
  FileCheck,
} from "@hugeicons/core-free-icons";
import api from "@/services/api";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

interface Document {
  id: number;
  document_type: string;
  file_name: string;
  file_url: string;
  file_size: number;
  uploaded_at: string;
  verified: boolean | null;
  verified_at?: string;
  rejection_reason?: string;
  notes: string;
}

export function TeacherDocumentManagement() {
  const [documents, setDocuments] = React.useState<Document[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [searchParams] = useSearchParams();

  const resubmitDocId = searchParams.get("resubmit");

  React.useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const data = await api.documents.listMyTeacher();
      setDocuments(data);
    } catch (error) {
      console.error("Failed to load documents", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (
    file: File,
    documentType: string,
    isResubmission: boolean = false,
    oldDocId?: number
  ) => {
    if (!file) return;

    try {
      setUploading(true);

      // Delete old document if resubmitting
      if (isResubmission && oldDocId) {
        await api.documents.delete(oldDocId, "teacher");
      }

      await api.documents.uploadTeacher(file, documentType);
      await loadDocuments();

      toast.success(
        isResubmission
          ? "Document resubmitted successfully!"
          : "Document uploaded successfully!"
      );
    } catch (error: any) {
      console.error("Upload failed", error);
      toast.error(error.response?.data?.error || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (doc: Document) => {
    if (doc.verified === true) {
      return (
        <Badge className="bg-green-100 text-green-800">
          <HugeiconsIcon
            icon={CheckmarkCircle01Icon}
            size={14}
            className="mr-1"
          />
          Verified
        </Badge>
      );
    }
    if (doc.verified === false) {
      return (
        <Badge className="bg-red-100 text-red-800">
          <HugeiconsIcon icon={FileRemoveIcon} size={14} className="mr-1" />
          Rejected
        </Badge>
      );
    }
    return (
      <Badge className="bg-yellow-100 text-yellow-800">
        <HugeiconsIcon icon={ClockIcon} size={14} className="mr-1" />
        Pending Review
      </Badge>
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      citizenship_front: "Citizenship Front",
      citizenship_back: "Citizenship Back",
      academic: "Academic Certificates",
      cv: "CV",
    };
    return labels[type] || type;
  };

  // Group documents by type
  const documentsByType = documents.reduce((acc, doc) => {
    if (!acc[doc.document_type]) {
      acc[doc.document_type] = [];
    }
    acc[doc.document_type].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

  const rejectedDocs = documents.filter((d) => d.verified === false);
  const pendingDocs = documents.filter((d) => d.verified === null);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-muted-foreground">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-50 to-neutral-100 p-6">
      <div className="container mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={FileCheck} size={24} />
              Verification Documents
            </CardTitle>
            <CardDescription>
              Upload and manage your verification documents
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Rejected Documents Alert */}
        {rejectedDocs.length > 0 && (
          <Alert variant="destructive">
            <HugeiconsIcon icon={AlertCircleIcon} size={20} />
            <AlertTitle>Action Required: Document Rejected</AlertTitle>
            <AlertDescription>
              {rejectedDocs.length} document(s) were rejected. Please review the
              reason and resubmit below.
            </AlertDescription>
          </Alert>
        )}

        {/* Pending Documents Info */}
        {pendingDocs.length > 0 && (
          <Alert>
            <HugeiconsIcon icon={ClockIcon} size={20} />
            <AlertTitle>Documents Under Review</AlertTitle>
            <AlertDescription>
              {pendingDocs.length} document(s) are currently being reviewed by
              admin. You'll be notified once they're verified.
            </AlertDescription>
          </Alert>
        )}

        {/* Document Types */}
        {[
          "citizenship_front",
          "citizenship_back",
          "academic",
          "cv",
        ].map((docType) => {
          const docsOfType = documentsByType[docType] || [];
          const latestDoc = docsOfType[0];
          const isRejected = latestDoc?.verified === false;
          const isPending = latestDoc?.verified === null;
          const isVerified = latestDoc?.verified === true;
          const shouldHighlight =
            resubmitDocId && latestDoc?.id.toString() === resubmitDocId;

          return (
            <Card
              key={docType}
              className={shouldHighlight ? "border-red-300 shadow-lg" : ""}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {getDocumentTypeLabel(docType)}
                    </CardTitle>
                    <CardDescription>
                      {docType === "citizenship_front" &&
                        "Upload the front side of your citizenship certificate or national ID"}
                      {docType === "citizenship_back" &&
                        "Upload the back side of your citizenship certificate or national ID"}
                      {docType === "academic" &&
                        "Upload your degrees, certificates, or transcripts"}
                      {docType === "cv" &&
                        "Upload your Curriculum Vitae"}
                    </CardDescription>
                  </div>
                  {latestDoc && getStatusBadge(latestDoc)}
                </div>
              </CardHeader>
              <CardContent>
                {latestDoc ? (
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg bg-neutral-50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-medium">{latestDoc.file_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Uploaded on{" "}
                            {new Date(
                              latestDoc.uploaded_at
                            ).toLocaleDateString()}{" "}
                            • {formatFileSize(latestDoc.file_size)}
                          </p>
                        </div>
                        <Button
                          onClick={() =>
                            window.open(latestDoc.file_url, "_blank")
                          }
                          variant="outline"
                          size="sm"
                        >
                          View
                        </Button>
                      </div>

                      {isVerified && latestDoc.verified_at && (
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-800">
                            ✅ Verified on{" "}
                            {new Date(
                              latestDoc.verified_at
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      )}

                      {isRejected && latestDoc.rejection_reason && (
                        <div className="p-3 bg-red-50 rounded-lg space-y-2">
                          <p className="text-sm font-medium text-red-800">
                            ❌ Rejection Reason:
                          </p>
                          <p className="text-sm text-red-700">
                            {latestDoc.rejection_reason}
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Please upload a new document addressing the above
                            concerns.
                          </p>
                        </div>
                      )}

                      {isPending && (
                        <div className="p-3 bg-yellow-50 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            ⏳ This document is under admin review. You'll be
                            notified once it's verified.
                          </p>
                        </div>
                      )}

                      {latestDoc.notes && (
                        <div className="p-3 bg-blue-50 rounded-lg mt-2">
                          <p className="text-sm text-blue-800">
                            <strong>Admin Notes:</strong> {latestDoc.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Resubmit button for rejected documents */}
                    {isRejected && (
                      <div>
                        <label htmlFor={`resubmit-${docType}`}>
                          <Button
                            onClick={() =>
                              document
                                .getElementById(`resubmit-${docType}`)
                                ?.click()
                            }
                            disabled={uploading}
                            className="w-full"
                          >
                            <HugeiconsIcon
                              icon={FileUploadIcon}
                              data-icon="inline-start"
                            />
                            {uploading ? "Uploading..." : "Resubmit Document"}
                          </Button>
                        </label>
                        <input
                          id={`resubmit-${docType}`}
                          type="file"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleUpload(file, docType, true, latestDoc.id);
                            }
                          }}
                        />
                      </div>
                    )}

                    {/* Show history if multiple documents */}
                    {docsOfType.length > 1 && (
                      <div className="pt-4 border-t">
                        <p className="text-sm font-medium mb-2">
                          Previous Submissions
                        </p>
                        <div className="space-y-2">
                          {docsOfType.slice(1).map((doc) => (
                            <div
                              key={doc.id}
                              className="flex items-center justify-between text-sm p-2 bg-neutral-50 rounded"
                            >
                              <span className="text-muted-foreground">
                                {doc.file_name} •{" "}
                                {new Date(doc.uploaded_at).toLocaleDateString()}
                              </span>
                              {getStatusBadge(doc)}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <HugeiconsIcon
                      icon={FileUploadIcon}
                      size={48}
                      className="mx-auto mb-4 text-muted-foreground opacity-50"
                    />
                    <p className="text-muted-foreground mb-4">
                      No document uploaded yet
                    </p>
                    <label htmlFor={`upload-${docType}`}>
                      <Button
                        onClick={() =>
                          document.getElementById(`upload-${docType}`)?.click()
                        }
                        disabled={uploading}
                      >
                        <HugeiconsIcon
                          icon={FileUploadIcon}
                          data-icon="inline-start"
                        />
                        {uploading ? "Uploading..." : "Upload Document"}
                      </Button>
                    </label>
                    <input
                      id={`upload-${docType}`}
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleUpload(file, docType);
                        }
                      }}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Supported formats: PDF, JPG, PNG • Max size: 10MB
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <HugeiconsIcon icon={AlertCircleIcon} size={20} />
              Document Verification Process
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Upload clear, legible copies of your documents</li>
              <li>• Admin will review within 24-48 hours</li>
              <li>
                • You'll receive a notification when documents are
                verified/rejected
              </li>
              <li>
                • If rejected, you can resubmit with the requested corrections
              </li>
              <li>
                • All documents must be verified before your profile can be
                activated
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
