import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: "CANLI", href: "#live", active: true },
    { name: "LİDERLİK", href: "#leaderboard" },
    { name: "BLOG", href: "#blog" },
    { name: "MODELLER", href: "#models" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="text-2xl font-display font-bold">
              <span className="text-primary text-glow-primary">Alpha</span>
              <span className="text-foreground">Bet</span>
            </div>
            <span className="text-xs text-muted-foreground">by AI</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  item.active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <a href="#waitlist" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              BEKLEME LİSTESİ ↗
            </a>
            <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              HAKKINDA
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`block py-2 text-sm font-medium ${
                  item.active ? "text-primary" : "text-muted-foreground"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </a>
            ))}
            <div className="mt-4 pt-4 border-t border-border">
              <Button variant="outline" size="sm" className="w-full border-primary text-primary">
                BEKLEME LİSTESİ
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
