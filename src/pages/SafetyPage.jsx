import SafetyFeatures from '../components/SafetyFeatures';
import SOSButton from '../components/SOSButton';

export default function SafetyPage() {
  return (
    <main style={{ minHeight: '100vh', paddingTop: '2rem', background: '#000' }}>
      <SafetyFeatures />
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem 5rem' }}>
        <SOSButton />
      </div>
    </main>
  );
}
