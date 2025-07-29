import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import BenefitsSection from "@/components/BenefitsSection";
import CategoriesSection from "@/components/CategoriesSection";
import StorySection from "@/components/StorySection";
import PracticeSection from "@/components/PracticeSection";
import CommunitySection from "@/components/CommunitySection";
import HowItWorksSection from "@/components/HowItWorksSection";
import FinalCTASection from "@/components/FinalCTASection";
import Footer from "@/components/Footer";

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <HeroSection />
        <BenefitsSection />
        <div id="categories">
          <CategoriesSection />
        </div>
        <StorySection />
        <div id="practice">
          <PracticeSection />
        </div>
        <div id="community">
          <CommunitySection />
        </div>
        <div id="how-it-works">
          <HowItWorksSection />
        </div>
        <FinalCTASection />
      </main>
      <Footer />
    </div>);

};

export default LandingPage;