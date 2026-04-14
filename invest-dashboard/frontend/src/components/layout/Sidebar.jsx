import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { useAppContext } from '../../context/AppContext';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '◉' },
  { to: '/portfolio', label: 'Portfolio', icon: '◈' },
  { to: '/news', label: 'News Feed', icon: '◎' },
  { to: '/alerts', label: 'Alerts', icon: '◇', showBadge: true },
  { to: '/settings', label: 'Settings', icon: '◌' },
];

export default function Sidebar() {
  const { unreadCount } = useAppContext();

  return (
    <aside className="w-56 shrink-0 bg-slate-900 border-r border-slate-700/50 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-700/50">
        <span className="text-brand-500 font-bold text-lg tracking-tight">InvestAI</span>
        <p className="text-slate-500 text-xs mt-0.5">Portfolio Intelligence</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon, showBadge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-brand-600/20 text-brand-400 font-medium'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
              )
            }
          >
            <span className="text-base leading-none">{icon}</span>
            <span className="flex-1">{label}</span>
            {showBadge && unreadCount > 0 && (
              <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-slate-700/50 text-xs text-slate-600">
        Single-user dashboard
      </div>
    </aside>
  );
}
