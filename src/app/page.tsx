// app/page.tsx
import HeroSection from '../components/HeroSection';
import ProductsPage from './products/page';
import styles from './page.module.css';
import Features from '@/components/Features';
import About from '@/components/About';
import SockShowcase from '@/components/SockShowcase';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className={styles.container}>
      <HeroSection />
      <Features />
      <ProductsPage />
      <About />
      <SockShowcase />
      <Footer />
    </div>
  );
}