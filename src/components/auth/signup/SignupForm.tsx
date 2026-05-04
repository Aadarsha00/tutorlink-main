import * as React from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Mail01Icon,
  LockPasswordIcon,
  EyeIcon,
  UserIcon,
  UserAdd01Icon,
  EyeOff,
  LoaderCircle,
} from "@hugeicons/core-free-icons";
import api from "@/services/api";

interface SignupFormProps {
  onSuccess?: (email: string) => void;
}

export function SignupForm({ onSuccess }: SignupFormProps) {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get("role");
  const defaultRole =
    initialRole === "teacher" || initialRole === "parent" ? initialRole : "";
  const [formData, setFormData] = React.useState<{
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    re_password: string;
    role: "teacher" | "parent" | "";
  }>({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    re_password: "",
    role: defaultRole,
  });
  const [showPassword, setShowPassword] = React.useState(false);
  const [showRePassword, setShowRePassword] = React.useState(false);
  const [passwordsMatch, setPasswordsMatch] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  React.useEffect(() => {
    setPasswordsMatch(formData.password === formData.re_password);
  }, [formData.password, formData.re_password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.role) {
      setError("Please select a role");
      setLoading(false);
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const registrationData = {
        email: formData.email,
        password: formData.password,
        re_password: formData.re_password,
        role: formData.role as "teacher" | "parent",
        first_name: formData.first_name,
        last_name: formData.last_name,
      };

      await api.auth.register(registrationData);
      onSuccess?.(formData.email);
    } catch (err: any) {
      let errorMessage = "Registration failed. Please try again.";

      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === "string") {
          errorMessage = data;
        } else if (data.email) {
          errorMessage = Array.isArray(data.email) ? data.email[0] : data.email;
        } else if (data.password) {
          errorMessage = Array.isArray(data.password)
            ? data.password[0]
            : data.password;
        } else if (data.role) {
          errorMessage = Array.isArray(data.role) ? data.role[0] : data.role;
        } else if (data.detail) {
          errorMessage = data.detail;
        } else if (data.non_field_errors) {
          errorMessage = Array.isArray(data.non_field_errors)
            ? data.non_field_errors[0]
            : data.non_field_errors;
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="register-first-name">First Name</FieldLabel>
            <div className="relative">
              <HugeiconsIcon
                icon={UserIcon}
                strokeWidth={2}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={20}
              />
              <Input
                id="register-first-name"
                type="text"
                placeholder="John"
                value={formData.first_name}
                onChange={(e) => handleChange("first_name", e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </Field>

          <Field>
            <FieldLabel htmlFor="register-last-name">Last Name</FieldLabel>
            <div className="relative">
              <HugeiconsIcon
                icon={UserIcon}
                strokeWidth={2}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={20}
              />
              <Input
                id="register-last-name"
                type="text"
                placeholder="Doe"
                value={formData.last_name}
                onChange={(e) => handleChange("last_name", e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="register-email">Email</FieldLabel>
          <div className="relative">
            <HugeiconsIcon
              icon={Mail01Icon}
              strokeWidth={2}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={20}
            />
            <Input
              id="register-email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </Field>

        <Field>
          <FieldLabel htmlFor="register-password">Password</FieldLabel>
          <div className="relative">
            <HugeiconsIcon
              icon={LockPasswordIcon}
              strokeWidth={2}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={20}
            />
            <Input
              id="register-password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className="pl-10 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <HugeiconsIcon icon={EyeOff} strokeWidth={2} size={20} />
              ) : (
                <HugeiconsIcon icon={EyeIcon} strokeWidth={2} size={20} />
              )}
            </button>
          </div>
        </Field>

        <Field>
          <FieldLabel htmlFor="register-re-password">
            Confirm Password
          </FieldLabel>
          <div className="relative">
            <HugeiconsIcon
              icon={LockPasswordIcon}
              strokeWidth={2}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={20}
            />
            <Input
              id="register-re-password"
              type={showRePassword ? "text" : "password"}
              placeholder="••••••••"
              value={formData.re_password}
              onChange={(e) => handleChange("re_password", e.target.value)}
              className="pl-10 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowRePassword(!showRePassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showRePassword ? (
                <HugeiconsIcon icon={EyeOff} strokeWidth={2} size={20} />
              ) : (
                <HugeiconsIcon icon={EyeIcon} strokeWidth={2} size={20} />
              )}
            </button>
          </div>
          {formData.re_password && !passwordsMatch && (
            <p className="text-sm text-destructive mt-1">
              Passwords do not match
            </p>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="register-role">I am a</FieldLabel>
          <Select
            value={formData.role}
            onValueChange={(value) => handleChange("role", value)}
            required
          >
            <SelectTrigger id="register-role">
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="parent">Parent</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Field orientation="horizontal" className="gap-3">
          <Button
            type="submit"
            className="flex-1"
            disabled={loading || !passwordsMatch}
          >
            {loading ? (
              <>
                <span className="animate-spin">
                  <HugeiconsIcon
                    icon={LoaderCircle}
                    strokeWidth={2}
                    size={20}
                  />
                </span>
                Creating account...
              </>
            ) : (
              <>
                <HugeiconsIcon
                  icon={UserAdd01Icon}
                  strokeWidth={2}
                  data-icon="inline-start"
                />
                Create Account
              </>
            )}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
