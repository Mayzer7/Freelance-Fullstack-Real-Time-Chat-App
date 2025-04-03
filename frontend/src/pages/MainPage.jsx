import React, { useState } from "react";
import {
  Code2,
  Briefcase,
  Users,
  Star,
  ArrowRight,
  Search,
  Menu,
  X,
  Palette
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useThemeStore } from "../store/useThemeStore";
import { THEMES } from "../constants";

function MainPage() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const { theme, setTheme } = useThemeStore();

  const AuthButton = () => {
    const token = localStorage.getItem("token");

    return (
      <button
        className="bg-primary hover:bg-primary/90 px-6 py-2 rounded-full transition-colors text-primary-content"
        onClick={() => navigate(token ? "/profile" : "/login")}
      >
        {token ? "Перейти в профиль" : "ВDSSDойти"}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-base-100 pt-16"> {/* Added pt-16 for navbar spacing */}
      {/* Theme Selector - Moved down and adjusted z-index */}
      <div className="fixed top-20 right-4 z-30">
        <button
          onClick={() => setShowThemes(!showThemes)}
          className="btn btn-circle btn-ghost"
          title="Change theme"
        >
          <Palette className="w-5 h-5" />
        </button>
        {showThemes && (
          <div className="absolute right-0 mt-2 p-4 bg-base-200 rounded-xl shadow-xl w-[280px]">
            <div className="grid grid-cols-3 gap-2">
              {THEMES.map((t) => (
                <button
                  key={t}
                  className={`
                    group flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors
                    ${theme === t ? "bg-base-300" : "hover:bg-base-300/50"}
                  `}
                  onClick={() => setTheme(t)}
                >
                  <div className="relative h-6 w-full rounded-md overflow-hidden" data-theme={t}>
                    <div className="absolute inset-0 grid grid-cols-4 gap-px p-1">
                      <div className="rounded bg-primary"></div>
                      <div className="rounded bg-secondary"></div>
                      <div className="rounded bg-accent"></div>
                      <div className="rounded bg-neutral"></div>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium truncate w-full text-center">
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Connect with Top
              <span className="text-primary"> Freelance Talent</span>
            </h1>
            <p className="text-base-content/70 text-lg">
              Найдите отличных фрилансеров для своих проектов или
              продемонстрируйте свои навыки клиентам по всему миру.
              Присоединяйтесь к нашему растущему сообществу профессионалов.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button className="btn btn-primary btn-lg rounded-full">
                Get Started <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              <button className="btn btn-outline btn-lg rounded-full">
                Learn More
              </button>
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="absolute inset-0 bg-primary/20 blur-3xl"></div>
            <img
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80"
              alt="Freelancer working"
              className="rounded-2xl shadow-2xl relative"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-base-200 p-8 rounded-2xl hover:bg-base-300 transition-all duration-300">
            <Briefcase className="w-12 h-12 text-primary mb-6" />
            <h3 className="text-xl font-semibold mb-4">
              Находите Идеальные Проекты
            </h3>
            <p className="text-base-content/70">
              Получите доступ к широкому спектру проектов, соответствующих вашим навыкам и опыту.
            </p>
          </div>
          <div className="bg-base-200 p-8 rounded-2xl hover:bg-base-300 transition-all duration-300">
            <Users className="w-12 h-12 text-secondary mb-6" />
            <h3 className="text-xl font-semibold mb-4">Лучшие OG Работники</h3>
            <p className="text-base-content/70">
              Общайтесь с квалифицированными профессионалами со всего мира.
            </p>
          </div>
          <div className="bg-base-200 p-8 rounded-2xl hover:bg-base-300 transition-all duration-300">
            <Star className="w-12 h-12 text-accent mb-6" />
            <h3 className="text-xl font-semibold mb-4">Безопасные платежи</h3>
            <p className="text-base-content/70">
              Гарантированные выплаты и профессиональная система выполнения работ.
            </p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="container mx-auto px-6 pb-20">
        <div className="bg-base-200 p-6 md:p-12 rounded-2xl relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Готовы приступить к работе?
            </h2>
            <div className="max-w-2xl mx-auto flex flex-col sm:flex-row bg-base-100 rounded-full overflow-hidden shadow-lg">
              <input
                type="text"
                placeholder="Ищите навыки или проекты..."
                className="w-full px-6 py-4 bg-transparent outline-none"
              />
              <button className="w-full sm:w-auto btn btn-primary rounded-none px-8">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default MainPage;