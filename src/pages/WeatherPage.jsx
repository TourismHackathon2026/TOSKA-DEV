import WeatherPanel from '../components/WeatherPanel';

export default function WeatherPage() {
  return (
    <main style={{ minHeight: '100vh', paddingTop: '2rem', background: '#000' }}>
      <WeatherPanel />
    </main>
  );
}
