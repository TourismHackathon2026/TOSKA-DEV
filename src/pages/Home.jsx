import HeroSection from '../components/HeroSection';
import StatsBar from '../components/StatsBar';
import FeaturedTreks from '../components/FeaturedTreks';
import LiveDashboard from '../components/LiveDashboard';
import WeatherPanel from '../components/WeatherPanel';
import SafetyFeatures from '../components/SafetyFeatures';
import CTASection from '../components/CTASection';

export default function Home() {
  return (
    <>
      <HeroSection />
      <StatsBar />
      <FeaturedTreks />
      <LiveDashboard />
      <SafetyFeatures />
      <WeatherPanel />
      <CTASection />
    </>
  );
}
