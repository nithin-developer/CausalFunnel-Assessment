import { NavLink, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Header() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#e5e7eb] bg-[#f8faf7]/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-6 md:px-12 max-w-[1200px] mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white font-bold text-xs">
            CF
          </div>
          <span className="text-xl font-bold tracking-tight text-black">
            CausalFunnel
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <NavLink
            to="/"
            className={`text-sm font-medium transition-colors hover:text-black ${
              location.pathname === "/"
                ? "text-black font-semibold "
                : "text-muted-foreground"
            }`}
          >
            Home
          </NavLink>
          <NavLink
            to="/sessions"
            end
            className={`text-sm font-medium transition-colors hover:text-black ${
              location.pathname === "/sessions"
                ? "text-black font-semibold "
                : "text-muted-foreground"
            }`}
          >
            Sessions
          </NavLink>
          <NavLink
            to="/heatmap"
            className={`text-sm font-medium transition-colors hover:text-black ${
              location.pathname.startsWith("/heatmap")
                ? "text-black font-semibold "
                : "text-muted-foreground"
            }`}
          >
            Heatmap
          </NavLink>

          <div className="flex items-center gap-4 ml-4 border-l border-border pl-8">
            <Button
              variant="ghost"
              className="font-semibold px-2 hover:bg-transparent hover:text-black/80"
            >
              Sign In
            </Button>
            <Button className="bg-black text-white hover:bg-black/90 font-semibold rounded-none px-6 py-4">
              Get Started Free
            </Button>
          </div>
        </nav>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center gap-4">
          <Button className="bg-black text-white hover:bg-black/90 font-semibold rounded-none text-xs h-8 px-4">
            Get Started
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" />}>
              <Menu className="w-5 h-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] flex flex-col gap-6 p-10">
              <SheetHeader className="text-left hidden">
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-6">
                <NavLink
                  to="/"
                  onClick={() => setOpen(false)}
                  className={`text-lg font-medium transition-colors hover:text-black ${
                    location.pathname === "/" ? "text-black font-semibold" : "text-muted-foreground"
                  }`}
                >
                  Home
                </NavLink>
                <NavLink
                  to="/sessions"
                  onClick={() => setOpen(false)}
                  className={`text-lg font-medium transition-colors hover:text-black ${
                    location.pathname === "/sessions" ? "text-black font-semibold" : "text-muted-foreground"
                  }`}
                >
                  Sessions
                </NavLink>
                <NavLink
                  to="/heatmap"
                  onClick={() => setOpen(false)}
                  className={`text-lg font-medium transition-colors hover:text-black ${
                    location.pathname.startsWith("/heatmap") ? "text-black font-semibold" : "text-muted-foreground"
                  }`}
                >
                  Heatmap
                </NavLink>
              </div>
              <div className="flex flex-col gap-3 mt-4 border-t pt-6">
                <Button variant="ghost" className="w-full justify-start font-semibold px-0 hover:bg-transparent text-muted-foreground hover:text-black">
                  Sign In
                </Button>
                <Button className="bg-black text-white hover:bg-black/90 font-semibold rounded-none w-full py-6 text-base">
                  Get Started Free
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
