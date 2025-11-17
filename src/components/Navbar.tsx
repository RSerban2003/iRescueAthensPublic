"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import Image from "next/image";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname(); // Get the current route

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  // Disable scrolling when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMenuOpen]);

  // Function to check if a link is active
  const isActive = (path: string) =>
    pathname === path ? "text-purple-600 dark:text-purple-400" : "";

  return (
    <nav className="z-50 sticky top-0 w-full shadow-sm px-8 h-20 flex items-center justify-between border-b border-gray-300 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
      {/* Logo */}
      <div className="flex items-center justify-center">
      <Link href="/" passHref legacyBehavior>
      <a className="block transition-transform hover:scale-105">
        <Image
          src="/irescue-logo.png"
          alt="iRescue Logo"
          width={60}
          height={60}
          className="hover:opacity-90"
        />
      </a>
    </Link>
      <Link href="/" className="hidden sm:flex items-center gap-2">
        <span className="text-4xl font-bold text-purple-600">iRescue</span>
      </Link>
      </div>
      

      {/* Hamburger Menu Icon (Mobile Only) */}
      <div className="sm:hidden cursor-pointer" onClick={toggleMenu}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-purple-600 dark:text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16m-7 6h7"
          />
        </svg>
      </div>

      {/* Desktop Menu (Hidden on Mobile) */}
      <div className="hidden sm:flex gap-8 text-xl">
        <Link href="/about" className={`hover:text-purple-600 dark:hover:text-purple-400 ${isActive("/about")}`}>
          Υπηρεσίες
        </Link>
        <Link href="/repair" className={`hover:text-purple-600 dark:hover:text-purple-400 ${isActive("/repair")}`}>
          Επισκευή
        </Link>
        <Link href="/purchase" className={`hover:text-purple-600 dark:hover:text-purple-400 ${isActive("/purchase")}`}>
          Αγορά Μεταχειρισμένου
        </Link>
        <Link href="/sell" className={`hover:text-purple-600 dark:hover:text-purple-400 ${isActive("/sell")}`}>
          Πούλησέ το
        </Link>
        <Link href="/contact" className={`hover:text-purple-600 dark:hover:text-purple-400 ${isActive("/contact")}`}>
          Επικοινωνία
        </Link>
        <ThemeSwitcher />
      </div>

      {/* Mobile Menu (Fullscreen Overlay) */}
      <div
        className={`fixed inset-0 w-screen h-screen bg-white dark:bg-gray-900 transform transition-all duration-300 ${
          isMenuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        } sm:hidden flex flex-col items-center justify-center gap-8 text-2xl`}
      >
        {/* Close Button */}
        <button onClick={closeMenu} className="absolute top-6 right-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-purple-600 dark:text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Mobile Links */}
        <Link href="/about" className={`hover:text-purple-600 dark:hover:text-purple-400 ${isActive("/about")}`} onClick={closeMenu}>
          Υπηρεσίες
        </Link>
        <Link href="/repair" className={`hover:text-purple-600 dark:hover:text-purple-400 ${isActive("/repair")}`} onClick={closeMenu}>
          Επισκευή
        </Link>
        <Link href="/purchase" className={`hover:text-purple-600 dark:hover:text-purple-400 ${isActive("/purchase")}`} onClick={closeMenu}>
          Αγορά Μεταχειρισμένου
        </Link>
        <Link href="/sell" className={`hover:text-purple-600 dark:hover:text-purple-400 ${isActive("/sell")}`}>
          Πούλησέ το
        </Link>
        <Link href="/contact" className={`hover:text-purple-600 dark:hover:text-purple-400 ${isActive("/contact")}`} onClick={closeMenu}>
          Επικοινωνία
        </Link>
        <ThemeSwitcher />
      </div>
    </nav>
  );
}
