import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  ArrowRight01Icon,
  Cancel01Icon,
  CheckmarkCircle01Icon,
  ClockIcon,
} from "@hugeicons/core-free-icons";
import api, {
  type ParentVerificationDocument,
  type VerificationDocument,
} from "@/services/api";
import { useAuth } from "@/hooks/useAuth";

type UserDocument = VerificationDocument | ParentVerificationDocument;
type VerificationState = "pending" | "verified" | "rejected" | null;

const DOCUMENT_LABELS: Record<string, string> = {
  citizenship_front: "Citizenship front",
  citizenship_back: "Citizenship back",
  academic: "Academic certificate",
  cv: "CV",
  id_card: "ID card",
  supporting_document: "Supporting document",
  other: "Other document",
};

const getRequiredDocumentTypes = (role: "teacher" | "parent") =>
  role === "teacher"
    ? ["citizenship_front", "citizenship_back", "academic", "cv"]
    : ["citizenship_front", "citizenship_back", "id_card", "supporting_document"];

const getLatestDocumentsByType = (documents: UserDocument[]) => {
  return documents.reduce<Record<string, UserDocument>>((latest, document) => {
    const current = latest[document.document_type];
    if (
      !current ||
      new Date(document.uploaded_at).getTime() >
        new Date(current.uploaded_at).getTime()
    ) {
      latest[document.document_type] = document;
    }
    return latest;
  }, {});
};

const getResultStorageKey = (
  userId: number,
  state: "verified" | "rejected",
  documents: UserDocument[]
) => {
  const signature = documents
    .map((document) => `${document.id}:${document.verified}:${document.verified_at}`)
    .sort()
    .join("|");

  return `tutorlink:${userId}:document-verification:${state}:${signature}`;
};

export function DocumentVerificationBanner() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [documents, setDocuments] = React.useState<UserDocument[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [dismissedKey, setDismissedKey] = React.useState<string | null>(null);
  const [showTerminalBanner, setShowTerminalBanner] = React.useState(false);
  const [terminalStorageKey, setTerminalStorageKey] = React.useState<
    string | null
  >(null);
  const [reasonOpen, setReasonOpen] = React.useState(false);

  const loadDocuments = React.useCallback(async () => {
    if (!user || user.role === "admin") {
      setDocuments([]);
      setLoading(false);
      return;
    }

    try {
      const data =
        user.role === "teacher"
          ? await api.documents.listMyTeacher()
          : await api.documents.listMyParent();
      setDocuments(data);
    } catch (error) {
      console.error("Failed to load verification documents", error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  React.useEffect(() => {
    const refreshOnNotification = () => {
      loadDocuments();
    };
    const refreshOnFocus = () => {
      if (document.visibilityState === "visible") {
        loadDocuments();
      }
    };
    const refreshInterval = window.setInterval(loadDocuments, 15000);

    window.addEventListener("tutorlink:notification", refreshOnNotification);
    window.addEventListener("focus", refreshOnNotification);
    document.addEventListener("visibilitychange", refreshOnFocus);

    return () => {
      window.clearInterval(refreshInterval);
      window.removeEventListener(
        "tutorlink:notification",
        refreshOnNotification
      );
      window.removeEventListener("focus", refreshOnNotification);
      document.removeEventListener("visibilitychange", refreshOnFocus);
    };
  }, [loadDocuments]);

  const requiredDocuments = React.useMemo(() => {
    if (!user || user.role === "admin") return [];

    const latestByType = getLatestDocumentsByType(documents);
    return getRequiredDocumentTypes(user.role)
      .map((type) => latestByType[type])
      .filter((document): document is UserDocument => Boolean(document));
  }, [documents, user]);

  const verificationState: VerificationState = React.useMemo(() => {
    if (!user || user.role === "admin") return null;

    const requiredTypes = getRequiredDocumentTypes(user.role);
    if (requiredDocuments.length < requiredTypes.length) return null;
    if (requiredDocuments.some((document) => document.verified === false)) {
      return "rejected";
    }
    if (requiredDocuments.some((document) => document.verified === null)) {
      return "pending";
    }
    if (requiredDocuments.every((document) => document.verified === true)) {
      return "verified";
    }

    return null;
  }, [requiredDocuments, user]);

  React.useEffect(() => {
    if (!user || verificationState === null || verificationState === "pending") {
      setShowTerminalBanner(false);
      setTerminalStorageKey(null);
      return;
    }

    const storageKey = getResultStorageKey(
      user.id,
      verificationState,
      requiredDocuments
    );

    if (localStorage.getItem(storageKey)) {
      setShowTerminalBanner(false);
      setTerminalStorageKey(storageKey);
      return;
    }

    setShowTerminalBanner(true);
    setTerminalStorageKey(storageKey);
  }, [requiredDocuments, user, verificationState]);

  const bannerKey = React.useMemo(() => {
    const signature = requiredDocuments
      .map(
        (document) =>
          `${document.id}:${document.document_type}:${document.verified}:${document.verified_at}`
      )
      .sort()
      .join("|");
    return `${verificationState ?? "none"}:${signature}`;
  }, [requiredDocuments, verificationState]);

  const dismissCurrentBanner = () => {
    setDismissedKey(bannerKey);
    if (
      terminalStorageKey &&
      (verificationState === "verified" || verificationState === "rejected")
    ) {
      localStorage.setItem(terminalStorageKey, "shown");
      setShowTerminalBanner(false);
    }
  };

  if (loading || dismissedKey === bannerKey || !user || user.role === "admin") {
    return null;
  }

  const rejectedDocuments = requiredDocuments.filter(
    (document) => document.verified === false
  );
  const documentsPath =
    user.role === "teacher" ? "/teacher/documents" : "/parent/documents";

  if (verificationState === "pending") {
    return (
      <div className="border-b border-sky-200 bg-sky-50">
        <div className="mx-auto flex max-w-7xl items-start justify-between gap-4 px-6 py-4">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
              <HugeiconsIcon icon={ClockIcon} size={22} />
            </div>
            <div>
              <h3 className="font-semibold text-sky-950">
                Your documents are being verified
              </h3>
              <p className="mt-1 text-sm text-sky-800">
                Admin is reviewing your uploaded documents. You can keep using
                your dashboard while the verification is in progress.
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={dismissCurrentBanner}
            className="shrink-0 text-sky-800 hover:bg-sky-100 hover:text-sky-950"
            aria-label="Dismiss document verification alert"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={18} />
          </Button>
        </div>
      </div>
    );
  }

  if (!showTerminalBanner || verificationState === null) {
    return null;
  }

  if (verificationState === "verified") {
    return (
      <div className="border-b border-emerald-200 bg-emerald-50">
        <div className="mx-auto flex max-w-7xl items-start justify-between gap-4 px-6 py-4">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <HugeiconsIcon icon={CheckmarkCircle01Icon} size={22} />
            </div>
            <div>
              <h3 className="font-semibold text-emerald-950">
                Your account is successfully verified
              </h3>
              <p className="mt-1 text-sm text-emerald-800">
                Your documents were approved. Your verified profile is now ready.
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={dismissCurrentBanner}
            className="shrink-0 text-emerald-800 hover:bg-emerald-100 hover:text-emerald-950"
            aria-label="Dismiss account verified alert"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={18} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="border-b border-red-200 bg-red-50">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 md:flex-row md:items-start md:justify-between">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-700">
              <HugeiconsIcon icon={Alert02Icon} size={22} />
            </div>
            <div>
              <h3 className="font-semibold text-red-950">
                Your account was not verified
              </h3>
              <p className="mt-1 text-sm text-red-800">
                One or more required documents were rejected. Review the reason
                and upload a corrected document.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 md:self-start">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReasonOpen(true)}
              className="border-red-300 text-red-800 hover:bg-red-100"
            >
              See why
            </Button>
            <Button
              size="sm"
              onClick={() => navigate(documentsPath)}
              className="bg-red-700 text-white hover:bg-red-800"
            >
              Upload again
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                strokeWidth={2}
                data-icon="inline-end"
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={dismissCurrentBanner}
              className="text-red-800 hover:bg-red-100 hover:text-red-950"
              aria-label="Dismiss account not verified alert"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={18} />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={reasonOpen} onOpenChange={setReasonOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Why verification was not approved</DialogTitle>
            <DialogDescription>
              Review the admin feedback below before uploading a new document.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {rejectedDocuments.map((document) => (
              <div
                key={document.id}
                className="rounded-lg border border-red-200 bg-red-50 p-3"
              >
                <p className="font-medium text-red-950">
                  {DOCUMENT_LABELS[document.document_type] ||
                    document.document_type}
                </p>
                <p className="mt-1 text-sm text-red-800">
                  {document.rejection_reason ||
                    document.notes ||
                    "No reason was provided by admin."}
                </p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
