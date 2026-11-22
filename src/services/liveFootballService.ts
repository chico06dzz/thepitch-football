import {
  AppLanguage,
  CompetitionId,
  FifaRankingData,
  FifaRankingEntry,
  FootballMatch,
  GoalNotificationEvent,
  MatchDetailedStats,
  MatchEvent,
  NationalCupId,
  NationalCupStandingsMap,
  NewsArticle,
  StandingRow,
  TopPlayerStat,
  TransferItem,
} from '../types/football.ts';

interface LeagueSource {
  espnSlug: string;
  competitionId: Exclude<CompetitionId, 'all'>;
  nationalCupId?: NationalCupId;
  competitionName: string;
  algerianFilterOnly?: boolean;
  skipDateOffsets?: boolean;
}

const LEAGUE_SOURCES: LeagueSource[] = [
  { espnSlug: 'fra.1', competitionId: 'ligue-1', competitionName: 'Ligue 1 McDonald’s' },
  { espnSlug: 'eng.1', competitionId: 'premier-league', competitionName: 'Premier League' },
  { espnSlug: 'esp.1', competitionId: 'la-liga', competitionName: 'La Liga EA Sports' },
  { espnSlug: 'ita.1', competitionId: 'serie-a', competitionName: 'Serie A Enilive' },
  { espnSlug: 'ger.1', competitionId: 'bundesliga', competitionName: 'Bundesliga' },
  {
    espnSlug: 'fifa.world',
    competitionId: 'national-teams',
    nationalCupId: 'world-cup',
    competitionName: 'Sélections — Coupe du Monde FIFA',
    skipDateOffsets: true,
  },
  {
    espnSlug: 'caf.nations',
    competitionId: 'national-teams',
    nationalCupId: 'afcon',
    competitionName: 'Sélections — Coupe d’Afrique des Nations (CAN)',
    skipDateOffsets: true,
  },
  {
    espnSlug: 'uefa.euro',
    competitionId: 'national-teams',
    nationalCupId: 'euro',
    competitionName: 'Sélections — UEFA Euro',
    skipDateOffsets: true,
  },
  {
    espnSlug: 'afc.asian.cup',
    competitionId: 'national-teams',
    nationalCupId: 'asian-cup',
    competitionName: 'Sélections — Coupe d’Asie AFC',
    skipDateOffsets: true,
  },
  {
    espnSlug: 'conmebol.america',
    competitionId: 'national-teams',
    nationalCupId: 'copa-america',
    competitionName: 'Sélections — Copa América',
    skipDateOffsets: true,
  },
  {
    espnSlug: 'concacaf.gold',
    competitionId: 'national-teams',
    nationalCupId: 'gold-cup',
    competitionName: 'Sélections — Gold Cup Concacaf',
    skipDateOffsets: true,
  },
  {
    espnSlug: 'uefa.nations',
    competitionId: 'national-teams',
    nationalCupId: 'nations-league',
    competitionName: 'Sélections — Ligue des Nations UEFA',
  },
  {
    espnSlug: 'concacaf.nations.league',
    competitionId: 'national-teams',
    nationalCupId: 'nations-league',
    competitionName: 'Sélections — Ligue des Nations Concacaf',
    skipDateOffsets: true,
  },
  {
    espnSlug: 'caf.nations_qual',
    competitionId: 'national-teams',
    nationalCupId: 'world-qualifiers',
    competitionName: 'Sélections — Éliminatoires CAN',
    skipDateOffsets: true,
  },
  {
    espnSlug: 'fifa.worldq.uefa',
    competitionId: 'national-teams',
    nationalCupId: 'world-qualifiers',
    competitionName: 'Sélections — Éliminatoires Mondial (Europe)',
    skipDateOffsets: true,
  },
  {
    espnSlug: 'fifa.worldq.caf',
    competitionId: 'national-teams',
    nationalCupId: 'world-qualifiers',
    competitionName: 'Sélections — Éliminatoires Mondial (Afrique)',
    skipDateOffsets: true,
  },
  {
    espnSlug: 'fifa.worldq.conmebol',
    competitionId: 'national-teams',
    nationalCupId: 'world-qualifiers',
    competitionName: 'Sélections — Éliminatoires Mondial (Am. du Sud)',
    skipDateOffsets: true,
  },
  {
    espnSlug: 'fifa.worldq.afc',
    competitionId: 'national-teams',
    nationalCupId: 'world-qualifiers',
    competitionName: 'Sélections — Éliminatoires Mondial (Asie)',
    skipDateOffsets: true,
  },
  {
    espnSlug: 'fifa.worldq.concacaf',
    competitionId: 'national-teams',
    nationalCupId: 'world-qualifiers',
    competitionName: 'Sélections — Éliminatoires Mondial (CONCACAF)',
    skipDateOffsets: true,
  },
  {
    espnSlug: 'fifa.friendly',
    competitionId: 'national-teams',
    nationalCupId: 'friendlies',
    competitionName: 'Sélections — Matchs Internationaux',
  },
  {
    espnSlug: 'caf.champions',
    competitionId: 'algerian-ligue-1',
    competitionName: 'Clubs Algériens — Ligue des Champions CAF',
    algerianFilterOnly: true,
  },
  {
    espnSlug: 'caf.confed',
    competitionId: 'algerian-ligue-1',
    competitionName: 'Clubs Algériens — Coupe Confédération CAF',
    algerianFilterOnly: true,
  },
];

const NEWS_SOURCES: { slug: string; competitionId: CompetitionId; label: string }[] = [
  { slug: 'all', competitionId: 'all', label: 'Europe & Monde' },
  { slug: 'fra.1', competitionId: 'ligue-1', label: 'Ligue 1' },
  { slug: 'eng.1', competitionId: 'premier-league', label: 'Premier League' },
  { slug: 'esp.1', competitionId: 'la-liga', label: 'La Liga' },
  { slug: 'ita.1', competitionId: 'serie-a', label: 'Serie A' },
  { slug: 'ger.1', competitionId: 'bundesliga', label: 'Bundesliga' },
  { slug: 'fifa.world', competitionId: 'national-teams', label: 'Sélections Nationales' },
  { slug: 'caf.nations', competitionId: 'algerian-ligue-1', label: 'Algérie & Afrique' },
];

const ALGERIAN_CLUB_KEYWORDS = [
  'mc alger',
  'mca',
  'belouizdad',
  'crb',
  'kabylie',
  'jsk',
  'usm alger',
  'usma',
  'constantine',
  'csc',
  'sétif',
  'setif',
  'saoura',
  'mc oran',
  'mco',
  'chlef',
  'akbou',
  'khenchela',
  'biskra',
  'ben aknoun',
  'el biar',
  'rouissat',
  'témouchent',
  'temouchent',
];

const IMAGE_BY_COMP: Record<CompetitionId, string> = {
  all: '/src/assets/images/editorial_match_action_1795348261245.jpg',
  'ligue-1': '/src/assets/images/hero_stadium_night_1795287057975.jpg',
  'premier-league': '/src/assets/images/editorial_match_action_1795348261245.jpg',
  'la-liga': '/src/assets/images/news_match_duel_1795287057563.jpg',
  'serie-a': '/src/assets/images/editorial_supporters_stands_1795348260566.jpg',
  bundesliga: '/src/assets/images/mercato_tunnel_view_1795287057654.jpg',
  'algerian-ligue-1': '/src/assets/images/hero_stadium_night_1795287057975.jpg',
  'national-teams': '/src/assets/images/news_national_teams_1795287057313.jpg',
};

const FALLBACK_GALLERY = [
  '/src/assets/images/editorial_match_action_1795348261245.jpg',
  '/src/assets/images/news_match_duel_1795287057563.jpg',
  '/src/assets/images/editorial_supporters_stands_1795348260566.jpg',
  '/src/assets/images/hero_stadium_night_1795287057975.jpg',
  '/src/assets/images/news_national_teams_1795287057313.jpg',
  '/src/assets/images/mercato_tunnel_view_1795287057654.jpg',
];

function extractEspnArticleImage(article: any): string | undefined {
  const images = article?.images;
  if (!Array.isArray(images) || images.length === 0) return undefined;

  const valid = images.filter(
    (img: any) =>
      typeof img?.url === 'string' &&
      img.url.startsWith('https://') &&
      !img.url.includes('placeholder'),
  );
  if (valid.length === 0) return undefined;

  const preferred =
    valid.find(
      (img: any) =>
        img.url.includes('espncdn.com/photo') && Number(img?.width ?? 0) >= 600,
    ) ||
    valid.find((img: any) => img.url.includes('espncdn.com/photo')) ||
    valid.sort((a: any, b: any) => Number(b?.width ?? 0) - Number(a?.width ?? 0))[0];

  return preferred?.url;
}

const translationCache = new Map<string, string>();

async function translateText(
  text: string,
  targetLang: AppLanguage,
  sourceLang: AppLanguage = 'en',
  retries = 1,
): Promise<string> {
  const clean = text.trim();
  if (!clean) return '';
  if (targetLang === sourceLang) return clean;

  const cacheKey = `${sourceLang}->${targetLang}::${clean}`;
  const cached = translationCache.get(cacheKey);
  if (cached) return cached;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4500);
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(clean)}`;
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      if (retries > 0 && res.status >= 500) {
        await new Promise((r) => setTimeout(r, 200));
        return translateText(clean, targetLang, sourceLang, retries - 1);
      }
      return clean;
    }
    const data = (await res.json()) as unknown;
    if (Array.isArray(data) && Array.isArray(data[0])) {
      const translated = (data[0] as any[])
        .map((chunk) => (Array.isArray(chunk) ? String(chunk[0] ?? '') : ''))
        .join('')
        .trim();
      if (translated) {
        if (translationCache.size > 2500) {
          const firstKey = translationCache.keys().next().value;
          if (firstKey) translationCache.delete(firstKey);
        }
        translationCache.set(cacheKey, translated);
        return translated;
      }
    }
  } catch {
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, 200));
      return translateText(clean, targetLang, sourceLang, retries - 1);
    }
  } finally {
    clearTimeout(timer);
  }
  return clean;
}

async function translateBatch(
  entries: { text: string; sourceLang: AppLanguage }[],
  targetLang: AppLanguage,
): Promise<string[]> {
  const results = entries.map((e) => e.text.trim());
  const bySource = new Map<AppLanguage, number[]>();

  entries.forEach((entry, idx) => {
    const clean = entry.text.trim();
    if (!clean || entry.sourceLang === targetLang) return;
    const cached = translationCache.get(`${entry.sourceLang}->${targetLang}::${clean}`);
    if (cached) {
      results[idx] = cached;
      return;
    }
    const list = bySource.get(entry.sourceLang) ?? [];
    list.push(idx);
    bySource.set(entry.sourceLang, list);
  });

  const chunkTasks: Promise<void>[] = [];
  for (const [sourceLang, indices] of bySource.entries()) {
    for (let i = 0; i < indices.length; i += 8) {
      const chunkIndices = indices.slice(i, i + 8);
      chunkTasks.push(
        (async () => {
          const cleanTexts = chunkIndices.map((idx) =>
            entries[idx].text.replace(/[\r\n]+/g, ' ').trim(),
          );
          const joined = cleanTexts.join('\n');
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 3200);
          try {
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(joined)}`;
            const res = await fetch(url, { signal: controller.signal });
            if (!res.ok) return;
            const data = (await res.json()) as unknown;
            if (!Array.isArray(data) || !Array.isArray(data[0])) return;
            const translatedJoined = (data[0] as any[])
              .map((chunk) => (Array.isArray(chunk) ? String(chunk[0] ?? '') : ''))
              .join('');
            const lines = translatedJoined.split('\n').map((l) => l.trim());
            if (lines.length === chunkIndices.length) {
              chunkIndices.forEach((origIdx, k) => {
                if (lines[k]) {
                  results[origIdx] = lines[k];
                  translationCache.set(
                    `${sourceLang}->${targetLang}::${entries[origIdx].text.trim()}`,
                    lines[k],
                  );
                }
              });
            }
          } catch {
            // Keep original text on timeout/rate limit
          } finally {
            clearTimeout(timer);
          }
        })(),
      );
    }
  }

  await Promise.all(chunkTasks);
  return results;
}

export function getParisDayKey(date: Date = new Date()): string {
  return date.toLocaleDateString('en-CA', { timeZone: 'Europe/Paris' });
}

function formatEspnDate(offsetDays: number): string {
  const parisToday = getParisDayKey(new Date());
  const [y, m, d] = parisToday.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + offsetDays));
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yy}${mm}${dd}`;
}

export function formatLocalizedNewsDate(iso: string, lang: AppLanguage): string {
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) {
    if (lang === 'ar') return 'اليوم';
    if (lang === 'en') return 'Today';
    return 'Aujourd’hui';
  }
  const todayKey = getParisDayKey(new Date());
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayKey = getParisDayKey(yesterday);
  const itemKey = getParisDayKey(dt);

  const locale = lang === 'ar' ? 'ar-EG-u-nu-latn' : lang === 'en' ? 'en-GB' : 'fr-FR';
  const timePart = dt.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Paris',
  });

  if (itemKey === todayKey) {
    if (lang === 'ar') return `اليوم · ${timePart}`;
    if (lang === 'en') return `Today · ${timePart}`;
    return `Aujourd’hui · ${timePart}`;
  }
  if (itemKey === yesterdayKey) {
    if (lang === 'ar') return `أمس · ${timePart}`;
    if (lang === 'en') return `Yesterday · ${timePart}`;
    return `Hier · ${timePart}`;
  }
  return dt.toLocaleString(locale, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Paris',
  });
}

function translateStatusDetail(detail?: string, state?: string): string | undefined {
  if (!detail) return undefined;
  const upper = detail.trim().toUpperCase();
  if (upper === 'FT' || upper === 'FULL TIME') return 'Terminé';
  if (upper === 'FT-PENS' || upper === 'AET') return 'Terminé (Prol./T.A.B.)';
  if (upper === 'HT' || upper === 'HALFTIME') return 'Mi-temps';
  if (upper === 'SCHEDULED' || state === 'pre') return 'Programmé';
  if (upper === 'POSTPONED') return 'Reporté';
  if (upper === 'CANCELED' || upper === 'CANCELLED' || upper === 'ABANDONED') return 'Annulé';
  return detail;
}

async function fetchJson<T>(url: string, timeoutMs = 6000, headers?: Record<string, string>): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'ThePitchApp/1.0',
        ...headers,
      },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchText(url: string, timeoutMs = 6000): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/rss+xml, application/xml, text/xml, text/plain',
        'User-Agent': 'Mozilla/5.0 (compatible; ThePitchBot/1.0)',
      },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function readStatNum(stats: any[] | undefined, name: string): number {
  if (!Array.isArray(stats)) return 0;
  const item = stats.find((s) => s?.name === name);
  if (!item) return 0;
  const val = Number(item.value ?? item.displayValue ?? 0);
  return Number.isFinite(val) ? val : 0;
}

function normalizeColor(hex?: string, fallback = '#334155'): string {
  if (!hex || typeof hex !== 'string') return fallback;
  const clean = hex.replace('#', '').trim();
  if (/^[0-9a-fA-F]{6}$/.test(clean)) {
    if (clean.toLowerCase() === '000000') return '#1E293B';
    return `#${clean}`;
  }
  return fallback;
}

function parseMinute(clock?: string): number {
  if (!clock) return 0;
  const m = clock.match(/(\d+)/);
  return m ? Number(m[1]) : 0;
}

function mapEventType(typeText?: string): MatchEvent['type'] | null {
  const t = (typeText || '').toLowerCase();
  if (t.includes('penalty') && t.includes('goal')) return 'penalty_goal';
  if (t.includes('goal')) return 'goal';
  if (t.includes('yellow')) return 'yellow_card';
  if (t.includes('red')) return 'red_card';
  if (t.includes('substitution')) return 'substitution';
  return null;
}

function isAlgerianTeamName(name: string): boolean {
  const lower = name.toLowerCase();
  return ALGERIAN_CLUB_KEYWORDS.some((kw) => lower.includes(kw));
}

export function parseEspnScoreboardEvent(ev: any, source: LeagueSource): FootballMatch | null {
  const comp = ev?.competitions?.[0];
  if (!comp) return null;

  const home = comp.competitors?.find((c: any) => c.homeAway === 'home') ?? comp.competitors?.[0];
  const away = comp.competitors?.find((c: any) => c.homeAway === 'away') ?? comp.competitors?.[1];
  if (!home || !away) return null;

  const homeName: string = home.team?.displayName || 'Domicile';
  const awayName: string = away.team?.displayName || 'Extérieur';

  if (source.algerianFilterOnly && !isAlgerianTeamName(homeName) && !isAlgerianTeamName(awayName)) {
    return null;
  }

  const state = ev?.status?.type?.state;
  const status: FootballMatch['status'] =
    state === 'in' ? 'live' : state === 'post' ? 'finished' : 'upcoming';

  const clockStr = ev?.status?.displayClock || ev?.status?.type?.shortDetail || '';
  const minute = status === 'live' ? parseMinute(clockStr) || undefined : undefined;

  const dateIso = ev?.date || new Date().toISOString();
  const kickoffDate = new Date(dateIso);
  const kickoffTime = kickoffDate.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Paris',
  });

  const homeStats = home.statistics;
  const awayStats = away.statistics;

  const stats: MatchDetailedStats = {
    possession: [
      Math.round(readStatNum(homeStats, 'possessionPct')) || 50,
      Math.round(readStatNum(awayStats, 'possessionPct')) || 50,
    ],
    shotsTotal: [
      readStatNum(homeStats, 'totalShots'),
      readStatNum(awayStats, 'totalShots'),
    ],
    shotsOnTarget: [
      readStatNum(homeStats, 'shotsOnTarget'),
      readStatNum(awayStats, 'shotsOnTarget'),
    ],
    passesCompleted: [
      readStatNum(homeStats, 'accuratePasses'),
      readStatNum(awayStats, 'accuratePasses'),
    ],
    passAccuracy: [
      Math.round(readStatNum(homeStats, 'passPct') * (readStatNum(homeStats, 'passPct') <= 1 ? 100 : 1)),
      Math.round(readStatNum(awayStats, 'passPct') * (readStatNum(awayStats, 'passPct') <= 1 ? 100 : 1)),
    ],
    corners: [
      readStatNum(homeStats, 'wonCorners'),
      readStatNum(awayStats, 'wonCorners'),
    ],
    fouls: [
      readStatNum(homeStats, 'foulsCommitted'),
      readStatNum(awayStats, 'foulsCommitted'),
    ],
    yellowCards: [
      readStatNum(homeStats, 'yellowCards'),
      readStatNum(awayStats, 'yellowCards'),
    ],
    redCards: [
      readStatNum(homeStats, 'redCards'),
      readStatNum(awayStats, 'redCards'),
    ],
    saves: [
      readStatNum(homeStats, 'saves'),
      readStatNum(awayStats, 'saves'),
    ],
    offsides: [
      readStatNum(homeStats, 'offsides'),
      readStatNum(awayStats, 'offsides'),
    ],
  };

  const events: MatchEvent[] = [];
  if (Array.isArray(comp.details)) {
    comp.details.forEach((d: any, idx: number) => {
      const mappedType = mapEventType(d?.type?.text);
      if (!mappedType) return;
      const teamSide: 'home' | 'away' =
        String(d?.team?.id) === String(home.team?.id) ? 'home' : 'away';
      const player = d?.athletesInvolved?.[0]?.displayName || 'Joueur';
      const assist = d?.athletesInvolved?.[1]?.displayName;
      events.push({
        id: `${ev.id}-ev-${idx}`,
        minute: parseMinute(d?.clock?.displayValue),
        clockDisplay: d?.clock?.displayValue,
        team: teamSide,
        type: mappedType,
        player,
        assist,
      });
    });
  }

  const broadcasts = comp.broadcasts?.[0]?.names?.join(', ');

  return {
    id: String(ev.id),
    espnLeagueSlug: source.espnSlug,
    competitionId: source.competitionId,
    nationalCupId: source.nationalCupId,
    competitionName: source.competitionName,
    matchday:
      ev?.season?.slug === 'regular-season'
        ? 'Saison régulière'
        : comp?.notes?.[0]?.headline || 'Journée en cours',
    date: dateIso,
    kickoffTime,
    status,
    statusDetail: translateStatusDetail(ev?.status?.type?.shortDetail, state),
    minute,
    stadium: comp?.venue?.fullName || 'Stade officiel',
    city: comp?.venue?.address?.city || '',
    attendance: comp?.attendance ? Number(comp.attendance).toLocaleString('fr-FR') : undefined,
    tvChannel: broadcasts || undefined,
    homeTeam: {
      id: String(home.team?.id ?? ''),
      name: homeName,
      shortName: home.team?.shortDisplayName || homeName,
      code: (home.team?.abbreviation || 'DOM').slice(0, 4),
      logo: home.team?.logo || home.team?.logos?.[0]?.href || undefined,
      accentColor: normalizeColor(home.team?.color, '#1D4ED8'),
      score: Number(home.score ?? 0),
    },
    awayTeam: {
      id: String(away.team?.id ?? ''),
      name: awayName,
      shortName: away.team?.shortDisplayName || awayName,
      code: (away.team?.abbreviation || 'EXT').slice(0, 4),
      logo: away.team?.logo || away.team?.logos?.[0]?.href || undefined,
      accentColor: normalizeColor(away.team?.color, '#DC2626'),
      score: Number(away.score ?? 0),
    },
    stats,
    events,
  };
}

// ---------- Algerian Ligue 1 Real Data (Wikipedia + Wikimedia + Optional API-Football) ----------

const ALGERIAN_CLUB_STADIUMS: Record<string, { stadium: string; city: string; color: string }> = {
  JSK: { stadium: 'Stade Hocine-Aït-Ahmed', city: 'Tizi Ouzou', color: '#EAB308' },
  CRB: { stadium: 'Stade du 20-Août-1955', city: 'Alger', color: '#DC2626' },
  MCA: { stadium: 'Stade Ali-la-Pointe', city: 'Alger', color: '#16A34A' },
  USMA: { stadium: 'Stade Omar-Benrabah', city: 'Alger', color: '#B91C1C' },
  MCO: { stadium: 'Stade Miloud-Hadefi', city: 'Oran', color: '#DC2626' },
  ESS: { stadium: 'Stade du 8-Mai-1945', city: 'Sétif', color: '#1E293B' },
  CSC: { stadium: 'Stade Chahid-Hamlaoui', city: 'Constantine', color: '#15803D' },
  JSS: { stadium: 'Stade du 20-Août-1955', city: 'Béchar', color: '#CA8A04' },
  ASO: { stadium: 'Stade Mohamed-Boumezrag', city: 'Chlef', color: '#DC2626' },
  USB: { stadium: 'Stade du 18-Février', city: 'Biskra', color: '#16A34A' },
  USMK: { stadium: 'Stade Amar-Hamam', city: 'Khenchela', color: '#1E293B' },
  OA: { stadium: 'Stade de l’Unité Maghrébine', city: 'Béjaïa', color: '#0284C7' },
  ESBA: { stadium: 'Stade El Mokrani', city: 'Alger', color: '#DC2626' },
  JSEB: { stadium: 'Stade Abderrahmane-Ibrir', city: 'Alger', color: '#1D4ED8' },
  MBR: { stadium: 'Stade de Rouissat', city: 'Ouargla', color: '#0F766E' },
  CRT: { stadium: 'Stade Omar-Oucief', city: 'Aïn Témouchent', color: '#DC2626' },
};

const ALGERIAN_FR_WIKI_TITLES: Record<string, string> = {
  'ES Sétif': 'Entente sportive sétifienne',
  'JS El Biar': "Jeunesse sportive d'El Biar",
  'USM Khenchela': 'Union sportive madinet Khenchela',
  'JS Saoura': 'Jeunesse sportive de Saoura',
  'ES Ben Aknoun': 'Étoile sportive de Ben Aknoun',
  'US Biskra': 'Union sportive de Biskra',
  'CR Témouchent': 'Chabab Riadhi Témouchent',
  'MB Rouissat': 'Moustakbal Baladiat Rouissat',
};

let cachedAlgLogos: Record<string, string> = {};
let cachedAlgLogosFetchedAt = 0;

export async function fetchAlgerianClubLogos(clubNames: string[]): Promise<Record<string, string>> {
  if (Object.keys(cachedAlgLogos).length >= 12 && Date.now() - cachedAlgLogosFetchedAt < 12 * 3600 * 1000) {
    return cachedAlgLogos;
  }

  const logos: Record<string, string> = { ...cachedAlgLogos };
  const [enRes, frRes] = await Promise.all([
    fetchJson<any>(
      `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(clubNames.join('|'))}&prop=pageimages&pithumbsize=128&format=json&origin=*`,
      5000,
    ),
    fetchJson<any>(
      `https://fr.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(Object.values(ALGERIAN_FR_WIKI_TITLES).join('|'))}&prop=pageimages&pithumbsize=128&format=json&origin=*`,
      5000,
    ),
  ]);

  if (enRes?.query?.pages) {
    for (const page of Object.values(enRes.query.pages) as any[]) {
      if (page?.title && page?.thumbnail?.source) {
        logos[page.title] = page.thumbnail.source;
      }
    }
  }

  if (frRes?.query?.pages) {
    const reverseMap = new Map<string, string>();
    for (const [enName, frTitle] of Object.entries(ALGERIAN_FR_WIKI_TITLES)) {
      reverseMap.set(frTitle.toLowerCase(), enName);
    }
    for (const page of Object.values(frRes.query.pages) as any[]) {
      if (page?.title && page?.thumbnail?.source) {
        const canonical = reverseMap.get(String(page.title).toLowerCase());
        if (canonical && !logos[canonical]) {
          logos[canonical] = page.thumbnail.source;
        }
      }
    }
  }

  if (Object.keys(logos).length > 0) {
    cachedAlgLogos = logos;
    cachedAlgLogosFetchedAt = Date.now();
  }
  return logos;
}

function emptyMatchStats(): MatchDetailedStats {
  return {
    possession: [50, 50],
    shotsTotal: [0, 0],
    shotsOnTarget: [0, 0],
    passesCompleted: [0, 0],
    passAccuracy: [0, 0],
    corners: [0, 0],
    fouls: [0, 0],
    yellowCards: [0, 0],
    redCards: [0, 0],
    saves: [0, 0],
    offsides: [0, 0],
  };
}

function cleanWikiLink(raw: string): string {
  return raw
    .replace(/\[\[(?:[^|\]]*\|)?([^\]]+)\]\]/g, '$1')
    .replace(/\{\{[^}]*\}\}/g, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

export interface AlgerianWikipediaBundle {
  standings: StandingRow[];
  topPlayers: TopPlayerStat[];
  matches: FootballMatch[];
}

let cachedAlgWikiBundle: { data: AlgerianWikipediaBundle; fetchedAt: number } | null = null;
let inFlightAlgWikiBundle: Promise<AlgerianWikipediaBundle> | null = null;

export async function fetchAlgerianWikipediaBundle(): Promise<AlgerianWikipediaBundle> {
  if (cachedAlgWikiBundle && Date.now() - cachedAlgWikiBundle.fetchedAt < 5 * 60 * 1000) {
    return cachedAlgWikiBundle.data;
  }
  if (inFlightAlgWikiBundle) {
    return inFlightAlgWikiBundle;
  }

  inFlightAlgWikiBundle = (async () => {
    try {
      const wiki = await fetchJson<any>(
        'https://en.wikipedia.org/w/api.php?action=query&titles=2026%E2%80%9327_Algerian_Ligue_Professionnelle_1&prop=revisions&rvprop=content&format=json&rvslots=main&origin=*',
        6000,
      );

      const page = wiki?.query?.pages ? (Object.values(wiki.query.pages)[0] as any) : null;
      const content: string = page?.revisions?.[0]?.slots?.main?.['*'] || '';
      if (!content) {
        return cachedAlgWikiBundle?.data ?? { standings: [], topPlayers: [], matches: [] };
      }

  // Parse League table section
  const tableStart = content.indexOf('==League table==');
  const tableSection =
    tableStart >= 0 ? content.slice(tableStart, content.indexOf('==Results==', tableStart)) : '';

  const teamOrderMatch = tableSection.match(/\|team_order\s*=\s*([^\n|]+)/);
  const codes = teamOrderMatch
    ? teamOrderMatch[1]
        .replace(/<!--[\s\S]*?-->/g, '')
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean)
    : [];

  const updateDateMatch = content.match(/\|update\s*=\s*([0-9]{1,2}\s+[A-Za-z]+\s+[0-9]{4})/);
  const parsedUpdateDate = updateDateMatch ? new Date(`${updateDateMatch[1]} 17:00 UTC`) : new Date();
  const updateIso = !Number.isNaN(parsedUpdateDate.getTime())
    ? parsedUpdateDate.toISOString()
    : new Date().toISOString();

  const teamNamesByCode: Record<string, string> = {};
  for (const m of tableSection.matchAll(/\|name_([A-Z]+)\s*=\s*([^\n|]+)/g)) {
    teamNamesByCode[m[1].trim()] = cleanWikiLink(m[2]);
  }

  const logos = await fetchAlgerianClubLogos(Object.values(teamNamesByCode));

  const zoneByRank: Record<number, StandingRow['zone']> = {};
  for (const m of tableSection.matchAll(/\|result(\d+)\s*=\s*([A-Z0-9]+)/g)) {
    const rank = Number(m[1]);
    const val = m[2].trim();
    if (val.startsWith('CCL')) zoneByRank[rank] = 'ucl';
    else if (val.startsWith('CCC')) zoneByRank[rank] = 'uel';
    else if (val === 'REL') zoneByRank[rank] = 'relegation';
    else if (val === 'PO') zoneByRank[rank] = 'playoff';
  }

  const readTeamParam = (param: string, code: string): number => {
    const rx = new RegExp(`\\|${param}_${code}\\s*=\\s*(\\d+)`);
    const m = tableSection.match(rx);
    return m ? Number(m[1]) : 0;
  };

  const standings: StandingRow[] = codes.map((code, idx) => {
    const position = idx + 1;
    const won = readTeamParam('win', code);
    const drawn = readTeamParam('draw', code);
    const lost = readTeamParam('loss', code);
    const goalsFor = readTeamParam('gf', code);
    const goalsAgainst = readTeamParam('ga', code);
    const team = teamNamesByCode[code] || code;
    return {
      position,
      team,
      shortName: team,
      logo: logos[team],
      played: won + drawn + lost,
      won,
      drawn,
      lost,
      goalsFor,
      goalsAgainst,
      goalDiff: goalsFor - goalsAgainst,
      points: won * 3 + drawn,
      zone: zoneByRank[position],
    };
  });

  // Parse Top scorers section
  const topPlayers: TopPlayerStat[] = [];
  const scorersStart = content.indexOf('==Top scorers==');
  if (scorersStart >= 0) {
    const scorersEnd = content.indexOf('===Hat-tricks===', scorersStart);
    const scorersBlock = content.slice(
      scorersStart,
      scorersEnd > scorersStart ? scorersEnd : scorersStart + 1800,
    );
    const rows = scorersBlock.split('|-').slice(1);
    let currentRank = 1;
    let currentGoals = 0;
    for (const row of rows) {
      if (row.includes('!scope')) continue;
      const cleaned = row.replace(/^\s*\n/, '');
      const cells = cleaned
        .split(/\n\||\|\|/)
        .map((c) => c.trim())
        .filter(Boolean);
      const links = [...row.matchAll(/\[\[(?:[^|\]]*\|)?([^\]]+)\]\]/g)].map((m) => m[1].trim());
      if (links.length >= 2) {
        const player = links[0];
        const club = links[1];
        const goalCellMatch = row.match(/\|\s*(?:rowspan=\d+\s*align="center"\|)?\s*(\d+)\s*(?:\n|$)/);
        const rankMatch = row.match(/^\s*\|(?:rowspan=\d+\s*align="center"\|)?\s*(\d+)\s*\|/);
        if (rankMatch) currentRank = Number(rankMatch[1]);
        if (goalCellMatch) currentGoals = Number(goalCellMatch[1]);
        if (player && club && currentGoals > 0) {
          topPlayers.push({
            rank: currentRank,
            player,
            club,
            competitionId: 'algerian-ligue-1',
            appearances: 9,
            goals: currentGoals,
            assists: 0,
            goalContributions: currentGoals,
          });
        }
      }
      void cells;
    }
  }

  // Parse Results matrix into recent finished matches
  const matches: FootballMatch[] = [];
  const resultsStart = content.indexOf('==Results==');
  if (resultsStart >= 0) {
    const resultsEnd = content.indexOf('==Clubs season-progress==', resultsStart);
    const resultsBlock = content.slice(
      resultsStart,
      resultsEnd > resultsStart ? resultsEnd : resultsStart + 6500,
    );
    for (const m of resultsBlock.matchAll(/\|match_([A-Z]+)_([A-Z]+)\s*=\s*(\d+)\s*[–-]\s*(\d+)/g)) {
      const homeCode = m[1].trim();
      const awayCode = m[2].trim();
      const homeScore = Number(m[3]);
      const awayScore = Number(m[4]);
      const homeName = teamNamesByCode[homeCode] || homeCode;
      const awayName = teamNamesByCode[awayCode] || awayCode;
      const meta = ALGERIAN_CLUB_STADIUMS[homeCode] ?? {
        stadium: `Stade ${homeName}`,
        city: 'Algérie',
        color: '#16A34A',
      };
      const awayColor = ALGERIAN_CLUB_STADIUMS[awayCode]?.color ?? '#DC2626';

      matches.push({
        id: `dz-2026-${homeCode}-${awayCode}`,
        competitionId: 'algerian-ligue-1',
        competitionName: 'Ligue 1 Mobilis (Algérie)',
        matchday: 'Saison 2026–27 · LFP.dz',
        date: updateIso,
        kickoffTime: '17:00',
        status: 'finished',
        statusDetail: 'Terminé',
        stadium: meta.stadium,
        city: meta.city,
        homeTeam: {
          id: `dz-${homeCode}`,
          name: homeName,
          shortName: homeName,
          code: homeCode,
          logo: logos[homeName],
          accentColor: meta.color,
          score: homeScore,
        },
        awayTeam: {
          id: `dz-${awayCode}`,
          name: awayName,
          shortName: awayName,
          code: awayCode,
          logo: logos[awayName],
          accentColor: awayColor,
          score: awayScore,
        },
        stats: emptyMatchStats(),
        events: [],
      });
    }
  }

  const bundle: AlgerianWikipediaBundle = {
    standings,
    topPlayers,
    matches: matches.slice(0, 32),
  };

      cachedAlgWikiBundle = { data: bundle, fetchedAt: Date.now() };
      return bundle;
    } finally {
      inFlightAlgWikiBundle = null;
    }
  })();

  return inFlightAlgWikiBundle;
}

async function fetchOptionalApiFootballAlgerianMatches(): Promise<FootballMatch[]> {
  const apiKey = process.env.API_FOOTBALL_KEY?.trim();
  if (!apiKey) return [];

  const headers = { 'x-apisports-key': apiKey };
  const [nextRes, lastRes] = await Promise.all([
    fetchJson<any>(
      'https://v3.football.api-sports.io/fixtures?league=186&season=2026&next=10',
      5000,
      headers,
    ),
    fetchJson<any>(
      'https://v3.football.api-sports.io/fixtures?league=186&season=2026&last=10',
      5000,
      headers,
    ),
  ]);

  const combined = [
    ...(Array.isArray(nextRes?.response) ? nextRes.response : []),
    ...(Array.isArray(lastRes?.response) ? lastRes.response : []),
  ];

  const out: FootballMatch[] = [];
  for (const item of combined) {
    const f = item?.fixture;
    const teams = item?.teams;
    const goals = item?.goals;
    if (!f?.id || !teams?.home?.name || !teams?.away?.name) continue;

    const short = String(f?.status?.short || 'NS').toUpperCase();
    const status: FootballMatch['status'] = ['1H', '2H', 'HT', 'ET', 'P', 'LIVE'].includes(short)
      ? 'live'
      : ['FT', 'AET', 'PEN'].includes(short)
        ? 'finished'
        : 'upcoming';

    const dateIso = f.date || new Date().toISOString();
    const kickoffTime = new Date(dateIso).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Paris',
    });

    out.push({
      id: `af-${f.id}`,
      competitionId: 'algerian-ligue-1',
      competitionName: 'Ligue 1 Mobilis (Algérie)',
      matchday: item?.league?.round || 'Saison 2026–27',
      date: dateIso,
      kickoffTime,
      status,
      statusDetail: translateStatusDetail(short, status === 'upcoming' ? 'pre' : undefined),
      minute: typeof f?.status?.elapsed === 'number' ? f.status.elapsed : undefined,
      stadium: f?.venue?.name || 'Stade officiel',
      city: f?.venue?.city || 'Algérie',
      homeTeam: {
        id: String(teams.home.id),
        name: teams.home.name,
        shortName: teams.home.name,
        code: teams.home.name.slice(0, 3).toUpperCase(),
        logo: teams.home.logo || undefined,
        accentColor: '#16A34A',
        score: Number(goals?.home ?? 0),
      },
      awayTeam: {
        id: String(teams.away.id),
        name: teams.away.name,
        shortName: teams.away.name,
        code: teams.away.name.slice(0, 3).toUpperCase(),
        logo: teams.away.logo || undefined,
        accentColor: '#DC2626',
        score: Number(goals?.away ?? 0),
      },
      stats: emptyMatchStats(),
      events: [],
    });
  }
  return out;
}

export async function fetchAllLiveMatches(
  includeHistoryAndSchedule: boolean | 'compact' = true,
): Promise<FootballMatch[]> {
  const matchMap = new Map<string, FootballMatch>();

  const dateOffsets =
    includeHistoryAndSchedule === 'compact'
      ? [0, 1, -1]
      : includeHistoryAndSchedule
        ? [0, 1, 2, -1, -2]
        : [0];
  const reqTimeout = includeHistoryAndSchedule === 'compact' ? 3800 : 5500;
  const requests: Promise<void>[] = [];

  for (const source of LEAGUE_SOURCES) {
    const todayStr = formatEspnDate(0);
    requests.push(
      fetchJson<any>(
        `https://site.api.espn.com/apis/site/v2/sports/soccer/${source.espnSlug}/scoreboard`,
        reqTimeout,
      ).then((data) => {
        if (!data?.events) return;
        for (const ev of data.events) {
          const parsed = parseEspnScoreboardEvent(ev, source);
          if (parsed) matchMap.set(parsed.id, parsed);
        }
      }),
    );

    if (!source.algerianFilterOnly && !source.skipDateOffsets && includeHistoryAndSchedule !== 'compact') {
      requests.push(
        fetchJson<any>(
          `https://site.api.espn.com/apis/site/v2/sports/soccer/${source.espnSlug}/scoreboard?dates=${todayStr}`,
          reqTimeout,
        ).then((data) => {
          if (!data?.events) return;
          for (const ev of data.events) {
            const parsed = parseEspnScoreboardEvent(ev, source);
            if (parsed) matchMap.set(parsed.id, parsed);
          }
        }),
      );
    }

    if (includeHistoryAndSchedule && !source.algerianFilterOnly && !source.skipDateOffsets) {
      for (const offset of dateOffsets) {
        if (offset === 0) continue;
        if (source.competitionId === 'national-teams' && offset > 1) continue;
        const dateParam = formatEspnDate(offset);
        requests.push(
          fetchJson<any>(
            `https://site.api.espn.com/apis/site/v2/sports/soccer/${source.espnSlug}/scoreboard?dates=${dateParam}`,
            reqTimeout,
          ).then((data) => {
            if (!data?.events) return;
            for (const ev of data.events) {
              const parsed = parseEspnScoreboardEvent(ev, source);
              if (parsed && !matchMap.has(parsed.id)) {
                matchMap.set(parsed.id, parsed);
              }
            }
          }),
        );
      }
    }
  }

  const [algWiki, apiFootballMatches] = await Promise.all([
    includeHistoryAndSchedule
      ? fetchAlgerianWikipediaBundle()
      : Promise.resolve({ standings: [], topPlayers: [], matches: [] }),
    fetchOptionalApiFootballAlgerianMatches(),
    ...requests,
  ]);

  for (const m of apiFootballMatches) {
    matchMap.set(m.id, m);
  }
  for (const m of algWiki.matches) {
    if (!matchMap.has(m.id)) {
      matchMap.set(m.id, m);
    }
  }

  const list = Array.from(matchMap.values());
  const orderWeight = { live: 0, upcoming: 1, finished: 2 };
  list.sort((a, b) => {
    const wDiff = orderWeight[a.status] - orderWeight[b.status];
    if (wDiff !== 0) return wDiff;
    const tA = new Date(a.date).getTime();
    const tB = new Date(b.date).getTime();
    return a.status === 'finished' ? tB - tA : tA - tB;
  });

  return list;
}

export async function fetchMatchDetails(
  matchId: string,
  espnSlug: string,
  existingMatch?: FootballMatch,
): Promise<FootballMatch | null> {
  if (matchId.startsWith('dz-') || matchId.startsWith('af-')) {
    return existingMatch ?? null;
  }

  const sum = await fetchJson<any>(
    `https://site.api.espn.com/apis/site/v2/sports/soccer/${espnSlug}/summary?event=${encodeURIComponent(matchId)}`,
    6000,
  );
  if (!sum) return existingMatch ?? null;

  const comp = sum?.header?.competitions?.[0];
  const baseSource =
    LEAGUE_SOURCES.find((s) => s.espnSlug === espnSlug) ?? LEAGUE_SOURCES[0];

  let match = existingMatch ? { ...existingMatch } : null;
  if (!match && comp) {
    match = parseEspnScoreboardEvent(
      {
        id: matchId,
        date: comp.date,
        status: comp.status,
        competitions: [comp],
      },
      baseSource,
    );
  }
  if (!match) return null;

  const teamsBox = sum?.boxscore?.teams;
  if (Array.isArray(teamsBox) && teamsBox.length === 2) {
    const homeBox =
      teamsBox.find((t: any) => String(t?.team?.id) === String(match!.homeTeam.id)) ?? teamsBox[0];
    const awayBox =
      teamsBox.find((t: any) => String(t?.team?.id) === String(match!.awayTeam.id)) ?? teamsBox[1];

    const hs = homeBox?.statistics;
    const as = awayBox?.statistics;
    const toPct = (val: number) => (val > 0 && val <= 1 ? Math.round(val * 100) : Math.round(val));

    match.stats = {
      possession: [
        Math.round(readStatNum(hs, 'possessionPct')) || match.stats.possession[0],
        Math.round(readStatNum(as, 'possessionPct')) || match.stats.possession[1],
      ],
      shotsTotal: [readStatNum(hs, 'totalShots'), readStatNum(as, 'totalShots')],
      shotsOnTarget: [readStatNum(hs, 'shotsOnTarget'), readStatNum(as, 'shotsOnTarget')],
      passesCompleted: [readStatNum(hs, 'accuratePasses'), readStatNum(as, 'accuratePasses')],
      passAccuracy: [toPct(readStatNum(hs, 'passPct')), toPct(readStatNum(as, 'passPct'))],
      corners: [readStatNum(hs, 'wonCorners'), readStatNum(as, 'wonCorners')],
      fouls: [readStatNum(hs, 'foulsCommitted'), readStatNum(as, 'foulsCommitted')],
      yellowCards: [readStatNum(hs, 'yellowCards'), readStatNum(as, 'yellowCards')],
      redCards: [readStatNum(hs, 'redCards'), readStatNum(as, 'redCards')],
      saves: [readStatNum(hs, 'saves'), readStatNum(as, 'saves')],
      offsides: [readStatNum(hs, 'offsides'), readStatNum(as, 'offsides')],
    };
  }

  if (Array.isArray(sum?.keyEvents) && sum.keyEvents.length > 0) {
    const parsedEvents: MatchEvent[] = [];
    sum.keyEvents.forEach((k: any, idx: number) => {
      const mappedType = mapEventType(k?.type?.text);
      if (!mappedType) return;
      const teamSide: 'home' | 'away' =
        String(k?.team?.id) === String(match!.homeTeam.id) ? 'home' : 'away';
      const player =
        k?.participants?.[0]?.athlete?.displayName ||
        k?.text?.split('(')[0]?.trim() ||
        'Joueur';
      const assist = k?.participants?.[1]?.athlete?.displayName;
      parsedEvents.push({
        id: `${matchId}-ke-${idx}`,
        minute: parseMinute(k?.clock?.displayValue),
        clockDisplay: k?.clock?.displayValue,
        team: teamSide,
        type: mappedType,
        player,
        assist,
        detail: k?.text,
      });
    });
    if (parsedEvents.length > 0) {
      match.events = parsedEvents;
    }
  }

  if (sum?.gameInfo?.attendance) {
    match.attendance = Number(sum.gameInfo.attendance).toLocaleString('fr-FR');
  }
  if (Array.isArray(sum?.gameInfo?.officials) && sum.gameInfo.officials[0]?.displayName) {
    match.referee = sum.gameInfo.officials[0].displayName;
  }
  if (sum?.gameInfo?.venue?.fullName) {
    match.stadium = sum.gameInfo.venue.fullName;
    match.city = sum.gameInfo.venue.address?.city || match.city;
  }
  if (Array.isArray(sum?.rosters)) {
    const hRoster = sum.rosters.find((r: any) => String(r?.team?.id) === String(match!.homeTeam.id));
    const aRoster = sum.rosters.find((r: any) => String(r?.team?.id) === String(match!.awayTeam.id));
    if (hRoster?.formation) match.homeTeam.formation = hRoster.formation;
    if (aRoster?.formation) match.awayTeam.formation = aRoster.formation;
  }

  return match;
}

export async function fetchAllStandings(): Promise<Record<Exclude<CompetitionId, 'all'>, StandingRow[]>> {
  const result: Record<Exclude<CompetitionId, 'all'>, StandingRow[]> = {
    'ligue-1': [],
    'premier-league': [],
    'la-liga': [],
    'serie-a': [],
    bundesliga: [],
    'algerian-ligue-1': [],
    'national-teams': [],
  };

  const standingSources: { slug: string; compId: Exclude<CompetitionId, 'all'> }[] = [
    { slug: 'fra.1', compId: 'ligue-1' },
    { slug: 'eng.1', compId: 'premier-league' },
    { slug: 'esp.1', compId: 'la-liga' },
    { slug: 'ita.1', compId: 'serie-a' },
    { slug: 'ger.1', compId: 'bundesliga' },
    { slug: 'uefa.nations', compId: 'national-teams' },
  ];

  const [algWiki] = await Promise.all([
    fetchAlgerianWikipediaBundle(),
    ...standingSources.map(async ({ slug, compId }) => {
      const data = await fetchJson<any>(
        `https://site.api.espn.com/apis/v2/sports/soccer/${slug}/standings`,
        5500,
      );
      if (!data?.children?.length) return;

      const rows: StandingRow[] = [];
      const groups = compId === 'national-teams' ? data.children.slice(0, 4) : [data.children[0]];

      for (const child of groups) {
        const entries = child?.standings?.entries;
        if (!Array.isArray(entries)) continue;

        entries.forEach((entry: any, idx: number) => {
          const getStat = (name: string) => {
            const found = entry?.stats?.find((s: any) => s?.name === name);
            return Number(found?.value ?? 0);
          };

          const position = getStat('rank') || idx + 1;
          const totalInTable = entries.length;

          let zone: StandingRow['zone'] | undefined;
          if (compId !== 'national-teams') {
            if (position <= 4) zone = 'ucl';
            else if (position <= 6) zone = 'uel';
            else if (position >= totalInTable - 2) zone = 'relegation';
          } else if (position <= 2) {
            zone = 'ucl';
          }

          rows.push({
            position,
            team: entry?.team?.displayName || 'Équipe',
            shortName: entry?.team?.shortDisplayName || entry?.team?.displayName || 'Équipe',
            logo: entry?.team?.logos?.[0]?.href || entry?.team?.logo || undefined,
            played: getStat('gamesPlayed'),
            won: getStat('wins'),
            drawn: getStat('ties'),
            lost: getStat('losses'),
            goalsFor: getStat('pointsFor'),
            goalsAgainst: getStat('pointsAgainst'),
            goalDiff: getStat('pointDifferential'),
            points: getStat('points'),
            groupName: compId === 'national-teams' ? child?.name?.replace('Group ', 'Groupe ') : undefined,
            zone,
          });
        });
      }

      if (compId !== 'national-teams') {
        rows.sort((a, b) => a.position - b.position);
      }
      result[compId] = rows;
    }),
  ]);

  if (algWiki.standings.length > 0) {
    result['algerian-ligue-1'] = algWiki.standings;
  }

  return result;
}

// ---------- National Team Cups Standings & FIFA World Ranking ----------

const COUNTRY_NAME_ALIASES: Record<string, string[]> = {
  usa: ['united states'],
  'united states': ['usa'],
  'korea republic': ['south korea'],
  'south korea': ['korea republic'],
  'ir iran': ['iran'],
  iran: ['ir iran'],
  "côte d'ivoire": ['ivory coast', "cote d'ivoire"],
  'ivory coast': ["côte d'ivoire", "cote d'ivoire"],
  'cabo verde': ['cape verde'],
  'cape verde': ['cabo verde'],
  türkiye: ['turkey'],
  turkey: ['türkiye'],
  czechia: ['czech republic'],
  'czech republic': ['czechia'],
  'congo dr': ['dr congo'],
  'dr congo': ['congo dr'],
  'china pr': ['china'],
  china: ['china pr'],
  'the gambia': ['gambia'],
  gambia: ['the gambia'],
  'republic of ireland': ['ireland'],
  ireland: ['republic of ireland'],
};

function parseEspnStandingsGroupRows(
  child: any,
  groupLabel?: string,
): { rows: StandingRow[]; logos: Record<string, string> } {
  const rows: StandingRow[] = [];
  const logos: Record<string, string> = {};
  const entries = child?.standings?.entries;
  if (!Array.isArray(entries)) return { rows, logos };

  const cleanGroup = groupLabel || (child?.name ? String(child.name).replace(/^Group\s+/i, 'Groupe ') : undefined);

  entries.forEach((entry: any, idx: number) => {
    const getStat = (name: string) => {
      const found = entry?.stats?.find((s: any) => s?.name === name);
      return Number(found?.value ?? 0);
    };
    const teamName = String(entry?.team?.displayName || 'Équipe').trim();
    const shortName = String(entry?.team?.shortDisplayName || teamName).trim();
    const logo: string | undefined = entry?.team?.logos?.[0]?.href || entry?.team?.logo || undefined;
    if (logo) {
      const lower = teamName.toLowerCase();
      logos[lower] = logo;
      logos[shortName.toLowerCase()] = logo;
      for (const alias of COUNTRY_NAME_ALIASES[lower] ?? []) {
        logos[alias] = logo;
      }
    }

    const position = getStat('rank') || idx + 1;
    rows.push({
      position,
      team: teamName,
      shortName,
      logo,
      played: getStat('gamesPlayed'),
      won: getStat('wins'),
      drawn: getStat('ties'),
      lost: getStat('losses'),
      goalsFor: getStat('pointsFor'),
      goalsAgainst: getStat('pointsAgainst'),
      goalDiff: getStat('pointDifferential'),
      points: getStat('points'),
      groupName: cleanGroup,
      zone: position <= 2 ? 'ucl' : position === 3 ? 'playoff' : undefined,
    });
  });

  return { rows, logos };
}

let cachedFifaRanking: { data: FifaRankingData; fetchedAt: number } | null = null;
let inFlightFifaRanking: Promise<FifaRankingData> | null = null;

async function fetchFifaWorldRanking(countryLogos: Record<string, string>): Promise<FifaRankingData> {
  if (cachedFifaRanking && Date.now() - cachedFifaRanking.fetchedAt < 15 * 60 * 1000) {
    // Enrich with any newly discovered logos
    if (Object.keys(countryLogos).length > 0) {
      cachedFifaRanking.data.entries.forEach((e) => {
        if (!e.logo) {
          const hit = countryLogos[e.team.toLowerCase()];
          if (hit) e.logo = hit;
        }
      });
    }
    return cachedFifaRanking.data;
  }
  if (inFlightFifaRanking) return inFlightFifaRanking;

  inFlightFifaRanking = (async (): Promise<FifaRankingData> => {
    try {
      const wiki = await fetchJson<any>(
        'https://en.wikipedia.org/w/api.php?action=query&titles=Module:SportsRankings/data/FIFA_World_Rankings&prop=revisions&rvprop=content&format=json&rvslots=main&origin=*',
        5500,
      );
      const page = wiki?.query?.pages ? (Object.values(wiki.query.pages)[0] as any) : null;
      const content: string = page?.revisions?.[0]?.slots?.main?.['*'] || '';
      if (!content) {
        return cachedFifaRanking?.data ?? { updatedAt: '', entries: [] };
      }

      // Extract update date
      const updMatch = content.match(
        /data\.updated\s*=\s*\{\s*day\s*=\s*(\d+)\s*,\s*month\s*=\s*'([^']+)'\s*,\s*year\s*=\s*(\d+)/,
      );
      let updatedAt = '';
      if (updMatch) {
        const dt = new Date(`${updMatch[1]} ${updMatch[2]} ${updMatch[3]} 12:00 UTC`);
        if (!Number.isNaN(dt.getTime())) {
          updatedAt = dt.toISOString();
        }
      }

      // Extract team name -> 3-letter FIFA code from data.alias
      const codeByTeam = new Map<string, string>();
      const aliasStart = content.indexOf('data.alias');
      const confedStart = content.indexOf('data.confederation');
      if (aliasStart >= 0) {
        const aliasBlock = content.slice(
          aliasStart,
          confedStart > aliasStart ? confedStart : aliasStart + 9000,
        );
        for (const m of aliasBlock.matchAll(/\{\s*"([A-Z0-9]+)"\s*,\s*"([^"]+)"\s*\}/g)) {
          codeByTeam.set(m[2].trim().toLowerCase(), m[1].trim());
        }
      }

      // Extract FIFA code -> confederation from data.confederation
      const confedByCode = new Map<
        string,
        'UEFA' | 'CONMEBOL' | 'CAF' | 'AFC' | 'CONCACAF' | 'OFC'
      >();
      if (confedStart >= 0) {
        const regionalIdx = content.indexOf('UNAF', confedStart);
        const confedBlock = content.slice(
          confedStart,
          regionalIdx > confedStart ? regionalIdx : confedStart + 5000,
        );
        const confeds: ('AFC' | 'CAF' | 'CONCACAF' | 'CONMEBOL' | 'OFC' | 'UEFA')[] = [
          'AFC',
          'CAF',
          'CONCACAF',
          'CONMEBOL',
          'OFC',
          'UEFA',
        ];
        for (const confed of confeds) {
          const rx = new RegExp(`\\b${confed}\\s*=\\s*\\{([^}]+)\\}`);
          const match = confedBlock.match(rx);
          if (match) {
            for (const c of match[1].matchAll(/"([A-Z]{3})"/g)) {
              confedByCode.set(c[1], confed);
            }
          }
        }
      }

      // Extract rankings rows: { "Team", rank, change, points }
      const rankStart = content.indexOf('data.rankings');
      const rankEnd = aliasStart > rankStart ? aliasStart : rankStart + 25000;
      const rankBlock = rankStart >= 0 ? content.slice(rankStart, rankEnd) : '';

      const entries: FifaRankingEntry[] = [];
      for (const m of rankBlock.matchAll(
        /\{\s*"([^"]+)"\s*,\s*(\d+)\s*,\s*(-?\d+)\s*,\s*([0-9]+(?:\.[0-9]+)?)\s*\}/g,
      )) {
        const team = m[1].trim();
        const rank = Number(m[2]);
        const previousChange = Number(m[3]);
        const points = Number(m[4]);
        const lower = team.toLowerCase();
        const code =
          codeByTeam.get(lower) ||
          team
            .replace(/[^A-Za-z]/g, '')
            .slice(0, 3)
            .toUpperCase();
        const confederation = confedByCode.get(code);
        let logo = countryLogos[lower];
        if (!logo) {
          for (const alias of COUNTRY_NAME_ALIASES[lower] ?? []) {
            if (countryLogos[alias]) {
              logo = countryLogos[alias];
              break;
            }
          }
        }

        entries.push({
          rank,
          previousChange,
          team,
          code,
          logo,
          points,
          confederation,
        });
      }

      const data: FifaRankingData = { updatedAt, entries };
      if (entries.length > 0) {
        cachedFifaRanking = { data, fetchedAt: Date.now() };
      }
      return data;
    } finally {
      inFlightFifaRanking = null;
    }
  })();

  return inFlightFifaRanking;
}

let cachedCupsResult: {
  data: { nationalCupsStandings: NationalCupStandingsMap; fifaRanking: FifaRankingData };
  fetchedAt: number;
} | null = null;

export async function fetchNationalCupsAndFifa(): Promise<{
  nationalCupsStandings: NationalCupStandingsMap;
  fifaRanking: FifaRankingData;
}> {
  if (
    cachedCupsResult &&
    Object.keys(cachedCupsResult.data.nationalCupsStandings).length > 0 &&
    cachedCupsResult.data.fifaRanking.entries.length > 0 &&
    Date.now() - cachedCupsResult.fetchedAt < 10 * 60 * 1000
  ) {
    return cachedCupsResult.data;
  }

  const cupSources: {
    cupId: Exclude<NationalCupId, 'friendlies'>;
    slug: string;
    regionPrefix?: string;
  }[] = [
    { cupId: 'world-cup', slug: 'fifa.world' },
    { cupId: 'afcon', slug: 'caf.nations' },
    { cupId: 'euro', slug: 'uefa.euro' },
    { cupId: 'asian-cup', slug: 'afc.asian.cup' },
    { cupId: 'copa-america', slug: 'conmebol.america' },
    { cupId: 'gold-cup', slug: 'concacaf.gold' },
    { cupId: 'nations-league', slug: 'uefa.nations', regionPrefix: 'UEFA' },
    { cupId: 'nations-league', slug: 'concacaf.nations.league', regionPrefix: 'CONCACAF' },
    { cupId: 'world-qualifiers', slug: 'caf.nations_qual', regionPrefix: 'CAN Qual.' },
    { cupId: 'world-qualifiers', slug: 'fifa.worldq.caf', regionPrefix: 'CAF' },
    { cupId: 'world-qualifiers', slug: 'fifa.worldq.uefa', regionPrefix: 'UEFA' },
    { cupId: 'world-qualifiers', slug: 'fifa.worldq.conmebol', regionPrefix: 'CONMEBOL' },
    { cupId: 'world-qualifiers', slug: 'fifa.worldq.afc', regionPrefix: 'AFC' },
  ];

  const nationalCupsStandings: NationalCupStandingsMap = {};
  const countryLogos: Record<string, string> = {};

  await Promise.all(
    cupSources.map(async ({ cupId, slug, regionPrefix }) => {
      const data = await fetchJson<any>(
        `https://site.api.espn.com/apis/v2/sports/soccer/${slug}/standings`,
        7500,
      );
      if (!Array.isArray(data?.children) || data.children.length === 0) return;

      const rows: StandingRow[] = [];
      for (const child of data.children) {
        const baseGroup = child?.name
          ? String(child.name).replace(/^Group\s+/i, 'Groupe ')
          : undefined;
        const groupLabel =
          regionPrefix && baseGroup ? `${regionPrefix} · ${baseGroup}` : regionPrefix || baseGroup;
        const parsed = parseEspnStandingsGroupRows(child, groupLabel);
        rows.push(...parsed.rows);
        Object.assign(countryLogos, parsed.logos);
      }

      if (rows.length > 0) {
        const existing = nationalCupsStandings[cupId] ?? [];
        nationalCupsStandings[cupId] = [...existing, ...rows];
      }
    }),
  );

  const fifaRanking = await fetchFifaWorldRanking(countryLogos);

  const result = { nationalCupsStandings, fifaRanking };
  if (Object.keys(nationalCupsStandings).length > 0 && fifaRanking.entries.length > 0) {
    cachedCupsResult = { data: result, fetchedAt: Date.now() };
  }
  return result;
}

export async function fetchAllTopPlayers(): Promise<TopPlayerStat[]> {
  const leagues: { slug: string; compId: Exclude<CompetitionId, 'all'> }[] = [
    { slug: 'fra.1', compId: 'ligue-1' },
    { slug: 'eng.1', compId: 'premier-league' },
    { slug: 'esp.1', compId: 'la-liga' },
    { slug: 'ita.1', compId: 'serie-a' },
    { slug: 'ger.1', compId: 'bundesliga' },
  ];

  const players: TopPlayerStat[] = [];

  const [algWiki] = await Promise.all([
    fetchAlgerianWikipediaBundle(),
    ...leagues.map(async ({ slug, compId }) => {
      const data = await fetchJson<any>(
        `https://site.api.espn.com/apis/site/v2/sports/soccer/${slug}/statistics`,
        5500,
      );
      const goalsCat = data?.stats?.find((c: any) => c?.name === 'goalsLeaders');
      const assistsCat = data?.stats?.find((c: any) => c?.name === 'assistsLeaders');

      const merged = new Map<string, TopPlayerStat>();
      const ingest = (cat: any) => {
        if (!Array.isArray(cat?.leaders)) return;
        for (const item of cat.leaders.slice(0, 8)) {
          const athlete = item?.athlete;
          if (!athlete?.id) continue;
          const getVal = (n: string) =>
            Number(item?.statistics?.find((s: any) => s?.name === n)?.value ?? 0);

          const shortStr: string = item?.shortDisplayValue || '';
          const mMatch = shortStr.match(/M:\s*(\d+)/i);
          const gMatch = shortStr.match(/G:\s*(\d+)/i);
          const aMatch = shortStr.match(/A:\s*(\d+)/i);

          const goals =
            getVal('totalGoals') ||
            (gMatch ? Number(gMatch[1]) : 0) ||
            (cat?.name === 'goalsLeaders' ? Number(item?.value ?? 0) : 0);
          const assists =
            getVal('goalAssists') ||
            (aMatch ? Number(aMatch[1]) : 0) ||
            (cat?.name === 'assistsLeaders' ? Number(item?.value ?? 0) : 0);
          const appearances = getVal('appearances') || (mMatch ? Number(mMatch[1]) : 0);

          const prev = merged.get(String(athlete.id));
          const finalGoals = Math.max(goals, prev?.goals ?? 0);
          const finalAssists = Math.max(assists, prev?.assists ?? 0);
          const finalApps = Math.max(appearances, prev?.appearances ?? 0);

          merged.set(String(athlete.id), {
            rank: 0,
            player: athlete.displayName || 'Joueur',
            club: athlete?.team?.displayName || prev?.club || 'Club',
            competitionId: compId,
            appearances: finalApps,
            goals: finalGoals,
            assists: finalAssists,
            goalContributions: finalGoals + finalAssists,
          });
        }
      };

      ingest(goalsCat);
      ingest(assistsCat);

      players.push(...merged.values());
    }),
  ]);

  players.push(...algWiki.topPlayers);

  players.sort((a, b) => b.goals - a.goals || b.assists - a.assists);
  players.forEach((p, idx) => {
    p.rank = idx + 1;
  });

  return players;
}

interface RawFeedItem {
  id: string;
  headline: string;
  description: string;
  sourceLang: AppLanguage;
  competitionId: CompetitionId;
  label: string;
  publishedIso: string;
  sourceUrl?: string;
  imageUrl?: string;
  isTransfer: boolean;
  isOfficialTransfer: boolean;
  priority: number;
}

let rawFeedBatchId = 0;
let cachedRawNews: RawFeedItem[] = [];
let cachedRawTransfers: RawFeedItem[] = [];
const localizedFeedCache: Partial<
  Record<AppLanguage, { batchId: number; news: NewsArticle[]; transfers: TransferItem[] }>
> = {};

function decodeXmlEntities(raw: string): string {
  return raw
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&#39;|&apos;/g, "'")
    .replace(/&#8217;|&rsquo;/g, '’')
    .replace(/&#8211;|&ndash;/g, '–')
    .replace(/&#8230;|&hellip;/g, '...')
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseRssItems(xml: string, limit = 8): { title: string; description: string; link: string; pubDate: string; imageUrl?: string }[] {
  const out: { title: string; description: string; link: string; pubDate: string; imageUrl?: string }[] = [];
  const matches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);
  for (const m of matches) {
    if (out.length >= limit) break;
    const block = m[1];
    const titleRaw = block.match(/<title>([\s\S]*?)<\/title>/)?.[1] || '';
    const linkRaw = block.match(/<link>([\s\S]*?)<\/link>/)?.[1] || '';
    const pubDateRaw = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || '';
    const descRaw = block.match(/<description>([\s\S]*?)<\/description>/)?.[1] || '';
    const imgMatch = block.match(/(?:url|src)=["'](https:\/\/[^"'>\s]+\.(?:jpg|jpeg|png|webp)[^"'>\s]*)/i);

    const title = decodeXmlEntities(titleRaw);
    const description = decodeXmlEntities(descRaw);
    const link = decodeXmlEntities(linkRaw);
    if (!title) continue;

    out.push({
      title,
      description,
      link,
      pubDate: pubDateRaw.trim() || new Date().toISOString(),
      imageUrl: imgMatch?.[1],
    });
  }
  return out;
}

function isTransferText(lower: string): boolean {
  return (
    lower.includes('transfer') ||
    lower.includes('rumor') ||
    lower.includes('sign') ||
    lower.includes('eye ') ||
    lower.includes('target') ||
    lower.includes('contract') ||
    lower.includes('mercato') ||
    lower.includes('transfert') ||
    lower.includes('recrue') ||
    lower.includes('prêt') ||
    lower.includes('contrat') ||
    lower.includes('courtis')
  );
}

function isOfficialTransferText(lower: string): boolean {
  return (
    lower.includes('sign') ||
    lower.includes('agree') ||
    lower.includes('complete') ||
    lower.includes('officiel') ||
    lower.includes('rejoint') ||
    lower.includes('engage')
  );
}

function localizeFeedCategoryLabel(
  compId: CompetitionId,
  defaultLabel: string,
  lang: AppLanguage,
): string {
  if (lang === 'fr') return defaultLabel;
  if (compId === 'all') {
    return lang === 'ar' ? 'أوروبا والعالم' : 'Europe & World';
  }
  if (compId === 'national-teams') {
    return lang === 'ar' ? 'المنتخبات الوطنية' : 'National Teams';
  }
  if (compId === 'algerian-ligue-1') {
    return lang === 'ar' ? 'الكرة الجزائرية' : 'Algerian Football';
  }
  if (compId === 'premier-league' && lang === 'ar') return 'البريميرليغ';
  if (compId === 'ligue-1' && lang === 'ar') return 'الدوري الفرنسي';
  if (compId === 'la-liga' && lang === 'ar') return 'الليغا';
  if (compId === 'serie-a' && lang === 'ar') return 'الكالتشيو';
  if (compId === 'bundesliga' && lang === 'ar') return 'البوندسليغا';
  return defaultLabel;
}

async function buildLocalizedFeed(
  rawNews: RawFeedItem[],
  rawTransfers: RawFeedItem[],
  lang: AppLanguage,
): Promise<{ news: NewsArticle[]; transfers: TransferItem[] }> {
  const authorLabel =
    lang === 'ar'
      ? 'تحرير THE PITCH · البث المباشر'
      : lang === 'en'
        ? 'THE PITCH Desk · Live Wire'
        : 'Rédaction THE PITCH · Fil Direct';
  const readTimeLabel =
    lang === 'ar' ? 'خبر مباشر' : lang === 'en' ? 'Live update' : 'Actu en temps réel';

  const [trNewsTitles, trNewsDescs, trTransferTitles, trTransferDescs] = await Promise.all([
    translateBatch(
      rawNews.map((item) => ({ text: item.headline, sourceLang: item.sourceLang })),
      lang,
    ),
    translateBatch(
      rawNews.map((item) => ({
        text: item.description && item.description !== item.headline ? item.description : '',
        sourceLang: item.sourceLang,
      })),
      lang,
    ),
    translateBatch(
      rawTransfers.map((item) => ({
        text: item.headline.replace(/^Transfer rumors, news:\s*/i, ''),
        sourceLang: item.sourceLang,
      })),
      lang,
    ),
    translateBatch(
      rawTransfers.map((item) => ({
        text: item.description && item.description !== item.headline ? item.description : '',
        sourceLang: item.sourceLang,
      })),
      lang,
    ),
  ]);

  const news: NewsArticle[] = rawNews.map((item, index) => {
    const locTitle = trNewsTitles[index] || item.headline;
    const locDesc = trNewsDescs[index] || '';
    const publishedLabel = formatLocalizedNewsDate(item.publishedIso, lang);
    const catLabel = localizeFeedCategoryLabel(item.competitionId, item.label, lang);
    const finalSubtitle = locDesc || locTitle;
    const fallbackImg =
      IMAGE_BY_COMP[item.competitionId] || FALLBACK_GALLERY[index % FALLBACK_GALLERY.length];

    const bodySecondLine =
      lang === 'ar'
        ? `خبر منشور مباشرة (${publishedLabel}) ضمن قسم ${catLabel}.`
        : lang === 'en'
          ? `Published in real time (${publishedLabel}) in the ${catLabel} section.`
          : `Information publiée en temps réel (${publishedLabel}) dans la rubrique ${catLabel}.`;

    return {
      id: `art-${item.id}`,
      title: locTitle,
      subtitle: finalSubtitle,
      category: catLabel,
      competitionId: item.competitionId,
      author: authorLabel,
      publishedAt: publishedLabel,
      publishedIso: item.publishedIso,
      readTime: readTimeLabel,
      imageUrl: item.imageUrl || fallbackImg,
      fallbackImageUrl: fallbackImg,
      imageCaption: `${catLabel} · ${publishedLabel}`,
      featured: index === 0,
      body: [finalSubtitle, bodySecondLine],
      sourceUrl: item.sourceUrl,
    };
  });

  const transfers: TransferItem[] = rawTransfers.map((item, index) => {
    const cleanHeadline = item.headline.replace(/^Transfer rumors, news:\s*/i, '');
    const locHeadline = trTransferTitles[index] || cleanHeadline;
    const locSummary = trTransferDescs[index] || '';
    const publishedLabel = formatLocalizedNewsDate(item.publishedIso, lang);
    const catLabel = localizeFeedCategoryLabel(item.competitionId, item.label, lang);
    const fallbackImg =
      FALLBACK_GALLERY[(index + 5) % FALLBACK_GALLERY.length] ||
      '/src/assets/images/mercato_tunnel_view_1795287057654.jpg';

    return {
      id: `tr-${item.id}`,
      headline: locHeadline,
      summary: locSummary || locHeadline,
      competitionId: item.competitionId,
      competitionLabel: catLabel,
      publishedAt: publishedLabel,
      publishedIso: item.publishedIso,
      sourceUrl: item.sourceUrl,
      imageUrl: item.imageUrl || fallbackImg,
      fallbackImageUrl: fallbackImg,
      category: item.isOfficialTransfer ? 'Officiel / Transfert' : 'Mercato & Rumeurs',
    };
  });

  return { news, transfers };
}

export async function getLocalizedNewsAndMercato(
  lang: AppLanguage = 'fr',
): Promise<{ news: NewsArticle[]; transfers: TransferItem[] }> {
  const cached = localizedFeedCache[lang];
  if (cached && cached.batchId === rawFeedBatchId && rawFeedBatchId > 0) {
    return { news: cached.news, transfers: cached.transfers };
  }
  if (cachedRawNews.length === 0 && cachedRawTransfers.length === 0) {
    return fetchRealNewsAndMercato(lang);
  }
  const built = await buildLocalizedFeed(cachedRawNews, cachedRawTransfers, lang);
  localizedFeedCache[lang] = { batchId: rawFeedBatchId, ...built };
  return built;
}

export async function fetchRealNewsAndMercato(
  lang: AppLanguage = 'fr',
): Promise<{
  news: NewsArticle[];
  transfers: TransferItem[];
}> {
  const rawNewsMap = new Map<string, RawFeedItem>();
  const rawTransferMap = new Map<string, RawFeedItem>();

  const nowMs = Date.now();
  const maxAgeMs = 72 * 3600 * 1000;

  await Promise.all([
    ...NEWS_SOURCES.map(async (src) => {
      const data = await fetchJson<any>(
        `https://site.api.espn.com/apis/site/v2/sports/soccer/${src.slug}/news`,
        3500,
      );
      if (!Array.isArray(data?.articles)) return;

      data.articles.forEach((a: any, idx: number) => {
        const headline: string = (a?.headline || '').trim();
        const description: string = (a?.description || '').trim();
        if (!headline) return;

        const lower = headline.toLowerCase();
        if (src.slug === 'all' && (lower.includes('nwsl') || lower.includes('usl '))) {
          return;
        }

        const publishedIso = a?.published || new Date().toISOString();
        const publishedMs = new Date(publishedIso).getTime();
        if (!Number.isNaN(publishedMs) && nowMs - publishedMs > maxAgeMs) {
          return;
        }

        const id = String(a?.dataSourceIdentifier || `${src.slug}-${idx}-${headline.slice(0, 20)}`);
        const isTransfer = isTransferText(lower);
        const isOfficialTransfer = isOfficialTransferText(lower);

        const item: RawFeedItem = {
          id,
          headline,
          description: description || headline,
          sourceLang: 'en',
          competitionId: src.competitionId,
          label: src.label,
          publishedIso,
          sourceUrl: a?.links?.web?.href,
          imageUrl: extractEspnArticleImage(a),
          isTransfer,
          isOfficialTransfer,
          priority: src.slug === 'all' && idx === 0 ? 1 : 0,
        };

        if (isTransfer) {
          if (!rawTransferMap.has(headline)) rawTransferMap.set(headline, item);
        } else if (!rawNewsMap.has(headline)) {
          rawNewsMap.set(headline, item);
        }
      });
    }),
    // DZfoot RSS: real daily Algerian Ligue 1 & National Team news (already in French)
    fetchText('https://www.dzfoot.com/feed', 3500).then((xml) => {
      if (!xml) return;
      const items = parseRssItems(xml, 6);
      items.forEach((rss, idx) => {
        const lower = rss.title.toLowerCase();
        const isNat = lower.includes('algérie') || lower.includes('algerie') || lower.includes('fennec') || lower.includes('petkovic');
        const isTr = isTransferText(lower);
        const pubMs = new Date(rss.pubDate).getTime();
        const publishedIso = !Number.isNaN(pubMs) ? new Date(pubMs).toISOString() : new Date().toISOString();
        const item: RawFeedItem = {
          id: `dzfoot-${idx}-${rss.title.slice(0, 16)}`,
          headline: rss.title,
          description: rss.description || rss.title,
          sourceLang: 'fr',
          competitionId: isNat ? 'national-teams' : 'algerian-ligue-1',
          label: isNat ? 'Sélections — Algérie' : 'Ligue 1 Mobilis (Algérie)',
          publishedIso,
          sourceUrl: rss.link,
          imageUrl: rss.imageUrl,
          isTransfer: isTr,
          isOfficialTransfer: isOfficialTransferText(lower),
          priority: 0,
        };
        if (isTr) {
          if (!rawTransferMap.has(rss.title)) rawTransferMap.set(rss.title, item);
        } else if (!rawNewsMap.has(rss.title)) {
          rawNewsMap.set(rss.title, item);
        }
      });
    }),
    // Google News RSS Mercato FR: fresh daily European & African transfer headlines
    fetchText(
      'https://news.google.com/rss/search?q=transfert+mercato+football&hl=fr&gl=FR&ceid=FR:fr',
      3500,
    ).then((xml) => {
      if (!xml) return;
      const items = parseRssItems(xml, 6);
      items.forEach((rss, idx) => {
        const lower = rss.title.toLowerCase();
        const pubMs = new Date(rss.pubDate).getTime();
        const publishedIso = !Number.isNaN(pubMs) ? new Date(pubMs).toISOString() : new Date().toISOString();
        const cleanTitle = rss.title.replace(/\s+-\s+[^-]+$/, '').trim();
        if (!cleanTitle || rawTransferMap.has(cleanTitle)) return;
        rawTransferMap.set(cleanTitle, {
          id: `gnews-tr-${idx}-${cleanTitle.slice(0, 16)}`,
          headline: cleanTitle,
          description: rss.description && rss.description.length > 20 ? rss.description : cleanTitle,
          sourceLang: 'fr',
          competitionId: 'all',
          label: 'Mercato Europe & Monde',
          publishedIso,
          sourceUrl: rss.link,
          isTransfer: true,
          isOfficialTransfer: isOfficialTransferText(lower),
          priority: 0,
        });
      });
    }),
  ]);

  const sortedRawNews = Array.from(rawNewsMap.values())
    .sort((a, b) => new Date(b.publishedIso).getTime() - new Date(a.publishedIso).getTime())
    .slice(0, 14);

  const sortedRawTransfers = Array.from(rawTransferMap.values())
    .sort((a, b) => new Date(b.publishedIso).getTime() - new Date(a.publishedIso).getTime())
    .slice(0, 12);

  cachedRawNews = sortedRawNews;
  cachedRawTransfers = sortedRawTransfers;
  rawFeedBatchId += 1;

  const built = await buildLocalizedFeed(sortedRawNews, sortedRawTransfers, lang);
  localizedFeedCache[lang] = { batchId: rawFeedBatchId, ...built };
  return built;
}

export function detectLiveGoals(
  previousMatches: FootballMatch[],
  nextMatches: FootballMatch[],
): GoalNotificationEvent[] {
  const prevById = new Map(previousMatches.map((m) => [m.id, m]));
  const detected: GoalNotificationEvent[] = [];

  for (const next of nextMatches) {
    if (next.status !== 'live') continue;
    const prev = prevById.get(next.id);
    if (!prev) continue;

    if (next.homeTeam.score > prev.homeTeam.score) {
      const latestGoal = [...next.events]
        .reverse()
        .find((e) => e.team === 'home' && (e.type === 'goal' || e.type === 'penalty_goal'));
      detected.push({
        id: `goal-${next.id}-${next.homeTeam.score}-${next.awayTeam.score}-${Date.now()}`,
        matchId: next.id,
        competitionId: next.competitionId,
        competitionName: next.competitionName,
        scoringTeam: next.homeTeam.name,
        homeTeam: next.homeTeam.shortName,
        awayTeam: next.awayTeam.shortName,
        homeScore: next.homeTeam.score,
        awayScore: next.awayTeam.score,
        scorer: latestGoal?.player || next.homeTeam.shortName,
        minute: next.minute ?? latestGoal?.minute ?? 0,
        timestamp: new Date().toISOString(),
      });
    }

    if (next.awayTeam.score > prev.awayTeam.score) {
      const latestGoal = [...next.events]
        .reverse()
        .find((e) => e.team === 'away' && (e.type === 'goal' || e.type === 'penalty_goal'));
      detected.push({
        id: `goal-${next.id}-${next.homeTeam.score}-${next.awayTeam.score}-${Date.now()}`,
        matchId: next.id,
        competitionId: next.competitionId,
        competitionName: next.competitionName,
        scoringTeam: next.awayTeam.name,
        homeTeam: next.homeTeam.shortName,
        awayTeam: next.awayTeam.shortName,
        homeScore: next.homeTeam.score,
        awayScore: next.awayTeam.score,
        scorer: latestGoal?.player || next.awayTeam.shortName,
        minute: next.minute ?? latestGoal?.minute ?? 0,
        timestamp: new Date().toISOString(),
      });
    }
  }

  return detected;
}

export function createTestGoalEvent(matches: FootballMatch[]): GoalNotificationEvent {
  const target = matches.find((m) => m.status === 'live') ?? matches[0];
  return {
    id: `test-goal-${Date.now()}`,
    matchId: target?.id || 'test-match',
    competitionId: target?.competitionId || 'premier-league',
    competitionName: target?.competitionName || 'Multiplex Direct',
    scoringTeam: target?.homeTeam.name || 'Équipe à domicile',
    homeTeam: target?.homeTeam.shortName || 'DOM',
    awayTeam: target?.awayTeam.shortName || 'EXT',
    homeScore: (target?.homeTeam.score ?? 1) + 1,
    awayScore: target?.awayTeam.score ?? 0,
    scorer: 'Alerte Test En Direct',
    minute: target?.minute ?? 75,
    timestamp: new Date().toISOString(),
    isTest: true,
  };
}
