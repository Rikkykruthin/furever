"use client";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { Menu, X, PawPrint } from "lucide-react";

export const Navbar = ({ children, className }) => {
  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-lg dark:border-neutral-800 dark:bg-black/80",
        className
      )}
    >
      {children}
    </nav>
  );
};

export const NavBody = ({ children, className }) => {
  return (
    <div
      className={cn(
        "mx-auto hidden max-w-7xl items-center justify-between px-4 py-4 md:flex",
        className
      )}
    >
      {children}
    </div>
  );
};

export const NavbarLogo = ({ className }) => {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2 text-xl font-bold text-neutral-900 dark:text-neutral-100",
        className
      )}
    >
      <div className="rounded-full bg-primary p-2">
        <PawPrint className="h-5 w-5 text-white" />
      </div>
      <span className="titlefont">FurEver</span>
    </Link>
  );
};

export const NavItems = ({ items, className }) => {
  return (
    <div className={cn("flex items-center gap-8", className)}>
      {items.map((item, idx) => (
        <Link
          key={`nav-item-${idx}`}
          href={item.link}
          className="relative text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          {item.name}
        </Link>
      ))}
    </div>
  );
};

export const NavbarButton = ({
  children,
  variant = "primary",
  className,
  onClick,
}) => {
  const variants = {
    primary:
      "bg-primary text-white hover:bg-primary/90 shadow-md hover:shadow-lg",
    secondary:
      "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200",
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
};

export const MobileNav = ({ children, className }) => {
  return (
    <div className={cn("flex flex-col md:hidden", className)}>{children}</div>
  );
};

export const MobileNavHeader = ({ children, className }) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 py-4",
        className
      )}
    >
      {children}
    </div>
  );
};

export const MobileNavToggle = ({ isOpen, onClick, className }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800",
        className
      )}
      aria-label="Toggle menu"
    >
      {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
    </button>
  );
};

export const MobileNavMenu = ({ isOpen, onClose, children, className }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={cn(
            "overflow-hidden border-t border-neutral-200 dark:border-neutral-800",
            className
          )}
        >
          <div className="flex flex-col gap-4 px-4 py-6">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
