# 🎬 Quran Video Studio

> A professional web-based tool for creating high-quality Quran recitation videos with synchronized audio, typography, and styling.

[![License](https://img.shields.io/badge/license-Open%20Source-brightgreen)](LICENSE)
[![Built with React](https://img.shields.io/badge/built%20with-React-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)

<p>
  <img src="https://img.shields.io/badge/Dev_by-Oussama-blue?style=for-the-badge">
  <br>
  <sub>Built with the help of AI • <a href="https://t.me/oussamadev">Contact via Telegram</a> • <a href="https://ko-fi.com/oussamadev">Support on Ko-fi ☕</a></sub>
</p>

---

![Alt text](https://i.postimg.cc/z5SZwtHW/02.png)

## 📋 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Quick Start](#-quick-start)
- [⚠️ Troubleshooting](#️-troubleshooting)
- [📁 Project Structure](#-project-structure)
- [🖥️ Desktop App Setup (Tauri)](#️-desktop-app-setup-tauri)
- [📝 License](#-license)

---

## ✨ Features

### 📖 Content Selection
- **Surah & Verse Navigation** - Easily browse and select any Surah and verse range
- **Multiple Reciters** - Choose from renowned Quran reciters with high-quality audio

### 🎵 Audio Tools
- **Waveform Visualization** - See your audio in real-time
- **Playback Controls** - Full control over audio timing and synchronization
- **Audio Synchronization** - Perfectly aligned audio with text display

### 🎨 Video Customization
- **Typography** - Multiple Arabic and English font options
- **Color Control** - Customize text colors, backgrounds, and highlighting
- **Background Support** - Solid colors or custom uploaded images
- **Layout Options** - Toggle Surah headers, Bismillah, and translations
- **Aspect Ratios** - 9:16 (Story/TikTok), 1:1 (Instagram), 16:9 (YouTube)

### 💾 Export & Production
- **MP4 Export** - High-quality video generation
- **Client-Side Processing** - Fast processing with mp4-muxer
- **No Server Upload** - Your videos stay private

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend Framework** | React 18 + TypeScript |
| **Build Tool** | Vite |
| **Styling** | Tailwind CSS |
| **Icons** | Lucide React |
| **Video Processing** | mp4-muxer |
| **State Management** | React Hooks |
| **Desktop (Optional)** | Tauri 2.0 |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn installed


The app will open at `http://localhost:3000` with Hot Module Replacement (HMR).

### Production Build

```bash
# 1. Install dependencies
npm install

# Build optimized production bundle
npm run build

# Preview the production build locally
npm run preview
```

**Why use `build` + `preview` instead of `dev`?**
- `npm run dev` - For active development with fast refresh
- `npm run build` - Optimizes all assets, creates production bundle
- `npm run preview` - Tests the optimized build locally before deployment

---

## ⚠️ Troubleshooting

### Issue: MIME Type Error - "Expected a JavaScript module script but the server responded with a MIME type of ''"

This error occurs when your dev server isn't properly serving `.ts` or `.js` files.

---

## 📁 Project Structure

```
src/
├── app/                 # Main application component
├── features/            # Feature modules
│   ├── Audio/          # Audio processing & waveform
│   ├── Quran/          # Quranic content & selection
│   └── VideoEditor/    # Video rendering & export
├── layouts/            # Layout components (Sidebar, etc.)
├── shared/             # Utilities, constants, types
└── index.tsx          # Entry point
```

---

## 🖥️ Desktop App Setup (Tauri)

### ⚠️ Important: Pre-Configuration Exists

**DO NOT run `npx tauri init` directly!** This project has custom Tauri configurations. Follow these steps:

### Step 1: Initialize Tauri

```bash
npx tauri init
```

Answer the prompts as follows:
```
App name: quran-video-studio
Window title: quran-video-studio
Web assets path: ../build
Dev server URL: http://localhost:3000
Frontend dev command: npm run dev
Frontend build command: npm run build
```

### Step 2: Apply Custom Configuration

1. Navigate to `src-tauri-config/` folder in project root
2. Copy all contents (files, folders, icons)
3. Paste into newly created `src-tauri/` folder
4. Click **Yes to All** when prompted to replace existing files

### Step 3: Install Tauri Dependencies

```bash
npm install @tauri-apps/api@2.0.0

npx tauri add path
npx tauri add fs
npx tauri add dialog
npx tauri add opener
npx tauri add log

cd src-tauri && cargo add log && cd ..
```

### Step 4: Run Desktop App

```bash
# Development with hot reload
npm run tauri dev

# Build native executable
npm run tauri build
```

---

## 📝 License

This project is open source and available for personal .

---

**Happy creating! 🎬✨**

---


<div dir="rtl" style="font-family: 'Arabic Typesetting', 'Simplified Arabic', Arial; margin-top: 40px; border-top: 2px solid #e5e7eb; padding-top: 20px;">

# 🎬 استوديو فيديو القرآن

> أداة احترافية قائمة على الويب لإنشاء مقاطع فيديو تلاوة القرآن عالية الجودة مع صوت متزامن وتطبيق طباعي واحترافي.

---
![Alt text](https://i.postimg.cc/z5SZwtHW/02.png)

## 📋 جدول المحتويات

- [✨ المميزات](#-المميزات)
- [🛠️ مجموعة التقنيات](#️-مجموعة-التقنيات)
- [🚀 البدء السريع](#-البدء-السريع)
- [⚠️ استكشاف الأخطاء](#️-استكشاف-الأخطاء)
- [📁 هيكل المشروع](#-هيكل-المشروع)
- [🖥️ إعداد تطبيق سطح المكتب](#️-إعداد-تطبيق-سطح-المكتب-tauri)
- [📝 الترخيص](#-الترخيص)

---

## ✨ المميزات

### 📖 اختيار المحتوى
- **التنقل في السور والآيات** - تصفح واختر أي سورة ونطاق آيات بسهولة
- **متعددو القراء** - اختر من القارئين المشهورين بصوت عالي الجودة

### 🎵 أدوات الصوت
- **تصور الموجة الصوتية** - شاهد صوتك في الوقت الفعلي
- **عناصر التحكم في التشغيل** - التحكم الكامل في توقيت الصوت والمزامنة
- **مزامنة الصوت** - محاذاة مثالية للصوت مع عرض النص

### 🎨 تخصيص الفيديو
- **الطباعة** - خيارات خطوط عربية وإنجليزية متعددة
- **التحكم في الألوان** - تخصيص ألوان النص والخلفيات والتمييز
- **دعم الخلفيات** - ألوان صلبة أو صور خلفية مخصصة
- **خيارات التخطيط** - إظهار/إخفاء رؤوس السور والبسملة والترجمات
- **نسب العرض** - 9:16 (قصة/تيك توك)، 1:1 (إنستجرام)، 16:9 (يوتيوب)

### 💾 التصدير والإنتاج
- **تصدير MP4** - توليد فيديو عالي الجودة
- **المعالجة من جانب العميل** - معالجة سريعة مع mp4-muxer
- **بدون تحميل الخادم** - مقاطعك تبقى خاصة

---

## 🛠️ مجموعة التقنيات

| الطبقة | التقنية |
|-------|---------|
| **إطار العمل الأمامي** | React 18 + TypeScript |
| **أداة البناء** | Vite |
| **التصميم** | Tailwind CSS |
| **الأيقونات** | Lucide React |
| **معالجة الفيديو** | mp4-muxer |
| **إدارة الحالة** | React Hooks |
| **تطبيق سطح المكتب** | Tauri 2.0 |

---

## 🚀 البدء السريع

### المتطلبات الأساسية
- Node.js 18+ و npm/yarn مثبتة

### التثبيت والتطوير


# 2. بدء خادم التطوير


### البناء للإنتاج

```bash
# 1. تثبيت المكتبات
npm install

# بناء حزمة الإنتاج المحسّنة
npm run build

# معاينة محلية للبناء الإنتاجي
npm run preview
```

**لماذا استخدام `build` + `preview` بدلاً من `dev`؟**
- `npm run dev` - للتطوير النشط مع التحديث السريع
- `npm run build` - يحسّن جميع الأصول وينشئ حزمة الإنتاج
- `npm run preview` - اختبار الحزمة المحسّنة محليًا قبل النشر

---

## ⚠️ استكشاف الأخطاء

### المشكلة: خطأ نوع MIME

يحدث هذا الخطأ عندما لا يقوم خادم التطوير بخدمة ملفات `.ts` أو `.js` بشكل صحيح.


## 📁 هيكل المشروع

```
src/
├── app/                 # المكون الرئيسي للتطبيق
├── features/            # وحدات الميزات
│   ├── Audio/          # معالجة الصوت والموجة الصوتية
│   ├── Quran/          # محتوى وتحديد قرآني
│   └── VideoEditor/    # عرض وتصدير الفيديو
├── layouts/            # مكونات التخطيط
├── shared/             # الأدوات والثوابت والأنواع المشتركة
└── index.tsx          # نقطة الدخول
```

---

## 🖥️ إعداد تطبيق سطح المكتب (Tauri)

### ⚠️ تحذير مهم: التكوين المسبق موجود

**لا تشغل `npx tauri init` مباشرة!** يحتوي هذا المشروع على إعدادات Tauri مخصصة. اتبع هذه الخطوات:

### الخطوة 1: تهيئة Tauri

```bash
npx tauri init
```

أجب على المطالبات كما يلي:
```
App name: quran-video-studio
Window title: quran-video-studio
Web assets path: ../build
Dev server URL: http://localhost:3000
Frontend dev command: npm run dev
Frontend build command: npm run build
```

### الخطوة 2: تطبيق التكوين المخصص

1. انتقل إلى مجلد `src-tauri-config/` في جذر المشروع
2. انسخ جميع المحتويات (الملفات والمجلدات والأيقونات)
3. الصق في مجلد `src-tauri/` الذي تم إنشاؤه حديثًا
4. انقر فوق **نعم للكل** عند المطالبة باستبدال الملفات الموجودة

### الخطوة 3: تثبيت تبعيات Tauri

```bash
npm install @tauri-apps/api@2.0.0

npx tauri add path
npx tauri add fs
npx tauri add dialog
npx tauri add opener
npx tauri add log

cd src-tauri && cargo add log && cd ..
```

### الخطوة 4: تشغيل تطبيق سطح المكتب

```bash
# التطوير مع إعادة التحميل الفوري
npm run tauri dev

# بناء التطبيق الأصلي
npm run tauri build
```

---

## 📝 الترخيص

هذا المشروع مفتوح المصدر ومتاح للاستخدام الشخصي .

---

**سعيد بالإنشاء! 🎬✨**

تم بناء هذا المشروع بـ ❤️ 

</div>
