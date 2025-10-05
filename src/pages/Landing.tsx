import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Telescope,
  Zap,
  BarChart3,
  Sparkles,
  ArrowRight,
  Globe,
  Database,
  TrendingUp,
} from "lucide-react";

export default function Landing() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleStart = () => {
    navigate("/upload");
  };

  const features = [
    {
      icon: Database,
      title: "Carga simple",
      description:
        "Sube un CSV de Kepler/TESS y obtén KPIs y visualizaciones al instante.",
      color: "cyan",
    },
    {
      icon: BarChart3,
      title: "Visualizaciones",
      description:
        "Distribuciones, dispersión período–radio y tabla navegable.",
      color: "blue",
    },
    {
      icon: Sparkles,
      title: "Enfoque UX",
      description:
        "Tema oscuro espacial, contraste alto y accesibilidad básica.",
      color: "purple",
    },
  ];

  const stats = [
    { value: "1000+", label: "Exoplanetas analizados", icon: Globe },
    { value: "95%", label: "Precisión del modelo", icon: TrendingUp },
    { value: "<1s", label: "Tiempo de análisis", icon: Zap },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden relative">
      {/* Animated background stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
              opacity: Math.random() * 0.5 + 0.2,
            }}
          />
        ))}
      </div>

      {/* Gradient orbs */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl transition-transform duration-1000"
        style={{
          transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl transition-transform duration-1000"
        style={{
          transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)`,
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6 py-12 md:py-20">
        {/* Hero Section */}
        <div
          className={`text-center space-y-8 mb-20 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {/* Icon badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-400/30 backdrop-blur-sm">
              <Telescope className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-300 text-sm font-medium">
                Powered by AI
              </span>
            </div>
          </div>

          <header className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                A World Away
              </span>
            </h1>
            <p className="text-slate-300 text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed">
              Descubre exoplanetas con inteligencia artificial
            </p>
            <p className="text-slate-400 text-base max-w-xl mx-auto">
              Analiza datos de Kepler y TESS, visualiza patrones ocultos y
              clasifica candidatos con precisión científica
            </p>
          </header>

          {/* CTA Button */}
          <div className="flex items-center justify-center pt-4">
            <button
              onClick={handleStart}
              className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-semibold text-lg shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 transition-all duration-300 flex items-center gap-2"
            >
              Comenzar análisis
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div
          className={`grid md:grid-cols-3 gap-6 mb-20 transition-all duration-1000 delay-200 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="relative group rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex flex-col items-center text-center space-y-2">
                  <Icon className="w-8 h-8 text-cyan-400 mb-2" />
                  <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-slate-400 text-sm">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Features */}
        <div
          className={`transition-all duration-1000 delay-400 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-3xl font-bold text-center mb-10 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Características principales
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="group relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 hover:border-cyan-400/50 transition-all duration-300 hover:scale-105"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 rounded-2xl transition-all duration-300" />
                  <div className="relative space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h3 className="font-semibold text-xl text-cyan-200">
                      {feature.title}
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer CTA */}
        <div
          className={`mt-20 text-center transition-all duration-1000 delay-600 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="inline-block p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm">
            <p className="text-slate-300 mb-4 text-lg">
              ¿Listo para explorar el universo?
            </p>
            <button
              onClick={handleStart}
              className="group px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 transition-all duration-300 flex items-center gap-2 mx-auto"
            >
              Comenzar ahora
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
