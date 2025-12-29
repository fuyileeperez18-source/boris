import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      <div className="relative w-6 h-6">
        {/* Sol - visible en modo oscuro */}
        <Sun
          className={`
            absolute inset-0 w-6 h-6 text-yellow-500 transition-all duration-300
            ${isDark ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-50 opacity-0'}
          `}
        />

        {/* Luna - visible en modo claro */}
        <Moon
          className={`
            absolute inset-0 w-6 h-6 text-gray-700 transition-all duration-300
            ${isDark ? '-rotate-90 scale-50 opacity-0' : 'rotate-0 scale-100 opacity-100'}
          `}
        />
      </div>
    </button>
  );
};

export default ThemeToggle;
