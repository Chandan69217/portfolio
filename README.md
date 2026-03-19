# 🚀 Chandan Sharma | Full-Stack Developer & Creative Technologist

Welcome to the repository of my 3D Portfolio! This isn't just a website; it's an interactive experience where code meets creativity. Built with **Next.js**, **GSAP**, and **Spline**, this portfolio pushes the boundaries of modern web design with fluid 3D animations and real-time interactions.

![Portfolio Preview](https://github.com/Chandan69217/3d-portfolio/blob/main/public/assets/projects-screenshots/portfolio/landing.png?raw=true)

---

## ✨ Features

- 🎹 **Interactive 3D Keyboard**: A custom-made Spline 3D keyboard where skill keycaps reveal details on hover/scroll.
- 🌌 **Cosmic Environment**: A dynamic starry background with interactive particles for an immersive experience.
- ⚡ **Slick Animations**: Powered by **GSAP**, **Framer Motion**, and **Lenis** for buttery-smooth scrolling and transitions.
- 💻 **Real-time Connectivity**: Integrated with **Socket.io** for real-time features.
- 📧 **Communication**: Built-in contact form powered by **Resend** for seamless email delivery.
- 📱 **Fully Responsive**: Optimized for all devices, from ultra-wide monitors to mobile screens.
- 🛠️ **Admin Dashboard**: Secure management system to update projects and skills on the fly.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Sass](https://sass-lang.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) & [Aceternity UI](https://ui.aceternity.com/)
- **State Management**: React Context API & Hooks

### Animations & 3D
- **3D Hub**: [Spline Runtime](https://spline.design/)
- **Motion**: [GSAP](https://gsap.com/) & [Framer Motion](https://www.framer.com/motion/)
- **Smooth Scroll**: [Lenis](https://github.com/darkroomengineering/lenis)

### Backend & Database
- **Database**: [PostgreSQL](https://www.postgresql.org/) (via [Supabase](https://supabase.com/))
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: JWT-based secure access
- **Email**: [Resend](https://resend.com/)
- **Real-time**: [Socket.io](https://socket.io/)

---

## 📂 Project Structure

```bash
src/
├── app/            # Next.js App Router (Pages & Layouts)
├── components/     # Reusable UI & 3D Model Components
├── content/        # Static content & MDX files
├── contexts/       # React Context Providers
├── hooks/          # Custom React Hooks
├── lib/            # External library configurations (Prisma, etc.)
├── types/          # TypeScript interface definitions
└── utils/          # Helper/Utility functions
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm / yarn / pnpm

### Installation

1. **Clone the repo:**
   ```bash
   git clone https://github.com/Chandan69217/3d-portfolio.git
   cd 3d-portfolio
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file in the root and add the following:
   ```env
   DATABASE_URL="your_postgresql_url"
   ADMIN_PASSWORD="your_admin_password"
   JWT_SECRET="your_secret_key"
   RESEND_API_KEY="your_resend_api_key"
   ```

4. **Database Sync:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view it.

---

## 🛡️ License

This project is licensed under the [MIT License](LICENSE).

---

## 🤝 Let's Connect!

- **LinkedIn**: [Chandan Sharma](https://www.linkedin.com/in/chandan-sharma-744083263/)
- **GitHub**: [@Chandan69217](https://github.com/Chandan69217)
- **Portfolio**: [Visit Live Site](https://www.google.com) (Update this with your real link!)

---

*Made with ❤️ by Chandan Sharma*
