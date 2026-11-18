// Drag & drop file picker with image previews, PDF icons, size/type checks and remove buttons.
import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { UploadCloud, FileText, X } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import { formatBytes } from '../../utils/format.js';
import { UPLOAD } from '../../config/constants.js';
import { STRINGS } from '../../config/strings.js';

const S = STRINGS.fileUpload;
const ACCEPT_TYPES = Object.keys(UPLOAD.ACCEPT);
const ACCEPT_ATTR = [...ACCEPT_TYPES, ...Object.values(UPLOAD.ACCEPT).flat()].join(',');

// Checks new files and returns the accepted list plus any error message.
const checkFiles = (current, incoming) => {
  const errors = [];
  const ok = incoming.filter((f) => {
    if (!ACCEPT_TYPES.includes(f.type)) { errors.push(S.badType(f.name)); return false; }
    if (f.size > UPLOAD.MAX_SIZE_MB * 1024 * 1024) { errors.push(S.tooLarge(f.name, UPLOAD.MAX_SIZE_MB)); return false; }
    return true;
  });
  const room = UPLOAD.MAX_FILES - current.length;
  if (ok.length > room) errors.push(S.tooMany(UPLOAD.MAX_FILES));
  return { files: [...current, ...ok.slice(0, Math.max(room, 0))], error: errors[0] };
};

const Preview = ({ file, onRemove }) => {
  const url = useMemo(() => (file.type.startsWith('image/') ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => url && URL.revokeObjectURL(url), [url]);
  return (
    <motion.li layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
      className="group relative overflow-hidden rounded-xl border border-surface-border bg-surface shadow-soft">
      <div className="flex aspect-[4/3] items-center justify-center bg-surface-muted">
        {url ? <img src={url} alt={file.name} className="h-full w-full object-cover" /> : <FileText className="h-10 w-10 text-danger" />}
      </div>
      <div className="px-3 py-2">
        <p className="truncate text-xs font-medium text-ink" title={file.name}>{file.name}</p>
        <p className="text-[11px] text-ink-faint">{formatBytes(file.size)}</p>
      </div>
      <button type="button" onClick={onRemove} aria-label={`${S.remove}: ${file.name}`}
        className="absolute right-2 top-2 rounded-full bg-surface/90 p-1 text-ink-muted shadow-soft transition hover:bg-danger hover:text-ink-inverse">
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.li>
  );
};

const FileUpload = ({ files = [], onChange, className }) => {
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState('');

  const add = (list) => {
    const result = checkFiles(files, [...list]);
    setError(result.error || '');
    onChange(result.files);
  };
  const full = files.length >= UPLOAD.MAX_FILES;

  return (
    <div className={className}>
      <div
        role="button" tabIndex={0}
        onClick={() => !full && inputRef.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && !full && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); if (!full) add(e.dataTransfer.files); }}
        aria-disabled={full}
        className={cn('flex flex-col items-center justify-center rounded-card border-2 border-dashed px-6 py-10 text-center transition-all',
          full ? 'cursor-not-allowed border-surface-border bg-surface-muted opacity-60'
            : drag ? 'cursor-copy border-primary bg-primary-soft' : 'cursor-pointer border-surface-strong bg-surface-muted/60 hover:border-primary hover:bg-primary-soft/40')}
      >
        <span className={cn('mb-3 flex h-12 w-12 items-center justify-center rounded-2xl transition-colors', drag ? 'bg-primary text-ink-inverse' : 'bg-surface text-primary shadow-soft')}>
          <UploadCloud className="h-6 w-6" />
        </span>
        <p className="text-sm text-ink-soft">{S.drop} <span className="font-semibold text-primary">{S.browse}</span></p>
        <p className="mt-1 text-xs text-ink-faint">{S.hint(UPLOAD.MAX_FILES, UPLOAD.MAX_SIZE_MB)}</p>
        <input ref={inputRef} type="file" multiple accept={ACCEPT_ATTR} className="sr-only" tabIndex={-1}
          onChange={(e) => { add(e.target.files); e.target.value = ''; }} />
      </div>
      {error && <p role="alert" className="mt-2 text-xs font-medium text-danger">{error}</p>}
      {files.length > 0 && (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <AnimatePresence>
            {files.map((f, i) => <Preview key={f.name + f.size + f.lastModified} file={f} onRemove={() => onChange(files.filter((_, j) => j !== i))} />)}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
};
export default FileUpload;
