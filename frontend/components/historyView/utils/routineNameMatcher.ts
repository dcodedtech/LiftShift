import { createExerciseNameResolver } from '../../../utils/exercise/exerciseNameResolver';
import type { Session } from './historySessions';

const LOOKBACK_MS = 14 * 24 * 60 * 60 * 1000;

let titleResolverCache: { titles: string[]; resolver: ReturnType<typeof createExerciseNameResolver> } | null = null;

const getTitleResolver = (titles: string[]) => {
  if (titleResolverCache && titleResolverCache.titles.length === titles.length && titleResolverCache.titles.every((t, i) => t === titles[i])) {
    return titleResolverCache.resolver;
  }
  const resolver = createExerciseNameResolver(titles, { mode: 'relaxed' });
  titleResolverCache = { titles, resolver };
  return resolver;
};

export const findPreviousRoutineSession = (
  session: Session,
  allSessions: Session[],
): Session | null => {
  if (!session.date) return null;

  const cutoff = new Date(session.date.getTime() - LOOKBACK_MS);

  const candidates = allSessions.filter(
    (s) =>
      s.key !== session.key &&
      s.date &&
      s.date < session.date! &&
      s.date >= cutoff,
  );

  if (candidates.length === 0) return null;

  const uniqueTitles = [...new Set(candidates.map((s) => s.title))];
  const resolver = getTitleResolver(uniqueTitles);
  const resolution = resolver.resolve(session.title);

  if (resolution.method === 'none' || !resolution.name) return null;

  const matched = candidates
    .filter((s) => s.title === resolution.name)
    .sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0));

  return matched[0] ?? null;
};
