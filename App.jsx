import React, { useEffect, useMemo, useState } from 'react';
import { supabase, isConfigured } from './supabase';
import { Search, ShoppingBag, Instagram, MapPin, Phone, ShieldCheck, Truck, Menu, X, SlidersHorizontal, Plus, Pencil, Trash2, LogOut, Upload, Package, Eye, EyeOff, ChevronLeft, Sparkles } from 'lucide-react';

const PHONE = '989915909891';
const WA = 'https://wa.me/' + PHONE;
const INSTAGRAM = 'https://instagram.com/Moslem_beauty2';
const CATEGORIES = ['همه محصولات','محصولات پوستی','محصولات آرایشی','ضدآفتاب','شوینده و پاک‌کننده','کرم و محصولات ترمیمی','عطر و ادکلن','رژ لب و برق لب','کرم پودر'];
const money = n => new Intl.NumberFormat('fa-IR').format(Number(n || 0)) + ' تومان';
const orderLink = p => WA + '?text=' + encodeURIComponent(`سلام، برای سفارش محصول زیر راهنمایی می‌خواستم:\n${p.name}\nقیمت: ${money(p.sale_price || p.price)}\nلطفاً موجودی و شرایط ارسال را اعلام کنید.`);
const demoProducts = [
  {id:'demo-1',name:'Booster Shot سبز',description:'محصول مراقبت پوستی؛ برای اطلاعات تکمیلی با ما در واتساپ در ارتباط باشید.',category:'محصولات پوستی',price:1650000,sale_price:null,stock:170,image_url:null,active:true,created_at:'2026-01-01'},
  {id:'demo-2',name:'Booster Shot صورتی TXA',description:'محصول مراقبت پوستی؛ برای اطلاعات تکمیلی با ما در واتساپ در ارتباط باشید.',category:'محصولات پوستی',price:1650000,sale_price:null,stock:50,image_url:null,active:true,created_at:'2026-01-02'},
  {id:'demo-3',name:'Booster Shot صورتی روشن PDRN',description:'محصول مراقبت پوستی؛ برای اطلاعات تکمیلی با ما در واتساپ در ارتباط باشید.',category:'محصولات پوستی',price:1650000,sale_price:null,stock:50,image_url:null,active:true,created_at:'2026-01-03'},
  {id:'demo-4',name:'Booster Shot سفید Glycolic Acid',description:'محصول مراقبت پوستی؛ برای اطلاعات تکمیلی با ما در واتساپ در ارتباط باشید.',category:'محصولات پوستی',price:1650000,sale_price:null,stock:50,image_url:null,active:true,created_at:'2026-01-04'},
  {id:'demo-5',name:'Booster Shot بنفش NAD',description:'محصول مراقبت پوستی؛ برای اطلاعات تکمیلی با ما در واتساپ در ارتباط باشید.',category:'محصولات پوستی',price:1650000,sale_price:null,stock:50,image_url:null,active:true,created_at:'2026-01-05'}
];

function ProductCard({p}) {
  const [expanded,setExpanded] = useState(false);
  const discounted = p.sale_price && Number(p.sale_price) > 0 && Number(p.sale_price) < Number(p.price);
  return <article className="product-card">
    <div className="product-photo">
      {p.image_url ? <img src={p.image_url} alt={p.name} loading="lazy"/> : <div className="photo-placeholder"><Sparkles size={30}/><span>MOSLEM BEAUTY</span><small>تصویر محصول</small></div>}
      {discounted && <span className="discount-tag">پیشنهاد ویژه</span>}
      {Number(p.stock) <= 0 && <span className="stock-tag">ناموجود</span>}
    </div>
    <div className="product-info">
      <span className="product-category">{p.category}</span>
      <h3>{p.name}</h3>
      {expanded && <p className="description">{p.description}</p>}
      <button className="text-toggle" onClick={()=>setExpanded(!expanded)}>{expanded?'بستن توضیحات':'توضیحات محصول'}</button>
      <div className="price-line">
        <div>{discounted && <del>{money(p.price)}</del>}<strong>{money(discounted?p.sale_price:p.price)}</strong></div>
        <span className={Number(p.stock)>0?'available':'unavailable'}>{Number(p.stock)>0?`موجودی: ${new Intl.NumberFormat('fa-IR').format(p.stock)} عدد`:'اتمام موجودی'}</span>
      </div>
      <a className={`order-btn ${Number(p.stock)<=0?'disabled':''}`} href={Number(p.stock)>0?orderLink(p):undefined} target="_blank" rel="noreferrer" aria-disabled={Number(p.stock)<=0}>
        <ShoppingBag size={17}/> سفارش از واتساپ
      </a>
    </div>
  </article>;
}

function Admin({onClose,onChanged}) {
  const [session,setSession] = useState(null);
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [error,setError] = useState('');
  const [products,setProducts] = useState([]);
  const [query,setQuery] = useState('');
  const [editing,setEditing] = useState(null);
  const [busy,setBusy] = useState(false);

  useEffect(()=>{ supabase.auth.getSession().then(({data})=>setSession(data.session)); const {data:{subscription}}=supabase.auth.onAuthStateChange((_e,s)=>setSession(s)); return ()=>subscription.unsubscribe(); },[]);
  useEffect(()=>{ if(session) load(); },[session]);
  async function load(){ const {data,error}=await supabase.from('products').select('*').order('created_at',{ascending:false}); if(error)setError(error.message); else setProducts(data||[]); }
  async function login(e){e.preventDefault();setError('');setBusy(true);const {data,error}=await supabase.auth.signInWithPassword({email,password});setBusy(false);if(error)setError('ورود ناموفق بود. ایمیل و رمز عبور را بررسی کنید.');else setSession(data.session);}
  async function logout(){await supabase.auth.signOut();setSession(null);}
  async function remove(p){if(!confirm(`محصول «${p.name}» حذف شود؟`))return;const {error}=await supabase.from('products').delete().eq('id',p.id);if(error)setError(error.message);else{await load();onChanged();}}
  const filtered=products.filter(p=>p.name.toLowerCase().includes(query.toLowerCase()));
  if(!isConfigured)return <div className="admin-overlay"><div className="admin-panel"><button className="close-btn" onClick={onClose}><X/></button><h2>پنل مدیریت</h2><p>ابتدا اطلاعات Supabase را در فایل <code>.env</code> تنظیم کنید.</p></div></div>;
  if(!session)return <div className="admin-overlay"><div className="login-card"><button className="close-btn" onClick={onClose}><X/></button><div className="mini-logo">MB</div><p className="eyebrow">MOSLEM BEAUTY</p><h2>ورود مدیریت</h2><p className="muted">این بخش فقط برای مالک فروشگاه است.</p><form onSubmit={login}><label>ایمیل مدیر</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoComplete="username"/><label>رمز عبور</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required autoComplete="current-password"/>{error&&<p className="error">{error}</p>}<button className="gold-btn full" disabled={busy}>{busy?'در حال ورود...':'ورود امن'}</button></form></div></div>;
  return <div className="admin-overlay"><div className="admin-panel">
    <header className="admin-header"><div><span className="eyebrow">MOSLEM BEAUTY</span><h2>مدیریت فروشگاه</h2></div><div className="admin-actions"><button className="outline-btn" onClick={logout}><LogOut size={16}/> خروج</button><button className="close-btn inline-close" onClick={onClose}><X/></button></div></header>
    <ProductEditor product={editing} onCancel={()=>setEditing(null)} onSaved={async()=>{setEditing(null);await load();onChanged();}} setError={setError}/>
    {error&&<p className="error">{error}</p>}
    <div className="admin-list-head"><h3>محصولات ({new Intl.NumberFormat('fa-IR').format(products.length)})</h3><div className="admin-search"><Search size={16}/><input placeholder="جست‌وجوی محصول..." value={query} onChange={e=>setQuery(e.target.value)}/></div></div>
    <div className="admin-products">{filtered.map(p=><div className="admin-product" key={p.id}><div className="admin-thumb">{p.image_url?<img src={p.image_url} alt=""/>:<Package/>}</div><div className="admin-product-main"><b>{p.name}</b><small>{p.category} · {money(p.sale_price||p.price)} · موجودی {p.stock}</small><small>{p.active?'نمایش در فروشگاه':'مخفی از فروشگاه'}</small></div><button className="icon-btn" title="ویرایش" onClick={()=>{setEditing(p);window.scrollTo({top:0,behavior:'smooth'});}}><Pencil size={17}/></button><button className="icon-btn danger" title="حذف" onClick={()=>remove(p)}><Trash2 size={17}/></button></div>)}</div>
  </div></div>;
}

function ProductEditor({product,onCancel,onSaved,setError}) {
  const empty={name:'',description:'',category:'محصولات پوستی',price:'',sale_price:'',stock:'0',active:true,image_url:''};
  const [form,setForm]=useState(empty); const [file,setFile]=useState(null); const [busy,setBusy]=useState(false);
  useEffect(()=>{setForm(product?{...product,price:String(product.price),sale_price:product.sale_price?String(product.sale_price):'',stock:String(product.stock)}:empty);setFile(null);},[product]);
  const change=(k,v)=>setForm(f=>({...f,[k]:v}));
  async function save(e){e.preventDefault();setBusy(true);setError('');try{
    let image_url=form.image_url;
    if(file){const ext=file.name.split('.').pop().toLowerCase();const path=`${crypto.randomUUID()}.${ext}`;const {error:upErr}=await supabase.storage.from('product-images').upload(path,file,{upsert:false,contentType:file.type});if(upErr)throw upErr;image_url=supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl;}
    const payload={name:form.name.trim(),description:form.description,category:form.category,price:Number(form.price),sale_price:form.sale_price?Number(form.sale_price):null,stock:Number(form.stock),active:form.active,image_url};
    const result=product?await supabase.from('products').update(payload).eq('id',product.id):await supabase.from('products').insert(payload);
    if(result.error)throw result.error;onSaved();
  }catch(err){setError(err.message||'ذخیره محصول انجام نشد.');}finally{setBusy(false);}}
  return <form className="editor" onSubmit={save}><div className="editor-title"><h3>{product?'ویرایش محصول':'افزودن محصول جدید'}</h3>{product&&<button type="button" className="text-toggle" onClick={onCancel}>لغو ویرایش</button>}</div>
    <div className="form-grid"><div className="field span-2"><label>نام محصول *</label><input required value={form.name} onChange={e=>change('name',e.target.value)} placeholder="نام محصول"/></div>
    <div className="field"><label>دسته‌بندی *</label><select value={form.category} onChange={e=>change('category',e.target.value)}>{CATEGORIES.slice(1).map(c=><option key={c}>{c}</option>)}</select></div>
    <div className="field"><label>قیمت (تومان) *</label><input type="number" min="0" required value={form.price} onChange={e=>change('price',e.target.value)}/></div>
    <div className="field"><label>قیمت تخفیف‌دار (اختیاری)</label><input type="number" min="0" value={form.sale_price} onChange={e=>change('sale_price',e.target.value)}/></div>
    <div className="field"><label>تعداد موجودی</label><input type="number" min="0" required value={form.stock} onChange={e=>change('stock',e.target.value)}/></div>
    <div className="field span-2"><label>توضیحات</label><textarea rows="3" value={form.description||''} onChange={e=>change('description',e.target.value)} placeholder="توضیحات محصول..."/></div>
    <div className="field span-2"><label>تصویر محصول (از گوشی یا کامپیوتر)</label><label className="upload-box"><Upload size={19}/><span>{file?file.name:'انتخاب تصویر محصول'}</span><input type="file" accept="image/*" onChange={e=>setFile(e.target.files?.[0]||null)}/></label>{form.image_url&&!file&&<small>تصویر فعلی ثبت شده است. برای جایگزینی، تصویر جدید انتخاب کنید.</small>}</div>
    <label className="check-field"><input type="checkbox" checked={form.active} onChange={e=>change('active',e.target.checked)}/> نمایش محصول در فروشگاه</label>
    </div><div className="editor-buttons"><button className="gold-btn" disabled={busy}>{busy?'در حال ذخیره...':product?'ذخیره تغییرات':'ثبت محصول'}</button>{product&&<button type="button" className="outline-btn" onClick={onCancel}>انصراف</button>}</div>
  </form>;
}

export default function App(){
  const [products,setProducts]=useState(demoProducts); const [category,setCategory]=useState('همه محصولات'); const [search,setSearch]=useState(''); const [admin,setAdmin]=useState(false); const [menu,setMenu]=useState(false); const [loading,setLoading]=useState(false); const [dbReady,setDbReady]=useState(false);
  async function load(){if(!isConfigured)return;setLoading(true);const {data,error}=await supabase.from('products').select('*').eq('active',true).order('created_at',{ascending:false});if(!error){setProducts(data||[]);setDbReady(true);}setLoading(false);}
  useEffect(()=>{load();},[]);
  const visible=useMemo(()=>products.filter(p=>(category==='همه محصولات'||p.category===category)&&(`${p.name} ${p.description||''}`).toLowerCase().includes(search.toLowerCase())),[products,category,search]);
  const featured=visible.slice(0,4);
  return <div className="site">
    <div className="topbar"><span><ShieldCheck size={14}/> ضمانت اصالت کالا</span><i/> <span><Truck size={14}/> ارسال به سراسر ایران</span><i/> <span>واردکننده مستقیم محصولات زیبایی</span></div>
    <header className="main-header"><a href="#" className="brand"><div className="brand-mark">MB</div><div><b>مسلم بیوتی</b><small>MOSLEM BEAUTY</small></div></a>
      <nav className={menu?'nav open':'nav'}>{[['#home','خانه'],['#categories','دسته‌بندی‌ها'],['#products','محصولات'],['#contact','تماس با ما']].map(([h,t])=><a key={h} href={h} onClick={()=>setMenu(false)}>{t}</a>)}</nav>
      <div className="header-actions"><a href={INSTAGRAM} target="_blank" rel="noreferrer" className="social-link"><Instagram size={18}/></a><button className="admin-entry" onClick={()=>setAdmin(true)}>مدیریت</button><button className="menu-btn" onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button></div>
    </header>
    <main>
      <section className="hero" id="home"><div className="hero-content"><span className="eyebrow"><span className="gold-dot"/> BEAUTY · CARE · LUXURY</span><h1>زیبایی، انتخابی<br/><em>درخشان و اصیل</em></h1><p>دنیایی از محصولات آرایشی، مراقبت پوست و عطرهای منتخب؛ با ضمانت اصالت کالا از مسلم بیوتی.</p><div className="hero-buttons"><a href="#products" className="gold-btn">مشاهده محصولات <ChevronLeft size={18}/></a><a href={WA} target="_blank" rel="noreferrer" className="hero-whatsapp">مشاوره و سفارش در واتساپ</a></div><div className="hero-points"><span><ShieldCheck/> ضمانت اصالت</span><span><Truck/> ارسال سراسری</span></div></div><div className="hero-art"><div className="hero-orbit orbit-one"/><div className="hero-orbit orbit-two"/><div className="hero-monogram">MB</div><div className="hero-caption">THE ART OF BEAUTY <b>✦</b></div></div></section>
      <section className="trust-strip"><div><ShieldCheck/><b>ضمانت اصالت کالا</b><small>با خیال آسوده خرید کنید</small></div><div><Truck/><b>ارسال به سراسر ایران</b><small>از قشم تا تمام ایران</small></div><div><ShoppingBag/><b>واردکننده محصولات</b><small>تنوع محصولات زیبایی</small></div></section>
      <section className="section categories-section" id="categories"><div className="section-heading"><div><span className="eyebrow">SHOP BY CATEGORY</span><h2>دسته‌بندی محصولات</h2></div><p>محصول موردنظرت را آسان‌تر پیدا کن.</p></div><div className="category-pills">{CATEGORIES.map((c,i)=><button key={c} className={category===c?'category-pill active':'category-pill'} onClick={()=>{setCategory(c);document.getElementById('products')?.scrollIntoView({behavior:'smooth'});}}><span>{['✦','◈','✧','☼','◌','❋','♢','♡','◉'][i]}</span>{c}</button>)}</div></section>
      <section className="section products-section" id="products"><div className="section-heading products-heading"><div><span className="eyebrow">OUR COLLECTION</span><h2>{category==='همه محصولات'?'منتخب محصولات مسلم بیوتی':category}</h2><p>با ضمانت اصالت و امکان سفارش مستقیم</p></div><div className="search-box"><Search size={18}/><input placeholder="جست‌وجوی محصول..." value={search} onChange={e=>setSearch(e.target.value)}/><SlidersHorizontal size={17}/></div></div>
        {loading&&<p className="muted">در حال دریافت محصولات...</p>}
        {!loading&&visible.length===0?<div className="empty-state"><Package size={32}/><b>محصولی پیدا نشد</b><span>عبارت جست‌وجو یا دسته‌بندی را تغییر دهید.</span></div>:<div className="product-grid">{visible.map(p=><ProductCard key={p.id} p={p}/>)}</div>}
        <div className="catalog-note">{dbReady?'محصولات به‌روز فروشگاه':'پیش‌نمایش اولیه محصولات؛ برای فعال‌سازی مدیریت آنلاین، Supabase را متصل کنید.'}</div>
      </section>
      <section className="brand-banner"><div><span className="eyebrow">MOSLEM BEAUTY · QESHM</span><h2>زیبایی از انتخابی مطمئن آغاز می‌شود.</h2><p>برای دریافت راهنمایی، استعلام موجودی و ثبت سفارش با ما در ارتباط باشید.</p><a className="gold-btn" href={WA} target="_blank" rel="noreferrer">گفت‌وگو در واتساپ <ChevronLeft size={18}/></a></div><div className="banner-seal">MB<span>AUTHENTIC<br/>BEAUTY</span></div></section>
    </main>
    <footer id="contact"><div className="footer-main"><div className="footer-brand"><div className="brand-mark">MB</div><h3>مسلم بیوتی</h3><span>MOSLEM BEAUTY</span><p>واردکننده محصولات آرایشی، بهداشتی، مراقبت پوست و عطر و ادکلن.</p></div><div className="footer-col"><h4>راه‌های ارتباطی</h4><a href="tel:09915909891"><Phone/> 09915909891</a><a href={WA} target="_blank" rel="noreferrer"><ShoppingBag/> واتساپ فروشگاه</a><a href={INSTAGRAM} target="_blank" rel="noreferrer"><Instagram/> Moslem_beauty2</a></div><div className="footer-col"><h4>نشانی فروشگاه</h4><p><MapPin/> قشم، درگهان، پاساژ زمرد</p><p className="footer-note">ارسال سفارش به سراسر ایران</p></div></div><div className="footer-bottom"><span>© تمامی حقوق برای مسلم بیوتی محفوظ است.</span><span>ساخته‌شده با <b>✦</b> برای زیبایی شما</span></div></footer>
    {admin&&<Admin onClose={()=>setAdmin(false)} onChanged={load}/>}
    <a className="floating-wa" href={WA} target="_blank" rel="noreferrer" aria-label="واتساپ"><ShoppingBag/></a>
  </div>;
}