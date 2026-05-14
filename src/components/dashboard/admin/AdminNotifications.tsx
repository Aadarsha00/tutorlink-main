import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import api, { type BroadcastNotificationData, type User } from "@/services/api";
import { toast } from "sonner";

export default function AdminNotificationsPage() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [sending, setSending] = React.useState(false);
  const [data, setData] = React.useState<BroadcastNotificationData>({
    title: "",
    message: "",
    link: "/notifications",
    audience: "all",
    roles: [],
    user_ids: [],
    emails: [],
    active_only: true,
    joined_after: "",
    joined_before: "",
  });

  React.useEffect(() => {
    api.users
      .getAll()
      .then((response) => setUsers(response.results))
      .catch(() => setUsers([]));
  }, []);

  const update = <K extends keyof BroadcastNotificationData>(
    key: K,
    value: BroadcastNotificationData[K]
  ) => setData((current) => ({ ...current, [key]: value }));

  const toggleRole = (role: "teacher" | "parent" | "admin") => {
    setData((current) => {
      const roles = current.roles || [];
      return {
        ...current,
        roles: roles.includes(role)
          ? roles.filter((item) => item !== role)
          : [...roles, role],
      };
    });
  };

  const toggleUser = (id: number) => {
    setData((current) => {
      const userIds = current.user_ids || [];
      return {
        ...current,
        user_ids: userIds.includes(id)
          ? userIds.filter((item) => item !== id)
          : [...userIds, id],
      };
    });
  };

  const send = async () => {
    if (!data.title.trim() || !data.message.trim()) {
      toast.error("Title and message are required");
      return;
    }

    try {
      setSending(true);
      const result = await api.notifications.broadcast(data);
      toast.success(
        `Sent ${result.created_count} notifications and ${result.email_count} emails`
      );
      setData((current) => ({ ...current, title: "", message: "", emails: [] }));
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to send notification");
    } finally {
      setSending(false);
    }
  };

  const selectedUsers = users.filter((user) => data.user_ids?.includes(user.id));

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-950">Send Notifications</h1>
          <p className="text-muted-foreground">
            Send custom notices to everyone, selected roles, selected users, filtered users, or external emails.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <Card>
            <CardHeader>
              <CardTitle>Message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="broadcast-title">Title</Label>
                <Input
                  id="broadcast-title"
                  value={data.title}
                  onChange={(event) => update("title", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="broadcast-message">Message</Label>
                <Textarea
                  id="broadcast-message"
                  value={data.message}
                  onChange={(event) => update("message", event.target.value)}
                  className="min-h-36 resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="broadcast-link">Link</Label>
                <Input
                  id="broadcast-link"
                  value={data.link || ""}
                  onChange={(event) => update("link", event.target.value)}
                  placeholder="/notifications"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="broadcast-emails">Custom emails</Label>
                <Textarea
                  id="broadcast-emails"
                  value={(data.emails || []).join("\n")}
                  onChange={(event) =>
                    update(
                      "emails",
                      event.target.value
                        .split(/\n|,/)
                        .map((email) => email.trim())
                        .filter(Boolean)
                    )
                  }
                  className="min-h-24 resize-none"
                  placeholder="one@email.com, two@email.com"
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Audience</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  value={data.audience}
                  onValueChange={(value) =>
                    update("audience", value as BroadcastNotificationData["audience"])
                  }
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All users</SelectItem>
                    <SelectItem value="roles">Selected roles</SelectItem>
                    <SelectItem value="users">Selected users</SelectItem>
                  </SelectContent>
                </Select>

                {data.audience === "roles" && (
                  <div className="grid gap-2">
                    {(["parent", "teacher", "admin"] as const).map((role) => (
                      <label key={role} className="flex items-center gap-2 text-sm capitalize">
                        <input
                          type="checkbox"
                          checked={Boolean(data.roles?.includes(role))}
                          onChange={() => toggleRole(role)}
                        />
                        {role}
                      </label>
                    ))}
                  </div>
                )}

                {data.audience === "users" && (
                  <div className="max-h-64 space-y-2 overflow-y-auto rounded-md border p-2">
                    {users.map((user) => (
                      <label key={user.id} className="flex items-start gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={Boolean(data.user_ids?.includes(user.id))}
                          onChange={() => toggleUser(user.id)}
                        />
                        <span>
                          <span className="font-medium">
                            {user.first_name} {user.last_name}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {user.email} - {user.role}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(data.active_only)}
                    onChange={(event) => update("active_only", event.target.checked)}
                  />
                  Active users only
                </label>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Criteria</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="joined-after">Joined after</Label>
                  <Input
                    id="joined-after"
                    type="date"
                    value={data.joined_after || ""}
                    onChange={(event) => update("joined_after", event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="joined-before">Joined before</Label>
                  <Input
                    id="joined-before"
                    type="date"
                    value={data.joined_before || ""}
                    onChange={(event) => update("joined_before", event.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-3 p-4">
                <p className="text-sm text-muted-foreground">
                  Selected users: {data.audience === "users" ? selectedUsers.length : "based on filters"}
                </p>
                <p className="text-sm text-muted-foreground">
                  External emails: {data.emails?.length || 0}
                </p>
                <Button className="w-full" onClick={send} disabled={sending}>
                  {sending ? "Sending..." : "Send Notification"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
