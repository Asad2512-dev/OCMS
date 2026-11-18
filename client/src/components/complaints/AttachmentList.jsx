// Shows complaint attachments: image thumbnails (open full size) and PDF tiles.
import { FileText, ExternalLink } from 'lucide-react';
import { STRINGS } from '../../config/strings.js';
import { fileUrl, isImage } from '../../utils/complaint.js';
import { formatBytes } from '../../utils/format.js';

const AttachmentList = ({ attachments = [] }) => {
  if (!attachments.length) return <p className="text-sm text-ink-muted">{STRINGS.complaint.noAttachments}</p>;
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {attachments.map((a) => (
        <li key={a.url}>
          <a href={fileUrl(a.url)} target="_blank" rel="noreferrer" title={`${STRINGS.complaint.openFile}: ${a.filename}`}
            className="group block overflow-hidden rounded-xl border border-surface-border bg-surface shadow-soft transition hover:shadow-lift">
            <div className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-surface-muted">
              {isImage(a.mimetype)
                ? <img src={fileUrl(a.url)} alt={a.filename} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                : <FileText className="h-10 w-10 text-danger" aria-hidden />}
            </div>
            <div className="flex items-center gap-2 px-3 py-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-ink">{a.filename}</p>
                {a.size && <p className="text-[11px] text-ink-faint">{formatBytes(a.size)}</p>}
              </div>
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-ink-faint group-hover:text-primary" aria-hidden />
            </div>
          </a>
        </li>
      ))}
    </ul>
  );
};
export default AttachmentList;
