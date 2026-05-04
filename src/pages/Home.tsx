
import { useEffect, useState } from "react";
import Footer from "../components/Home/Footer";
import HeroSection from "../components/Home/Hero";
import Navbar from "../components/Home/Navbar";
import StudentTestimonialsSection from "../components/Home/Testimonial";
import PremiumTutorsShowcase from "../components/Home/Tutors";
import PerfectTutorSection from "../components/Home/PerfectTutor";
import CTASection from "../components/Home/CTA";
import api, { type LandingData } from "@/services/api";

export const Home: React.FC = () => {
  const [landingData, setLandingData] = useState<LandingData | null>(null);
  const [loadingLanding, setLoadingLanding] = useState(true);

  useEffect(() => {
    let active = true;

    api.public
      .landing()
      .then((data) => {
        if (active) setLandingData(data);
      })
      .catch((error) => {
        console.error("Failed to load landing data", error);
      })
      .finally(() => {
        if (active) setLoadingLanding(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <Navbar />
      <HeroSection
        stats={landingData?.stats}
        tutors={landingData?.hero_tutors || landingData?.featured_tutors}
      />
      <PerfectTutorSection/>
      <PremiumTutorsShowcase
        tutors={landingData?.featured_tutors}
        loading={loadingLanding}
      />
      <StudentTestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
};
