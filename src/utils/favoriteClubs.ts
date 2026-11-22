import { FOLLOWABLE_TEAMS } from '../data/footballData';
import {
  CompetitionId,
  FavoriteFilterMode,
  FootballMatch,
  NewsArticle,
  StandingRow,
  TransferItem,
  UserProfilePreferences,
} from '../types/football';

export const USER_PROFILE_STORAGE_KEY = 'thepitch_user_profile';

export const DEFAULT_USER_PROFILE: UserProfilePreferences = {
  displayName: '',
  favoriteClubs: [],
  favoriteFilterMode: 'only',
};

export function loadUserProfile(): UserProfilePreferences {
  try {
    const raw = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
    if (!raw) return DEFAULT_USER_PROFILE;
    const parsed = JSON.parse(raw) as Partial<UserProfilePreferences>;
    const favoriteClubs = Array.isArray(parsed.favoriteClubs)
      ? parsed.favoriteClubs
          .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
          .map((item) => item.trim())
      : [];
    const mode: FavoriteFilterMode =
      parsed.favoriteFilterMode === 'only' ||
      parsed.favoriteFilterMode === 'prioritize' ||
      parsed.favoriteFilterMode === 'all'
        ? parsed.favoriteFilterMode
        : 'only';
    return {
      displayName: typeof parsed.displayName === 'string' ? parsed.displayName : '',
      favoriteClubs: Array.from(new Set(favoriteClubs)),
      favoriteFilterMode: mode,
    };
  } catch {
    return DEFAULT_USER_PROFILE;
  }
}

export function saveUserProfile(profile: UserProfilePreferences): void {
  try {
    localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
    window.dispatchEvent(new Event('thepitch:profile-updated'));
  } catch {
    // Ignore storage quota errors
  }
}

const CLUB_ALIASES: Record<string, string[]> = {
  'paris saint-germain': ['paris saint-germain', 'psg', 'paris sg', 'paris-sg'],
  marseille: ['marseille', 'olympique de marseille', 'olympique marseille', 'om'],
  'as monaco': ['as monaco', 'monaco'],
  lyon: ['lyon', 'olympique lyonnais', 'ol'],
  lille: ['lille', 'losc', 'losc lille'],
  nice: ['nice', 'ogc nice'],
  rennes: ['rennes', 'stade rennais', 'rennais'],
  lens: ['lens', 'rc lens'],
  arsenal: ['arsenal', 'gunners'],
  liverpool: ['liverpool', 'reds'],
  'manchester city': ['manchester city', 'man city', 'city'],
  'manchester united': ['manchester united', 'man united', 'man utd'],
  chelsea: ['chelsea', 'blues'],
  'newcastle united': ['newcastle united', 'newcastle'],
  tottenham: ['tottenham', 'tottenham hotspur', 'spurs'],
  'real madrid': ['real madrid'],
  barcelona: ['barcelona', 'barcelone', 'fc barcelone', 'barca', 'barça'],
  'atlético madrid': ['atlético madrid', 'atletico madrid', 'atlético', 'atletico'],
  'inter milan': ['inter milan', 'inter', 'internazionale'],
  'ac milan': ['ac milan', 'milan ac'],
  juventus: ['juventus', 'juve'],
  napoli: ['napoli', 'naples'],
  'bayern munich': ['bayern munich', 'bayern münchen', 'bayern', 'fc bayern'],
  'bayer leverkusen': ['bayer leverkusen', 'leverkusen'],
  'borussia dortmund': ['borussia dortmund', 'dortmund', 'bvb'],
  algeria: ['algeria', 'algérie', 'algerie', 'les fennecs', 'fennecs', 'dz'],
  'mc alger': ['mc alger', 'mca', 'mouloudia alger', 'mouloudia club d\'alger'],
  'cr belouizdad': ['cr belouizdad', 'crb', 'belouizdad'],
  'js kabylie': ['js kabylie', 'jsk', 'kabylie'],
  'usm alger': ['usm alger', 'usma'],
  'mc oran': ['mc oran', 'mco'],
  'es setif': ['es setif', 'es sétif', 'ess', 'entente setif'],
  'cs constantine': ['cs constantine', 'csc'],
  france: ['france', 'équipe de france', 'equipe de france', 'les bleus'],
  spain: ['spain', 'espagne', 'la roja'],
  england: ['england', 'angleterre'],
  argentina: ['argentina', 'argentine'],
  brazil: ['brazil', 'brésil', 'bresil'],
  germany: ['germany', 'allemagne'],
  italy: ['italy', 'italie'],
  portugal: ['portugal'],
  morocco: ['morocco', 'maroc', 'lions de l\'atlas'],
  senegal: ['senegal', 'sénégal', 'lions de la téranga'],
  egypt: ['egypt', 'égypte', 'egypte'],
  tunisia: ['tunisia', 'tunisie'],
  japan: ['japan', 'japon'],
};

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function getSearchTermsForClub(clubName: string): string[] {
  const normalized = normalizeText(clubName);
  const terms = new Set<string>([normalized]);

  for (const [canonical, aliases] of Object.entries(CLUB_ALIASES)) {
    const normCanonical = normalizeText(canonical);
    const normAliases = aliases.map(normalizeText);
    if (normCanonical === normalized || normAliases.includes(normalized)) {
      terms.add(normCanonical);
      for (const alias of normAliases) {
        terms.add(alias);
      }
    }
  }

  return Array.from(terms).filter((t) => t.length >= 2);
}

function containsWholeTerm(haystack: string, term: string): boolean {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // For very short acronyms (2-3 chars like PSG, OM, OL), require word boundaries
  if (term.length <= 3) {
    const regex = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i');
    return regex.test(haystack);
  }
  return haystack.includes(term);
}

export function isClubNameMatch(favoriteClub: string, candidateName: string): boolean {
  const normCandidate = normalizeText(candidateName);
  if (!normCandidate) return false;
  const terms = getSearchTermsForClub(favoriteClub);
  return terms.some((term) => containsWholeTerm(normCandidate, term));
}

export function textMentionsFavoriteClub(favoriteClubs: string[], text: string): boolean {
  if (favoriteClubs.length === 0) return false;
  const normText = normalizeText(text);
  if (!normText) return false;
  return favoriteClubs.some((club) => {
    const terms = getSearchTermsForClub(club);
    return terms.some((term) => containsWholeTerm(normText, term));
  });
}

export function matchInvolvesFavorite(match: FootballMatch, favoriteClubs: string[]): boolean {
  if (favoriteClubs.length === 0) return false;
  return favoriteClubs.some(
    (club) =>
      isClubNameMatch(club, match.homeTeam.name) ||
      isClubNameMatch(club, match.homeTeam.shortName) ||
      isClubNameMatch(club, match.awayTeam.name) ||
      isClubNameMatch(club, match.awayTeam.shortName),
  );
}

export function articleInvolvesFavorite(article: NewsArticle, favoriteClubs: string[]): boolean {
  if (favoriteClubs.length === 0) return false;
  const combined = `${article.title} ${article.subtitle} ${article.body.join(' ')}`;
  return textMentionsFavoriteClub(favoriteClubs, combined);
}

export function transferInvolvesFavorite(
  transfer: TransferItem,
  favoriteClubs: string[],
): boolean {
  if (favoriteClubs.length === 0) return false;
  const combined = `${transfer.headline} ${transfer.summary}`;
  return textMentionsFavoriteClub(favoriteClubs, combined);
}

export function prioritizeAndFilterMatches(
  matches: FootballMatch[],
  favoriteClubs: string[],
  mode: FavoriteFilterMode,
): { items: FootballMatch[]; matchedCount: number } {
  if (favoriteClubs.length === 0 || mode === 'all') {
    return { items: matches, matchedCount: 0 };
  }

  const favoriteList: FootballMatch[] = [];
  const otherList: FootballMatch[] = [];

  for (const match of matches) {
    if (matchInvolvesFavorite(match, favoriteClubs)) {
      favoriteList.push(match);
    } else {
      otherList.push(match);
    }
  }

  if (mode === 'only') {
    return { items: favoriteList, matchedCount: favoriteList.length };
  }

  return {
    items: [...favoriteList, ...otherList],
    matchedCount: favoriteList.length,
  };
}

export function prioritizeAndFilterNews(
  articles: NewsArticle[],
  favoriteClubs: string[],
  mode: FavoriteFilterMode,
): { items: NewsArticle[]; matchedCount: number } {
  if (favoriteClubs.length === 0 || mode === 'all') {
    return { items: articles, matchedCount: 0 };
  }

  const favoriteList: NewsArticle[] = [];
  const otherList: NewsArticle[] = [];

  for (const article of articles) {
    if (articleInvolvesFavorite(article, favoriteClubs)) {
      favoriteList.push(article);
    } else {
      otherList.push(article);
    }
  }

  if (mode === 'only') {
    return { items: favoriteList, matchedCount: favoriteList.length };
  }

  return {
    items: [...favoriteList, ...otherList],
    matchedCount: favoriteList.length,
  };
}

export function prioritizeAndFilterTransfers(
  transfers: TransferItem[],
  favoriteClubs: string[],
  mode: FavoriteFilterMode,
): { items: TransferItem[]; matchedCount: number } {
  if (favoriteClubs.length === 0 || mode === 'all') {
    return { items: transfers, matchedCount: 0 };
  }

  const favoriteList: TransferItem[] = [];
  const otherList: TransferItem[] = [];

  for (const transfer of transfers) {
    if (transferInvolvesFavorite(transfer, favoriteClubs)) {
      favoriteList.push(transfer);
    } else {
      otherList.push(transfer);
    }
  }

  if (mode === 'only') {
    return { items: favoriteList, matchedCount: favoriteList.length };
  }

  return {
    items: [...favoriteList, ...otherList],
    matchedCount: favoriteList.length,
  };
}

export function collectAvailableClubs(
  matches: FootballMatch[],
  standingsByComp: Record<Exclude<CompetitionId, 'all'>, StandingRow[]>,
): string[] {
  const seen = new Map<string, string>();

  const register = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const key = normalizeText(trimmed);
    if (!seen.has(key)) {
      seen.set(key, trimmed);
    }
  };

  for (const team of FOLLOWABLE_TEAMS) {
    register(team);
  }

  for (const rows of Object.values(standingsByComp)) {
    for (const row of rows) {
      register(row.team);
    }
  }

  for (const match of matches) {
    register(match.homeTeam.name);
    register(match.awayTeam.name);
  }

  return Array.from(seen.values());
}
