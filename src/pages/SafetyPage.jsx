import SafetyFeatures from '../components/SafetyFeatures';
import SOSButton from '../components/SOSButton';

export default function SafetyPage() {
  return (
    <main className="min-h-screen pt-8">
      <SafetyFeatures />
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-20">
        <SOSButton />
      </div>
    </main>
  );
}
