import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import api, { type User } from "@/services/api";
import { toast } from "sonner";

type ModerationAction = "suspend" | "block" | "reactivate";

interface AdminUserDetailsDialogProps {
  user: User | null;
  onOpenChange: (open: boolean) => void;
  onUserUpdated?: (user: User) => void;
}

const getStatusBadge = (user: User) => {
  if (user.moderation_status === "blocked" || !user.is_active) {
    return "Blocked";
  }
  if (user.moderation_status === "suspended") {
    return "Suspended";
  }
  return "Active";
};

export function AdminUserDetailsDialog({
  user,
  onOpenChange,
  onUserUpdated,
}: AdminUserDetailsDialogProps) {
  const [selectedUser, setSelectedUser] = React.useState<User | null>(user);
  const [moderating, setModerating] = React.useState(false);
  const [moderationAction, setModerationAction] =
    React.useState<ModerationAction | null>(null);
  const [suspendDays, setSuspendDays] = React.useState("7");
  const [moderationReason, setModerationReason] = React.useState(
    "Platform policy violation"
  );

  React.useEffect(() => {
    setSelectedUser(user);
    if (!user) {
      setModerationAction(null);
    }
  }, [user]);

  const openModerationDialog = (action: ModerationAction) => {
    setModerationAction(action);
    setSuspendDays("7");
    setModerationReason(action === "reactivate" ? "" : "Platform policy violation");
  };

  const moderateUser = async () => {
    if (!selectedUser || !moderationAction) return;

    const days = moderationAction === "suspend" ? Number(suspendDays) : undefined;
    if (moderationAction === "suspend" && (!days || days <= 0)) {
      toast.error("Enter a valid suspension length");
      return;
    }

    try {
      setModerating(true);
      const updated = await api.users.moderate(selectedUser.id, {
        action: moderationAction,
        days,
        reason: moderationAction === "reactivate" ? "" : moderationReason.trim(),
      });
      setSelectedUser(updated);
      onUserUpdated?.(updated);
      setModerationAction(null);
      toast.success("User moderation updated");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update user");
    } finally {
      setModerating(false);
    }
  };

  return (
    <>
      <Dialog open={Boolean(selectedUser)} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {selectedUser.first_name} {selectedUser.last_name}
                </DialogTitle>
                <DialogDescription>{selectedUser.email}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div className="grid gap-3 rounded-lg border bg-neutral-50 p-4 sm:grid-cols-3">
                  <div>
                    <p className="text-muted-foreground">User ID</p>
                    <p className="font-medium">#{selectedUser.id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Role</p>
                    <p className="font-medium capitalize">{selectedUser.role}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <p className="font-medium">{getStatusBadge(selectedUser)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Email verified</p>
                    <p className="font-medium">
                      {selectedUser.is_email_verified ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Joined</p>
                    <p className="font-medium">
                      {new Date(selectedUser.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Updated</p>
                    <p className="font-medium">
                      {new Date(selectedUser.updated_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="mb-3 font-semibold">Profile</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-muted-foreground">Name</p>
                      <p className="font-medium">
                        {selectedUser.first_name} {selectedUser.last_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="break-all font-medium">{selectedUser.email}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Profile picture</p>
                      <p className="font-medium">
                        {selectedUser.profile_picture ? "Uploaded" : "Not uploaded"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Picture review</p>
                      <p className="font-medium">
                        {selectedUser.profile_picture_verified === true
                          ? "Verified"
                          : selectedUser.profile_picture_verified === false
                          ? "Rejected"
                          : "Pending or not submitted"}
                      </p>
                    </div>
                  </div>
                </div>
                {selectedUser.suspended_until && (
                  <div className="rounded-lg bg-amber-50 p-3 text-amber-800">
                    Suspended until{" "}
                    {new Date(selectedUser.suspended_until).toLocaleString()}
                  </div>
                )}
                {selectedUser.moderation_reason && (
                  <div className="rounded-lg bg-neutral-50 p-3">
                    <p className="font-medium">Moderation reason</p>
                    <p className="text-muted-foreground">
                      {selectedUser.moderation_reason}
                    </p>
                  </div>
                )}
              </div>
              <DialogFooter className="gap-2 sm:justify-between">
                <Button
                  variant="outline"
                  disabled={moderating || selectedUser.role === "admin"}
                  onClick={() => openModerationDialog("suspend")}
                >
                  Suspend
                </Button>
                <Button
                  variant="outline"
                  className="border-red-300 text-red-600"
                  disabled={moderating || selectedUser.role === "admin"}
                  onClick={() => openModerationDialog("block")}
                >
                  Block
                </Button>
                <Button
                  disabled={moderating || selectedUser.role === "admin"}
                  onClick={() => openModerationDialog("reactivate")}
                >
                  Reactivate
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(moderationAction)}
        onOpenChange={(open) => !open && setModerationAction(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="capitalize">
              {moderationAction} {selectedUser?.first_name} {selectedUser?.last_name}
            </DialogTitle>
            <DialogDescription>
              This updates the user's login access and public moderation status.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {moderationAction === "suspend" && (
              <div className="space-y-2">
                <Label htmlFor="admin-user-suspend-days">Suspension days</Label>
                <Input
                  id="admin-user-suspend-days"
                  type="number"
                  min={1}
                  value={suspendDays}
                  onChange={(event) => setSuspendDays(event.target.value)}
                />
              </div>
            )}
            {moderationAction !== "reactivate" && (
              <div className="space-y-2">
                <Label htmlFor="admin-user-moderation-reason">Reason</Label>
                <Textarea
                  id="admin-user-moderation-reason"
                  value={moderationReason}
                  onChange={(event) => setModerationReason(event.target.value)}
                  className="min-h-24 resize-none"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModerationAction(null)}>
              Cancel
            </Button>
            <Button disabled={moderating} onClick={moderateUser}>
              {moderating ? "Saving..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
