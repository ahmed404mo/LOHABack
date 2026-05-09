-- CreateTable
CREATE TABLE "Setting" (
    "id" SERIAL NOT NULL,
    "siteName" TEXT NOT NULL DEFAULT 'LOHA',
    "siteDescription" TEXT NOT NULL DEFAULT 'لوحات فنية حصرية مصنوعة بالكامل باليد، تحمل روح الخط العربي والألوان الفاخرة',
    "siteLogo" TEXT NOT NULL DEFAULT '',
    "contactEmail" TEXT NOT NULL DEFAULT 'saraabdullwhab606@gmail.com',
    "contactPhone" TEXT NOT NULL DEFAULT '01006230353',
    "whatsappNumber" TEXT NOT NULL DEFAULT '201006230353',
    "facebookUrl" TEXT NOT NULL DEFAULT 'https://facebook.com/loha',
    "instagramUrl" TEXT NOT NULL DEFAULT 'https://instagram.com/loha_art',
    "tiktokUrl" TEXT NOT NULL DEFAULT 'https://tiktok.com/@loha_art',
    "address" TEXT NOT NULL DEFAULT 'القاهرة، مصر',
    "shippingFee" INTEGER NOT NULL DEFAULT 50,
    "freeShippingMin" INTEGER NOT NULL DEFAULT 500,
    "returnPolicy" TEXT NOT NULL DEFAULT 'يمكن استبدال المنتج خلال 30 يوم من تاريخ الشراء بشرط أن يكون بحالة جديدة',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);
