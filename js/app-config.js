export const SEMESTER_START = "2026-07-20";
export const SEMESTER_END = "2026-12-31";
export const ROLLS = Array.from({length:13},(_,i)=>`242031${String(i+1).padStart(3,"0")}`);

export const SUBJECTS = [
  {id:"physical", name:"Physical Chemistry II"},
  {id:"organic", name:"Organic Chemistry"},
  {id:"inorganic", name:"Inorganic Chemistry II"},
  {id:"minor", name:"Minor V"}
];

// Extracted from the uploaded July–December 2026 Chemistry timetable.
// Each array item is one class period. Repeated subject IDs mean two periods that day.
export const WEEKLY_SCHEDULE = {
  1: ["physical","organic","minor"],                 // Monday
  2: ["inorganic","physical","inorganic","minor"],  // Tuesday
  3: ["organic","inorganic"],                       // Wednesday
  4: ["organic","inorganic","physical","minor"],    // Thursday
  5: ["physical","organic","minor"]                  // Friday
};

export const SUBJECT_SHORT = {
  physical:"Physical", organic:"Organic", inorganic:"Inorganic", minor:"Minor V"
};
