"use client";
import { usePortfolioData } from "@/contexts/PortfolioDataContext";

import { useInView } from "framer-motion";
import React, { useRef } from "react";
import { Button } from "../ui/button";
import { SiGithub, SiInstagram } from "react-icons/si";
import { FaTelegramPlane, FaLinkedin } from "react-icons/fa";
import Link from "next/link";

const SocialMediaButtons = () => {
  const ref = useRef<HTMLDivElement>(null);
  const show = useInView(ref, { once: true });
  const { data } = usePortfolioData();
  const config = data?.config;

  if (!config) return null;

  const BUTTONS = [
    {
      name: "Github",
      href: config.social.github,
      icon: <SiGithub size={"24"} color={"#fff"} />,
    },
    {
      name: "LinkedIn",
      href: config.social.linkedin,
      icon: <FaLinkedin size={"24"} color={"#fff"} />,
    },
    {
      name: "Telegram",
      href: config.social.telegram,
      icon: <FaTelegramPlane size={"24"} color={"#fff"} />,
    },
    {
      name: "Instagram",
      href: config.social.instagram,
      icon: <SiInstagram size={"24"} color={"#fff"} />,
    },
  ];

  return (
    <div ref={ref} className="z-10">
      {show &&
        BUTTONS.map((button) => (
          <Link href={button.href} key={button.name} target="_blank">
            <Button variant={"ghost"}>{button.icon}</Button>
          </Link>
        ))}
    </div>
  );
};

export default SocialMediaButtons;
