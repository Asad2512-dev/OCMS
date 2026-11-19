// The dashboard/report charts (recharts). Colors come from theme.chart.
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, Legend, AreaChart, Area,
} from 'recharts';
import theme from '../../config/theme.js';
import { STRINGS } from '../../config/strings.js';
import { formatMonth } from '../../utils/format.js';
import { tooltipStyle, axisProps, gridProps } from './ChartCard.jsx';

const C = STRINGS.dashboard.charts;
const legend = { iconType: 'circle', iconSize: 8, wrapperStyle: { fontSize: 12, color: theme.colors.ink.muted } };

// Donut of complaints per category, with total in the middle.
export const CategoryDonut = ({ data }) => {
  const rows = Object.entries(data || {}).map(([k, v]) => ({ name: STRINGS.categories[k] || k, value: v }));
  const total = rows.reduce((s, r) => s + r.value, 0);
  return (
    <div className="flex h-full flex-col items-center gap-4 sm:flex-row">
      <div className="relative h-48 w-48 shrink-0 sm:h-full sm:min-h-[12rem] sm:w-1/2">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={rows} dataKey="value" innerRadius="62%" outerRadius="90%" paddingAngle={3} stroke="none">
              {rows.map((r, i) => <Cell key={r.name} fill={theme.chart[i % theme.chart.length]} />)}
            </Pie>
            <Tooltip {...tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold text-ink">{total}</span>
          <span className="text-xs text-ink-muted">{C.total}</span>
        </div>
      </div>
      <ul className="w-full space-y-2.5">
        {rows.map((r, i) => (
          <li key={r.name} className="flex items-center gap-2.5 text-sm">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: theme.chart[i % theme.chart.length] }} />
            <span className="flex-1 text-ink-soft">{r.name}</span>
            <span className="font-medium text-ink">{r.value}</span>
            <span className="w-10 text-right text-xs text-ink-faint">{total ? Math.round((r.value / total) * 100) : 0}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Monthly trend: total vs resolved.
export const TrendChart = ({ data = [] }) => (
  <ResponsiveContainer>
    <AreaChart data={data.map((d) => ({ ...d, name: formatMonth(d.label) }))} margin={{ left: -20, right: 8, top: 8 }}>
      <defs>
        <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={theme.chart[0]} stopOpacity={0.25} /><stop offset="100%" stopColor={theme.chart[0]} stopOpacity={0} />
        </linearGradient>
        <linearGradient id="gResolved" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={theme.chart[2]} stopOpacity={0.2} /><stop offset="100%" stopColor={theme.chart[2]} stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid {...gridProps} />
      <XAxis dataKey="name" {...axisProps} interval="preserveStartEnd" />
      <YAxis allowDecimals={false} {...axisProps} />
      <Tooltip {...tooltipStyle} cursor={{ stroke: theme.colors.surface.strong }} />
      <Legend {...legend} />
      <Area type="monotone" dataKey="total" name={C.total} stroke={theme.chart[0]} strokeWidth={2.5} fill="url(#gTotal)" />
      <Area type="monotone" dataKey="resolved" name={C.resolved} stroke={theme.chart[2]} strokeWidth={2.5} fill="url(#gResolved)" />
    </AreaChart>
  </ResponsiveContainer>
);

// Department performance: total vs resolved per department.
export const DepartmentBar = ({ data = [] }) => (
  <ResponsiveContainer>
    <BarChart data={data} margin={{ left: -20, right: 8, top: 8 }} barGap={4}>
      <CartesianGrid {...gridProps} />
      <XAxis dataKey="department" {...axisProps} />
      <YAxis allowDecimals={false} {...axisProps} />
      <Tooltip {...tooltipStyle} />
      <Legend {...legend} />
      <Bar dataKey="total" name={C.total} fill={theme.chart[0]} radius={[6, 6, 0, 0]} maxBarSize={28} />
      <Bar dataKey="resolved" name={C.resolved} fill={theme.chart[2]} radius={[6, 6, 0, 0]} maxBarSize={28} />
    </BarChart>
  </ResponsiveContainer>
);

// Average rating per department (horizontal bars, 0–5).
export const RatingBar = ({ data = [] }) => (
  <ResponsiveContainer>
    <BarChart data={data} layout="vertical" margin={{ left: 10, right: 24 }}>
      <CartesianGrid {...gridProps} horizontal={false} vertical />
      <XAxis type="number" domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} {...axisProps} />
      <YAxis type="category" dataKey="department" width={80} {...axisProps} />
      <Tooltip {...tooltipStyle} />
      <Bar dataKey="avgRating" name={C.rating} fill={theme.colors.star.DEFAULT} radius={[0, 6, 6, 0]} maxBarSize={22} />
    </BarChart>
  </ResponsiveContainer>
);

export { LineChart, Line };
