import HeroSection from '@/components/HeroSection';
import AvailabilityCheck from '@/components/AvailabilityCheck';
import WhyChooseUs from '@/components/WhyChooseUs';
import HowItWorks from '@/components/HowItWorks';

export default function Home() {
  return (
    <>
        <HeroSection />
        <AvailabilityCheck />
        <HowItWorks />
        <WhyChooseUs />
    </>
  );
}
