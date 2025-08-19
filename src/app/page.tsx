// app/page.tsx
import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.title}>مرحباً بك في متجر الشرابات</h1>
        <p className={styles.description}>
          اكتشف مجموعتنا الواسعة من الشرابات عالية الجودة والمريحة
        </p>
        <Link href="/products" className={styles.cta}>
          تسوق الآن
        </Link>
      </div>

      <div className={styles.features}>
        <div className={styles.feature}>
          <h3>جودة عالية</h3>
          <p>شرابات مصنوعة من أفضل المواد</p>
        </div>
        <div className={styles.feature}>
          <h3>تشكيلة واسعة</h3>
          <p>أنواع وألوان مختلفة لكل الأذواق</p>
        </div>
        <div className={styles.feature}>
          <h3>أسعار مناسبة</h3>
          <p>أفضل الأسعار في السوق</p>
        </div>
      </div>
    </div>
  );
}