import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen flex-col pt-16" style={{ background: '#000000' }}>
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
  );
}
