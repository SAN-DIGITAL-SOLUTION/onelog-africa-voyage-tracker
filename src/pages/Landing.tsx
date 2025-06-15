
import LandingHeader from "../sections/LandingHeader";
import LandingHero from "../sections/LandingHero";
import LandingFeatures from "../sections/LandingFeatures";
import LandingAfrica from "../sections/LandingAfrica";
import LandingFooter from "../sections/LandingFooter";

export default function Landing() {
  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-[#171C2E] via-[#222748] to-[#253d59] dark:from-[#171C2E] dark:via-[#222748] dark:to-[#253d59] transition-colors">
      <LandingHeader />
      <main className="flex flex-col flex-1">
        <LandingHero />
        <LandingFeatures />
        <LandingAfrica />
      </main>
      <LandingFooter />
    </div>
  );
}
