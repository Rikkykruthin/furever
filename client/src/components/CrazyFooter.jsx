"use client";
import Link from "next/link";
import { 
  PawPrint, 
  Mail, 
  ArrowUpRight,
  Twitter,
  Instagram,
  Linkedin,
  Facebook
} from "lucide-react";

export default function CrazyFooter() {
  const currentYear = new Date().getFullYear();

  const navigation = {
    services: [
      { name: "Pet Adoption", href: "/adoption" },
      { name: "Vet Consultation", href: "/vet-consultation" },
      { name: "Pet Store", href: "/store" },
      { name: "Pet Grooming", href: "/pet-grooming" },
      { name: "Pet Training", href: "/pet-training" },
    ],
    support: [
      { name: "Emergency", href: "/emergency" },
      { name: "Donate", href: "/donate" },
      { name: "Volunteer", href: "/volunteer" },
      { name: "Community", href: "/community" },
    ],
    company: [
      { name: "About", href: "/about" },
      { name: "Contact", href: "/contact" },
      { name: "Careers", href: "/careers" },
      { name: "Blog", href: "/blog" },
    ],
    legal: [
      { name: "Privacy", href: "/privacy" },
      { name: "Terms", href: "/terms" },
      { name: "Cookies", href: "/cookies" },
    ],
  };

  const socialLinks = [
    { name: "Twitter", icon: Twitter, href: "#" },
    { name: "Instagram", icon: Instagram, href: "#" },
    { name: "LinkedIn", icon: Linkedin, href: "#" },
    { name: "Facebook", icon: Facebook, href: "#" },
  ];

  return (
    <footer className="bg-slate-950 dark:bg-black text-white">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="mb-20 pb-20 border-b border-slate-800">
          <div className="max-w-4xl">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Ready to make a difference?
            </h2>
            <p className="text-xl md:text-2xl text-slate-400 mb-8 leading-relaxed">
              Join our community of pet lovers and animal welfare advocates. 
              Together, we can create a better world for our furry friends.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                href="/emergency"
                className="inline-flex items-center gap-2 bg-white text-slate-950 px-8 py-4 rounded-full font-semibold hover:bg-slate-100 transition-colors group"
              >
                Report Emergency
                <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
              <Link 
                href="/adoption"
                className="inline-flex items-center gap-2 border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-slate-950 transition-colors group"
              >
                Adopt a Pet
                <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
          <div className="lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
              <div className="p-2 bg-white rounded-lg group-hover:scale-110 transition-transform">
                <PawPrint className="w-6 h-6 text-slate-950" />
              </div>
              <span className="text-2xl font-bold">FurEver</span>
            </Link>
            <p className="text-slate-400 mb-8 leading-relaxed max-w-sm">
              A platform dedicated to street animal welfare and creating a vibrant 
              pet-loving community.
            </p>
            <div className="space-y-3">
              <a 
                href="mailto:hello@furever.com" 
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
              >
                <Mail className="w-4 h-4" />
                <span>hello@furever.com</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-slate-500">Services</h3>
            <ul className="space-y-3">
              {navigation.services.map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className="text-slate-400 hover:text-white transition-colors inline-block"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-slate-500">Support</h3>
            <ul className="space-y-3">
              {navigation.support.map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className="text-slate-400 hover:text-white transition-colors inline-block"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-slate-500">Company</h3>
            <ul className="space-y-3">
              {navigation.company.map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className="text-slate-400 hover:text-white transition-colors inline-block"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-slate-500">Legal</h3>
            <ul className="space-y-3">
              {navigation.legal.map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href}
                    className="text-slate-400 hover:text-white transition-colors inline-block"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mb-16 pb-16 border-b border-slate-800">
          <div className="max-w-2xl">
            <h3 className="text-2xl font-bold mb-3">Stay in the loop</h3>
            <p className="text-slate-400 mb-6">
              Get updates on rescued animals, adoption stories, and ways you can help.
            </p>
            <form className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-3 bg-slate-900 border border-slate-800 rounded-full text-white placeholder-slate-500 focus:outline-none focus:border-slate-600 transition-colors"
              />
              <button 
                type="submit"
                className="px-8 py-3 bg-white text-slate-950 rounded-full font-semibold hover:bg-slate-100 transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500">
            <span>© {currentYear} FurEver</span>
            <span className="hidden sm:inline">•</span>
            <span>All rights reserved</span>
          </div>

          <div className="flex items-center gap-4">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.href}
                  aria-label={social.name}
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
