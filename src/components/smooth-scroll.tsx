"use client";

import React, { useEffect } from "react";
import { ReactLenis, useLenis } from "@/lib/lenis";

interface LenisProps {
  children: React.ReactNode;
  isInsideModal?: boolean;
}

function SmoothScroll({ children, isInsideModal = false }: LenisProps) {
  const lenis = useLenis(({ scroll }) => {
    // called every scroll
  });

  useEffect(() => {
    document.addEventListener("DOMContentLoaded", () => {
      lenis?.stop();
      lenis?.start();
    });
  }, []);

  // Stop Lenis completely when any modal opens, restart when it closes
  useEffect(() => {
    const handleModalOpen = () => lenis?.stop();
    const handleModalClose = () => lenis?.start();
    window.addEventListener("modal-open", handleModalOpen);
    window.addEventListener("modal-close", handleModalClose);
    return () => {
      window.removeEventListener("modal-open", handleModalOpen);
      window.removeEventListener("modal-close", handleModalClose);
    };
  }, [lenis]);

  return (
    <ReactLenis
      root
      options={{
        duration: 2,
        prevent: (node) => {
          // Walk up the DOM to check if this node is inside an open modal
          let el: Element | null = node;
          while (el) {
            if (
              el.classList.contains("modall") ||
              el.hasAttribute("data-lenis-prevent")
            ) {
              return true;
            }
            el = el.parentElement;
          }
          return false;
        },
      }}
    >
      {children}
    </ReactLenis>
  );
}

export default SmoothScroll;
