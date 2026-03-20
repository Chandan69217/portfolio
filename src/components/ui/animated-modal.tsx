"use client";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { ScrollArea } from "./scroll-area";

interface ModalContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);

  return (
    <ModalContext.Provider value={{ open, setOpen }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};

export function Modal({ children }: { children: ReactNode }) {
  return <ModalProvider>{children}</ModalProvider>;
}

export const ModalTrigger = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const { setOpen } = useModal();
  return (
    <button
      className={cn(
        "px-4 py-2 rounded-md text-black dark:text-white text-center relative overflow-hidden",
        className
      )}
      onClick={() => setOpen(true)}
    >
      {children}
    </button>
  );
};

export const ModalBody = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const { open } = useModal();

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") setOpen(false);
      });
    }
  }, []);
  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "auto";
      window.dispatchEvent(new CustomEvent("modal-close"));
      return;
    }

    document.body.style.overflow = "hidden";
    window.dispatchEvent(new CustomEvent("modal-open"));

    // Block wheel events that originate OUTSIDE the modal at the capture phase.
    // Events inside the modal pass through, so overflow-y-auto scrolls natively.
    const blockOutsideWheel = (e: WheelEvent) => {
      if (modalRef.current && modalRef.current.contains(e.target as Node)) return; // inside modal → allow
      e.preventDefault();
      e.stopPropagation();
    };
    document.addEventListener("wheel", blockOutsideWheel, { capture: true, passive: false });
    return () => document.removeEventListener("wheel", blockOutsideWheel, { capture: true });
  }, [open]);

  const modalRef = useRef<HTMLDivElement>(null);
  const { setOpen } = useModal();
  useOutsideClick(modalRef, () => setOpen(false));

  // Native capture-phase wheel listener on the modal container.
  // This runs BEFORE Lenis' bubble-phase document listener, so
  // stopPropagation here prevents Lenis from ever seeing the event.
  useEffect(() => {
    const el = modalRef.current;
    if (!el) return;
    const stopWheel = (e: WheelEvent) => {
      // Allow the event to bubble up from children (like the scrollable div)
      // but stop it before it reaches the document/Lenis.
      e.stopPropagation();
    };
    // Use capture: false (bubble phase) so children get the event first.
    el.addEventListener("wheel", stopWheel, { capture: false, passive: true });
    return () => el.removeEventListener("wheel", stopWheel, { capture: false });
  }, [open]); // re-attach when modal opens (ref mounts)

  // Separate footer children from content children
  const childArray = React.Children.toArray(children);
  const footerChildren = childArray.filter(
    (child) => React.isValidElement(child) && child.type === ModalFooter
  );
  const contentChildren = childArray.filter(
    (child) => !(React.isValidElement(child) && child.type === ModalFooter)
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
            backdropFilter: "blur(10px)",
          }}
          exit={{
            opacity: 0,
            backdropFilter: "blur(0px)",
          }}
          className="modall fixed [perspective:800px] [transform-style:preserve-3d] inset-0 h-full w-full  flex items-center justify-center z-50"
        >
          <Overlay />

          <motion.div
            ref={modalRef}
            className={cn(
              "min-h-[50%] max-h-[90%] md:max-w-[40%] bg-white dark:bg-neutral-950 border border-transparent dark:border-neutral-800 md:rounded-2xl relative z-50 flex flex-col flex-1 overflow-hidden",
              className
            )}
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            initial={{
              opacity: 0,
              scale: 0.5,
              rotateX: 40,
              y: 40,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              rotateX: 0,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.8,
              rotateX: 10,
            }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 15,
            }}
          >
            <CloseIcon />
            {/* Scrollable content area — no scrollbar, native overflow scroll */}
            <div
              data-lenis-prevent
              className="flex-1 overflow-y-auto overscroll-contain no-scrollbar"
              style={{
                minHeight: 0,
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {contentChildren}
            </div>
            {/* Sticky footer — always at bottom, never scrolls */}
            {footerChildren.length > 0 && (
              <div className="flex-shrink-0">
                {footerChildren}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const ModalContent = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col flex-1 p-3 md:p-10", className)}>
      {children}
    </div>
  );
};

export const ModalFooter = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "flex justify-end p-4 bg-gray-100 dark:bg-neutral-900",
        className
      )}
    >
      {children}
    </div>
  );
};

const Overlay = ({ className }: { className?: string }) => {
  const { setOpen } = useModal();
  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
        backdropFilter: "blur(10px)",
      }}
      exit={{
        opacity: 0,
        backdropFilter: "blur(0px)",
      }}
      className={`modal-overlay fixed inset-0 h-full w-full bg-black bg-opacity-50 z-50 ${className}`}
      onClick={() => setOpen(false)}
    ></motion.div>
  );
};

const CloseIcon = () => {
  const { setOpen } = useModal();
  return (
    <button
      onClick={() => setOpen(false)}
      className="absolute top-4 right-4 group z-[9999]"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="36"
        height="36"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-black dark:text-white h-4 w-4 group-hover:scale-125 group-hover:rotate-3 transition duration-200"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M18 6l-12 12" />
        <path d="M6 6l12 12" />
      </svg>
    </button>
  );
};

// Hook to detect clicks outside of a component.
// Add it in a separate file, I've added here for simplicity
export const useOutsideClick = (
  ref: React.RefObject<HTMLDivElement | null>,
  callback: Function
) => {
  useEffect(() => {
    const listener = (
      event: any
      //  React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
    ) => {
      // DO NOTHING if the element being clicked is the target element or their children
      if (
        !ref.current ||
        ref.current.contains(event.target) ||
        !event.target.classList.contains("no-click-outside")
      ) {
        return;
      }
      callback(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, callback]);
};
