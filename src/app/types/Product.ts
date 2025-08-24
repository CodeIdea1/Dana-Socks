// types/Product.ts
// تحديث نوع Product لإضافة الصور الإضافية

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    imageUrl: string;
    createdAt: string;
    // إضافة الصور الإضافية
    additionalImages?: string[];
}

// أو يمكن تحديث CartContext إذا كان Product معرف هناك
export interface ProductWithAdditionalImages extends Product {
    additionalImages: string[];
}

// دالة مساعدة لمعالجة الصور
export const getProductImages = (product: Product): string[] => {
    const images: string[] = [];
    
    // إضافة الصورة الرئيسية
    if (product.imageUrl) {
        images.push(product.imageUrl);
    }
    
    // إضافة الصور الإضافية إذا كانت متوفرة
    if ('additionalImages' in product && Array.isArray((product as any).additionalImages)) {
        const additionalImages = (product as any).additionalImages as string[];
        images.push(...additionalImages.filter(img => img && img.trim() !== ''));
    } else {
        // إضافة صور افتراضية للعرض (يمكن تخصيصها حسب الحاجة)
        if (product.imageUrl) {
            images.push(product.imageUrl, product.imageUrl);
        }
    }
    
    return images.filter(img => img && img.trim() !== '');
};

// دالة للتحقق من صحة رابط الصورة
export const validateImageUrl = (url: string | undefined): string => {
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
};