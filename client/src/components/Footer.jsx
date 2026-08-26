import { Link } from "react-router-dom";
import { Camera, Music2, MessageCircle } from "lucide-react";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { label: "Women", to: "/shop/women" },
      { label: "Men", to: "/shop/men" },
      { label: "New Arrivals", to: "/shop?sort=newest" },
      { label: "Collections", to: "/shop" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Contact", to: "#contact" },
      { label: "FAQ", to: "#faq" },
      { label: "Shipping", to: "#shipping" },
      { label: "Returns", to: "#returns" },
      { label: "Size Guide", to: "#size-guide" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Our Story", to: "/about" },
      { label: "Journal", to: "#journal" },
    ],
  },
];

const SOCIALS = [
  { label: "Instagram", icon: Camera, href: "#" },
  { label: "TikTok", icon: Music2, href: "#" },
  { label: "Pinterest", icon: MessageCircle, href: "#" },
];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-bg">
      <div className="mx-auto max-w-[1600px] px-5 py-16 sm:px-8 lg:py-24">
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-5">
          <div className="col-span-2 flex flex-col gap-4 lg:col-span-2">
            <span className="font-heading text-3xl tracking-[0.2em]">VELORA</span>
            <p className="max-w-xs text-sm text-muted">
              Timeless silhouettes and premium materials, designed for the everyday.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title} className="flex flex-col gap-4">
              <h3 className="label text-muted">{col.title}</h3>
              <ul className="flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="link-underline text-sm">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="flex flex-col gap-4">
            <h3 className="label text-muted">Social</h3>
            <ul className="flex flex-col gap-3">
              {SOCIALS.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    className="link-underline inline-flex items-center gap-2 text-sm"
                  >
                    <social.icon size={14} strokeWidth={1.5} />
                    {social.label}
                  </a>
                </li>
              ))}
              <li>
                <a href="#newsletter" className="link-underline text-sm">
                  Newsletter
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-line pt-8 text-xs text-muted sm:flex-row sm:items-center">
          <span>© 2026 VELORA. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="#privacy" className="link-underline">
              Privacy
            </a>
            <a href="#terms" className="link-underline">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
