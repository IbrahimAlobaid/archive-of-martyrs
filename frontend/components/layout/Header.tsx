import Link from "next/link";

const links = [
  { href: "/", label: "الرئيسية" },
  { href: "/martyrs", label: "أرشيف الشهداء" },
  { href: "/about", label: "عن المنصة" },
  { href: "/contact", label: "تواصل وتصحيح" }
];

export function Header() {
  return (
    <header className="border-b border-stone/80 bg-sand/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-8">
        <Link href="/" className="text-lg font-semibold tracking-tight text-ink md:text-xl">
          أرشيف الشهداء
        </Link>
        <nav aria-label="التنقل الرئيسي" className="flex items-center gap-4 text-sm text-muted md:gap-6">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
