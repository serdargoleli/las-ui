# las-css

**las-css**, TailwindCSS tarzında çalışan, tamamen SCSS altyapısıyla dinamik olarak utility sınıfları üreten hafif, esnek ve genişletilebilir bir CSS utility framework’tür.

Kendi tasarım sistemini oluşturmak isteyenler için minimal, hızlı ve özelleştirilebilir bir yapı sunar.

---

## 🚀 Özellikler

- ⚡ **Hafif ve hızlı:** Sadece ihtiyaç duyulan utility sınıfları üretilir.
- 🎨 **SCSS ile tam kontrol:** Tüm utility’ler map ve fonksiyonlarla yönetilir.
- 🧩 **Modüler yapı:** Border, spacing, color scale, typography vb. modüller halinde gelir.
- 🛠️ **Extend edilebilir:** Kendi utility’lerini veya scale’lerini kolayca ekleyebilirsin.
- 🎯 **Utility-first tasarım:** HTML üzerinde hızlı prototip ve final ürün geliştirme.

---

## 📥 Kurulum

```bash
npm install las-css
```

Veya pnpm için:

```bash
pnpm add las-css
```

---

## 🔧 Kullanım

### 1. React / Vite / Webpack (Önerilen)

Projenizin ana giriş dosyasına (örneğin `main.jsx`, `App.tsx` veya `index.js`) import edin:

```javascript
import "las-css";
```

> **Not:** Paket otomatik olarak minified CSS dosyasını (`style.min.css`) yükler.

### 2. CDN (Tarayıcı)

Paketi indirmeden doğrudan HTML içinde kullanmak için:

```html
<link href="https://cdn.jsdelivr.net/npm/las-css@latest/dist/style.min.css" rel="stylesheet">
```

---

## 💡 İpucu: IntelliSense (Otomatik Tamamlama)

VS Code kullanıyorsanız, sınıfları otomatik tamamlamak için **"IntelliSense for CSS class names in HTML"** eklentisini kurmanızı öneririz.

Kurulumdan sonra `.vscode/settings.json` dosyanıza şunu ekleyin:

```json
{
  "html-css-class-completion.includeGlobPattern": "**/*.{css,html,jsx,tsx}",
  "html-css-class-completion.enableEmmetSupport": true
}
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
```html
<div class="text-primary-500 bg-gray-100">...</div>
```

---

## ⚙️ Geliştirme

Repo’yu klonladıktan sonra:

```bash
npm install
npm run build
```

SCSS kaynakları `src/` klasöründe, çıkış dosyaları `dist/` altındadır.

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
