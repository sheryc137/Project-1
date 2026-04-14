import clsx from 'clsx';

export default function Card({ children, className, title }) {
  return (
    <div className={clsx('card', className)}>
      {title && <div className="card-header">{title}</div>}
      {children}
    </div>
  );
}
