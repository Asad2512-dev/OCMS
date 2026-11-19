// Card wrapper for a chart, with loading skeleton and "no data" message. Also shared chart styling.
import { BarChart3 } from 'lucide-react';
import { Card, CardHeader, Skeleton } from '../ui/index.js';
import theme from '../../config/theme.js';
import { STRINGS } from '../../config/strings.js';

export const tooltipStyle = {
  contentStyle: {
    background: theme.colors.surface.DEFAULT, border: `1px solid ${theme.colors.surface.border}`,
    borderRadius: 12, boxShadow: theme.shadows.lift, fontSize: 12, color: theme.colors.ink.DEFAULT,
  },
  labelStyle: { color: theme.colors.ink.muted, marginBottom: 4 },
  cursor: { fill: theme.colors.surface.subtle },
};
export const axisProps = { tick: { fill: theme.colors.ink.muted, fontSize: 12 }, axisLine: false, tickLine: false };
export const gridProps = { stroke: theme.colors.surface.border, strokeDasharray: '3 3', vertical: false };

const ChartCard = ({ title, subtitle, loading, empty, height = 280, children, action, className, autoHeightOnMobile }) => (
  <Card className={className}>
    <CardHeader title={title} subtitle={subtitle} action={action} />
    {/* autoHeightOnMobile: on phones the content decides the height (e.g. donut + legend stacked). */}
    <div style={{ '--chart-h': `${height}px` }} className={autoHeightOnMobile ? 'min-h-[var(--chart-h)] sm:h-[var(--chart-h)]' : 'h-[var(--chart-h)]'}>
      {loading ? <Skeleton className="h-full w-full rounded-xl" /> : empty ? (
        <div className="flex h-full flex-col items-center justify-center text-sm text-ink-faint">
          <BarChart3 className="mb-2 h-8 w-8" />{STRINGS.dashboard.charts.noData}
        </div>
      ) : children}
    </div>
  </Card>
);
export default ChartCard;
