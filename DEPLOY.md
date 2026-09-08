# 🚀 Deploy — qadam-baqadam yo'riqnoma

Bu yerda hamma narsa oddiy qilib yozilgan. Ketma-ket bajaring.

**Nima qilamiz:**

| Qism | Qayerga | Narxi |
|---|---|---|
| Kod | GitHub | bepul |
| Backend (bot + API) | Render | bepul |
| Frontend (Mini App) | Vercel | bepul |
| Baza | Neon (allaqachon bor) | bepul |

Taxminiy vaqt: **30–40 daqiqa**.

---

# 1-QISM. GitHub'ga yuklash

## 1.1. GitHub'da bo'sh repo yarating

1. [github.com](https://github.com) ga kiring
2. O'ng yuqoridagi **`+`** → **New repository**
3. To'ldiring:
   - **Repository name:** `malohat-pishiriqlari`
   - **Private** ni tanlang ⚠️ (loyihada shaxsiy ma'lumotlar bor)
   - **README, .gitignore, license — HECH BIRINI belgilamang**
4. **Create repository** tugmasini bosing
5. Ochilgan sahifadagi manzilni nusxalang, masalan:
   `https://github.com/foydalanuvchi/malohat-pishiriqlari.git`

## 1.2. Kompyuterdan kodni yuboring

Loyiha papkasida (`D:\pishiriq`) terminal oching va **birma-bir** bajaring:

```bash
git init
```

```bash
git add .
```

```bash
git commit -m "Malohat pishiriqlari - Telegram Mini App"
```

```bash
git branch -M main
```

Quyidagida `SIZNING-MANZIL` o'rniga 1.1 da nusxalagan manzilni qo'ying:

```bash
git remote add origin SIZNING-MANZIL
```

```bash
git push -u origin main
```

> GitHub login so'rasa: **Username** — GitHub nomingiz,
> **Password** o'rniga **Personal Access Token** kerak bo'ladi.
> Token olish: GitHub → Settings → Developer settings →
> Personal access tokens → Tokens (classic) → **Generate new token** →
> `repo` katagini belgilang → Generate → tokenni nusxalang.

## 1.3. Tekshiring ✅

GitHub sahifasini yangilang — fayllar ko'rinishi kerak.

**Muhim:** `backend/.env` fayli u yerda **BO'LMASLIGI** kerak.
Agar ko'rinsa — to'xtang va menga ayting (unda bot tokeni bor).

---

# 2-QISM. Backend'ni Render'ga qo'yish

## 2.1. Render'da hisob oching

1. [render.com](https://render.com) → **Get Started** → **GitHub** bilan kiring
2. Render'ga repo'laringizga ruxsat bering

## 2.2. Servis yarating

1. Panelda **New +** → **Web Service**
2. **Build and deploy from a Git repository** → **Next**
3. `malohat-pishiriqlari` repo'sini toping → **Connect**
4. Maydonlarni to'ldiring:

| Maydon | Qiymat |
|---|---|
| **Name** | `malohat-backend` |
| **Region** | `Frankfurt (EU Central)` |
| **Branch** | `main` |
| **Root Directory** | `backend` ⚠️ shuni yozishni unutmang |
| **Runtime** | `Node` |
| **Build Command** | `npm install --omit=optional && npx prisma generate && npx prisma db push --accept-data-loss` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

## 2.3. Maxfiy sozlamalarni kiriting

Pastdagi **Environment Variables** bo'limida **Add Environment Variable**
tugmasi bilan quyidagilarni **birma-bir** qo'shing:

| Key | Value |
|---|---|
| `BOT_TOKEN` | `8830628253:AAGcsoT0QXuJ2eH-yi8exz3ZsSKBVR9iR0g` |
| `DATABASE_URL` | Neon manzilingiz (`backend/.env` dan nusxalang) |
| `ADMIN_TELEGRAM_ID` | `7536494282` |
| `JWT_SECRET` | Uzun tasodifiy matn, masalan `malohat_2026_maxfiy_kalit_xyz789` |
| `NODE_ENV` | `production` |
| `USE_TUNNEL` | `false` |
| `WEB_APP_URL` | Hozircha **bo'sh qoldiring** — 3-qismdan keyin to'ldiramiz |

## 2.4. Deploy

**Create Web Service** tugmasini bosing. 3–5 daqiqa kutasiz.

Loglarda quyidagini ko'rsangiz — tayyor:

```
OK  PostgreSQL bazasiga ulanish muvaffaqiyatli (Neon)
OK  API server ishlamoqda
OK  Bot ishga tushdi: @malohat_sweet_bot
```

## 2.5. Manzilni nusxalang

Yuqorida yashil rangda manzil chiqadi, masalan:
`https://malohat-backend.onrender.com`

**Bu manzilni saqlab qo'ying** — 3-qismda kerak bo'ladi.

## 2.6. Tekshiring ✅

Brauzerda oching: `https://malohat-backend.onrender.com/health`

Shunday javob chiqishi kerak:
```json
{"ok":true,"service":"malohat-backend","time":"..."}
```

---

# 3-QISM. Frontend'ni Vercel'ga qo'yish

## 3.1. Vercel'da hisob oching

1. [vercel.com](https://vercel.com) → **Sign Up** → **Continue with GitHub**

## 3.2. Loyihani import qiling

1. **Add New...** → **Project**
2. `malohat-pishiriqlari` → **Import**
3. To'ldiring:

| Maydon | Qiymat |
|---|---|
| **Framework Preset** | `Next.js` (o'zi tanlaydi) |
| **Root Directory** | **Edit** bosing → `frontend` ni tanlang ⚠️ |

## 3.3. Sozlamani qo'shing

**Environment Variables** bo'limiga bitta qator qo'shing:

| Key | Value |
|---|---|
| `BACKEND_URL` | 2.5 dagi Render manzili, masalan `https://malohat-backend.onrender.com` |

> Oxirida `/` qo'ymang.

## 3.4. Deploy

**Deploy** tugmasini bosing. 2–3 daqiqa kutasiz.

Tayyor bo'lgach manzil chiqadi, masalan:
`https://malohat-pishiriqlari.vercel.app`

**Bu manzilni ham saqlang.**

---

# 4-QISM. Ikkalasini bog'lash

Bot Mini App qaysi manzilni ochishini bilishi kerak.

1. **Render** panelига qayting → `malohat-backend` → chapda **Environment**
2. `WEB_APP_URL` ni toping (yoki yangi qo'shing) va qiymat qilib
   Vercel manzilini yozing:
   ```
   https://malohat-pishiriqlari.vercel.app
   ```
3. **Save Changes** — Render o'zi qayta deploy qiladi (2–3 daqiqa)

---

# 5-QISM. Tekshirish

## 5.1. Bot

1. Telegram'da **@malohat_sweet_bot** ni oching
2. **/start** yuboring
3. **"BOSHLASH"** tugmasini bosing → do'kon ochilishi kerak

## 5.2. Buyurtma

1. Katalogdan mahsulot tanlang → savatga qo'shing
2. Savatchada ism va telefon yozing → rasmiylashtiring
3. Telegram'ingizga buyurtma xabari kelishi kerak

## 5.3. Admin panel

1. Botda **/admin** yuboring
2. Bot 4 xonali kod yuboradi
3. **"Admin panelni ochish"** tugmasini bosing
4. Kodni kiriting → panel ochiladi

---

# ⚠️ Bepul tarifning ikkita cheklovi

## 1. Render 15 daqiqadan keyin "uxlaydi"

Bepul tarifda hech kim murojaat qilmasa, servis to'xtaydi va **bot javob bermay qoladi**.
Birinchi murojaatdan keyin 30–50 soniyada qayta uyg'onadi.

**Bepul yechim — har 10 daqiqada avtomatik "turtki":**

1. [cron-job.org](https://cron-job.org) da ro'yxatdan o'ting (bepul)
2. **Create cronjob** bosing
3. To'ldiring:
   - **Title:** `Malohat backend`
   - **URL:** `https://malohat-backend.onrender.com/health`
   - **Schedule:** `Every 10 minutes`
4. **Create** — endi bot doim uyg'oq turadi

## 2. Render bepul tarifi oyiga 750 soat beradi

Bitta servis uchun bu 24/7 ishlashga yetadi. Ikkinchi servis qo'shsangiz yetmaydi.

---

# 🔄 Keyinchalik kodni yangilash

Kodni o'zgartirgandan keyin:

```bash
git add .
```

```bash
git commit -m "nima o'zgargani"
```

```bash
git push
```

Render va Vercel **o'zi** ko'rib, avtomatik yangi versiyani chiqaradi.
Hech narsa qilish kerak emas.

---

# 🆘 Muammo bo'lsa

| Belgi | Sabab | Yechim |
|---|---|---|
| Render'da `Cannot find module '@prisma/client'` | Build buyrug'i noto'g'ri | 2.2 dagi Build Command'ni aynan nusxalang |
| Bot javob bermayapti | Servis uxlab qolgan | 1–2 daqiqa kuting yoki cron-job.org ni sozlang |
| "BOSHLASH" tugmasi ishlamayapti | `WEB_APP_URL` noto'g'ri | 4-qismni qayta tekshiring, `https://` bo'lsin |
| Do'konda mahsulot ko'rinmayapti | `BACKEND_URL` noto'g'ri | Vercel → Settings → Environment Variables |
| Rasm yuklanmayapti | Rasm 4 MB dan katta | Kichikroq rasm tanlang |
| Admin panelga kira olmayapti | Kod eskirgan | Botda `/admin` yuborib yangi kod oling |

**Log ko'rish:**
- Render: servis sahifasi → chapda **Logs**
- Vercel: loyiha sahifasi → **Deployments** → oxirgisini bosing

---

# 🔐 Xavfsizlik eslatmasi

Bot tokeni va baza paroli `backend/.env` faylida. Bu fayl `.gitignore` da,
ya'ni GitHub'ga **yuklanmaydi**. Uni hech kimga bermang va hech qayerga
nusxalab yozmang — faqat Render panelidagi Environment Variables'ga.

Agar token boshqa birov qo'liga tushsa: Telegram'da **@BotFather** ga kirib
`/revoke` orqali eski tokenni bekor qiling va yangisini oling.
