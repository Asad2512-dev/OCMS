// Round avatar with the person's initials. The color is picked from theme.avatar based on the name.
import { UserX } from 'lucide-react';
import theme from '../../config/theme.js';
import { initials } from '../../utils/format.js';
import { cn } from '../../utils/cn.js';

const SIZES = { xs: 'h-6 w-6 text-[10px]', sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-lg', xl: 'h-20 w-20 text-2xl' };
const colorFor = (name = '') => theme.avatar[[...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % theme.avatar.length];

const Avatar = ({ name, size = 'md', anonymous, className }) => (
  <span
    className={cn('inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold text-ink-inverse ring-2 ring-surface', SIZES[size],
      anonymous && 'bg-surface-strong', className)}
    style={anonymous ? undefined : { backgroundColor: colorFor(name) }}
    aria-hidden
  >
    {anonymous ? <UserX className="h-1/2 w-1/2" /> : initials(name)}
  </span>
);
export default Avatar;
