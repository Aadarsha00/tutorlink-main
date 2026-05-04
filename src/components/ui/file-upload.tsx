import * as React from "react";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Upload01Icon,
  Delete02Icon,
  FileValidationIcon,
  CheckmarkCircle01Icon,
} from "@hugeicons/core-free-icons";
import api, {
  type ParentDocumentType,
  type VerificationDocument,
} from "@/services/api";

type UploadApiError = {
  response?: {
    data?: {
      error?: string;
    };
  };
};

const getUploadErrorMessage = (err: unknown, fallback: string) => {
  const apiError = err as UploadApiError;
  return apiError.response?.data?.error || fallback;
};

interface FileUploadProps {
  documentType: string;
  documentLabel: string;
  userRole: "teacher" | "parent";
  deferUpload?: boolean;
  onFileSelected?: (file: File) => void;
  onFileRemoved?: () => void;
  onUploadSuccess?: (document: VerificationDocument) => void;
  existingDocument?: VerificationDocument;
}

export function FileUpload({
  documentType,
  documentLabel,
  userRole,
  deferUpload = false,
  onFileSelected,
  onFileRemoved,
  onUploadSuccess,
  existingDocument,
}: FileUploadProps) {
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [document, setDocument] = React.useState<VerificationDocument | null>(
    existingDocument || null
  );
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    const validExtensions = [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"];
    const fileExt = file.name
      .substring(file.name.lastIndexOf("."))
      .toLowerCase();
    if (!validExtensions.includes(fileExt)) {
      setError("Invalid file type. Allowed: PDF, JPG, PNG, DOC, DOCX");
      return;
    }

    setError("");

    if (deferUpload) {
      setSelectedFile(file);
      onFileSelected?.(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setUploading(true);

    try {
      const uploadedDoc =
        userRole === "teacher"
          ? await api.documents.uploadTeacher(file, documentType)
          : await api.documents.uploadParent(
              file,
              documentType as ParentDocumentType
            );

      setDocument(uploadedDoc);
      onUploadSuccess?.(uploadedDoc);
    } catch (err: unknown) {
      console.error("Upload error:", err);
      setError(getUploadErrorMessage(err, "Failed to upload file. Please try again."));
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async () => {
    if (selectedFile) {
      setSelectedFile(null);
      setError("");
      onFileRemoved?.();
      return;
    }

    if (!document) return;

    if (!confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      await api.documents.delete(document.id, userRole);
      setDocument(null);
      setError("");
    } catch (err: unknown) {
      console.error("Delete error:", err);
      setError("Failed to delete document");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{documentLabel}</label>

      {document || selectedFile ? (
        <div className="flex items-center justify-between p-4 border-2 border-green-500 rounded-lg bg-green-50">
          <div className="flex items-center gap-3">
            <HugeiconsIcon
              icon={CheckmarkCircle01Icon}
              className="text-green-600"
              size={24}
            />
            <div>
              <p className="font-medium text-sm">
                {document?.file_name || selectedFile?.name}
              </p>
              <p className="text-xs text-gray-600">
                {document
                  ? `${formatFileSize(document.file_size)} - Uploaded ${new Date(
                      document.uploaded_at
                    ).toLocaleDateString()}`
                  : `${formatFileSize(selectedFile?.size || 0)} - Selected`}
              </p>
              {document?.verified && (
                <span className="text-xs text-green-600 font-medium">
                  Verified
                </span>
              )}
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          <HugeiconsIcon
            icon={FileValidationIcon}
            className="mx-auto text-gray-400 mb-2"
            size={32}
          />
          <p className="text-sm text-gray-600 mb-3">
            PDF, JPG, PNG, DOC (Max 5MB)
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <span className="animate-spin">...</span>
                Uploading...
              </>
            ) : (
              <>
                <HugeiconsIcon
                  icon={Upload01Icon}
                  strokeWidth={2}
                  data-icon="inline-start"
                />
                Choose File
              </>
            )}
          </Button>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
