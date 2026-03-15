"use client";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { Moon, Sun, User, LogOut } from "lucide-react";
import { getToken, getUserByToken } from "@/actions/userActions";
import { logoutAction } from "@/actions/loginActions";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NavbarWrapper() {
  const navItems = [
    { name: "Home", link: "/" },
    { name: "Community", link: "/community" },
    { name: "Chat", link: "/chat" },
    { name: "Pet Store", link: "/store" },
    { name: "Vet Services", link: "/vet-consultation" },
    { name: "Pet Training", link: "/pet-training" },
    { name: "Pet Grooming", link: "/pet-grooming" },
    { name: "Street Animals", link: "/street-animals" },
    { name: "Emergency", link: "/emergency" },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userToken = await getToken("userToken");
      const sellerToken = await getToken("sellerToken");
      const adminToken = await getToken("adminToken");
      const token = userToken || sellerToken || adminToken;
      if (token) {
        const response = await getUserByToken(token);
        if (response.success) {
          setUser(response.user);
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutAction();
      setUser(null);
      router.push("/login");
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "digest" in error &&
        error.digest?.startsWith("NEXT_REDIRECT")
      ) {
        setUser(null);
        return;
      }
      setUser(null);
      router.push("/login");
    }
  };

  return (
    <Navbar>
      {/* Desktop Navigation */}
      <NavBody>
        <NavbarLogo />
        <NavItems items={navItems} />
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
          {user ? (
            <>
              <Link href="/profile">
                <NavbarButton variant="secondary">
                  <User className="h-4 w-4 inline mr-2" />
                  Profile
                </NavbarButton>
              </Link>
              <NavbarButton variant="primary" onClick={handleLogout}>
                <LogOut className="h-4 w-4 inline mr-2" />
                Logout
              </NavbarButton>
            </>
          ) : (
            <>
              <Link href="/login">
                <NavbarButton variant="secondary">Login</NavbarButton>
              </Link>
              <Link href="/register">
                <NavbarButton variant="primary">Sign Up</NavbarButton>
              </Link>
            </>
          )}
        </div>
      </NavBody>

      {/* Mobile Navigation */}
      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </div>
        </MobileNavHeader>
        <MobileNavMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        >
          {navItems.map((item, idx) => (
            <Link
              key={`mobile-link-${idx}`}
              href={item.link}
              onClick={() => setIsMobileMenuOpen(false)}
              className="relative text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors py-2"
            >
              <span className="block text-base font-medium">{item.name}</span>
            </Link>
          ))}
          <div className="flex w-full flex-col gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            {user ? (
              <>
                <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                  <NavbarButton variant="secondary" className="w-full">
                    <User className="h-4 w-4 inline mr-2" />
                    Profile
                  </NavbarButton>
                </Link>
                <NavbarButton
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  variant="primary"
                  className="w-full"
                >
                  <LogOut className="h-4 w-4 inline mr-2" />
                  Logout
                </NavbarButton>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <NavbarButton variant="secondary" className="w-full">
                    Login
                  </NavbarButton>
                </Link>
                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <NavbarButton variant="primary" className="w-full">
                    Sign Up
                  </NavbarButton>
                </Link>
              </>
            )}
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
