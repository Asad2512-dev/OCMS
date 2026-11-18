// Small helpers for deleting uploaded files (used when a request fails after files were saved).
import fs from 'fs/promises';

export const removeFiles = (files = []) =>
  Promise.all(files.map((f) => fs.unlink(f.path).catch(() => {})));

export const removeRequestFiles = (req) => removeFiles(req.files || []);
