// Extra offensive words to block in complaints, on top of the English list in the "bad-words" package.
// Add or remove words here (lowercase). Roman Urdu spellings vary, so list common variants.
// Words are matched as whole words only, so "class" will never match "ass".
// Avoid words with innocent meanings (e.g. "chor" = thief, "gali" = street, "ghatiya" = poor quality),
// otherwise genuine complaints would be blocked.

export const CUSTOM_BAD_WORDS = [
  // Roman Urdu / Punjabi abuse
  'kamina', 'kameena', 'kamine', 'kameeni', 'kamini',
  'harami', 'haraami', 'haramzada', 'haramzadi', 'haramkhor',
  'kutta', 'kutte', 'kuttay', 'kutti', 'kuttiya', 'kutiya',
  'suar', 'suwar', 'khanzeer',
  'ullu', 'gadha', 'gadhay', 'gadhe', 'bewakoof', 'bevkoof',
  'chutiya', 'chutia', 'chootiya', 'chootia', 'chutiye',
  'bhosdi', 'bhosdike', 'bhosri', 'bhosriwala',
  'madarchod', 'maderchod', 'behenchod', 'bhenchod', 'bhanchod',
  'gandu', 'gaandu', 'gand', 'gaand',
  'lun', 'lund', 'loda', 'lauda', 'lulli',
  'phuddi', 'fuddi', 'phudi',
  'randi', 'rundi', 'randwa', 'dalla', 'dalle', 'kanjar', 'kanjri',
  'tatti', 'besharam', 'beghairat', 'bay-ghairat', 'bay ghairat', 'be ghairat',
  'jahil', 'jaahil', 'zaleel', 'zalil', 'lanati', 'lanti', 'lanat',
  'khabees', 'khabis', 'badtameez', 'badmash',

  // Urdu script
  'حرامی', 'حرامزادہ', 'کمینہ', 'کمینی', 'کتا', 'کتی', 'کتیا', 'سور', 'الو', 'گدھا',
  'چوتیا', 'گانڈو', 'رنڈی', 'کنجر', 'کنجری', 'دلا', 'بےغیرت', 'بے غیرت', 'لعنتی', 'خبیث', 'ذلیل', 'بدتمیز',
];
