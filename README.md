# las-css

**las-css**, TailwindCSS tarzında çalışan, tamamen SCSS altyapısıyla dinamik olarak utility sınıfları üreten hafif, esnek ve genişletilebilir bir CSS utility framework’tür.

Kendi tasarım sistemini oluşturmak isteyenler için minimal, hızlı ve özelleştirilebilir bir yapı sunar.

---

## 🚀 Özellikler

- ⚡ Hafif ve hızlı: Sadece ihtiyaç duyulan utility sınıfları üretilir.  
- 🎨 SCSS ile tam kontrol: Tüm utility’ler map ve fonksiyonlarla yönetilir.  
- 🧩 Modüler yapı: Border, spacing, color scale, typography vb. modüller halinde gelir.  
- 🛠️ Extend edilebilir: Kendi utility’lerini veya scale’lerini kolayca ekleyebilirsin.  
- 🎯 Utility-first tasarım: HTML üzerinde hızlı prototip ve final ürün geliştirme.

---

## 📥 Kurulum

```bash
   npm install las-css
```

Veya pnpm için:

```bash
   pnpm add las-css
```

CDN (jsDelivr) ile kullanmak için:

```html
<link href="https://cdn.jsdelivr.net/npm/las-css/dist/las.css" rel="stylesheet">
```

---

## 🔧 Kullanım

SCSS projesinde import edin:

```scss
@use "las-css" as las;
```

HTML’de utility sınıflarını kullanın:

```html
<div class="p-4 bg-primary-500 text-white rounded-md">
  Merhaba LAS CSS!
</div>
```


---

## 🏗️ Örnek Utility’ler

### Grid
```html
<div class="grid grid-cols-3 gap-4">...</div>
```

### Border
```html
<div class="border border-solid border-primary-500">...</div>
```

### Scale (Transform)
```html
<div class="scale-105 hover:scale-110">...</div>
```

### Color scale (500 → base value)
```scss
.my-text {
  color: var(--color-primary-500);
}
```

---

## ⚙️ Geliştirme

Repo’yu klonladıktan sonra:

```bash
npm install
npm run build
```

SCSS kaynakları `src/` klasöründe, çıkış dosyası `dist/las.css` altındadır.

---

## 🧪 Yol Haritası

- [ ] Responsive prefix sistemi (sm:, md:, lg:)  
- [ ] Variant sistemleri (hover:, focus:, disabled:)  
- [ ] Plugin architecture  
- [ ] Typography utilities  
- [ ] Animasyon utilities  

---

## 📝 Lisans
MIT
