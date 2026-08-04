import "../styles/globals.css";
import { AuthProvider } from "../context/AuthContext";

function TopBar() {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy text-sm font-bold text-white shadow-sm">
            BT
          </div>
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-900">BuildTrack</p>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
              Construction clarity
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 text-right sm:flex-row sm:items-center sm:gap-3 md:gap-4">
          <span className="max-w-[160px] text-[10px] font-medium leading-snug text-slate-600 sm:max-w-none sm:text-xs md:text-sm">
            Build smarter. Deliver stronger.
          </span>
          <span className="hidden h-4 w-px bg-slate-300 sm:block" />
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-600 sm:px-3 sm:py-1 sm:text-[10px] md:text-xs">
            Trusted execution
          </span>
        </div>
      </div>
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
