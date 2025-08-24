// utils/firebaseHelpers.ts
import { Product } from '@/contexts/CartContext';

export interface FirebaseProductData {
    name?: string;
    description?: string;
    price?: number | string;
    stock?: number | string;
    category?: string;
    imageUrl?: string;
    image?: string; // الحقل القديم
    additionalImages?: string[] | { [key: string]: string } | any;
    createdAt?: string | any;
}

// تعريف نوع المنتج الموسع
export interface ExtendedProduct extends Product {
    additionalImages: string[];
    createdAt?: string;
}

/**
 * تحويل بيانات المنتج من Firebase إلى النوع المطلوب
 */
export function convertFirebaseProductData(
    id: string, 
    data: FirebaseProductData
): ExtendedProduct {
    // معالجة الصور الإضافية
    const additionalImages = processAdditionalImages(data.additionalImages);
    
    return {
        id,
        name: data.name || 'غير محدد',
        description: data.description || '',
        price: Number(data.price) || 0,
        stock: Number(data.stock) || 0,
        category: data.category || 'غير مصنف',
        imageUrl: data.imageUrl || data.image || '',
        additionalImages,
        createdAt: data.createdAt || ''
    };
}

/**
 * معالجة الصور الإضافية من Firebase
 */
export function processAdditionalImages(
    additionalImages: string[] | { [key: string]: string } | any
): string[] {
    if (!additionalImages) {
        return [];
    }

    // إذا كان Array
    if (Array.isArray(additionalImages)) {
        return additionalImages.filter((img): img is string => 
            typeof img === 'string' && img.trim() !== ''
        );
    }

    // إذا كان Object
    if (typeof additionalImages === 'object') {
        const values = Object.values(additionalImages);
        return values.filter((img): img is string => 
            typeof img === 'string' && img.trim() !== ''
        );
    }

    return [];
}

/**
 * الحصول على جميع صور المنتج (الرئيسية + الإضافية)
 */
export function getProductImages(product: Product & { additionalImages?: string[] }): string[] {
    const images: string[] = [];
    
    // إضافة الصورة الرئيسية
    if (product.imageUrl && product.imageUrl.trim() !== '') {
        images.push(product.imageUrl);
    }
    
    // إضافة الصور الإضافية
    if (product.additionalImages && Array.isArray(product.additionalImages)) {
        const validImages = product.additionalImages.filter(img => 
            img && typeof img === 'string' && img.trim() !== ''
        );
        images.push(...validImages);
    }
    
    // إذا لم توجد صور إضافية، أضف الصورة الرئيسية للعرض
    if (images.length === 1 && product.imageUrl) {
        // إضافة نسخ من الصورة الرئيسية للعرض في المعرض
        images.push(product.imageUrl, product.imageUrl);
    }
    
    // إذا لم توجد أي صور، أضف صورة افتراضية
    if (images.length === 0) {
        images.push('/placeholder.png');
    }
    
    return images;
}

/**
 * التحقق من صحة رابط الصورة
 */
export function validateImageUrl(url: string | undefined): string {
    if (!url || url.trim() === '') {
        return '/placeholder.png';
    }

    const cleanUrl = url.trim();

    try {
        new URL(cleanUrl);
        return cleanUrl;
    } catch {
        console.warn('Invalid image URL:', url);
        return '/placeholder.png';
    }
}

/**
 * معالج أخطاء تحميل الصورة
 */
export function handleImageError(
    e: React.SyntheticEvent<HTMLImageElement>,
    fallbackUrl = '/placeholder.png'
): void {
    const target = e.target as HTMLImageElement;
    
    if (target.src !== fallbackUrl) {
        target.src = fallbackUrl;
    } else {
        // إذا فشلت الصورة الاحتياطية أيضاً، إخفاء الصورة
        target.style.display = 'none';
        console.error('Fallback image also failed to load');
    }
}

/**
 * معالج تحميل الصورة بنجاح
 */
export function handleImageLoad(e: React.SyntheticEvent<HTMLImageElement>): void {
    const target = e.target as HTMLImageElement;
    target.style.opacity = '1';
}