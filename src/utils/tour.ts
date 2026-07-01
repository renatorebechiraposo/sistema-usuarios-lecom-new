export const TOUR_VERSION = "v1"; // altere para "v2" quando mudar o tour

function getTourKey(userId?: string) {
  // Se tiver userId, grava por usuário; senão, global
  return userId ? `tourSeen:${userId}:${TOUR_VERSION}` : `tourSeen:${TOUR_VERSION}`;
}

export function hasSeenTour(userId?: string): boolean {
  if (typeof window === "undefined") return true; // em SSR, não mostra o tour
  try {
    return localStorage.getItem(getTourKey(userId)) === "1";
  } catch {
    // Em caso de erro de storage, por segurança não mostrar o tour
    return true;
  }
}

export function markTourSeen(userId?: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getTourKey(userId), "1");
    // Se quiser guardar data/hora também:
    localStorage.setItem(`${getTourKey(userId)}:ts`, new Date().toISOString());
  } catch {}
}
