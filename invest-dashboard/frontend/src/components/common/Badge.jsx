import clsx from 'clsx';

const variants = {
  default: 'bg-slate-700 text-slate-300',
  blue: 'bg-blue-900/50 text-blue-300',
  green: 'bg-green-900/50 text-green-300',
  amber: 'bg-amber-900/50 text-amber-300',
  orange: 'bg-orange-900/50 text-orange-300',
  red: 'bg-red-900/50 text-red-300',
  purple: 'bg-purple-900/50 text-purple-300',
};

export default function Badge({ children, variant = 'default', className }) {
  return (
    <span className={clsx('badge', variants[variant], className)}>
      {children}
    </span>
  );
}
