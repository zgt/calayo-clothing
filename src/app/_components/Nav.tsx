"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  type LucideIcon,
  Home,
  User,
  Briefcase,
  FileText,
  ChevronDown,
} from "lucide-react";
import { useMobile } from "~/context/mobile-provider";

interface DropdownItem {
  name: string;
  url: string;
}

interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
  dropdown?: DropdownItem[];
}

interface NavBarProps {
  items: NavItem[];
  className?: string;
}

// Helper function for utility classes
function cn(...inputs: (string | undefined | null | boolean)[]) {
  return inputs.filter(Boolean).join(" ");
}

export function NavBar({ items, className }: NavBarProps) {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("");
  const { isMobile } = useMobile();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Set active tab based on current pathname
  useEffect(() => {
    const currentItem = items.find((item) => {
      if (item.url === pathname) return true;
      if (item.dropdown) {
        return item.dropdown.some(
          (dropdownItem) => dropdownItem.url === pathname,
        );
      }
      return false;
    });
    if (currentItem) {
      setActiveTab(currentItem.name);
    } else {
      // Handle special case: if no direct match found, clear active tab
      setActiveTab("");
    }
  }, [pathname, items]);

  // Remove the resize useEffect since useMobile handles this

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleItemClick = (item: NavItem) => {
    if (item.dropdown) {
      setOpenDropdown(openDropdown === item.name ? null : item.name);
    } else {
      setActiveTab(item.name);
      setOpenDropdown(null);
    }
  };

  return (
    <div
      className={cn(
        "pointer-events-none fixed bottom-0 left-1/2 z-50 mb-6 h-fit w-fit -translate-x-1/2 sm:top-0 sm:pt-6",
        className,
      )}
    >
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-emerald-800/30 bg-emerald-900/20 px-1 py-1 shadow-lg backdrop-blur-lg">
        {items.map((item) => {
          const Icon = item.icon;
          const hasDropdown = item.dropdown && item.dropdown.length > 0;
          const isDropdownOpen = openDropdown === item.name;
          // Only highlight if this is the active tab AND dropdown is not open on another item
          const isActive = activeTab === item.name && !openDropdown;
          // Highlight dropdown button when it's open OR when on a page that matches dropdown items
          const isOnDropdownPage =
            hasDropdown &&
            item.dropdown?.some(
              (dropdownItem) => dropdownItem.url === pathname,
            );
          const isDropdownActive =
            hasDropdown && (isDropdownOpen || isOnDropdownPage);

          return (
            <div
              key={item.name}
              className="relative"
              ref={hasDropdown ? dropdownRef : undefined}
            >
              {hasDropdown ? (
                <button
                  onClick={() => handleItemClick(item)}
                  className={cn(
                    "relative flex cursor-pointer items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors md:px-6",
                    "text-emerald-100/80 hover:text-white",
                    "md:gap-1",
                    isDropdownActive && "bg-emerald-800/30 text-white",
                  )}
                >
                  <span className="hidden md:inline">{item.name}</span>
                  <span className="md:hidden">
                    <Icon size={18} strokeWidth={2.5} />
                  </span>
                  <ChevronDown
                    size={14}
                    className={cn(
                      "transition-transform",
                      isDropdownOpen && "rotate-180",
                    )}
                  />
                  {isDropdownActive && (
                    <motion.div
                      layoutId="lamp"
                      className="absolute inset-0 -z-10 w-full rounded-full bg-emerald-400/10"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    >
                      <div className="absolute -bottom-2 left-1/2 h-1 w-10 -translate-x-1/2 rounded-b-full bg-emerald-400 sm:-top-2 sm:w-8 sm:rounded-t-full sm:rounded-b-none">
                        <div className="absolute -bottom-2 -left-2 h-6 w-14 rounded-full bg-emerald-400/20 blur-md sm:-top-2 sm:w-12" />
                        <div className="absolute -bottom-1 h-6 w-10 rounded-full bg-emerald-400/20 blur-md sm:-top-1 sm:w-8" />
                        <div className="absolute bottom-0 left-2 h-4 w-6 rounded-full bg-emerald-400/20 blur-sm sm:top-0 sm:w-4" />
                      </div>
                    </motion.div>
                  )}
                </button>
              ) : (
                <Link
                  href={item.url}
                  onClick={() => handleItemClick(item)}
                  className={cn(
                    "relative flex cursor-pointer items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors md:px-6",
                    "text-emerald-100/80 hover:text-white",
                    "md:gap-1",
                    isActive && "bg-emerald-800/30 text-white",
                  )}
                >
                  <span className="hidden md:inline">{item.name}</span>
                  <span className="md:hidden">
                    <Icon size={18} strokeWidth={2.5} />
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="lamp"
                      className="absolute inset-0 -z-10 w-full rounded-full bg-emerald-400/10"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    >
                      <div className="absolute -bottom-2 left-1/2 h-1 w-10 -translate-x-1/2 rounded-b-full bg-emerald-400 sm:-top-2 sm:w-8 sm:rounded-t-full sm:rounded-b-none">
                        <div className="absolute -bottom-2 -left-2 h-6 w-14 rounded-full bg-emerald-400/20 blur-md sm:-top-2 sm:w-12" />
                        <div className="absolute -bottom-1 h-6 w-10 rounded-full bg-emerald-400/20 blur-md sm:-top-1 sm:w-8" />
                        <div className="absolute bottom-0 left-2 h-4 w-6 rounded-full bg-emerald-400/20 blur-sm sm:top-0 sm:w-4" />
                      </div>
                    </motion.div>
                  )}
                </Link>
              )}

              <AnimatePresence>
                {hasDropdown && isDropdownOpen && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: isMobile ? 10 : -10,
                      scale: 0.95,
                    }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: isMobile ? 10 : -10, scale: 0.95 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                    className={cn(
                      "absolute left-1/2 z-50 min-w-[160px] -translate-x-1/2 rounded-xl border border-emerald-800/30 bg-emerald-900/20 py-2 shadow-lg backdrop-blur-lg",
                      isMobile ? "bottom-full mb-2" : "top-full mt-2",
                    )}
                  >
                    {item.dropdown!.map((dropdownItem) => (
                      <Link
                        key={dropdownItem.name}
                        href={dropdownItem.url}
                        onClick={() => {
                          setActiveTab(item.name);
                          setOpenDropdown(null);
                        }}
                        className="block px-4 py-2 text-sm text-emerald-100/80 transition-colors hover:bg-emerald-800/20 hover:text-white"
                      >
                        {dropdownItem.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Nav() {
  const navItems: NavItem[] = [
    { name: "Home", url: "/", icon: Home },
    {
      name: "Commissions",
      url: "/commissions",
      icon: Briefcase,
      dropdown: [
        { name: "Create Commission", url: "/commissions" },
        { name: "My Orders", url: "/profile/orders" },
      ],
    },
    { name: "Features", url: "/features", icon: FileText },
    { name: "About", url: "/about", icon: User },
  ];

  return <NavBar items={navItems} />;
}
