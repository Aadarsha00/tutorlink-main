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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserMultiple02Icon,
  UserIcon,
  Search01Icon,
  CheckmarkCircle01Icon,
  Mail01Icon,
  Calendar03Icon,
} from "@hugeicons/core-free-icons";
import api, { type User } from "@/services/api";

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = React.useState<User[] | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [teachersRes] = await Promise.all([api.users.teachers()]);
      setTeachers(teachersRes);
    } catch (error) {
      console.error("Failed to load teachers", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = React.useMemo(() => {
    return teachers?.filter((teacher) => {
      const matchesSearch =
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.last_name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === "all" || teacher.role === roleFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && teacher.is_active) ||
        (statusFilter === "inactive" && !teacher.is_active);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [teachers, searchTerm, roleFilter, statusFilter]);

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      teacher: { bg: "bg-blue-100", text: "text-blue-800", label: "Teacher" },
      parent: { bg: "bg-purple-100", text: "text-purple-800", label: "Parent" },
      admin: { bg: "bg-red-100", text: "text-red-800", label: "Admin" },
    };

    const config = roleConfig[role as keyof typeof roleConfig] || {
      bg: "bg-neutral-100",
      text: "text-neutral-800",
      label: role,
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p className="text-muted-foreground">Loading teachers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-50 to-neutral-100">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">All Teachers</h1>
          <p className="text-muted-foreground">
            Manage all teachers across the platform
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <HugeiconsIcon
                  icon={Search01Icon}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  size={20}
                />
                <Input
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-45">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="teacher">Teachers</SelectItem>
                  <SelectItem value="parent">Parents</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-45">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={UserMultiple02Icon} size={24} />
              Teachers ({filteredUsers?.length})
            </CardTitle>
            <CardDescription>
              {roleFilter !== "all" && `Filtered by ${roleFilter} role`}
              {statusFilter !== "all" && ` · ${statusFilter}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredUsers?.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-16 w-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-4">
                  <HugeiconsIcon
                    icon={UserIcon}
                    className="text-neutral-400"
                    size={32}
                  />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  No teachers found
                </h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredUsers?.map((teacher) => (
                  <Card key={teacher.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <img
                            className="h-12 w-12 rounded-full"
                            src={teacher.profile_picture}
                            alt="Profile"
                          />

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">
                                {teacher.first_name} {teacher.last_name}
                              </h3>
                              {getRoleBadge(teacher.role)}
                              {teacher.is_active && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <HugeiconsIcon
                                    icon={CheckmarkCircle01Icon}
                                    size={12}
                                    className="mr-1"
                                  />
                                  Active
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <HugeiconsIcon icon={Mail01Icon} size={14} />
                                {teacher.email}
                              </span>
                              <span className="flex items-center gap-1">
                                <HugeiconsIcon
                                  icon={Calendar03Icon}
                                  size={14}
                                />
                                Joined{" "}
                                {new Date(
                                  teacher.created_at
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
