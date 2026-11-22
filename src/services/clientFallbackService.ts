import {
  EMPTY_FIFA_RANKING,
  EMPTY_NATIONAL_CUPS_STANDINGS,
  EMPTY_STANDINGS,
} from '../data/footballData';
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
} from '../types/football';

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

const clientTranslationCache = new Map<string, string>();

async function fetchCorsJson<T>(url: string, timeoutMs = 6500): Promise<T | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function translateClientText(
  text: string,
  targetLang: AppLanguage,
  sourceLang: AppLanguage = 'en',
): Promise<string> {
  const clean = text.trim();
  if (!clean || targetLang === sourceLang) return clean;
  const key = `${sourceLang}->${targetLang}::${clean}`;
  const cached = clientTranslationCache.get(key);
  if (cached) return cached;

  const data = await fetchCorsJson<unknown>(
    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(clean)}`,
    4500,
  );
  if (Array.isArray(data) && Array.isArray(data[0])) {
    const translated = (data[0] as unknown[])
      .map((chunk) => (Array.isArray(chunk) ? String(chunk[0] ?? '') : ''))
      .join('')
      .trim();
    if (translated) {
      clientTranslationCache.set(key, translated);
      return translated;
    }
  }
  return clean;
}

function getParisDayKeyClient(date: Date = new Date()): string {
  return date.toLocaleDateString('en-CA', { timeZone: 'Europe/Paris' });
}

function formatEspnDateClient(offsetDays: number): string {
  const parisToday = getParisDayKeyClient(new Date());
  const [y, m, d] = parisToday.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + offsetDays));
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yy}${mm}${dd}`;
}

function formatLocalizedNewsDateClient(iso: string, lang: AppLanguage): string {
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) {
    return lang === 'ar' ? 'اليوم' : lang === 'en' ? 'Today' : 'Aujourd’hui';
  }
  const todayKey = getParisDayKeyClient(new Date());
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayKey = getParisDayKeyClient(yesterday);
  const itemKey = getParisDayKeyClient(dt);
  const locale = lang === 'ar' ? 'ar-EG-u-nu-latn' : lang === 'en' ? 'en-GB' : 'fr-FR';
  const timePart = dt.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Paris',
  });
  if (itemKey === todayKey) {
    return lang === 'ar' ? `اليوم · ${timePart}` : lang === 'en' ? `Today · ${timePart}` : `Aujourd’hui · ${timePart}`;
  }
  if (itemKey === yesterdayKey) {
    return lang === 'ar' ? `أمس · ${timePart}` : lang === 'en' ? `Yesterday · ${timePart}` : `Hier · ${timePart}`;
  }
  return dt.toLocaleString(locale, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Paris',
  });
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
    return clean.toLowerCase() === '000000' ? '#1E293B' : `#${clean}`;
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

function parseEspnScoreboardEventClient(ev: any, source: LeagueSource): FootballMatch | null {
  const comp = ev?.competitions?.[0];
  if (!comp) return null;
  const home = comp.competitors?.find((c: any) => c.homeAway === 'home') ?? comp.competitors?.[0];
  const away = comp.competitors?.find((c: any) => c.homeAway === 'away') ?? comp.competitors?.[1];
  if (!home || !away) return null;

  const homeName: string = home.team?.displayName || 'Domicile';
  const awayName: string = away.team?.displayName || 'Extérieur';
  if (source.algerianFilterOnly) {
    const hLower = homeName.toLowerCase();
    const aLower = awayName.toLowerCase();
    const hasAlg = ALGERIAN_CLUB_KEYWORDS.some((kw) => hLower.includes(kw) || aLower.includes(kw));
    if (!hasAlg) return null;
  }

  const state = ev?.status?.type?.state;
  const status: FootballMatch['status'] =
    state === 'in' ? 'live' : state === 'post' ? 'finished' : 'upcoming';
  const clockStr = ev?.status?.displayClock || ev?.status?.type?.shortDetail || '';
  const minute = status === 'live' ? parseMinute(clockStr) || undefined : undefined;
  const dateIso = ev?.date || new Date().toISOString();
  const kickoffTime = new Date(dateIso).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Paris',
  });

  const homeStats = home.statistics;
  const awayStats = away.statistics;
  const hPct = readStatNum(homeStats, 'passPct');
  const aPct = readStatNum(awayStats, 'passPct');

  const stats: MatchDetailedStats = {
    possession: [
      Math.round(readStatNum(homeStats, 'possessionPct')) || 50,
      Math.round(readStatNum(awayStats, 'possessionPct')) || 50,
    ],
    shotsTotal: [readStatNum(homeStats, 'totalShots'), readStatNum(awayStats, 'totalShots')],
    shotsOnTarget: [readStatNum(homeStats, 'shotsOnTarget'), readStatNum(awayStats, 'shotsOnTarget')],
    passesCompleted: [readStatNum(homeStats, 'accuratePasses'), readStatNum(awayStats, 'accuratePasses')],
    passAccuracy: [Math.round(hPct <= 1 ? hPct * 100 : hPct), Math.round(aPct <= 1 ? aPct * 100 : aPct)],
    corners: [readStatNum(homeStats, 'wonCorners'), readStatNum(awayStats, 'wonCorners')],
    fouls: [readStatNum(homeStats, 'foulsCommitted'), readStatNum(awayStats, 'foulsCommitted')],
    yellowCards: [readStatNum(homeStats, 'yellowCards'), readStatNum(awayStats, 'yellowCards')],
    redCards: [readStatNum(homeStats, 'redCards'), readStatNum(awayStats, 'redCards')],
    saves: [readStatNum(homeStats, 'saves'), readStatNum(awayStats, 'saves')],
    offsides: [readStatNum(homeStats, 'offsides'), readStatNum(awayStats, 'offsides')],
  };

  const events: MatchEvent[] = [];
  if (Array.isArray(comp.details)) {
    comp.details.forEach((d: any, idx: number) => {
      const mappedType = mapEventType(d?.type?.text);
      if (!mappedType) return;
      const teamSide: 'home' | 'away' =
        String(d?.team?.id) === String(home.team?.id) ? 'home' : 'away';
      events.push({
        id: `${ev.id}-ev-${idx}`,
        minute: parseMinute(d?.clock?.displayValue),
        clockDisplay: d?.clock?.displayValue,
        team: teamSide,
        type: mappedType,
        player: d?.athletesInvolved?.[0]?.displayName || 'Joueur',
        assist: d?.athletesInvolved?.[1]?.displayName,
      });
    });
  }

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
    tvChannel: comp.broadcasts?.[0]?.names?.join(', ') || undefined,
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

function cleanWikiLink(raw: string): string {
  return raw
    .replace(/\[\[(?:[^|\]]*\|)?([^\]]+)\]\]/g, '$1')
    .replace(/\{\{[^}]*\}\}/g, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

async function fetchAlgerianWikipediaFallback(): Promise<{
  standings: StandingRow[];
  topPlayers: TopPlayerStat[];
  matches: FootballMatch[];
}> {
  const wiki = await fetchCorsJson<any>(
    'https://en.wikipedia.org/w/api.php?action=query&titles=2026%E2%80%9327_Algerian_Ligue_Professionnelle_1&prop=revisions&rvprop=content&format=json&rvslots=main&origin=*',
    6500,
  );
  const page = wiki?.query?.pages ? (Object.values(wiki.query.pages)[0] as any) : null;
  const content: string = page?.revisions?.[0]?.slots?.main?.['*'] || '';
  if (!content) return { standings: [], topPlayers: [], matches: [] };

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

  const logos: Record<string, string> = {};
  const clubNames = Object.values(teamNamesByCode);
  const [enRes, frRes] = await Promise.all([
    clubNames.length > 0
      ? fetchCorsJson<any>(
          `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(clubNames.join('|'))}&prop=pageimages&pithumbsize=128&format=json&origin=*`,
          5000,
        )
      : Promise.resolve(null),
    fetchCorsJson<any>(
      `https://fr.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(Object.values(ALGERIAN_FR_WIKI_TITLES).join('|'))}&prop=pageimages&pithumbsize=128&format=json&origin=*`,
      5000,
    ),
  ]);

  if (enRes?.query?.pages) {
    for (const p of Object.values(enRes.query.pages) as any[]) {
      if (p?.title && p?.thumbnail?.source) logos[p.title] = p.thumbnail.source;
    }
  }
  if (frRes?.query?.pages) {
    const rev = new Map(Object.entries(ALGERIAN_FR_WIKI_TITLES).map(([en, fr]) => [fr.toLowerCase(), en]));
    for (const p of Object.values(frRes.query.pages) as any[]) {
      if (p?.title && p?.thumbnail?.source) {
        const canonical = rev.get(String(p.title).toLowerCase());
        if (canonical && !logos[canonical]) logos[canonical] = p.thumbnail.source;
      }
    }
  }

  const zoneByRank: Record<number, StandingRow['zone']> = {};
  for (const m of tableSection.matchAll(/\|result(\d+)\s*=\s*([A-Z0-9]+)/g)) {
    const rank = Number(m[1]);
    const val = m[2].trim();
    if (val.startsWith('CCL')) zoneByRank[rank] = 'ucl';
    else if (val.startsWith('CCC')) zoneByRank[rank] = 'uel';
    else if (val === 'REL') zoneByRank[rank] = 'relegation';
    else if (val === 'PO') zoneByRank[rank] = 'playoff';
  }

  const readParam = (param: string, code: string) => {
    const m = tableSection.match(new RegExp(`\\|${param}_${code}\\s*=\\s*(\\d+)`));
    return m ? Number(m[1]) : 0;
  };

  const standings: StandingRow[] = codes.map((code, idx) => {
    const position = idx + 1;
    const won = readParam('win', code);
    const drawn = readParam('draw', code);
    const lost = readParam('loss', code);
    const goalsFor = readParam('gf', code);
    const goalsAgainst = readParam('ga', code);
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

  const topPlayers: TopPlayerStat[] = [];
  const scorersStart = content.indexOf('==Top scorers==');
  if (scorersStart >= 0) {
    const scorersEnd = content.indexOf('===Hat-tricks===', scorersStart);
    const scorersBlock = content.slice(
      scorersStart,
      scorersEnd > scorersStart ? scorersEnd : scorersStart + 1800,
    );
    let currentRank = 1;
    let currentGoals = 0;
    for (const row of scorersBlock.split('|-').slice(1)) {
      if (row.includes('!scope')) continue;
      const links = [...row.matchAll(/\[\[(?:[^|\]]*\|)?([^\]]+)\]\]/g)].map((m) => m[1].trim());
      if (links.length >= 2) {
        const rankMatch = row.match(/^\s*\|(?:rowspan=\d+\s*align="center"\|)?\s*(\d+)\s*\|/);
        const goalMatch = row.match(/\|\s*(?:rowspan=\d+\s*align="center"\|)?\s*(\d+)\s*(?:\n|$)/);
        if (rankMatch) currentRank = Number(rankMatch[1]);
        if (goalMatch) currentGoals = Number(goalMatch[1]);
        if (currentGoals > 0) {
          topPlayers.push({
            rank: currentRank,
            player: links[0],
            club: links[1],
            competitionId: 'algerian-ligue-1',
            appearances: 9,
            goals: currentGoals,
            assists: 0,
            goalContributions: currentGoals,
          });
        }
      }
    }
  }

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
      const homeName = teamNamesByCode[homeCode] || homeCode;
      const awayName = teamNamesByCode[awayCode] || awayCode;
      const meta = ALGERIAN_CLUB_STADIUMS[homeCode] ?? {
        stadium: `Stade ${homeName}`,
        city: 'Algérie',
        color: '#16A34A',
      };
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
          score: Number(m[3]),
        },
        awayTeam: {
          id: `dz-${awayCode}`,
          name: awayName,
          shortName: awayName,
          code: awayCode,
          logo: logos[awayName],
          accentColor: ALGERIAN_CLUB_STADIUMS[awayCode]?.color ?? '#DC2626',
          score: Number(m[4]),
        },
        stats: emptyMatchStats(),
        events: [],
      });
    }
  }

  return { standings, topPlayers, matches: matches.slice(0, 32) };
}

function isTransferText(lower: string): boolean {
  return (
    lower.includes('transfer') ||
    lower.includes('rumor') ||
    lower.includes('sign') ||
    lower.includes('target') ||
    lower.includes('contract') ||
    lower.includes('mercato') ||
    lower.includes('transfert') ||
    lower.includes('recrue') ||
    lower.includes('prêt') ||
    lower.includes('contrat')
  );
}

function isOfficialTransferText(lower: string): boolean {
  return (
    lower.includes('sign') ||
    lower.includes('agree') ||
    lower.includes('complete') ||
    lower.includes('officiel') ||
    lower.includes('rejoint')
  );
}

const CLIENT_COUNTRY_ALIASES: Record<string, string[]> = {
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

async function fetchClientNationalCupsAndFifa(): Promise<{
  nationalCupsStandings: NationalCupStandingsMap;
  fifaRanking: FifaRankingData;
}> {
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

  const nationalCupsStandings: NationalCupStandingsMap = { ...EMPTY_NATIONAL_CUPS_STANDINGS };
  const countryLogos: Record<string, string> = {};

  const [wiki] = await Promise.all([
    fetchCorsJson<any>(
      'https://en.wikipedia.org/w/api.php?action=query&titles=Module:SportsRankings/data/FIFA_World_Rankings&prop=revisions&rvprop=content&format=json&rvslots=main&origin=*',
      6000,
    ),
    ...cupSources.map(async ({ cupId, slug, regionPrefix }) => {
      const data = await fetchCorsJson<any>(
        `https://site.api.espn.com/apis/v2/sports/soccer/${slug}/standings`,
        7500,
      );
      if (!Array.isArray(data?.children) || data.children.length === 0) return;
      const rows: StandingRow[] = [];
      for (const child of data.children) {
        const entries = child?.standings?.entries;
        if (!Array.isArray(entries)) continue;
        const baseGroup = child?.name
          ? String(child.name).replace(/^Group\s+/i, 'Groupe ')
          : undefined;
        const groupLabel =
          regionPrefix && baseGroup ? `${regionPrefix} · ${baseGroup}` : regionPrefix || baseGroup;
        entries.forEach((entry: any, idx: number) => {
          const getStat = (n: string) =>
            Number(entry?.stats?.find((s: any) => s?.name === n)?.value ?? 0);
          const teamName = String(entry?.team?.displayName || 'Équipe').trim();
          const shortName = String(entry?.team?.shortDisplayName || teamName).trim();
          const logo: string | undefined = entry?.team?.logos?.[0]?.href || entry?.team?.logo || undefined;
          if (logo) {
            const lower = teamName.toLowerCase();
            countryLogos[lower] = logo;
            countryLogos[shortName.toLowerCase()] = logo;
            for (const alias of CLIENT_COUNTRY_ALIASES[lower] ?? []) {
              countryLogos[alias] = logo;
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
            groupName: groupLabel,
            zone: position <= 2 ? 'ucl' : position === 3 ? 'playoff' : undefined,
          });
        });
      }
      if (rows.length > 0) {
        const existing = nationalCupsStandings[cupId] ?? [];
        nationalCupsStandings[cupId] = [...existing, ...rows];
      }
    }),
  ]);

  let fifaRanking: FifaRankingData = { ...EMPTY_FIFA_RANKING };
  const page = wiki?.query?.pages ? (Object.values(wiki.query.pages)[0] as any) : null;
  const content: string = page?.revisions?.[0]?.slots?.main?.['*'] || '';
  if (content) {
    const updMatch = content.match(
      /data\.updated\s*=\s*\{\s*day\s*=\s*(\d+)\s*,\s*month\s*=\s*'([^']+)'\s*,\s*year\s*=\s*(\d+)/,
    );
    let updatedAt = '';
    if (updMatch) {
      const dt = new Date(`${updMatch[1]} ${updMatch[2]} ${updMatch[3]} 12:00 UTC`);
      if (!Number.isNaN(dt.getTime())) updatedAt = dt.toISOString();
    }

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
        const match = confedBlock.match(new RegExp(`\\b${confed}\\s*=\\s*\\{([^}]+)\\}`));
        if (match) {
          for (const c of match[1].matchAll(/"([A-Z]{3})"/g)) {
            confedByCode.set(c[1], confed);
          }
        }
      }
    }

    const rankStart = content.indexOf('data.rankings');
    const rankBlock =
      rankStart >= 0
        ? content.slice(rankStart, aliasStart > rankStart ? aliasStart : rankStart + 25000)
        : '';
    const entries: FifaRankingEntry[] = [];
    for (const m of rankBlock.matchAll(
      /\{\s*"([^"]+)"\s*,\s*(\d+)\s*,\s*(-?\d+)\s*,\s*([0-9]+(?:\.[0-9]+)?)\s*\}/g,
    )) {
      const team = m[1].trim();
      const lower = team.toLowerCase();
      const code =
        codeByTeam.get(lower) ||
        team
          .replace(/[^A-Za-z]/g, '')
          .slice(0, 3)
          .toUpperCase();
      let logo = countryLogos[lower];
      if (!logo) {
        for (const alias of CLIENT_COUNTRY_ALIASES[lower] ?? []) {
          if (countryLogos[alias]) {
            logo = countryLogos[alias];
            break;
          }
        }
      }
      entries.push({
        rank: Number(m[2]),
        previousChange: Number(m[3]),
        team,
        code,
        logo,
        points: Number(m[4]),
        confederation: confedByCode.get(code),
      });
    }
    fifaRanking = { updatedAt, entries };
  }

  return { nationalCupsStandings, fifaRanking };
}

export interface ClientBootstrapData {
  matches: FootballMatch[];
  standings: Record<Exclude<CompetitionId, 'all'>, StandingRow[]>;
  nationalCupsStandings: NationalCupStandingsMap;
  fifaRanking: FifaRankingData;
  topPlayers: TopPlayerStat[];
  news: NewsArticle[];
  transfers: TransferItem[];
  lastSyncedAt: string;
}

export async function fetchClientFallbackBootstrap(
  lang: AppLanguage = 'fr',
): Promise<ClientBootstrapData> {
  const matchMap = new Map<string, FootballMatch>();
  const standings: Record<Exclude<CompetitionId, 'all'>, StandingRow[]> = {
    ...EMPTY_STANDINGS,
    'ligue-1': [],
    'premier-league': [],
    'la-liga': [],
    'serie-a': [],
    bundesliga: [],
    'algerian-ligue-1': [],
    'national-teams': [],
  };
  const topPlayers: TopPlayerStat[] = [];

  const offsets = [0, 1, -1];
  const matchPromises: Promise<void>[] = [];

  for (const source of LEAGUE_SOURCES) {
    matchPromises.push(
      fetchCorsJson<any>(
        `https://site.api.espn.com/apis/site/v2/sports/soccer/${source.espnSlug}/scoreboard`,
      ).then((data) => {
        if (!Array.isArray(data?.events)) return;
        for (const ev of data.events) {
          const parsed = parseEspnScoreboardEventClient(ev, source);
          if (parsed) matchMap.set(parsed.id, parsed);
        }
      }),
    );

    if (!source.algerianFilterOnly && !source.skipDateOffsets) {
      for (const offset of offsets) {
        if (source.competitionId === 'national-teams' && offset > 1) continue;
        const dateParam = formatEspnDateClient(offset);
        matchPromises.push(
          fetchCorsJson<any>(
            `https://site.api.espn.com/apis/site/v2/sports/soccer/${source.espnSlug}/scoreboard?dates=${dateParam}`,
          ).then((data) => {
            if (!Array.isArray(data?.events)) return;
            for (const ev of data.events) {
              const parsed = parseEspnScoreboardEventClient(ev, source);
              if (parsed && !matchMap.has(parsed.id)) matchMap.set(parsed.id, parsed);
            }
          }),
        );
      }
    }
  }

  const standingSources: { slug: string; compId: Exclude<CompetitionId, 'all'> }[] = [
    { slug: 'fra.1', compId: 'ligue-1' },
    { slug: 'eng.1', compId: 'premier-league' },
    { slug: 'esp.1', compId: 'la-liga' },
    { slug: 'ita.1', compId: 'serie-a' },
    { slug: 'ger.1', compId: 'bundesliga' },
    { slug: 'uefa.nations', compId: 'national-teams' },
  ];

  const standingPromises = standingSources.map(async ({ slug, compId }) => {
    const data = await fetchCorsJson<any>(
      `https://site.api.espn.com/apis/v2/sports/soccer/${slug}/standings`,
    );
    if (!data?.children?.length) return;
    const rows: StandingRow[] = [];
    const groups = compId === 'national-teams' ? data.children.slice(0, 4) : [data.children[0]];
    for (const child of groups) {
      const entries = child?.standings?.entries;
      if (!Array.isArray(entries)) continue;
      entries.forEach((entry: any, idx: number) => {
        const getStat = (n: string) =>
          Number(entry?.stats?.find((s: any) => s?.name === n)?.value ?? 0);
        const position = getStat('rank') || idx + 1;
        let zone: StandingRow['zone'];
        if (compId !== 'national-teams') {
          if (position <= 4) zone = 'ucl';
          else if (position <= 6) zone = 'uel';
          else if (position >= entries.length - 2) zone = 'relegation';
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
    if (compId !== 'national-teams') rows.sort((a, b) => a.position - b.position);
    standings[compId] = rows;
  });

  const statsLeagues: { slug: string; compId: Exclude<CompetitionId, 'all'> }[] = [
    { slug: 'fra.1', compId: 'ligue-1' },
    { slug: 'eng.1', compId: 'premier-league' },
    { slug: 'esp.1', compId: 'la-liga' },
    { slug: 'ita.1', compId: 'serie-a' },
    { slug: 'ger.1', compId: 'bundesliga' },
  ];

  const statsPromises = statsLeagues.map(async ({ slug, compId }) => {
    const data = await fetchCorsJson<any>(
      `https://site.api.espn.com/apis/site/v2/sports/soccer/${slug}/statistics`,
    );
    const goalsCat = data?.stats?.find((c: any) => c?.name === 'goalsLeaders');
    const assistsCat = data?.stats?.find((c: any) => c?.name === 'assistsLeaders');
    const merged = new Map<string, TopPlayerStat>();
    const ingest = (cat: any) => {
      if (!Array.isArray(cat?.leaders)) return;
      for (const item of cat.leaders.slice(0, 6)) {
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
        merged.set(String(athlete.id), {
          rank: 0,
          player: athlete.displayName || 'Joueur',
          club: athlete?.team?.displayName || prev?.club || 'Club',
          competitionId: compId,
          appearances: Math.max(appearances, prev?.appearances ?? 0),
          goals: finalGoals,
          assists: finalAssists,
          goalContributions: finalGoals + finalAssists,
        });
      }
    };
    ingest(goalsCat);
    ingest(assistsCat);
    topPlayers.push(...merged.values());
  });

  interface RawClientFeed {
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
    isOfficial: boolean;
  }

  const rawNewsMap = new Map<string, RawClientFeed>();
  const rawTransferMap = new Map<string, RawClientFeed>();
  const nowMs = Date.now();
  const maxAgeMs = 72 * 3600 * 1000;

  const newsPromises = NEWS_SOURCES.map(async (src) => {
    const data = await fetchCorsJson<any>(
      `https://site.api.espn.com/apis/site/v2/sports/soccer/${src.slug}/news`,
    );
    if (!Array.isArray(data?.articles)) return;
    data.articles.forEach((a: any, idx: number) => {
      const headline = String(a?.headline || '').trim();
      const description = String(a?.description || '').trim();
      if (!headline) return;
      const lower = headline.toLowerCase();
      if (src.slug === 'all' && (lower.includes('nwsl') || lower.includes('usl '))) return;
      const publishedIso = a?.published || new Date().toISOString();
      const publishedMs = new Date(publishedIso).getTime();
      if (!Number.isNaN(publishedMs) && nowMs - publishedMs > maxAgeMs) return;

      const imgs = Array.isArray(a?.images)
        ? a.images.filter((i: any) => typeof i?.url === 'string' && i.url.startsWith('https://'))
        : [];
      const item: RawClientFeed = {
        id: String(a?.dataSourceIdentifier || `${src.slug}-${idx}-${headline.slice(0, 16)}`),
        headline,
        description: description || headline,
        sourceLang: 'en',
        competitionId: src.competitionId,
        label: src.label,
        publishedIso,
        sourceUrl: a?.links?.web?.href,
        imageUrl: imgs[0]?.url,
        isTransfer: isTransferText(lower),
        isOfficial: isOfficialTransferText(lower),
      };
      if (item.isTransfer) {
        if (!rawTransferMap.has(headline)) rawTransferMap.set(headline, item);
      } else if (!rawNewsMap.has(headline)) {
        rawNewsMap.set(headline, item);
      }
    });
  });

  const dzfootPromise = fetchCorsJson<any>(
    `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent('https://www.dzfoot.com/feed')}`,
  ).then((data) => {
    if (!Array.isArray(data?.items)) return;
    data.items.slice(0, 6).forEach((rss: any, idx: number) => {
      const title = String(rss?.title || '').trim();
      if (!title) return;
      const lower = title.toLowerCase();
      const isNat =
        lower.includes('algérie') ||
        lower.includes('algerie') ||
        lower.includes('fennec') ||
        lower.includes('petkovic');
      const desc = String(rss?.description || '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      const img =
        typeof rss?.thumbnail === 'string' && rss.thumbnail.startsWith('https://')
          ? rss.thumbnail
          : typeof rss?.enclosure?.link === 'string' && rss.enclosure.link.startsWith('https://')
            ? rss.enclosure.link
            : undefined;
      const item: RawClientFeed = {
        id: `dzfoot-c-${idx}-${title.slice(0, 14)}`,
        headline: title,
        description: desc || title,
        sourceLang: 'fr',
        competitionId: isNat ? 'national-teams' : 'algerian-ligue-1',
        label: isNat ? 'Sélections — Algérie' : 'Ligue 1 Mobilis (Algérie)',
        publishedIso: rss?.pubDate ? new Date(rss.pubDate).toISOString() : new Date().toISOString(),
        sourceUrl: rss?.link,
        imageUrl: img,
        isTransfer: isTransferText(lower),
        isOfficial: isOfficialTransferText(lower),
      };
      if (item.isTransfer) {
        if (!rawTransferMap.has(title)) rawTransferMap.set(title, item);
      } else if (!rawNewsMap.has(title)) {
        rawNewsMap.set(title, item);
      }
    });
  });

  const [algWiki, cupsAndFifa] = await Promise.all([
    fetchAlgerianWikipediaFallback(),
    fetchClientNationalCupsAndFifa(),
    ...matchPromises,
    ...standingPromises,
    ...statsPromises,
    ...newsPromises,
    dzfootPromise,
  ]);

  if (algWiki.standings.length > 0) standings['algerian-ligue-1'] = algWiki.standings;
  topPlayers.push(...algWiki.topPlayers);
  topPlayers.sort((a, b) => b.goals - a.goals || b.assists - a.assists);
  topPlayers.forEach((p, i) => {
    p.rank = i + 1;
  });

  for (const m of algWiki.matches) {
    if (!matchMap.has(m.id)) matchMap.set(m.id, m);
  }

  const orderWeight = { live: 0, upcoming: 1, finished: 2 };
  const matches = Array.from(matchMap.values()).sort((a, b) => {
    const wDiff = orderWeight[a.status] - orderWeight[b.status];
    if (wDiff !== 0) return wDiff;
    const tA = new Date(a.date).getTime();
    const tB = new Date(b.date).getTime();
    return a.status === 'finished' ? tB - tA : tA - tB;
  });

  const rawNews = Array.from(rawNewsMap.values())
    .sort((a, b) => new Date(b.publishedIso).getTime() - new Date(a.publishedIso).getTime())
    .slice(0, 12);
  const rawTransfers = Array.from(rawTransferMap.values())
    .sort((a, b) => new Date(b.publishedIso).getTime() - new Date(a.publishedIso).getTime())
    .slice(0, 10);

  const authorLabel =
    lang === 'ar'
      ? 'تحرير THE PITCH · البث المباشر'
      : lang === 'en'
        ? 'THE PITCH Desk · Live Wire'
        : 'Rédaction THE PITCH · Fil Direct';
  const readTimeLabel =
    lang === 'ar' ? 'خبر مباشر' : lang === 'en' ? 'Live update' : 'Actu en temps réel';

  const news: NewsArticle[] = await Promise.all(
    rawNews.map(async (item, index) => {
      const [locTitle, locDesc] = await Promise.all([
        translateClientText(item.headline, lang, item.sourceLang),
        item.description !== item.headline
          ? translateClientText(item.description, lang, item.sourceLang)
          : Promise.resolve(''),
      ]);
      const publishedLabel = formatLocalizedNewsDateClient(item.publishedIso, lang);
      const fallbackImg =
        IMAGE_BY_COMP[item.competitionId] || FALLBACK_GALLERY[index % FALLBACK_GALLERY.length];
      const subtitle = locDesc || locTitle;
      const bodySecond =
        lang === 'ar'
          ? `خبر منشور مباشرة (${publishedLabel}).`
          : lang === 'en'
            ? `Published in real time (${publishedLabel}).`
            : `Information publiée en temps réel (${publishedLabel}).`;

      return {
        id: `art-${item.id}`,
        title: locTitle,
        subtitle,
        category: item.label,
        competitionId: item.competitionId,
        author: authorLabel,
        publishedAt: publishedLabel,
        publishedIso: item.publishedIso,
        readTime: readTimeLabel,
        imageUrl: item.imageUrl || fallbackImg,
        fallbackImageUrl: fallbackImg,
        imageCaption: `${item.label} · ${publishedLabel}`,
        featured: index === 0,
        body: [subtitle, bodySecond],
        sourceUrl: item.sourceUrl,
      };
    }),
  );

  const transfers: TransferItem[] = await Promise.all(
    rawTransfers.map(async (item, index) => {
      const cleanHeadline = item.headline.replace(/^Transfer rumors, news:\s*/i, '');
      const [locHeadline, locSummary] = await Promise.all([
        translateClientText(cleanHeadline, lang, item.sourceLang),
        item.description !== item.headline
          ? translateClientText(item.description, lang, item.sourceLang)
          : Promise.resolve(''),
      ]);
      const fallbackImg =
        FALLBACK_GALLERY[(index + 5) % FALLBACK_GALLERY.length] ||
        '/src/assets/images/mercato_tunnel_view_1795287057654.jpg';
      return {
        id: `tr-${item.id}`,
        headline: locHeadline,
        summary: locSummary || locHeadline,
        competitionId: item.competitionId,
        competitionLabel: item.label,
        publishedAt: formatLocalizedNewsDateClient(item.publishedIso, lang),
        publishedIso: item.publishedIso,
        sourceUrl: item.sourceUrl,
        imageUrl: item.imageUrl || fallbackImg,
        fallbackImageUrl: fallbackImg,
        category: item.isOfficial ? 'Officiel / Transfert' : 'Mercato & Rumeurs',
      };
    }),
  );

  return {
    matches,
    standings,
    nationalCupsStandings: cupsAndFifa.nationalCupsStandings,
    fifaRanking: cupsAndFifa.fifaRanking,
    topPlayers,
    news,
    transfers,
    lastSyncedAt: new Date().toISOString(),
  };
}

export async function fetchEspnMatchDetailsDirect(
  match: FootballMatch,
): Promise<FootballMatch> {
  if (match.id.startsWith('dz-') || match.id.startsWith('af-')) {
    return match;
  }
  const slug = match.espnLeagueSlug || 'eng.1';
  const sum = await fetchCorsJson<any>(
    `https://site.api.espn.com/apis/site/v2/sports/soccer/${encodeURIComponent(slug)}/summary?event=${encodeURIComponent(match.id)}`,
    6000,
  );
  if (!sum) return match;

  const updated: FootballMatch = { ...match, stats: { ...match.stats }, events: [...match.events] };
  const teamsBox = sum?.boxscore?.teams;
  if (Array.isArray(teamsBox) && teamsBox.length === 2) {
    const homeBox =
      teamsBox.find((t: any) => String(t?.team?.id) === String(match.homeTeam.id)) ?? teamsBox[0];
    const awayBox =
      teamsBox.find((t: any) => String(t?.team?.id) === String(match.awayTeam.id)) ?? teamsBox[1];
    const hs = homeBox?.statistics;
    const as = awayBox?.statistics;
    const toPct = (v: number) => (v > 0 && v <= 1 ? Math.round(v * 100) : Math.round(v));
    updated.stats = {
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
      parsedEvents.push({
        id: `${match.id}-ke-${idx}`,
        minute: parseMinute(k?.clock?.displayValue),
        clockDisplay: k?.clock?.displayValue,
        team: String(k?.team?.id) === String(match.homeTeam.id) ? 'home' : 'away',
        type: mappedType,
        player:
          k?.participants?.[0]?.athlete?.displayName ||
          k?.text?.split('(')[0]?.trim() ||
          'Joueur',
        assist: k?.participants?.[1]?.athlete?.displayName,
        detail: k?.text,
      });
    });
    if (parsedEvents.length > 0) updated.events = parsedEvents;
  }

  if (sum?.gameInfo?.attendance) {
    updated.attendance = Number(sum.gameInfo.attendance).toLocaleString('fr-FR');
  }
  if (Array.isArray(sum?.gameInfo?.officials) && sum.gameInfo.officials[0]?.displayName) {
    updated.referee = sum.gameInfo.officials[0].displayName;
  }
  if (sum?.gameInfo?.venue?.fullName) {
    updated.stadium = sum.gameInfo.venue.fullName;
    updated.city = sum.gameInfo.venue.address?.city || updated.city;
  }
  if (Array.isArray(sum?.rosters)) {
    const hRoster = sum.rosters.find((r: any) => String(r?.team?.id) === String(match.homeTeam.id));
    const aRoster = sum.rosters.find((r: any) => String(r?.team?.id) === String(match.awayTeam.id));
    if (hRoster?.formation) updated.homeTeam = { ...updated.homeTeam, formation: hRoster.formation };
    if (aRoster?.formation) updated.awayTeam = { ...updated.awayTeam, formation: aRoster.formation };
  }

  return updated;
}

export function detectLiveGoalsClient(
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
      const latest = [...next.events]
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
        scorer: latest?.player || next.homeTeam.shortName,
        minute: next.minute ?? latest?.minute ?? 0,
        timestamp: new Date().toISOString(),
      });
    }
    if (next.awayTeam.score > prev.awayTeam.score) {
      const latest = [...next.events]
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
        scorer: latest?.player || next.awayTeam.shortName,
        minute: next.minute ?? latest?.minute ?? 0,
        timestamp: new Date().toISOString(),
      });
    }
  }
  return detected;
}
