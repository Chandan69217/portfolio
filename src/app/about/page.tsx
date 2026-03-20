"use client";
import React, { useEffect, useState } from "react";
import { DiMongodb, DiNginx, DiNpm, DiPostgresql, DiVim } from "react-icons/di";
import {
  FaAws,
  FaCss3,
  FaDocker,
  FaEnvelope,
  FaGit,
  FaGithub,
  FaHtml5,
  FaLinkedin,
  FaLinux,
  FaNodeJs,
  FaPhone,
  FaReact,
  FaVuejs,
  FaYarn,
} from "react-icons/fa6";
import {
  RiFirebaseFill,
  RiTailwindCssFill,
} from "react-icons/ri";
import {
  SiExpress,
  SiKubuntu,
  SiPrettier,
  SiTypescript,
  SiVercel,
  SiVscodium,
  SiJavascript,
} from "react-icons/si";
import { TbTerminal2 } from "react-icons/tb";

// @ts-ignore
import { motion } from "framer-motion";

import { usePortfolioData } from "@/contexts/PortfolioDataContext";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const CONTACT_LINKS = [
  {
    name: "Email",
    content: "naresh.khatri2345@gmail",
    href: "mailto:naresh.khatri2345@gmail.com",
    icon: <FaEnvelope />,
  },
  {
    name: "Phone",
    content: "1234567890",
    href: "tel:1234567890",
    icon: <FaPhone />,
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/naresh-khatri/",
    content: "/naresh-khatri",
    icon: <FaLinkedin />,
  },
  {
    name: "GitHub",
    href: "https://github.com/Naresh-Khatri",
    content: "/naresh-khatri",
    icon: <FaGithub />,
  },
];

const TOOLS = [
  { name: "JavaScript", icon: <SiJavascript size={50} color="#f0db4f" /> },
  { name: "TypeScript", icon: <SiTypescript size={50} color="#007acc" /> },
  { name: "HTML", icon: <FaHtml5 size={50} color="#e34c26" /> },
  { name: "CSS", icon: <FaCss3 size={50} color="#563d7c" /> },
  { name: "Nodejs", icon: <FaNodeJs size={50} color="#6cc24a" /> },
  { name: "React", icon: <FaReact size={50} color="#61dafb" /> },
  { name: "Docker", icon: <FaDocker size={50} color="#2496ed" /> },
  { name: "NginX", icon: <DiNginx size={50} color="#008000" /> },
  { name: "Vue", icon: <FaVuejs size={50} color="#41b883" /> },
  { name: "Express", icon: <SiExpress size={50} /> },
  { name: "Postgres", icon: <DiPostgresql size={50} color="#336791" /> },
  { name: "MongoDB", icon: <DiMongodb size={50} color="#4db33d" /> },
  { name: "Tailwind", icon: <RiTailwindCssFill size={50} color="#06b6d4" /> },
  { name: "Firebase", icon: <RiFirebaseFill size={50} color="#FFCA28" /> },
  { name: "Git", icon: <FaGit size={50} color="#f05032" /> },
  { name: "GitHub", icon: <FaGithub size={50} /> },
  { name: "VS Code", icon: <SiVscodium size={50} color="#007acc" /> },
  { name: "VIM", icon: <DiVim size={50} /> },
  { name: "Prettier", icon: <SiPrettier size={50} color="#f7b93c" /> },
  { name: "NPM", icon: <DiNpm size={50} color="#CB3837" /> },
  { name: "Yarn", icon: <FaYarn size={50} color="#2C8EBB" /> },
  { name: "Vercel", icon: <SiVercel size={50} /> },
  { name: "Linux", icon: <FaLinux size={50} /> },
  { name: "Kubuntu", icon: <SiKubuntu size={50} color="#0077C4" /> },
  { name: "Terminal", icon: <TbTerminal2 size={50} /> },
  { name: "AWS", icon: <FaAws size={50} color="#ff9900" /> },
];

function Page() {
  const { data } = usePortfolioData();
  const config = data?.config;

  const [toolsLoaded, setToolsLoaded] = useState(false);

  useEffect(() => {
    setToolsLoaded(true);
  }, []);

  return (
    <div className="md:px-12 px-8 lg:px-24 pt-32 pb-20 overflow-hidden">
      {/* Back Button */}
      <Link
        href="/"
        className="absolute top-14 left-4 flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full backdrop-blur-md text-sm text-zinc-300 hover:text-white z-50"
      >
        <ArrowLeft size={16} />
        Back to Portfolio
      </Link>

      {/* Layout */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">

        {/* Sidebar */}
        <aside className="w-full lg:w-[30%] xl:w-[25%]">
          <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">
            <div className="flex flex-col items-center">
              <img
                className="rounded-full w-[140px] aspect-square object-cover mb-6"
                src={config?.profilePic || "/assets/me.jpg"}
                alt="me"
              />

              <p className="text-2xl font-bold text-white">
                {config?.author || "Naresh Khatri"}
              </p>

              <p className="text-sm text-zinc-400 mt-2 text-center">
                {config?.description?.short || "Web Developer"}
              </p>
            </div>

            <hr className="my-6 border-white/10" />

            <ul className="flex flex-col gap-3">
              {CONTACT_LINKS.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="flex items-center gap-4 p-3 bg-white/5 rounded-xl hover:bg-white/10"
                  >
                    {link.icon}
                    <div>
                      <p>{link.name}</p>
                      <p className="text-xs text-zinc-400">
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
          <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl">

            <h1 className="text-4xl font-bold mb-6 text-white">
              About Me
            </h1>

            <p className="text-zinc-300 mb-10">
              {config?.description?.long || "Fullstack Developer"}
            </p>

            <h2 className="text-3xl font-bold mb-6 text-white mt-12">
              Stuff I Use
            </h2>

            <div className="relative rounded-3xl py-10 w-full overflow-hidden border border-white/5 bg-black/20 shadow-inner">
              {/* Fade Overlays */}
              <div className="absolute top-0 left-0 w-24 h-full bg-gradient-to-r from-[#111111] to-transparent z-20 pointer-events-none" />
              <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-[#111111] to-transparent z-20 pointer-events-none" />

              {/* Marquee 1 (Left Scrolling) */}
              <div className="flex overflow-visible relative group w-full mb-6 py-2">
                 <motion.div
                   className="flex shrink-0 gap-6 pr-6 w-max"
                   animate={{ x: ["0%", "-50%"] }}
                   transition={{ duration: 40, ease: "linear", repeat: Infinity }}
                 >
                   {[...TOOLS, ...TOOLS, ...TOOLS].reverse().map((tool, idx) => (
                     <div key={idx} className="w-20 h-20 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-indigo-500/50 shadow-md hover:shadow-[0_0_25px_rgba(99,102,241,0.4)] transition-all duration-300 flex-shrink-0 hover:scale-[1.15] cursor-pointer text-white/70 hover:text-white z-10 relative">
                       {tool.icon}
                     </div>
                   ))}
                 </motion.div>
              </div>

              {/* Marquee 2 (Right Scrolling) */}
              <div className="flex overflow-visible relative group w-full py-2">
                 <motion.div
                   className="flex shrink-0 gap-6 pr-6 w-max"
                   animate={{ x: ["-50%", "0%"] }}
                   transition={{ duration: 45, ease: "linear", repeat: Infinity }}
                 >
                   {[...TOOLS, ...TOOLS, ...TOOLS].map((tool, idx) => (
                     <div key={idx} className="w-20 h-20 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-indigo-500/50 shadow-md hover:shadow-[0_0_25px_rgba(99,102,241,0.4)] transition-all duration-300 flex-shrink-0 hover:scale-[1.15] cursor-pointer text-white/70 hover:text-white z-10 relative">
                       {tool.icon}
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