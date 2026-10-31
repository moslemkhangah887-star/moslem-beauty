# مسلم بیوتی | MOSLEM BEAUTY

## ساختار صحیح پروژه
`index.html` و `package.json` و پوشه `src` همگی در ریشه همین پوشه هستند.

## راه‌اندازی
1. همه محتویات این پوشه را در ریشه مخزن GitHub بارگذاری کنید؛ خود پوشه `moslem-beauty-store` را به‌عنوان یک پوشه تودرتو بارگذاری نکنید.
2. در Netlify مقدار Build command را `npm run build` و Publish directory را `dist` قرار دهید.
3. متغیرهای محیطی `VITE_SUPABASE_URL` و `VITE_SUPABASE_ANON_KEY` را در Netlify وارد کنید.
4. فایل `supabase/schema.sql` را در SQL Editor پروژه Supabase اجرا کنید.
5. برای مدیریت، کاربر مدیر باید در Supabase ساخته شده باشد و مقدار `store_admin=true` در app_metadata او قرار گیرد.

کلیدهای محرمانه یا service_role را هرگز در متغیرهای VITE قرار ندهید.
