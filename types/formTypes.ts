// types/formTypes.ts

/**
 * Alle Formular-Typen, die der Client (Frontend) verwenden darf.
 * → wird an die API gesendet
 */
export type FormType =
  | "bestellung"
  | "verkauf"
  | "projekt"
  | "support"
  | "sofortrabatt";

/**
 * Nur jene Typen, die in der SUBMISSIONS-Tabelle erlaubt sind.
 * → darf *NICHT* "sofortrabatt" enthalten, da eigene Tabelle
 */
export type SubmissionType =
  | "bestellung"
  | "verkauf"
  | "projekt"
  | "support";
