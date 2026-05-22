import { Link } from "@tanstack/react-router";
import { Twitter, Facebook, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border mt-16 bg-card">
      <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Live Lottery Result. All rights reserved.</p>
        <nav className="flex gap-4">
          <Link to="/about" className="hover:text-foreground">About</Link>
          <Link to="/contact" className="hover:text-foreground">Contact</Link>
          <Link to="/history" className="hover:text-foreground">History</Link>
        </nav>
        <div className="flex items-center gap-3">
          <a href="#" aria-label="Twitter" className="hover:text-foreground"><Twitter className="h-4 w-4" /></a>
          <a href="#" aria-label="Facebook" className="hover:text-foreground"><Facebook className="h-4 w-4" /></a>
          <a href="#" aria-label="Instagram" className="hover:text-foreground"><Instagram className="h-4 w-4" /></a>
        </div>
      </div>
    </footer>
  );
}
