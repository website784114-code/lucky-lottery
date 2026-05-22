import { Link } from "@tanstack/react-router";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="Live Lottery"
            className="h-12 w-12 rounded-full object-contain p-1 sm:h-[50px] sm:w-[50px]"
            loading="eager"
            decoding="async"
          />
          <span className="hidden text-base font-bold text-white sm:inline sm:text-lg">Live Lottery</span>
          <span className="inline text-sm font-bold text-white sm:hidden">Live Lottery</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1 text-sm">
          {[
            { to: "/", label: "Home" },
            { to: "/live", label: "Results" },
            { to: "/history", label: "History" },
            { to: "/contact", label: "Contact" },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
              activeProps={{ className: "px-3 py-1.5 rounded-md text-primary font-medium" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
