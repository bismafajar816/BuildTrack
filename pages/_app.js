import { useRouter } from "next/router";
import "../styles/globals.css";
import { AuthProvider } from "../context/AuthContext";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Projects", href: "/projects" },
  { label: "Reports", href: "/projects/browse" },
  { label: "Team", href: "/team" },
  { label: "Analytics", href: "/analytics" },
];

function TopBar() {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm text-gray-800">
      {/* ─── TOP BAR – GRADIENT ─── */}
      <div className="bg-gradient-to-r from-navy via-[#1a3a6a] to-[#2a4a7a]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-bold text-navy shadow-sm">
              BT
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight text-white">BuildTrack</p>
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/80">
                Construction clarity
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 text-right sm:flex-row sm:items-center sm:gap-3 md:gap-4">
            <span className="max-w-[160px] text-[10px] font-medium leading-snug text-white/85 sm:max-w-none sm:text-xs md:text-sm">
              Build smarter. Deliver stronger.
            </span>
            <span className="hidden h-4 w-px bg-white/30 sm:block" />
            <span className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white sm:px-3 sm:py-1 sm:text-[10px] md:text-xs">
              Trusted execution
            </span>
          </div>
        </div>
      </div>

      {/* ─── SPACER ─── */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      {/* ─── NAVIGATION – updated active/hover states ─── */}
      <nav aria-label="Main navigation" className="bg-gray-50/90 backdrop-blur-sm">
        <div className="flex w-full items-stretch px-4 py-1.5 sm:px-6 lg:px-8">
          {navItems.map((item, index) => {
            const isActive = router.pathname === item.href;

            return (
              <a
                key={item.label}
                href={item.href}
                className={[
                  "flex-1 text-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                  // Non‑active: hover with navy tint
                  !isActive && "hover:bg-navy/10 text-gray-700",
                  // Active: solid navy, white text, subtle ring
                  isActive
                    ? "bg-navy text-white font-semibold shadow-sm ring-1 ring-navy/30"
                    : "bg-transparent text-gray-600",
                  // Divider
                  index < navItems.length - 1
                    ? "border-r border-gray-200/70"
                    : "",
                ].join(" ")}
              >
                {item.label}
              </a>
            );
          })}
        </div>
      </nav>
    </header>
  );
}

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <TopBar />
        <Component {...pageProps} />
      </div>
    </AuthProvider>
  );
}