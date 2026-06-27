import Navbar from './Navbar';
import Footer from './Footer';
import NotificationBanner from './NotificationBanner';

export default function Layout({ children }) {
  return (
    <div className="app-shell flex min-h-screen flex-col">
      <Navbar />
      <NotificationBanner />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
