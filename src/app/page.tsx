import { Navbar } from "@/features/landing/components/navbar";
import { Hero } from "@/features/landing/components/hero";
import { TrustedStats } from "@/features/landing/components/trusted-stats";
import { DashboardPreview } from "@/features/landing/components/dashboard-preview";
import { Features } from "@/features/landing/components/features";
import { HowItWorks } from "@/features/landing/components/how-it-works";
import { Testimonials } from "@/features/landing/components/testimonials";
import { Pricing } from "@/features/landing/components/pricing";
import { FAQ } from "@/features/landing/components/faq";
import { Footer } from "@/features/landing/components/footer";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <TrustedStats />
        <DashboardPreview />
        <Features />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
