// 1–5 star rating. Interactive when onChange is given, otherwise read-only.
import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import { RATING_MAX } from '../../config/constants.js';
import { STRINGS } from '../../config/strings.js';

const StarRating = ({ value = 0, onChange, size = 'md' }) => {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  const px = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-9 w-9' : 'h-6 w-6';
  const stars = Array.from({ length: RATING_MAX }, (_, i) => i + 1);

  if (!onChange) {
    return (
      <span className="inline-flex items-center gap-0.5" aria-label={`${value}/${RATING_MAX}`}>
        {stars.map((s) => <Star key={s} className={cn(px, s <= Math.round(value) ? 'fill-star text-star' : 'fill-star-empty text-star-empty')} />)}
      </span>
    );
  }
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1" role="radiogroup" onMouseLeave={() => setHover(0)}>
        {stars.map((s) => (
          <button key={s} type="button" role="radio" aria-checked={value === s} aria-label={STRINGS.complaint.ratingLabels[s - 1]}
            onMouseEnter={() => setHover(s)} onClick={() => onChange(s)}
            className="rounded-md p-0.5 transition-transform hover:scale-110">
            <Star className={cn(px, 'transition-colors', s <= shown ? 'fill-star text-star' : 'fill-star-empty text-star-empty')} />
          </button>
        ))}
      </div>
      {shown > 0 && <span className="text-sm font-medium text-ink-soft">{STRINGS.complaint.ratingLabels[shown - 1]}</span>}
    </div>
  );
};
export default StarRating;
