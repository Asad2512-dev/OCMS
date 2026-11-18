// Prepares a complaint for the API response.
// For anonymous complaints, anyone except the owner sees "Anonymous" and every trace of the owner's id is removed.
import { ANONYMOUS_LABEL } from '../config/constants.js';

const idOf = (ref) => (ref && ref._id ? ref._id : ref)?.toString();

// Replaces the owner with null wherever they appear (remarks, status history).
const hideOwner = (list, ownerId) =>
  (list || []).map((item) => (idOf(item.by) === ownerId ? { ...item, by: null } : item));

export const complaintView = (complaint, viewer) => {
  const c = typeof complaint.toObject === 'function' ? complaint.toObject() : { ...complaint };
  const ownerId = idOf(c.submittedBy);
  const isOwner = ownerId === viewer._id.toString();
  const base = { ...c, isOwner };

  if (!c.isAnonymous || isOwner) return base;

  return {
    ...base,
    submittedBy: null,
    submitterName: ANONYMOUS_LABEL,
    remarks: hideOwner(c.remarks, ownerId),
    statusHistory: hideOwner(c.statusHistory, ownerId),
  };
};
