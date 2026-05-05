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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CalendarIcon,
  Cancel01Icon,
  CheckmarkCircle01Icon,
  FileCheck,
  FileViewIcon,
} from "@hugeicons/core-free-icons";
import api from "@/services/api";
import { toast } from "sonner";

type UserType = "teacher" | "parent";
type VerificationFilter = "pending" | "verified" | "rejected";

interface VerificationDocument {
  id: number;
  user: {
    id: number;
    email: string;
    full_name: string;
    role: string;
    profile_picture?: string | null;
  };
  document_type: string;
  file_name: string;
  file_url: string;
  file_size: number;
  uploaded_at: string;
  verified: boolean | null;
  verified_at?: string;
  verified_by?: {
    id: number;
    email: string;
  };
  rejection_reason?: string;
  notes: string;
}

type AdminDocument = VerificationDocument & {
  userType: UserType;
};

interface UserDocumentGroup {
  key: string;
  user: AdminDocument["user"];
  userType: UserType;
  documents: AdminDocument[];
  latestDocuments: AdminDocument[];
}

const DOCUMENT_LABELS: Record<string, string> = {
  profile_picture: "Profile Picture",
  citizenship_front: "Citizenship Front",
  citizenship_back: "Citizenship Back",
  academic: "Academic Certificate",
  cv: "CV",
  id_card: "ID Card",
  supporting_document: "Supporting Document",
  other: "Other Document",
};

const getDocumentLabel = (type: string) =>
  DOCUMENT_LABELS[type] ||
  type.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

const DOCUMENT_ORDER: Record<string, number> = {
  profile_picture: 0,
  citizenship_front: 1,
  citizenship_back: 2,
  academic: 3,
  cv: 4,
  id_card: 5,
  supporting_document: 6,
  other: 7,
};

const sortByDocumentOrder = (a: AdminDocument, b: AdminDocument) => {
  const orderA = DOCUMENT_ORDER[a.document_type] ?? 99;
  const orderB = DOCUMENT_ORDER[b.document_type] ?? 99;
  if (orderA !== orderB) return orderA - orderB;
  return sortNewestFirst(a, b);
};

const getAbsoluteFileUrl = (fileUrl?: string | null) => {
  if (!fileUrl) return "";
  return fileUrl.startsWith("http") ? fileUrl : `http://127.0.0.1:8000${fileUrl}`;
};

const getVerificationStatus = (doc: AdminDocument): VerificationFilter => {
  if (doc.verified === true) return "verified";
  if (doc.verified === false) return "rejected";
  return "pending";
};

const isProfilePictureDocument = (doc: AdminDocument) =>
  doc.document_type === "profile_picture";

const getDocumentKey = (doc: AdminDocument) =>
  `${doc.userType}-${doc.document_type}-${doc.id}`;

const sortReviewQueue = (documents: AdminDocument[]) =>
  documents.slice().sort(sortByDocumentOrder);

const getStatusBadge = (doc: AdminDocument) => {
  const status = getVerificationStatus(doc);

  if (status === "verified") {
    return (
      <Badge className="bg-green-100 text-green-800">
        <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} className="mr-1" />
        Verified
      </Badge>
    );
  }

  if (status === "rejected") {
    return (
      <Badge className="bg-red-100 text-red-800">
        <HugeiconsIcon icon={Cancel01Icon} size={14} className="mr-1" />
        Rejected
      </Badge>
    );
  }

  return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
};

const sortNewestFirst = (a: AdminDocument, b: AdminDocument) =>
  new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime();

const getLatestDocuments = (documents: AdminDocument[]) => {
  const latestByType = documents
    .slice()
    .sort(sortNewestFirst)
    .reduce<Record<string, AdminDocument>>((latest, document) => {
      if (!latest[document.document_type]) {
        latest[document.document_type] = document;
      }
      return latest;
    }, {});

  return Object.values(latestByType).sort(sortByDocumentOrder);
};

const groupDocumentsByUser = (documents: AdminDocument[]): UserDocumentGroup[] => {
  const groups = documents.reduce<Record<string, UserDocumentGroup>>(
    (acc, document) => {
      const key = `${document.userType}-${document.user.email}`;
      if (!acc[key]) {
        acc[key] = {
          key,
          user: document.user,
          userType: document.userType,
          documents: [],
          latestDocuments: [],
        };
      }

      acc[key].documents.push(document);
      return acc;
    },
    {}
  );

  return Object.values(groups)
    .map((group) => ({
      ...group,
      documents: group.documents.slice().sort(sortNewestFirst),
      latestDocuments: getLatestDocuments(group.documents),
    }))
    .sort((a, b) => {
      const aLatest = a.documents[0]?.uploaded_at ?? "";
      const bLatest = b.documents[0]?.uploaded_at ?? "";
      return new Date(bLatest).getTime() - new Date(aLatest).getTime();
    });
};

const getPreviewType = (fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension || "")) {
    return "image";
  }
  if (extension === "pdf") return "pdf";
  return "download";
};

const getInitials = (name: string, email: string) => {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");
  return (initials || email[0] || "?").toUpperCase();
};

export function AdminDocumentVerification() {
  const [teacherDocs, setTeacherDocs] = React.useState<VerificationDocument[]>(
    []
  );
  const [parentDocs, setParentDocs] = React.useState<VerificationDocument[]>([]);
  const [profilePictureDocs, setProfilePictureDocs] = React.useState<
    VerificationDocument[]
  >([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<VerificationFilter>("pending");
  const [userTypeFilter, setUserTypeFilter] = React.useState<UserType | "all">(
    "all"
  );
  const [activeGroupKey, setActiveGroupKey] = React.useState<string | null>(null);
  const [reviewQueue, setReviewQueue] = React.useState<AdminDocument[]>([]);
  const [reviewIndex, setReviewIndex] = React.useState(0);
  const [profilePicturePreview, setProfilePicturePreview] =
    React.useState<UserDocumentGroup | null>(null);
  const [rejectionReason, setRejectionReason] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const loadDocuments = React.useCallback(async () => {
    try {
      setLoading(true);
      const [teacherData, parentData, profilePictureData] = await Promise.all([
        api.documents.admin.listTeacherDocuments(),
        api.documents.admin.listParentDocuments(),
        api.documents.admin.listProfilePictures(),
      ]);
      setTeacherDocs(teacherData.results);
      setParentDocs(parentData.results);
      setProfilePictureDocs(profilePictureData.results);
    } catch (error) {
      console.error("Failed to load documents", error);
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const allDocuments: AdminDocument[] = React.useMemo(
    () => [
      ...teacherDocs.map((doc) => ({ ...doc, userType: "teacher" as const })),
      ...parentDocs.map((doc) => ({ ...doc, userType: "parent" as const })),
      ...profilePictureDocs.map((doc) => ({
        ...doc,
        userType:
          doc.user.role === "parent" ? ("parent" as const) : ("teacher" as const),
      })),
    ],
    [parentDocs, profilePictureDocs, teacherDocs]
  );

  const allGroups = React.useMemo(() => {
    const typeFilteredDocuments =
      userTypeFilter === "all"
        ? allDocuments
        : allDocuments.filter((doc) => doc.userType === userTypeFilter);

    return groupDocumentsByUser(typeFilteredDocuments);
  }, [allDocuments, userTypeFilter]);

  const filteredGroups = React.useMemo(
    () =>
      allGroups
        .map((group) => ({
          ...group,
          latestDocuments: group.latestDocuments.filter(
            (doc) => getVerificationStatus(doc) === filter
          ),
        }))
        .filter((group) => group.latestDocuments.length > 0),
    [allGroups, filter]
  );

  const primaryDocuments = allGroups.flatMap((group) => group.latestDocuments);
  const pendingCount = primaryDocuments.filter(
    (doc) => getVerificationStatus(doc) === "pending"
  ).length;
  const verifiedCount = primaryDocuments.filter(
    (doc) => getVerificationStatus(doc) === "verified"
  ).length;
  const rejectedCount = primaryDocuments.filter(
    (doc) => getVerificationStatus(doc) === "rejected"
  ).length;

  const activeDocument = reviewQueue[reviewIndex] ?? null;
  const activeGroup = allGroups.find((group) => group.key === activeGroupKey);
  const activeHistory =
    activeDocument && activeGroup
      ? activeGroup.documents.filter(
          (doc) =>
            doc.document_type === activeDocument.document_type &&
            doc.id !== activeDocument.id
        )
      : [];

  const openReviewModal = (group: UserDocumentGroup) => {
    setActiveGroupKey(group.key);
    setReviewQueue(sortReviewQueue(group.latestDocuments));
    setReviewIndex(0);
    setRejectionReason("");
  };

  const openProfilePictureReview = (group: UserDocumentGroup) => {
    const profilePictureDocument = group.latestDocuments.find(
      isProfilePictureDocument
    );
    if (!profilePictureDocument) {
      setProfilePicturePreview(group);
      return;
    }

    const queue = sortReviewQueue(group.latestDocuments);
    setActiveGroupKey(group.key);
    setReviewQueue(queue);
    setReviewIndex(
      Math.max(
        0,
        queue.findIndex(
          (document) =>
            getDocumentKey(document) === getDocumentKey(profilePictureDocument)
        )
      )
    );
    setRejectionReason("");
  };

  const closeReviewModal = () => {
    setActiveGroupKey(null);
    setReviewQueue([]);
    setReviewIndex(0);
    setRejectionReason("");
  };

  const advanceAfterAction = (currentDoc: AdminDocument) => {
    const nextQueue = reviewQueue.filter(
      (doc) => getDocumentKey(doc) !== getDocumentKey(currentDoc)
    );
    if (nextQueue.length === 0) {
      closeReviewModal();
      return;
    }

    setReviewQueue(nextQueue);
    setReviewIndex((currentIndex) =>
      Math.min(currentIndex, Math.max(nextQueue.length - 1, 0))
    );
    setRejectionReason("");
  };

  const handleVerifyDocument = async () => {
    if (!activeDocument) return;

    try {
      setSubmitting(true);
      if (isProfilePictureDocument(activeDocument)) {
        await api.documents.admin.verifyProfilePicture(
          activeDocument.userType,
          activeDocument.id,
          {
            verified: true,
          }
        );
      } else if (activeDocument.userType === "teacher") {
        await api.documents.admin.verifyTeacherDocument(activeDocument.id, {
          verified: true,
        });
      } else {
        await api.documents.admin.verifyParentDocument(activeDocument.id, {
          verified: true,
        });
      }

      toast.success(
        isProfilePictureDocument(activeDocument)
          ? "Profile picture accepted"
          : "Document verified successfully"
      );
      advanceAfterAction(activeDocument);
      await loadDocuments();
    } catch (error) {
      console.error("Failed to verify document", error);
      toast.error("Failed to verify document");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectDocument = async () => {
    if (!activeDocument || !rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      setSubmitting(true);
      if (isProfilePictureDocument(activeDocument)) {
        await api.documents.admin.verifyProfilePicture(
          activeDocument.userType,
          activeDocument.id,
          {
            verified: false,
            rejection_reason: rejectionReason,
          }
        );
      } else if (activeDocument.userType === "teacher") {
        await api.documents.admin.verifyTeacherDocument(activeDocument.id, {
          verified: false,
          rejection_reason: rejectionReason,
        });
      } else {
        await api.documents.admin.verifyParentDocument(activeDocument.id, {
          verified: false,
          rejection_reason: rejectionReason,
        });
      }

      toast.success(
        isProfilePictureDocument(activeDocument)
          ? "Profile picture rejected"
          : "Document rejected"
      );
      advanceAfterAction(activeDocument);
      await loadDocuments();
    } catch (error) {
      console.error("Failed to reject document", error);
      toast.error("Failed to reject document");
    } finally {
      setSubmitting(false);
    }
  };

  const renderDocumentPreview = () => {
    if (!activeDocument) return null;

    const fileUrl = getAbsoluteFileUrl(activeDocument.file_url);
    const previewType = getPreviewType(activeDocument.file_name);

    if (previewType === "image") {
      return (
        <img
          src={fileUrl}
          alt={activeDocument.file_name}
          className="h-full max-h-[70vh] w-full rounded-lg object-contain"
        />
      );
    }

    if (previewType === "pdf") {
      return (
        <div className="flex h-[70vh] flex-col items-center justify-center rounded-lg border bg-neutral-50 p-8 text-center">
          <HugeiconsIcon
            icon={FileViewIcon}
            size={48}
            className="mb-4 text-muted-foreground"
          />
          <p className="font-medium">PDF Preview</p>
          <p className="mt-2 text-sm text-muted-foreground mb-4">
            PDF files cannot be previewed in the browser due to security restrictions.
          </p>
          <Button asChild>
            <a href={fileUrl} target="_blank" rel="noreferrer">
              Open PDF in New Tab
            </a>
          </Button>
        </div>
      );
    }

    return (
      <div className="flex h-[50vh] flex-col items-center justify-center rounded-lg border bg-neutral-50 p-8 text-center">
        <HugeiconsIcon
          icon={FileViewIcon}
          size={48}
          className="mb-4 text-muted-foreground"
        />
        <p className="font-medium">Preview is not available for this file type.</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Open the document in a new tab to inspect it.
        </p>
        <Button asChild className="mt-4">
          <a href={fileUrl} target="_blank" rel="noreferrer">
            Open document
          </a>
        </Button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">...</div>
          <p className="text-muted-foreground">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-50 to-neutral-100 p-6">
      <div className="container mx-auto max-w-7xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={FileCheck} size={24} />
              Document Verification
            </CardTitle>
            <CardDescription>
              Review users one at a time. Profile pictures and the latest upload
              for each document type are queued for action, while older uploads
              stay in the modal as history.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="mb-4 flex flex-wrap gap-2">
          <Button
            variant={userTypeFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setUserTypeFilter("all")}
          >
            All Users
          </Button>
          <Button
            variant={userTypeFilter === "teacher" ? "default" : "outline"}
            size="sm"
            onClick={() => setUserTypeFilter("teacher")}
          >
            Teachers
          </Button>
          <Button
            variant={userTypeFilter === "parent" ? "default" : "outline"}
            size="sm"
            onClick={() => setUserTypeFilter("parent")}
          >
            Parents
          </Button>
        </div>

        <Tabs
          value={filter}
          onValueChange={(value) => setFilter(value as VerificationFilter)}
        >
          <TabsList className="mb-6">
            <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
            <TabsTrigger value="verified">
              Verified ({verifiedCount})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({rejectedCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={filter}>
            {filteredGroups.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <HugeiconsIcon
                    icon={FileViewIcon}
                    size={48}
                    className="mx-auto mb-4 text-muted-foreground opacity-50"
                  />
                  <p className="text-muted-foreground">
                    No {filter} document submissions
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredGroups.map((group) => {
                  const pendingForUser = group.documents.filter(
                    (doc) => getVerificationStatus(doc) === "pending"
                  ).length;
                  const verifiedForUser = group.documents.filter(
                    (doc) => getVerificationStatus(doc) === "verified"
                  ).length;
                  const rejectedForUser = group.documents.filter(
                    (doc) => getVerificationStatus(doc) === "rejected"
                  ).length;

                  return (
                    <Card key={group.key}>
                    <CardContent className="grid gap-8 p-6 xl:grid-cols-[380px_1fr]">
                        <aside className="space-y-5 border-b pb-6 xl:border-b-0 xl:border-r xl:pb-0 xl:pr-8">
                          <div className="flex flex-col items-center text-center">
                            <button
                              type="button"
                              onClick={() => openProfilePictureReview(group)}
                              className="rounded-full outline-none ring-offset-background transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
                              aria-label="Review profile picture"
                            >
                              <Avatar className="size-28" size="lg">
                                {group.user.profile_picture && (
                                  <AvatarImage
                                    src={group.user.profile_picture}
                                    alt={group.user.full_name}
                                  />
                                )}
                                <AvatarFallback className="text-2xl">
                                  {getInitials(group.user.full_name, group.user.email)}
                                </AvatarFallback>
                              </Avatar>
                            </button>
                            <h3 className="mt-4 max-w-full truncate text-xl font-semibold">
                              {group.user.full_name || "Unnamed user"}
                            </h3>
                            <p className="mt-1 max-w-full break-all text-sm text-muted-foreground">
                              {group.user.email}
                            </p>
                            <div className="mt-3 flex flex-wrap justify-center gap-2">
                              <Badge variant="outline" className="capitalize">
                                {group.userType}
                              </Badge>
                              <Badge variant="outline">ID {group.user.id}</Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="rounded-lg bg-yellow-50 p-2">
                              <p className="text-lg font-semibold text-yellow-800">
                                {pendingForUser}
                              </p>
                              <p className="text-xs text-yellow-800">Pending</p>
                            </div>
                            <div className="rounded-lg bg-green-50 p-2">
                              <p className="text-lg font-semibold text-green-800">
                                {verifiedForUser}
                              </p>
                              <p className="text-xs text-green-800">Verified</p>
                            </div>
                            <div className="rounded-lg bg-red-50 p-2">
                              <p className="text-lg font-semibold text-red-800">
                                {rejectedForUser}
                              </p>
                              <p className="text-xs text-red-800">Rejected</p>
                            </div>
                          </div>

                          <div className="text-sm text-muted-foreground">
                            <div className="mb-1 flex items-center gap-2">
                              <HugeiconsIcon icon={CalendarIcon} size={16} />
                              Latest upload
                            </div>
                            <p className="font-medium text-foreground">
                              {new Date(
                                group.documents[0].uploaded_at
                              ).toLocaleDateString()}
                            </p>
                            <p className="mt-1">
                              {group.documents.length} total submission
                              {group.documents.length === 1 ? "" : "s"}
                            </p>
                          </div>
                        </aside>

                        <section className="flex flex-col justify-between gap-6">
                          <div>
                            <div className="flex flex-wrap gap-2">
                              {group.latestDocuments.map((doc) => (
                                <Badge
                                  key={getDocumentKey(doc)}
                                  variant="outline"
                                  className="bg-white"
                                >
                                  {getDocumentLabel(doc.document_type)}
                                  <span className="ml-1 text-muted-foreground">
                                    {getStatusBadge(doc)}
                                  </span>
                                </Badge>
                              ))}
                            </div>
                            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
                              Open the review modal to inspect the profile
                              picture and documents, see previous submissions,
                              and take action.
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="text-sm text-muted-foreground">
                              {group.latestDocuments.length} latest document
                              {group.latestDocuments.length === 1 ? "" : "s"} in
                              this {filter} queue.
                            </p>
                            <Button onClick={() => openReviewModal(group)}>
                              <HugeiconsIcon
                                icon={FileViewIcon}
                                data-icon="inline-start"
                              />
                              {filter === "pending"
                                ? "Verify documents"
                                : "View documents"}
                            </Button>
                          </div>
                        </section>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog
        open={Boolean(activeDocument)}
        onOpenChange={(open) => !open && closeReviewModal()}
      >
        <DialogContent className="sm:max-w-6xl">
          {activeDocument && activeGroup && (
            <>
              <DialogHeader>
                <DialogTitle className="flex flex-wrap items-center gap-2">
                  {getDocumentLabel(activeDocument.document_type)}
                  {getStatusBadge(activeDocument)}
                </DialogTitle>
                <DialogDescription>
                  Document {reviewIndex + 1} of {reviewQueue.length} for{" "}
                  {activeGroup.user.full_name || activeGroup.user.email}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
                <aside className="space-y-4 rounded-lg border bg-neutral-50 p-4 text-sm">
                  <div className="flex items-start gap-3">
                    <Avatar className="size-14" size="lg">
                      {activeGroup.user.profile_picture && (
                        <AvatarImage
                          src={activeGroup.user.profile_picture}
                          alt={activeGroup.user.full_name}
                        />
                      )}
                      <AvatarFallback>
                        {getInitials(
                          activeGroup.user.full_name,
                          activeGroup.user.email
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-semibold">
                        {activeGroup.user.full_name || "Unnamed user"}
                      </p>
                      <p className="break-all text-muted-foreground">
                        {activeGroup.user.email}
                      </p>
                      <Badge variant="outline" className="mt-2 capitalize">
                        {activeGroup.userType}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <p className="text-muted-foreground">Document type</p>
                    <p className="font-medium">
                      {getDocumentLabel(activeDocument.document_type)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">File name</p>
                    <p className="break-all font-medium">
                      {activeDocument.file_name}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-muted-foreground">Uploaded</p>
                      <p className="font-medium">
                        {new Date(
                          activeDocument.uploaded_at
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Size</p>
                      <p className="font-medium">
                        {formatFileSize(activeDocument.file_size)}
                      </p>
                    </div>
                  </div>

                  {activeDocument.rejection_reason && (
                    <div className="rounded-md bg-red-50 p-3 text-red-800">
                      <p className="font-medium">Rejection reason</p>
                      <p className="mt-1">{activeDocument.rejection_reason}</p>
                    </div>
                  )}

                  {activeHistory.length > 0 && (
                    <div className="border-t pt-3">
                      <p className="mb-2 font-medium">Previous submissions</p>
                      <div className="space-y-2">
                        {activeHistory.map((doc) => (
                          <div
                            key={getDocumentKey(doc)}
                            className="rounded-md bg-white p-2"
                          >
                            <p className="break-all text-xs font-medium">
                              {doc.file_name}
                            </p>
                            <div className="mt-1 flex items-center justify-between gap-2">
                              {getStatusBadge(doc)}
                              <span className="text-xs text-muted-foreground">
                                {new Date(doc.uploaded_at).toLocaleDateString()}
                              </span>
                            </div>
                            {doc.rejection_reason && (
                              <p className="mt-1 text-xs text-red-700">
                                {doc.rejection_reason}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </aside>

                <div>{renderDocumentPreview()}</div>
              </div>

              <DialogFooter className="gap-3 sm:justify-between">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setReviewIndex((index) => Math.max(0, index - 1))
                    }
                    disabled={reviewIndex === 0 || submitting}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setReviewIndex((index) =>
                        Math.min(reviewQueue.length - 1, index + 1)
                      )
                    }
                    disabled={reviewIndex >= reviewQueue.length - 1 || submitting}
                  >
                    Next
                  </Button>
                </div>

                {getVerificationStatus(activeDocument) === "pending" ? (
                  <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-end sm:justify-end">
                    <div className="grid min-w-0 flex-1 gap-2 sm:max-w-md">
                      <Label htmlFor="rejection-reason">Rejection reason</Label>
                      <Textarea
                        id="rejection-reason"
                        placeholder="Required only when rejecting..."
                        value={rejectionReason}
                        onChange={(event) =>
                          setRejectionReason(event.target.value)
                        }
                        rows={2}
                        disabled={submitting}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleRejectDocument}
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                        disabled={!rejectionReason.trim() || submitting}
                      >
                        Reject
                      </Button>
                      <Button
                        onClick={handleVerifyDocument}
                        className="bg-green-600 hover:bg-green-700"
                        disabled={submitting}
                      >
                        Accept
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="outline" onClick={closeReviewModal}>
                    Close
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(profilePicturePreview)}
        onOpenChange={(open) => !open && setProfilePicturePreview(null)}
      >
        <DialogContent className="sm:max-w-md">
          {profilePicturePreview && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {profilePicturePreview.user.full_name || "Profile picture"}
                </DialogTitle>
                <DialogDescription>
                  {profilePicturePreview.user.email}
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-center rounded-lg bg-neutral-50 p-6">
                {profilePicturePreview.user.profile_picture ? (
                  <img
                    src={profilePicturePreview.user.profile_picture}
                    alt={profilePicturePreview.user.full_name}
                    className="max-h-[60vh] rounded-lg object-contain"
                  />
                ) : (
                  <div className="flex size-48 items-center justify-center rounded-full bg-muted text-5xl font-semibold text-muted-foreground">
                    {getInitials(
                      profilePicturePreview.user.full_name,
                      profilePicturePreview.user.email
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
