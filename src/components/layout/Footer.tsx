import Link from "next/link";
import { Logo } from "@/components/visuals/Logo";
import { footerNav, legalNav } from "@/config/nav";
import { site, whatsappLink } from "@/config/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-line bg-void">
      <div aria-hidden className="grid-backdrop grid-backdrop--fine opacity-60" />
      <div
        aria-hidden
        className="halo left-1/2 top-full size-[520px] -translate-x-1/2 -translate-y-1/2"
      />

      <div className="shell relative py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-ash">
              {site.shortDescription}
            </p>
            <p className="mt-6 font-display text-lg text-silver">{site.slogan}</p>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            {footerNav.map((group) => (
              <div key={group.title}>
                <h3 className="font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-gold">
                  {group.title}
                </h3>
                <ul className="mt-5 space-y-3">
                  {group.items.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="inline-flex items-center gap-2 text-sm text-ash transition-colors duration-300 hover:text-chalk"
                      >
                        {item.label}
                        {item.soon ? (
                          <span className="font-mono text-[0.5625rem] uppercase tracking-widest text-gold-deep">
                            breve
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 rule" />

        <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ash">
            <a
              href={`mailto:${site.contact.email}`}
              className="link-underline transition-colors hover:text-chalk"
            >
              {site.contact.email}
            </a>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline transition-colors hover:text-chalk"
            >
              WhatsApp {site.contact.whatsappLabel}
            </a>
            <a
              href={site.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline transition-colors hover:text-chalk"
            >
              Instagram
            </a>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ash">
            {legalNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="link-underline transition-colors hover:text-chalk"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-ash/70">
            © {year} {site.name} — Fabricação criativa
          </p>
        </div>
      </div>
    </footer>
  );
}
