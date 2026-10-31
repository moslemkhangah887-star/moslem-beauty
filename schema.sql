-- MOSLEM BEAUTY - Supabase schema
-- Run this whole file in Supabase Dashboard > SQL Editor.
-- IMPORTANT: create the owner Auth user manually first (see README), then add its UUID below.

create extension if not exists pgcrypto;

create table if not exists public.store_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 180),
  description text not null default '',
  category text not null check (category in (
    'محصولات پوستی','محصولات آرایشی','ضدآفتاب','شوینده و پاک‌کننده',
    'کرم و محصولات ترمیمی','عطر و ادکلن','رژ لب و برق لب','کرم پودر'
  )),
  price bigint not null check (price >= 0),
  sale_price bigint null check (sale_price is null or sale_price >= 0),
  stock integer not null default 0 check (stock >= 0),
  image_url text null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_active_created_idx on public.products(active, created_at desc);
create index if not exists products_category_idx on public.products(category);

create or replace function public.is_store_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.store_admins
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_store_admin() from public;
grant execute on function public.is_store_admin() to anon, authenticated;

alter table public.store_admins enable row level security;
alter table public.products enable row level security;

drop policy if exists "Admins can read own admin row" on public.store_admins;
create policy "Admins can read own admin row" on public.store_admins
for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products" on public.products
for select to anon, authenticated using (active = true or public.is_store_admin());

drop policy if exists "Only store admins can insert products" on public.products;
create policy "Only store admins can insert products" on public.products
for insert to authenticated with check (public.is_store_admin());

drop policy if exists "Only store admins can update products" on public.products;
create policy "Only store admins can update products" on public.products
for update to authenticated using (public.is_store_admin()) with check (public.is_store_admin());

drop policy if exists "Only store admins can delete products" on public.products;
create policy "Only store admins can delete products" on public.products
for delete to authenticated using (public.is_store_admin());

-- Public image URLs are readable; upload/update/delete are owner-only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images','product-images',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg','image/png','image/webp'];

drop policy if exists "Public can view product images" on storage.objects;
create policy "Public can view product images" on storage.objects
for select to anon, authenticated using (bucket_id = 'product-images');

drop policy if exists "Only store admins can upload product images" on storage.objects;
create policy "Only store admins can upload product images" on storage.objects
for insert to authenticated with check (bucket_id = 'product-images' and public.is_store_admin());

drop policy if exists "Only store admins can update product images" on storage.objects;
create policy "Only store admins can update product images" on storage.objects
for update to authenticated using (bucket_id = 'product-images' and public.is_store_admin())
with check (bucket_id = 'product-images' and public.is_store_admin());

drop policy if exists "Only store admins can delete product images" on storage.objects;
create policy "Only store admins can delete product images" on storage.objects
for delete to authenticated using (bucket_id = 'product-images' and public.is_store_admin());

-- Initial products. Safe to run once; avoid duplicate seed records by name.
insert into public.products (name, description, category, price, stock, active)
select v.name, v.description, 'محصولات پوستی', 1650000, v.stock, true
from (values
 ('Booster Shot سبز','محصول مراقبت پوستی. برای اطلاعات تکمیلی با فروشگاه تماس بگیرید.',170),
 ('Booster Shot صورتی TXA','محصول مراقبت پوستی. برای اطلاعات تکمیلی با فروشگاه تماس بگیرید.',50),
 ('Booster Shot صورتی روشن PDRN','محصول مراقبت پوستی. برای اطلاعات تکمیلی با فروشگاه تماس بگیرید.',50),
 ('Booster Shot سفید Glycolic Acid','محصول مراقبت پوستی. برای اطلاعات تکمیلی با فروشگاه تماس بگیرید.',50),
 ('Booster Shot بنفش NAD','محصول مراقبت پوستی. برای اطلاعات تکمیلی با فروشگاه تماس بگیرید.',50)
) as v(name,description,stock)
where not exists (select 1 from public.products p where p.name = v.name);
