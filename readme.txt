Health Check
GET
/health
تأكد إن السيرفر شغال
Users
POST
/api/users/register
تسجيل مستخدم جديد
Body — JSON
{ "name": "Ahmed Ali", "email": "ahmed@test.com", "password": "123456", "phone": "01012345678" }
POST
/api/users/login
تسجيل دخول ← احفظ الـ token!
Body — JSON
{ "email": "admin@loha.com", "password": "0100admin" }
ابدأ بيه — الـ token اللي بيرجع استخدمه في كل الـ requests التانية
GET
/api/users/me
 Auth
بيانات المستخدم الحالي
GET
/api/users
 Admin
كل المستخدمين
DEL
/api/users/:id
 Admin
حذف مستخدم
PUT
/api/users/:id
 Admin
تعديل مستخدم
Body — JSON
{ "name": "Ahmed New", "phone": "01099999999" }
PATCH
/api/users/:id/role
 Admin
تغيير role المستخدم
Body — JSON
{ "role": "admin" }
Products
GET
/api/products
كل المنتجات (يمكن فلتر: ?category=oil)
GET
/api/products/:id
منتج واحد
POST
/api/products
 Admin
إضافة منتج + صورة
Body — form-data
name        → لوحة زيتية
category    → oil
description → وصف المنتج
price       → 500
sizes       → ["30x40","50x60"]
stock       → 10
isBestseller→ false
image       → [اختار صورة]
PUT
/api/products/:id
 Admin
تعديل منتج
Body — form-data (فقط اللي هتغيره)
price → 600
stock → 5
DEL
/api/products/:id
 Admin
حذف منتج
Orders
POST
/api/orders
 Auth
إنشاء طلب
Body — JSON
{
  "total": 500,
  "items": [
    {
      "productId": 1,
      "quantity": 1,
      "price": 500,
      "size": "30x40"
    }
  ]
}
GET
/api/orders/my-orders
 Auth
طلباتي
GET
/api/orders
 Admin
كل الطلبات
PUT
/api/orders/:id/status
 Admin
تحديث حالة الطلب
Body — JSON
{ "status": "shipped" }
القيم المتاحة
pending | paid | processing | shipped | delivered | cancelled
Custom Orders
POST
/api/custom-orders
 Auth
طلب مخصوص + صورة مطلوبة
Body — form-data
size        → 50x70
message     → عاوز لوحة بورتريه
designImage → [اختار صورة] ← مطلوب!
GET
/api/custom-orders/my-orders
 Auth
طلباتي المخصوصة
GET
/api/custom-orders
 Admin
كل الطلبات المخصوصة
PUT
/api/custom-orders/:id/status
 Admin
تحديث حالة الطلب المخصوص
Body — JSON
{ "status": "approved" }
القيم المتاحة
pending | approved | rejected | completed
