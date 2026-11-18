// Dialog window. side="right" turns it into a slide-in drawer. Closes on Escape and outside click; traps focus.
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import { STRINGS } from '../../config/strings.js';

const SIZES = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

const useEscapeAndFocus = (open, onClose, panelRef) => {
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key !== 'Tab' || !panelRef.current) return;
      const els = panelRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!els.length) return;
      const [first, last] = [els[0], els[els.length - 1]];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    setTimeout(() => panelRef.current?.querySelector('input, select, textarea, button:not([data-close])')?.focus(), 50);
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; previous?.focus?.(); };
  }, [open, onClose, panelRef]);
};

const Modal = ({ open, onClose, title, subtitle, children, footer, size = 'md', side }) => {
  const panelRef = useRef(null);
  useEscapeAndFocus(open, onClose, panelRef);
  const drawer = side === 'right';

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className={cn('fixed inset-0 z-50 flex', drawer ? 'justify-end' : 'items-end justify-center p-0 sm:items-center sm:p-4')}>
          <motion.div className="absolute inset-0 bg-overlay backdrop-blur-[2px]" onClick={onClose}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.div
            ref={panelRef}
            role="dialog" aria-modal="true" aria-labelledby="modal-title"
            className={cn('relative flex max-h-full w-full flex-col bg-surface shadow-pop',
              drawer ? 'h-full max-w-md' : cn('max-h-[90vh] rounded-t-card sm:rounded-card', SIZES[size]))}
            initial={drawer ? { x: '100%' } : { opacity: 0, scale: 0.96, y: 12 }}
            animate={drawer ? { x: 0 } : { opacity: 1, scale: 1, y: 0 }}
            exit={drawer ? { x: '100%' } : { opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-surface-border px-6 py-4">
              <div>
                <h2 id="modal-title" className="text-lg font-semibold text-ink">{title}</h2>
                {subtitle && <p className="mt-0.5 text-sm text-ink-muted">{subtitle}</p>}
              </div>
              <button type="button" data-close onClick={onClose} aria-label={STRINGS.common.close}
                className="-mr-2 rounded-lg p-2 text-ink-faint transition-colors hover:bg-surface-subtle hover:text-ink">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="scrollbar-thin flex-1 overflow-y-auto px-6 py-5">{children}</div>
            {footer && <div className="flex flex-col-reverse gap-2 border-t border-surface-border bg-surface-muted/60 px-6 py-4 sm:flex-row sm:justify-end">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
export default Modal;
