import {
  AuthLayout,
  PasswordResetConfirmCard,
  PasswordResetConfirmForm,
} from "@/components/auth";

export function PasswordResetConfirmPage() {
  return (
    <AuthLayout>
      <PasswordResetConfirmCard>
        <PasswordResetConfirmForm />
      </PasswordResetConfirmCard>
    </AuthLayout>
  );
}
