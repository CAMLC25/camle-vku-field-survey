import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ConditionRatingProps {
  value: number; // 1 to 5
  onChange: (value: number) => void;
  disabled?: boolean;
}

export const ConditionRating: React.FC<ConditionRatingProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const { t } = useLanguage();

  const activeRating = hoverRating !== null ? hoverRating : value;

  const labels: Record<number, { title: string; color: string; desc: string }> = {
    1: { title: t.rating1Title, color: 'text-rose-600', desc: t.rating1Desc },
    2: { title: t.rating2Title, color: 'text-orange-600', desc: t.rating2Desc },
    3: { title: t.rating3Title, color: 'text-amber-600', desc: t.rating3Desc },
    4: { title: t.rating4Title, color: 'text-emerald-600', desc: t.rating4Desc },
    5: { title: t.rating5Title, color: 'text-vku-600', desc: t.rating5Desc }
  };

  const ratingInfo = labels[activeRating] || labels[3];

  return (
    <div className="w-full">
      <div className="flex items-center gap-1.5 sm:gap-2">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= activeRating;
          return (
            <button
              key={star}
              type="button"
              disabled={disabled}
              onClick={() => onChange(star)}
              onMouseEnter={() => !disabled && setHoverRating(star)}
              onMouseLeave={() => !disabled && setHoverRating(null)}
              className="p-1 rounded-lg transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-vku-400"
              aria-label={`Rate condition ${star} out of 5 stars`}
            >
              <Star
                className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                    : 'text-slate-300 hover:text-slate-400'
                }`}
              />
            </button>
          );
        })}
        <span className="ml-2 text-sm font-bold text-slate-700">
          {activeRating}/5
        </span>
      </div>

      <div className="mt-1.5 text-xs flex items-center gap-1.5">
        <span className={`font-semibold ${ratingInfo.color}`}>
          {ratingInfo.title}:
        </span>
        <span className="text-slate-500 truncate">{ratingInfo.desc}</span>
      </div>
    </div>
  );
};
