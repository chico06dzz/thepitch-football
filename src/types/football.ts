export type CompetitionId =
  | 'all'
  | 'ligue-1'
  | 'premier-league'
  | 'la-liga'
  | 'serie-a'
  | 'bundesliga'
  | 'algerian-ligue-1'
  | 'national-teams';

export type NationalCupId =
  | 'world-cup'
  | 'afcon'
  | 'euro'
  | 'asian-cup'
  | 'copa-america'
  | 'gold-cup'
  | 'nations-league'
  | 'world-qualifiers'
  | 'friendlies';

export type MatchStatus = 'live' | 'upcoming' | 'finished';

export interface MatchEvent {
  id: string;
  minute: number;
  extraMinute?: number;
  clockDisplay?: string;
  team: 'home' | 'away';
  type: 'goal' | 'penalty_goal' | 'yellow_card' | 'red_card' | 'substitution';
  player: string;
  assist?: string;
  detail?: string;
}

export interface MatchDetailedStats {
  possession: [number, number];
  shotsTotal: [number, number];
  shotsOnTarget: [number, number];
  passesCompleted: [number, number];
  passAccuracy: [number, number];
  corners: [number, number];
  fouls: [number, number];
  yellowCards: [number, number];
  redCards: [number, number];
  saves: [number, number];
  offsides: [number, number];
}

export interface FootballMatch {
  id: string;
  espnLeagueSlug?: string;
  competitionId: Exclude<CompetitionId, 'all'>;
  nationalCupId?: NationalCupId;
  competitionName: string;
  matchday: string;
  date: string; // ISO date e.g. '2026-11-21T18:30Z'
  kickoffTime: string; // e.g. '19:30'
  status: MatchStatus;
  statusDetail?: string;
  minute?: number;
  stadium: string;
  city: string;
  referee?: string;
  attendance?: string;
  homeTeam: {
    id?: string;
    name: string;
    shortName: string;
    code: string;
    logo?: string;
    accentColor: string;
    score: number;
    formation?: string;
  };
  awayTeam: {
    id?: string;
    name: string;
    shortName: string;
    code: string;
    logo?: string;
    accentColor: string;
    score: number;
    formation?: string;
  };
  stats: MatchDetailedStats;
  events: MatchEvent[];
  tvChannel?: string;
}

export interface StandingRow {
  position: number;
  team: string;
  shortName: string;
  logo?: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  groupName?: string;
  zone?: 'ucl' | 'uel' | 'relegation' | 'playoff';
}

export interface FifaRankingEntry {
  rank: number;
  previousChange: number;
  team: string;
  code: string;
  logo?: string;
  points: number;
  confederation?: 'UEFA' | 'CONMEBOL' | 'CAF' | 'AFC' | 'CONCACAF' | 'OFC';
}

export interface FifaRankingData {
  updatedAt: string;
  entries: FifaRankingEntry[];
}

export type NationalCupStandingsMap = Partial<
  Record<Exclude<NationalCupId, 'friendlies'>, StandingRow[]>
>;

export interface TopPlayerStat {
  rank: number;
  player: string;
  club: string;
  competitionId: Exclude<CompetitionId, 'all'>;
  appearances: number;
  goals: number;
  assists: number;
  goalContributions: number;
}

export interface TransferItem {
  id: string;
  headline: string;
  summary: string;
  competitionId: CompetitionId;
  competitionLabel: string;
  publishedAt: string;
  publishedIso?: string;
  sourceUrl?: string;
  imageUrl?: string;
  fallbackImageUrl?: string;
  category: 'Mercato & Rumeurs' | 'Officiel / Transfert';
}

export interface NewsArticle {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  competitionId: CompetitionId;
  author: string;
  publishedAt: string;
  publishedIso?: string;
  readTime: string;
  imageUrl: string;
  fallbackImageUrl?: string;
  imageCaption: string;
  featured?: boolean;
  body: string[];
  sourceUrl?: string;
}

export interface SupporterComment {
  id: string;
  targetType: 'match' | 'article' | 'transfer' | 'debate';
  targetId: string;
  author: string;
  clubSupport?: string;
  content: string;
  createdAt: string;
  likes: number;
}

export interface DebatePollOption {
  id: string;
  label: string;
  votes: number;
}

export interface DebateTopic {
  id: string;
  title: string;
  description: string;
  competitionId: CompetitionId;
  author: string;
  createdAt: string;
  options: DebatePollOption[];
}

export interface PredictionVoteCounts {
  matchId: string;
  homeVotes: number;
  drawVotes: number;
  awayVotes: number;
}

export interface UserAlertRule {
  id: string;
  type: 'team' | 'competition';
  target: string;
  label: string;
  goalPush: boolean;
  lineupAlert: boolean;
  mercatoAlert: boolean;
  createdAt: string;
}

export interface GoalNotificationEvent {
  id: string;
  matchId: string;
  competitionId: Exclude<CompetitionId, 'all'>;
  competitionName: string;
  scoringTeam: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  scorer: string;
  minute: number;
  timestamp: string;
  isTest?: boolean;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

export type FavoriteFilterMode = 'only' | 'prioritize' | 'all';

export interface UserProfilePreferences {
  displayName: string;
  favoriteClubs: string[];
  favoriteFilterMode: FavoriteFilterMode;
}

export type AppLanguage = 'fr' | 'ar' | 'en';


