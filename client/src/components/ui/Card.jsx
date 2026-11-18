// White rounded card with a soft shadow. CardHeader gives a consistent title row with optional actions.
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn.js';

export const Card = ({ className, children, padded = true, hover, animate = true, ...props }) => {
  const Comp = animate ? motion.div : 'div';
  const motionProps = animate ? { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.25 } } : {};
  return (
    <Comp
      className={cn('rounded-card border border-surface-border bg-surface shadow-card', padded && 'p-5 sm:p-6',
        hover && 'transition-shadow hover:shadow-lift', className)}
      {...motionProps}
      {...props}
    >
      {children}
    </Comp>
  );
};

export const CardHeader = ({ title, subtitle, action, icon: Icon, className }) => (
  <div className={cn('mb-5 flex items-start justify-between gap-3', className)}>
    <div className="flex min-w-0 items-start gap-3">
      {Icon && <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary"><Icon className="h-4 w-4" /></span>}
      <div className="min-w-0">
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-ink-muted">{subtitle}</p>}
      </div>
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export default Card;
