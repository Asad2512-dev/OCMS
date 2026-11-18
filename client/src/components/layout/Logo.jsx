// UniVoice logo: a gradient badge with a megaphone icon plus the app name.
import { Megaphone } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import { STRINGS } from '../../config/strings.js';

const Logo = ({ compact, className, light }) => (
  <span className={cn('inline-flex items-center gap-2.5', className)}>
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-ink-inverse shadow-glow">
      <Megaphone className="h-[18px] w-[18px]" aria-hidden />
    </span>
    {!compact && <span className={cn('text-lg font-semibold tracking-tight', light ? 'text-ink-inverse' : 'text-ink')}>{STRINGS.app.name}</span>}
  </span>
);
export default Logo;
