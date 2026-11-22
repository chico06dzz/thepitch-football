import {
  AppLanguage,
  CompetitionId,
  FootballMatch,
  GoalNotificationEvent,
  MatchDetailedStats,
  MatchEvent,
  NewsArticle,
  StandingRow,
  TopPlayerStat,
  TransferItem,
} from '../types/football.ts';

interface LeagueSource {
  espnSlug: string;
  competitionId: Exclude<CompetitionId, 'all'>;
  competitionName: string;
}

const LEAGUE_SOURCES: LeagueSource[] = [
  { espnSlug: 'fra.1', competitionId: 'ligue-1', competitionName: 'Ligue 1 McDonald’s' },
  { espnSlug: 'eng.1', competitionId: 'premier-league', competitionName: 'Premier League' },
  { espnSlug: 'esp.1', competitionId: 'la-liga', competitionName: 'La Liga EA Sports' },
  { espnSlug: 'ita.1', competitionId: 'serie-a', competitionName: 'Serie A Enilive' },
  { espnSlug: 'ger.1', competitionId: 'bundesliga', competitionName: 'Bundesliga' },
  { espnSlug: 'uefa.nations', competitionId: 'national-teams', competitionName: 'Sélections — Ligue des Nations' },
  { espnSlug: 'fifa.friendly', competitionId: 'national-teams', competitionName: 'Sélections — Matchs Internationaux' },
];

const NEWS_SOURCES: { slug: string; competitionId: CompetitionId; label: string }[] = [
  { slug: 'all', competitionId: 'all', label: 'Europe & Monde' },
  { slug: 'fra.1', competitionId: 'ligue-1', label: 'Ligue 1' },
  { slug: 'eng.1', competitionId: 'premier-league', label: 'Premier League' },
  { slug: 'esp.1', competitionId: 'la-liga', label: 'La Liga' },
  { slug: 'ita.1', competitionId: 'serie-a', label: 'Serie A' },
  { slug: 'ger.1', competitionId: 'bundesliga', label: 'Bundesliga' },
  { slug: 'fifa.world', competitionId: 'national-teams', label: 'Sélections Nationales' },
];

const IMAGE_BY_COMP: Record<CompetitionId, string> = {
  all: '/src/assets/images/editorial_match_action_1795348261245.jpg',
  'ligue-1': '/src/assets/images/hero_stadium_night_1795287057975.jpg',
  'premier-league': '/src/assets/images/editorial_match_action_1795348261245.jpg',
  'la-liga': '/src/assets/images/news_match_duel_1795287057563.jpg',
  'serie-a': '/src/assets/images/editorial_supporters_stands_1795348260566.jpg',
  bundesliga: '/src/assets/images/mercato_tunnel_view_1795287057654.jpg',
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

  // Prefer high-resolution photo URLs from a.espncdn.com/photo/
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
  retries = 1,
): Promise<string> {
  const clean = text.trim();
  if (!clean) return '';
  if (targetLang === 'en') return clean;

  const cacheKey = `${targetLang}::${clean}`;
  const cached = translationCache.get(cacheKey);
  if (cached) return cached;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(clean)}`;
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      if (retries > 0) {
        await new Promise((r) => setTimeout(r, 250));
        return translateText(clean, targetLang, retries - 1);
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
        if (translationCache.size > 2000) {
          const firstKey = translationCache.keys().next().value;
          if (firstKey) translationCache.delete(firstKey);
        }
        translationCache.set(cacheKey, translated);
        return translated;
      }
    }
  } catch {
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, 250));
      return translateText(clean, targetLang, retries - 1);
    }
  } finally {
    clearTimeout(timer);
  }
  return clean;
}

async function mapInBatches<T, R>(
  items: T[],
  batchSize: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const slice = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      slice.map((item, offset) => fn(item, i + offset)),
    );
    results.push(...batchResults);
  }
  return results;
}

export function getParisDayKey(date: Date = new Date()): string {
  return date.toLocaleDateString('en-CA', { timeZone: 'Europe/Paris' });
}

function formatEspnDate(offsetDays: number): string {
  const parisToday = getParisDayKey(new Date()); // YYYY-MM-DD
  const [y, m, d] = parisToday.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + offsetDays));
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yy}${mm}${dd}`;
}

function formatLocalizedNewsDate(iso: string, lang: AppLanguage): string {
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

async function fetchJson<T>(url: string, timeoutMs = 12000): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
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

function parseEspnScoreboardEvent(ev: any, source: LeagueSource): FootballMatch | null {
  const comp = ev?.competitions?.[0];
  if (!comp) return null;

  const home = comp.competitors?.find((c: any) => c.homeAway === 'home') ?? comp.competitors?.[0];
  const away = comp.competitors?.find((c: any) => c.homeAway === 'away') ?? comp.competitors?.[1];
  if (!home || !away) return null;

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
      name: home.team?.displayName || 'Domicile',
      shortName: home.team?.shortDisplayName || home.team?.displayName || 'DOM',
      code: (home.team?.abbreviation || 'DOM').slice(0, 4),
      logo: home.team?.logo || home.team?.logos?.[0]?.href || undefined,
      accentColor: normalizeColor(home.team?.color, '#1D4ED8'),
      score: Number(home.score ?? 0),
    },
    awayTeam: {
      id: String(away.team?.id ?? ''),
      name: away.team?.displayName || 'Extérieur',
      shortName: away.team?.shortDisplayName || away.team?.displayName || 'EXT',
      code: (away.team?.abbreviation || 'EXT').slice(0, 4),
      logo: away.team?.logo || away.team?.logos?.[0]?.href || undefined,
      accentColor: normalizeColor(away.team?.color, '#DC2626'),
      score: Number(away.score ?? 0),
    },
    stats,
    events,
  };
}

export async function fetchAllLiveMatches(includeHistoryAndSchedule = true): Promise<FootballMatch[]> {
  const matchMap = new Map<string, FootballMatch>();

  const dateOffsets = includeHistoryAndSchedule
    ? [0, 1, 2, 3, -1, -2, -4, -7]
    : [0];

  const requests: Promise<void>[] = [];

  for (const source of LEAGUE_SOURCES) {
    const todayStr = formatEspnDate(0);
    // Always fetch both default scoreboard and explicit today's date in Paris time
    requests.push(
      fetchJson<any>(`https://site.api.espn.com/apis/site/v2/sports/soccer/${source.espnSlug}/scoreboard`).then(
        (data) => {
          if (!data?.events) return;
          for (const ev of data.events) {
            const parsed = parseEspnScoreboardEvent(ev, source);
            if (parsed) matchMap.set(parsed.id, parsed);
          }
        },
      ),
    );
    requests.push(
      fetchJson<any>(
        `https://site.api.espn.com/apis/site/v2/sports/soccer/${source.espnSlug}/scoreboard?dates=${todayStr}`,
      ).then((data) => {
        if (!data?.events) return;
        for (const ev of data.events) {
          const parsed = parseEspnScoreboardEvent(ev, source);
          if (parsed) matchMap.set(parsed.id, parsed);
        }
      }),
    );

    if (includeHistoryAndSchedule) {
      for (const offset of dateOffsets) {
        if (offset === 0) continue;
        if (source.competitionId === 'national-teams' && offset > 2) continue;
        const dateParam = formatEspnDate(offset);
        requests.push(
          fetchJson<any>(
            `https://site.api.espn.com/apis/site/v2/sports/soccer/${source.espnSlug}/scoreboard?dates=${dateParam}`,
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

  await Promise.all(requests);

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
  const sum = await fetchJson<any>(
    `https://site.api.espn.com/apis/site/v2/sports/soccer/${espnSlug}/summary?event=${encodeURIComponent(matchId)}`,
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

  await Promise.all(
    standingSources.map(async ({ slug, compId }) => {
      const data = await fetchJson<any>(
        `https://site.api.espn.com/apis/v2/sports/soccer/${slug}/standings`,
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
  );

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

  await Promise.all(
    leagues.map(async ({ slug, compId }) => {
      const data = await fetchJson<any>(
        `https://site.api.espn.com/apis/site/v2/sports/soccer/${slug}/statistics`,
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
  );

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

  const news: NewsArticle[] = await mapInBatches(rawNews, 3, async (item, index) => {
    const [locTitle, locDesc] = await Promise.all([
      translateText(item.headline, lang),
      item.description !== item.headline
        ? translateText(item.description, lang)
        : Promise.resolve(''),
    ]);
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

  const transfers: TransferItem[] = await mapInBatches(rawTransfers, 3, async (item, index) => {
    const cleanHeadline = item.headline.replace(/^Transfer rumors, news:\s*/i, '');
    const [locHeadline, locSummary] = await Promise.all([
      translateText(cleanHeadline, lang),
      item.description !== item.headline
        ? translateText(item.description, lang)
        : Promise.resolve(''),
    ]);
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
  const maxAgeMs = 72 * 3600 * 1000; // Prioritize fresh real-time news (last 72h max)

  await Promise.all(
    NEWS_SOURCES.map(async (src) => {
      const data = await fetchJson<any>(
        `https://site.api.espn.com/apis/site/v2/sports/soccer/${src.slug}/news`,
      );
      if (!Array.isArray(data?.articles)) return;

      data.articles.forEach((a: any, idx: number) => {
        const headline: string = (a?.headline || '').trim();
        const description: string = (a?.description || '').trim();
        if (!headline) return;

        const lower = headline.toLowerCase();
        // Keep European Big 5 & international news sharp (skip US domestic league awards in global feed)
        if (src.slug === 'all' && (lower.includes('nwsl') || lower.includes('usl '))) {
          return;
        }

        const publishedIso = a?.published || new Date().toISOString();
        const publishedMs = new Date(publishedIso).getTime();
        if (!Number.isNaN(publishedMs) && nowMs - publishedMs > maxAgeMs) {
          return;
        }

        const id = String(a?.dataSourceIdentifier || `${src.slug}-${idx}-${headline.slice(0, 20)}`);
        const isTransfer =
          lower.includes('transfer') ||
          lower.includes('rumor') ||
          lower.includes('sign') ||
          lower.includes('eye ') ||
          lower.includes('target') ||
          lower.includes('contract') ||
          lower.includes('mercato');
        const isOfficialTransfer =
          lower.includes('sign') || lower.includes('agree') || lower.includes('complete');

        const item: RawFeedItem = {
          id,
          headline,
          description: description || headline,
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
  );

  const sortedRawNews = Array.from(rawNewsMap.values())
    .sort((a, b) => new Date(b.publishedIso).getTime() - new Date(a.publishedIso).getTime())
    .slice(0, 12);

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
