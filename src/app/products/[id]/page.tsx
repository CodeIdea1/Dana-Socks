// app/products/[id]/page.tsx
import { Suspense } from 'react';
import ProductDetailsClient from '@/components/ProductDetailsClient';

interface ProductPageProps {
    params: {
        id: string;
    };
}

// مكون التحميل
function ProductLoading() {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '50vh',
            flexDirection: 'column',
            gap: '20px'
        }}>
            <div style={{
                width: '50px',
                height: '50px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #007bff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
            }}></div>
            <p>جاري تحميل تفاصيل المنتج...</p>
        </div>
    );
}

export default function ProductPage({ params }: ProductPageProps) {
    return (
        <main>
            <Suspense fallback={<ProductLoading />}>
                <ProductDetailsClient productId={params.id} />
            </Suspense>
        </main>
    );
}

// إضافة metadata للصفحة
export async function generateMetadata({ params }: ProductPageProps) {
    return {
        title: `تفاصيل المنتج - ${params.id}`,
        description: 'عرض تفاصيل المنتج مع الصور والأسعار والمواصفات'
    };
}