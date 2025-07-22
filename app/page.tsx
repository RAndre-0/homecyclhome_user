import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import AvailabilityCheck from '@/components/AvailabilityCheck';
import WhyChooseUs from '@/components/WhyChooseUs';
import Footer from '@/components/Footer';
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
