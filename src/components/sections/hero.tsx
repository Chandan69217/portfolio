import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
import { File, Github, Linkedin } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePreloader } from "../preloader";
import { BlurIn, BoxReveal } from "../reveal-animations";
import ScrollDownIcon from "../scroll-down-icon";
import { SiGithub } from "react-icons/si";
import { FaTelegramPlane, FaLinkedin } from "react-icons/fa";
import { usePortfolioData } from "@/contexts/PortfolioDataContext";

import SectionWrapper from "../ui/section-wrapper";

const HeroSection = () => {
  const { isLoading } = usePreloader();
  const { data } = usePortfolioData();
  const config = data?.config;

  return (
    <SectionWrapper id="hero" className={cn("relative w-full min-h-screen")}>
      <div className="grid md:grid-cols-2 min-h-screen w-full">
        <div
          className={cn(
            "min-h-screen z-[2] col-span-1",
            "flex flex-col justify-center items-start",
            "pt-24 pb-16 md:py-16",
            "px-6 sm:px-12 md:pl-16 lg:pl-20 xl:pl-28 md:pr-4"
          )}
        >
          {!isLoading && (
            <div className="flex flex-col items-start w-full max-w-xl">
              <div>
                <BlurIn delay={0.7}>
                  <p
                    className={cn(
                      "font-thin text-md text-slate-500 dark:text-zinc-400",
                      "cursor-default font-display sm:text-xl md:text-xl whitespace-nowrap bg-clip-text mb-1"
                    )}
                  >
                    Hi, I am
                  </p>
                </BlurIn>

                <BlurIn delay={1}>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <h1
                        className={cn(
                          "-ml-[2px] md:-ml-[4px] leading-[1.05] md:leading-none font-thin text-slate-800 dark:text-white text-left",
                          "font-thin text-5xl sm:text-6xl md:text-6xl lg:text-7xl xl:text-8xl",
                          "cursor-default text-edge-outline font-display"
                        )}
                      >
                        <span className="block">{config?.author.split(" ")[0]}</span>
                        <span className="block">{config?.author.split(" ").slice(1).join(" ")}</span>
                      </h1>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="dark:bg-white dark:text-black"
                    >
                      theres something waiting for you in devtools
                    </TooltipContent>
                  </Tooltip>
                </BlurIn>
                {/* <div className="md:block hidden bg-gradient-to-r from-zinc-300/0 via-zinc-300/50 to-zinc-300/0 w-screen h-px animate-fade-right animate-glow" /> */}
                <BlurIn delay={1.2}>
                  <p
                    className={cn(
                      "mt-4 font-thin text-md text-slate-500 dark:text-zinc-400",
                      "cursor-default font-display sm:text-xl md:text-xl bg-clip-text max-w-xs md:max-w-sm lg:max-w-md xl:max-w-xl leading-relaxed"
                    )}
                  >
                    {config?.description?.short || "A Full Stack Developer"}
                  </p>
                </BlurIn>
              </div>
              <div className="mt-8 flex flex-col gap-3 w-fit">
                <Link
                  href={
                    config?.resumeUrl || '#'
                  }
                  target="_blank"
                  className="flex-1"
                >
                  <BoxReveal delay={2} width="100%" >
                    <Button className="flex items-center gap-2 w-full">
                      <File size={24} />
                      <p>Resume</p>
                    </Button>
                  </BoxReveal>
                </Link>
                <div className="md:self-start flex gap-3">
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <Link href={"#contact"}>
                        <Button
                          variant={"outline"}
                          className="block w-full overflow-hidden"
                        >
                          Hire Me
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>pls 🥹 🙏</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <Link href="/about">
                        <Button
                          variant={"outline"}
                          className="block w-full overflow-hidden"
                        >
                          About Me
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>about me</p>
                    </TooltipContent>
                  </Tooltip>


                  <div className="flex items-center h-full gap-2">
                    <Link
                      href={config?.social.telegram || ""}
                      target="_blank"
                    >
                      <Button variant={"outline"}>
                        <FaTelegramPlane size={24} />
                      </Button>
                    </Link>
                    <Link
                      href={config?.social.github || ""}
                      target="_blank"
                      className="cursor-can-hover"
                    >
                      <Button variant={"outline"}>
                        <SiGithub size={24} />
                      </Button>
                    </Link>
                    <Link
                      href={config?.social.linkedin || ""}
                      target="_blank"
                      className="cursor-can-hover"
                    >
                      <Button variant={"outline"}>
                        <FaLinkedin size={24} />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="grid col-span-1"></div>
      </div>
      <div className="absolute bottom-10 left-[50%] translate-x-[-50%]">
        <ScrollDownIcon />
      </div>
    </SectionWrapper>
  );
};

export default HeroSection;
