import { Link, useLocation } from "react-router-dom";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const active = (p:string)=> pathname===p ? "text-white" : "text-slate-300 hover:text-white";
  return (
    <div className="app-bg min-h-screen text-slate-100">
      <header className="border-b border-white/10 backdrop-blur sticky top-0 z-20">
        <nav className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/" className="font-bold tracking-wide">A World Away</Link>
          <div className="flex items-center gap-5 text-sm">
            <Link className={active("/upload")} to="/upload">Cargar</Link>
            <Link className={active("/results")} to="/results">Resultados</Link>
            <Link className={active("/education")} to="/education">Aprender</Link>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">{children}</main>

      <footer className="max-w-7xl mx-auto px-6 py-10 text-xs text-slate-400">
        Hecho para Space Apps • Demo • Datos: Kepler/TESS (CSV)
      </footer>
    </div>
  );
}
