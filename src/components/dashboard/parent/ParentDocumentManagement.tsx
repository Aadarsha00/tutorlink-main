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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  FileUploadIcon,
  FileRemoveIcon,
  AlertCircleIcon,
  CheckmarkCircle01Icon,
  ClockIcon,
  FileCheck,
  EyeIcon,
} from "@hugeicons/core-free-icons";
import api, {
  type ParentDocumentType,
  type ParentVerificationDocument,
} from "@/services/api";

export default function ParentDocumentManagement() {
  const [documents, setDocuments] = React.useState<
    ParentVerificationDocument[]
  >([]);
  const [uploading, setUploading] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const [previewDocument, setPreviewDocument] =
    React.useState<ParentVerificationDocument | null>(null);

  React.useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const data = await api.documents.listMyParent();
      setDocuments(data);
    } catch (err) {
      console.error("Failed to load documents", err);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (
    file: File,
    documentType: ParentDocumentType,
    isResubmission = false,
    oldDocId?: number
  ) => {
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

    try {
      setUploading(true);
      setError("");

      if (isResubmission && oldDocId) {
        await api.documents.delete(oldDocId, "parent");
      }

      await api.documents.uploadParent(file, documentType);
      await loadDocuments();

      setSuccess(
        isResubmission
          ? "Document resubmitted successfully!"
          : "Document uploaded successfully!"
      );
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("Upload failed", err);
      setError(err.response?.data?.error || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (doc: ParentVerificationDocument) => {
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

  const DOCUMENT_TYPE_LABELS: Record<ParentDocumentType, string> = {
    citizenship_front: "Citizenship Front",
    citizenship_back: "Citizenship Back",
    id_card: "ID Card",
    supporting_document: "Supporting Document",
  };

  const getDocumentTypeLabel = (type: ParentDocumentType) =>
    DOCUMENT_TYPE_LABELS[type];

  const documentsByType = documents.reduce<
    Record<ParentDocumentType, ParentVerificationDocument[]>
  >(
    (acc, doc) => {
      acc[doc.document_type] ??= [];
      acc[doc.document_type].push(doc);
      return acc;
    },
    {
      citizenship_front: [],
      citizenship_back: [],
      id_card: [],
      supporting_document: [],
    }
  );

  const REQUIRED_DOCS: ParentDocumentType[] = [
    "citizenship_front",
    "citizenship_back",
    "id_card",
    "supporting_document",
  ];

  const rejectedDocs = documents.filter((d) => d.verified === false);
  const pendingDocs = documents.filter((d) => d.verified === null);
  const isPreviewImage = previewDocument
    ? /\.(jpg|jpeg|png|gif|webp)$/i.test(previewDocument.file_url) ||
      /\.(jpg|jpeg|png|gif|webp)$/i.test(previewDocument.file_name)
    : false;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-neutral-50 to-neutral-100">
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

        {error && (
          <Alert variant="destructive">
            <HugeiconsIcon icon={AlertCircleIcon} size={20} />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 text-green-900 border-green-200">
            <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {REQUIRED_DOCS.map((docType) => {
          const docsOfType = documentsByType[docType] || [];
          const latestDoc = docsOfType[0];
          const isRejected = latestDoc?.verified === false;
          const isPending = latestDoc?.verified === null;
          const isVerified = latestDoc?.verified === true;

          return (
            <Card key={docType}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {getDocumentTypeLabel(docType)}
                    </CardTitle>
                    <CardDescription>
                      {docType === "citizenship_front" &&
                        "Upload the front side of your citizenship document"}
                      {docType === "citizenship_back" &&
                        "Upload the back side of your citizenship document"}
                      {docType === "id_card" &&
                        "Upload your ID card or other government-issued ID"}
                      {docType === "supporting_document" &&
                        "Upload one supporting document for additional verification"}
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
                          onClick={() => setPreviewDocument(latestDoc)}
                          variant="outline"
                          size="sm"
                        >
                          <HugeiconsIcon
                            icon={EyeIcon}
                            data-icon="inline-start"
                          />
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

                    {isRejected && (
                      <div>
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
                • Citizenship front, citizenship back, ID card, and one
                supporting document must all be verified before you can post gigs
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={Boolean(previewDocument)}
        onOpenChange={(open) => {
          if (!open) setPreviewDocument(null);
        }}
      >
        <DialogContent className="h-[94vh] max-h-[94vh] max-w-[96vw] overflow-hidden p-5 sm:max-w-[96vw]">
          <DialogHeader>
            <DialogTitle>
              {previewDocument
                ? getDocumentTypeLabel(previewDocument.document_type)
                : "Document Preview"}
            </DialogTitle>
          </DialogHeader>

          {previewDocument && (
            <div className="h-[calc(94vh-7.5rem)] overflow-auto rounded-lg border bg-neutral-50 p-3">
              {isPreviewImage ? (
                <img
                  src={previewDocument.file_url}
                  alt={previewDocument.file_name}
                  className="mx-auto h-full max-h-full max-w-full rounded-md object-contain"
                />
              ) : (
                <div className="flex min-h-full flex-col items-center justify-center gap-4 text-center">
                  <HugeiconsIcon
                    icon={FileCheck}
                    size={48}
                    className="text-muted-foreground"
                  />
                  <div>
                    <p className="font-medium">{previewDocument.file_name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      This file type cannot be previewed as an image.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => window.open(previewDocument.file_url, "_blank")}
                  >
                    Open File
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
