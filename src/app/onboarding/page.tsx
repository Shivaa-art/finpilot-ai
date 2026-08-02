import { AuthShell } from "@/features/auth/components/auth-shell";
import { OnboardingForm } from "@/features/onboarding/components/onboarding-form";

export default function OnboardingPage() {
  return (
    <AuthShell title="Tell us about your business" subtitle="This takes about a minute and shapes every recommendation you'll see.">
      <OnboardingForm />
    </AuthShell>
  );
}
