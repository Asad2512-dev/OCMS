// Track a complaint by its ID (e.g. CMP-2026-0001). Shows a short summary and its timeline.
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ArrowRight, SearchX } from 'lucide-react';
import { Card, PageHeader, Input, Button, StatusBadge, PriorityBadge, EmptyState, SkeletonCard } from '../../components/ui/index.js';
import Timeline from '../../components/complaints/Timeline.jsx';
import { complaintApi } from '../../services/endpoints.js';
import { ROUTES, COMPLAINT_ID_PATTERN } from '../../config/constants.js';
import { STRINGS } from '../../config/strings.js';

const T = STRINGS.track;

const TrackComplaint = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [code, setCode] = useState(searchParams.get('code') || '');
  const [error, setError] = useState('');
  const [state, setState] = useState({ loading: false, complaint: null, notFound: false });

  const track = async (value) => {
    const id = value.trim().toUpperCase();
    if (!COMPLAINT_ID_PATTERN.test(id)) { setError(T.invalid); return; }
    setError(''); setSearchParams({ code: id }, { replace: true });
    setState({ loading: true, complaint: null, notFound: false });
    try {
      const { complaint } = await complaintApi.track(id);
      setState({ loading: false, complaint, notFound: false });
    } catch {
      setState({ loading: false, complaint: null, notFound: true });
    }
  };

  useEffect(() => { const q = searchParams.get('code'); if (q) { setCode(q); track(q); } }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const c = state.complaint;
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={T.title} subtitle={T.subtitle} />
      <Card>
        <form onSubmit={(e) => { e.preventDefault(); track(code); }} className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <Input className="flex-1" icon={Search} placeholder={T.placeholder} value={code} onChange={(e) => { setCode(e.target.value); setError(''); }}
            error={error} hint={T.hint} aria-label={STRINGS.complaint.fields.id} inputClassName="font-mono uppercase" />
          <Button type="submit" loading={state.loading} className="sm:mt-0">{T.button}</Button>
        </form>
      </Card>

      <div className="mt-6">
        {state.loading && <SkeletonCard />}
        {state.notFound && <Card><EmptyState icon={SearchX} title={STRINGS.complaint.notFound} text={T.notFound} /></Card>}
        {c && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-mono text-xs text-ink-faint">{c.complaintId}</p>
                  <h2 className="mt-1 text-lg font-semibold text-ink">{c.title}</h2>
                  <div className="mt-3 flex flex-wrap gap-2"><StatusBadge status={c.status} /><PriorityBadge priority={c.priority} /></div>
                </div>
                <Link to={ROUTES.COMPLAINT(c._id)}><Button variant="secondary" iconRight={ArrowRight}>{T.openDetails}</Button></Link>
              </div>
              <div className="my-6 h-px bg-surface-border" />
              <Timeline complaint={c} />
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};
export default TrackComplaint;
