import { PasswordResetForm, PasswordResetCard, AuthLayout } from "@/components/auth";

export function PasswordResetPage() {
  return (
    <AuthLayout>
      <PasswordResetCard>
        <PasswordResetForm />
      </PasswordResetCard>
    </AuthLayout>
  );
}
