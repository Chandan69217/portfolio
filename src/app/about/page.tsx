"use client";
import React, { useEffect, useState } from "react";
import { FaEnvelope, FaPhone, FaLinkedin, FaGithub } from "react-icons/fa6";

// @ts-ignore
import { motion } from "framer-motion";

import { usePortfolioData } from "@/contexts/PortfolioDataContext";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// const CONTACT_LINKS = [
//   {
//     name: "Email",
//     content: con,
//     href: "mailto:naresh.khatri2345@gmail.com",
//     icon: <FaEnvelope />,
//   },
//   {
//     name: "Phone",
//     content: "1234567890",
//     href: "tel:1234567890",
//     icon: <FaPhone />,
//   },
//   {
//     name: "LinkedIn",
//     href: "https://www.linkedin.com/in/naresh-khatri/",
//     content: "/naresh-khatri",
//     icon: <FaLinkedin />,
//   },
//   {
//     name: "GitHub",
//     href: "https://github.com/Naresh-Khatri",
//     content: "/naresh-khatri",
//     icon: <FaGithub />,
//   },
// ];



function Page() {
  const { data, loading } = usePortfolioData();
  const config = data?.config;
  const skills = data?.skills || [];
  
  // Create an array large enough for seamless infinite scrolling
  const listItems = [...skills, ...skills, ...skills, ...skills, ...skills, ...skills];
  const topMarquee = [...listItems].reverse();
  const bottomMarquee = [...listItems];

  const CONTACT_LINKS = [
    {
      name: "Email",
      content: config?.email ?? "--",
      href: `"mailto:${config?.email ?? "--"}"`,
      icon: <FaEnvelope />,
    },
    {
      name: "Phone",
      content: config?.social?.phone ?? "--",
      href: `tel:${config?.social?.phone}`,
      icon: <FaPhone />,
    },
    {
      name: "LinkedIn",
      href: `${config?.social?.linkedin}`,
      content: `${config?.social?.linkedin}`,
      icon: <FaLinkedin />,
    },
    {
      name: "GitHub",
      href: `${config?.social?.github}`,
      content: `${config?.social?.github}`,
      icon: <FaGithub />,
    },
  ];

  const [toolsLoaded, setToolsLoaded] = useState(false);

  useEffect(() => {
    setToolsLoaded(true);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] flex items-center justify-center font-sans text-slate-900 dark:text-white">
        <div className="flex items-center gap-3 text-slate-500 dark:text-white/50">
          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Portfolio loading...
        </div>
      </div>
    );
  }

  return (
    <div className="md:px-12 px-8 lg:px-24 pt-32 pb-20 overflow-hidden">
      {/* Back Button */}
      <Link
        href="/"
        className="absolute top-14 left-4 flex items-center gap-2 px-5 py-2.5 bg-slate-200/50 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-300/50 dark:border-white/10 rounded-full backdrop-blur-md text-sm text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white z-50"
      >
        <ArrowLeft size={16} />
        Back to Portfolio
      </Link>

      {/* Layout */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-stretch">

        {/* Sidebar */}
        <aside className="w-full lg:w-[30%] xl:w-[25%]">
          <div className="p-8 rounded-3xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-xl h-full shadow-sm dark:shadow-none">
            <div className="flex flex-col items-center">
              <img
                className="rounded-full w-[140px] aspect-square object-cover mb-6"
                src={config?.profilePic || "/assets/me.jpg"}
                alt="me"
              />

              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {config?.author || "Naresh Khatri"}
              </p>

              <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2 text-center">
                {config?.description?.short || "Web Developer"}
              </p>
            </div>

            <hr className="my-6 border-slate-200 dark:border-white/10" />

            <ul className="flex flex-col gap-3">
              {CONTACT_LINKS.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-white/5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-white"
                  >
                    {link.icon}
                    <div>
                      <p>{link.name}</p>
                      <p className="text-xs text-slate-500 dark:text-zinc-400">
                        {link.content}
                      </p>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">
          <div className="p-8 rounded-3xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-xl h-full shadow-sm dark:shadow-none">

            <h1 className="text-4xl font-bold mb-6 text-slate-900 dark:text-white">
              About Me
            </h1>

            <p className="text-slate-600 dark:text-zinc-300 mb-10">
              {config?.description?.long || "Fullstack Developer"}
            </p>

            <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white mt-12">
              Stuff I Use
            </h2>

            <div className="relative rounded-3xl py-10 w-full overflow-hidden border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/20 shadow-inner">
              {/* Fade Overlays */}
              <div className="absolute top-0 left-0 w-24 h-full bg-gradient-to-r from-slate-50 dark:from-[#111111] to-transparent z-20 pointer-events-none" />
              <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-slate-50 dark:from-[#111111] to-transparent z-20 pointer-events-none" />

              {/* Marquee 1 (Left Scrolling) */}
              <div className="flex overflow-visible relative group w-full mb-4 md:mb-6 py-2">
                <motion.div
                  className="flex shrink-0 gap-4 md:gap-6 pr-4 md:pr-6 w-max"
                  animate={{ x: ["0%", "-50%"] }}
                  transition={{ duration: 40, ease: "linear", repeat: Infinity }}
                >
                  {topMarquee.map((skill, idx) => (
                    <div key={`top-${idx}`} title={skill.label} className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl md:rounded-2xl hover:bg-slate-50 dark:hover:bg-white/10 hover:border-indigo-500/50 shadow-sm dark:shadow-md hover:shadow-[0_0_25px_rgba(99,102,241,0.2)] dark:hover:shadow-[0_0_25px_rgba(99,102,241,0.4)] transition-all duration-300 flex-shrink-0 hover:scale-[1.15] cursor-pointer text-slate-500 dark:text-white/70 hover:text-slate-900 dark:hover:text-white z-10 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={skill.icon} alt={skill.label} className="w-8 h-8 md:w-10 md:h-10 object-contain drop-shadow-md" />
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Marquee 2 (Right Scrolling) */}
              <div className="flex overflow-visible relative group w-full py-2">
                <motion.div
                  className="flex shrink-0 gap-4 md:gap-6 pr-4 md:pr-6 w-max"
                  animate={{ x: ["-50%", "0%"] }}
                  transition={{ duration: 45, ease: "linear", repeat: Infinity }}
                >
                  {bottomMarquee.map((skill, idx) => (
                    <div key={`bottom-${idx}`} title={skill.label} className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl md:rounded-2xl hover:bg-slate-50 dark:hover:bg-white/10 hover:border-indigo-500/50 shadow-sm dark:shadow-md hover:shadow-[0_0_25px_rgba(99,102,241,0.2)] dark:hover:shadow-[0_0_25px_rgba(99,102,241,0.4)] transition-all duration-300 flex-shrink-0 hover:scale-[1.15] cursor-pointer text-slate-500 dark:text-white/70 hover:text-slate-900 dark:hover:text-white z-10 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={skill.icon} alt={skill.label} className="w-8 h-8 md:w-10 md:h-10 object-contain drop-shadow-md" />
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>

          </div>
        </main>

      </div>
    </div>
  );
}

export default Page;