import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserIcon,
  Delete02Icon,
  Edit02Icon,
  CheckmarkCircle01Icon,
  CancelCircleIcon,
  Calendar03Icon,
  Shield,
  Camera01Icon,
  ZoomIn,
  ZoomOut,
  RefreshIcon,
} from "@hugeicons/core-free-icons";
import api from "@/services/api";
import type {
  User,
  ChangePasswordData,
  ParentVerificationDocument,
  VerificationDocument,
} from "@/services/api";
import { toast } from "sonner";

type IdentityDocument = VerificationDocument | ParentVerificationDocument;

const REQUIRED_ID_DOCUMENT_TYPES = ["citizenship_front", "citizenship_back"];

const hasVerifiedIdDocuments = (documents: IdentityDocument[]) => {
  const latestByType = documents.reduce<Record<string, IdentityDocument>>(
    (latest, document) => {
      if (!REQUIRED_ID_DOCUMENT_TYPES.includes(document.document_type)) {
        return latest;
      }

      if (
        !latest[document.document_type] ||
        new Date(document.uploaded_at).getTime() >
          new Date(latest[document.document_type].uploaded_at).getTime()
      ) {
        latest[document.document_type] = document;
      }

      return latest;
    },
    {}
  );

  return REQUIRED_ID_DOCUMENT_TYPES.every(
    (documentType) => latestByType[documentType]?.verified === true
  );
};

interface CropSettings {
  scale: number;
  x: number;
  y: number;
}

function ImageCropDialog({
  open,
  onOpenChange,
  imageUrl,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  onSave: (croppedImage: string) => void;
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const imageRef = React.useRef<HTMLImageElement | null>(null);
  const [cropSettings, setCropSettings] = React.useState<CropSettings>({
    scale: 1,
    x: 0,
    y: 0,
  });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });

  React.useEffect(() => {
    if (open && imageUrl) {
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        drawCanvas();
      };
      img.src = imageUrl;
    }
  }, [open, imageUrl]);

  React.useEffect(() => {
    if (imageRef.current) {
      drawCanvas();
    }
  }, [cropSettings]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 300;
    canvas.width = size;
    canvas.height = size;

    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, size, size);

    ctx.save();
    ctx.translate(size / 2, size / 2);

    const scaledWidth = img.width * cropSettings.scale;
    const scaledHeight = img.height * cropSettings.scale;

    ctx.drawImage(
      img,
      -scaledWidth / 2 + cropSettings.x,
      -scaledHeight / 2 + cropSettings.y,
      scaledWidth,
      scaledHeight
    );

    ctx.restore();

    // Draw crop circle overlay
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 10, 0, Math.PI * 2);
    ctx.stroke();
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - cropSettings.x,
      y: e.clientY - cropSettings.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setCropSettings((prev) => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const finalCanvas = document.createElement("canvas");
    const finalCtx = finalCanvas.getContext("2d");
    if (!finalCtx) return;

    const size = 300;
    finalCanvas.width = size;
    finalCanvas.height = size;

    finalCtx.beginPath();
    finalCtx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    finalCtx.closePath();
    finalCtx.clip();

    finalCtx.drawImage(canvas, 0, 0);

    const croppedImage = finalCanvas.toDataURL("image/jpeg", 0.9);
    onSave(croppedImage);
    onOpenChange(false);
  };

  const resetPosition = () => {
    setCropSettings({ scale: 1, x: 0, y: 0 });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Crop Profile Picture</DialogTitle>
          <DialogDescription>
            Adjust the image to fit in the circular frame
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              className="border rounded-lg cursor-move"
              style={{ width: "300px", height: "300px" }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <HugeiconsIcon icon={ZoomOut} size={20} />
              <Slider
                value={[cropSettings.scale]}
                onValueChange={([value]) =>
                  setCropSettings((prev) => ({ ...prev, scale: value }))
                }
                min={0.5}
                max={3}
                step={0.1}
                className="flex-1"
              />
              <HugeiconsIcon icon={ZoomIn} size={20} />
            </div>

            <Button
              variant="outline"
              onClick={resetPosition}
              className="w-full"
              size="sm"
            >
              <HugeiconsIcon icon={RefreshIcon} data-icon="inline-start" />
              Reset Position
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Picture</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProfileSection() {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [identityVerified, setIdentityVerified] = React.useState(false);
  const [formData, setFormData] = React.useState({
    first_name: "",
    last_name: "",
    profile_picture: "",
  });
  const [cropDialogOpen, setCropDialogOpen] = React.useState(false);
  const [tempImageUrl, setTempImageUrl] = React.useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      setLoading(true);
      const data = await api.auth.getCurrentUser();
      setUser(data);
      if (data.role === "admin") {
        setIdentityVerified(true);
      } else {
        const documents =
          data.role === "teacher"
            ? await api.documents.listMyTeacher()
            : await api.documents.listMyParent();
        setIdentityVerified(hasVerifiedIdDocuments(documents));
      }
      setFormData({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        profile_picture: data.profile_picture || "",
      });
    } catch (error) {
      console.error("Failed to load user", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      setTempImageUrl(imageUrl);
      setCropDialogOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const [croppedImageFile, setCroppedImageFile] = React.useState<File | null>(
    null
  );

  const handleCroppedImage = (croppedImage: string) => {
    setFormData((prev) => ({ ...prev, profile_picture: croppedImage }));

    // Convert base64 to File object
    fetch(croppedImage)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "profile-picture.jpg", {
          type: "image/jpeg",
        });
        setCroppedImageFile(file);
      });
  };

  const handleSave = async () => {
    try {
      if (!identityVerified) {
        toast.error(
          "Profile edits are available after citizenship front and back are verified."
        );
        return;
      }

      setSaving(true);

      // If there's a new profile picture, upload it separately
      if (croppedImageFile && user?.role !== "teacher") {
        const formDataUpload = new FormData();
        formDataUpload.append("profile_picture", croppedImageFile);

        // Update profile picture
        await api.auth.updateCurrentUser(formDataUpload as any);
      }

      // Update other fields (name)
      const updateData: any = {};
      if (formData.first_name !== user?.first_name) {
        updateData.first_name = formData.first_name;
      }
      if (formData.last_name !== user?.last_name) {
        updateData.last_name = formData.last_name;
      }

      if (Object.keys(updateData).length > 0) {
        await api.auth.updateCurrentUser(updateData);
      }

      // Reload user data
      const updated = await api.auth.getCurrentUser();
      setUser(updated);
      setFormData({
        first_name: updated.first_name || "",
        last_name: updated.last_name || "",
        profile_picture: updated.profile_picture || "",
      });

      setEditing(false);
      setCroppedImageFile(null);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Manage your personal information
              </CardDescription>
            </div>
            {!editing && (
              <Button
                onClick={() => setEditing(true)}
                variant="outline"
                disabled={!identityVerified}
                title={
                  identityVerified
                    ? undefined
                    : "Citizenship front and back must be verified first"
                }
              >
                <HugeiconsIcon icon={Edit02Icon} data-icon="inline-start" />
                Edit Profile
              </Button>
            )}
          </div>
          {!identityVerified && (
            <CardDescription className="mt-2 text-amber-700">
              Profile edits unlock after your citizenship front and back are
              verified.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Profile Picture */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <img
                  className="h-24 w-24 rounded-full object-cover"
                  src={
                    editing && user.role !== "teacher" && formData.profile_picture
                      ? formData.profile_picture
                      : user.profile_picture
                  }
                  alt={user.first_name}
                />
                {editing && user.role !== "teacher" && (
                  <>
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <HugeiconsIcon icon={Camera01Icon} size={16} />
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-1">
                  {user.first_name} {user.last_name}
                </h3>
                <p className="text-muted-foreground mb-2">{user.email}</p>
                <Badge variant="secondary" className="capitalize">
                  {user.role}
                </Badge>
              </div>
            </div>

            <Separator />

            {editing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) =>
                        setFormData({ ...formData, first_name: e.target.value })
                      }
                      placeholder="Enter first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) =>
                        setFormData({ ...formData, last_name: e.target.value })
                      }
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        first_name: user.first_name || "",
                        last_name: user.last_name || "",
                        profile_picture: user.profile_picture || "",
                      });
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    First Name
                  </p>
                  <p className="text-base">{user.first_name || "Not set"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Last Name
                  </p>
                  <p className="text-base">{user.last_name || "Not set"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Email Address
                  </p>
                  <p className="text-base">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Account Type
                  </p>
                  <p className="text-base capitalize">{user.role}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Status */}
      <Card>
        <CardHeader>
          <CardTitle>Account Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium mb-1">Account Status</p>
                <p className="text-xs text-muted-foreground">
                  {user.is_active ? "Active" : "Inactive"}
                </p>
              </div>
              {user.is_active ? (
                <HugeiconsIcon
                  icon={CheckmarkCircle01Icon}
                  className="text-green-600"
                  size={24}
                />
              ) : (
                <HugeiconsIcon
                  icon={CancelCircleIcon}
                  className="text-red-600"
                  size={24}
                />
              )}
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium mb-1">Account Status</p>
                <p className="text-xs text-muted-foreground">
                  {user.is_active ? "Active" : "Inactive"}
                </p>
              </div>
              {user.is_active ? (
                <HugeiconsIcon
                  icon={CheckmarkCircle01Icon}
                  className="text-green-600"
                  size={24}
                />
              ) : (
                <HugeiconsIcon
                  icon={CancelCircleIcon}
                  className="text-red-600"
                  size={24}
                />
              )}
            </div>

            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <HugeiconsIcon
                icon={Calendar03Icon}
                className="text-muted-foreground"
                size={20}
              />
              <div>
                <p className="text-sm font-medium mb-1">Member Since</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <HugeiconsIcon
                icon={Calendar03Icon}
                className="text-muted-foreground"
                size={20}
              />
              <div>
                <p className="text-sm font-medium mb-1">Last Updated</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(user.updated_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Crop Dialog */}
      <ImageCropDialog
        open={cropDialogOpen}
        onOpenChange={setCropDialogOpen}
        imageUrl={tempImageUrl}
        onSave={handleCroppedImage}
      />
    </div>
  );
}

function SecuritySection() {
  const [loading, setLoading] = React.useState(false);
  const [passwordData, setPasswordData] = React.useState<ChangePasswordData>({
    current_password: "",
    new_password: "",
    re_new_password: "",
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const handlePasswordChange = async () => {
    setErrors({});

    if (!passwordData.current_password) {
      setErrors({ current_password: "Current password is required" });
      return;
    }
    if (!passwordData.new_password) {
      setErrors({ new_password: "New password is required" });
      return;
    }
    if (passwordData.new_password.length < 8) {
      setErrors({ new_password: "Password must be at least 8 characters" });
      return;
    }
    if (passwordData.new_password !== passwordData.re_new_password) {
      setErrors({ re_new_password: "Passwords do not match" });
      return;
    }

    try {
      setLoading(true);
      await api.auth.changePassword(passwordData);
      toast.success("Password changed successfully!");
      setPasswordData({
        current_password: "",
        new_password: "",
        re_new_password: "",
      });
    } catch (error: any) {
      console.error("Failed to change password", error);
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        toast.error("Failed to change password");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="current_password">Current Password</Label>
              <Input
                id="current_password"
                type="password"
                value={passwordData.current_password}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    current_password: e.target.value,
                  })
                }
                placeholder="Enter current password"
              />
              {errors.current_password && (
                <p className="text-sm text-red-600">
                  {errors.current_password}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="new_password">New Password</Label>
              <Input
                id="new_password"
                type="password"
                value={passwordData.new_password}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    new_password: e.target.value,
                  })
                }
                placeholder="Enter new password"
              />
              {errors.new_password && (
                <p className="text-sm text-red-600">{errors.new_password}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters long
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="re_new_password">Confirm New Password</Label>
              <Input
                id="re_new_password"
                type="password"
                value={passwordData.re_new_password}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    re_new_password: e.target.value,
                  })
                }
                placeholder="Confirm new password"
              />
              {errors.re_new_password && (
                <p className="text-sm text-red-600">{errors.re_new_password}</p>
              )}
            </div>

            <Button onClick={handlePasswordChange} disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions that affect your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive">
            <HugeiconsIcon icon={Delete02Icon} data-icon="inline-start" />
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProfileSettingsPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-50 to-neutral-100">
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Profile & Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <HugeiconsIcon icon={UserIcon} size={18} />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <HugeiconsIcon icon={Shield} size={18} />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileSection />
          </TabsContent>

          <TabsContent value="security">
            <SecuritySection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
