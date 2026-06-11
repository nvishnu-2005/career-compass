import { Link } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-glow">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="text-base tracking-tight">Pathway<span className="text-primary">AI</span></span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "rounded-md px-3 py-2 text-foreground font-medium" }}
          >
            Home
          </Link>
          <Link
            to="/recommend"
            className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "rounded-md px-3 py-2 text-foreground font-medium" }}
          >
            Get Recommendation
          </Link>
          <Link
            to="/submissions"
            className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:text-foreground"
            activeProps={{ className: "rounded-md px-3 py-2 text-foreground font-medium" }}
          >
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}
