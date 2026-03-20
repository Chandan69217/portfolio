# Project Setup and Deployment Guide

Successfully initialized and verified the 3D Portfolio project. Below are the steps to run it locally and deploy it to Vercel.

## 🚀 Running Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```
   > [!NOTE]
   > If you encounter errors during generation on Windows, ensure your `DATABASE_URL` in [.env](file:///d:/Programs/3d-portfolio-master/.env) is accessible and that you have the latest Prisma CLI installed.
3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Access the site at [http://localhost:3000](http://localhost:3000).

---

## ☁️ Deploying to Vercel

Follow these steps for a "Setup Guard" deployment:

### 1. Push to GitHub
If not already synced, push your project to a GitHub repository:
```bash
git init
git add .
git commit -m "initial commit"
git remote add origin YOUR_REPO_URL
git push -u origin main
```

### 2. Create Vercel Project
- Go to [Vercel](https://vercel.com) and click **"Add New"** > **"Project"**.
- Import your portfolio repository.

### 3. Configure Environment Variables
In the **Environment Variables** section, add the following from your [.env](file:///d:/Programs/3d-portfolio-master/.env) file:
| Variable | Value |
| :--- | :--- |
| `DATABASE_URL` | `postgresql://...` (Your Supabase Pooler URL) |
| `ADMIN_PASSWORD` | Your custom password |
| `JWT_SECRET` | A secure random string |
| `RESEND_API_KEY` | Your Resend API key |

### 4. Overwrite Build Command
To ensure Prisma works correctly in production, change the **Build Command** in Vercel settings (**Project Settings > Framework Settings**):
- **Build Command**: `npx prisma generate && next build`

### 5. Deployment
Click **Deploy**. Vercel will automatically build and assign a domain to your project.

---

## ✅ Verification
- **Local**: Project is confirmed running on Next.js 16.2.0 (Canary).
- **Database**: Prisma is configured to connect to your Supabase instance.
- **UI**: 3D elements (Three.js/Spline) are ready for interaction.
