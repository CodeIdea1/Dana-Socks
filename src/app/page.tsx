// app/page.tsx
import HeroSection from '../components/HeroSection';
import ProductsPage from './products/page';
import styles from './page.module.css';
import Features from '@/components/Features';

export default function Home() {
  return (
    <div className={styles.container}>
      <HeroSection />
      <Features />
      <ProductsPage />

      {/* يمكنك إضافة أقسام أخرى هنا */}
      <div className={styles.additionalContent}>
        {/* محتوى إضافي إذا لزم الأمر */}
      </div>
    </div>
  );
}