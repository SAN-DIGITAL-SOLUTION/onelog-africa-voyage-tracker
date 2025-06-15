import LandingHeader from "../sections/LandingHeader";
import LandingHero from "../sections/LandingHero";
import LandingFeatures from "../sections/LandingFeatures";
import LandingAfrica from "../sections/LandingAfrica";
import LandingFooter from "../sections/LandingFooter";
import LandingWhy from "../sections/LandingWhy";
import LandingKeyFeatures from "../sections/LandingKeyFeatures";
import LandingMadeInAfrica from "../sections/LandingMadeInAfrica";
import LandingTestimonials from "../sections/LandingTestimonials";
import LandingCTA from "../sections/LandingCTA";

export default function Landing() {
  return (
    <div className="relative min-h-screen flex flex-col bg-background dark:bg-dm-bg transition-colors">
      <LandingHeader />
      <main className="flex flex-col flex-1">
        <LandingHero />
        <LandingWhy />
        <LandingKeyFeatures />
        <LandingMadeInAfrica />
        <LandingTestimonials />
        <LandingCTA />
        <LandingFeatures />
        <LandingAfrica />
      </main>
      <LandingFooter />
    </div>
  );
}
