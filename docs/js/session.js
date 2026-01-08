// docs/js/session.js

const SESSION_KEY = "cg_session_v1";

/**
 * Get or initialise the current quiz session.
 */
export function getSession() {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) {
    const fresh = {
      user: null,          // { name, className }
      started: Date.now(),
      results: {},         // { scroll: {...}, algebra: {...}, ... }
      order: ["scroll", "algebra"] // section IDs in sequence
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(fresh));
    return fresh;
  }
  return JSON.parse(raw);
}

/**
 * Save the current session object.
 */
export function saveSession(session) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

/**
 * Set the signed-in user.
 */
export function setUser(name, className) {
  const s = getSession();
  s.user = { name, className };
  saveSession(s);
}

/**
 * Save the result of a section, e.g. "scroll", "algebra".
 */
export function saveSectionResult(sectionId, result) {
  const s = getSession();
  s.results[sectionId] = result; // { score, maxScore, finishedAt, ... }
  saveSession(s);
}

/**
 * Get next section ID after currentId, or null.
 */
export function getNextSectionId(currentId) {
  const s = getSession();
  const idx = s.order.indexOf(currentId);
  if (idx === -1 || idx === s.order.length - 1) return null;
  return s.order[idx + 1];
}
