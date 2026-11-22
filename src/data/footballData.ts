import {
  CompetitionId,
  DebateTopic,
  PredictionVoteCounts,
  StandingRow,
  SupporterComment,
} from '../types/football';

export const COMPETITIONS: { id: CompetitionId; name: string; shortName: string; region: string }[] = [
  { id: 'all', name: 'Toutes les compétitions', shortName: 'Toutes', region: 'Europe & Monde' },
  { id: 'ligue-1', name: 'Ligue 1 McDonald’s', shortName: 'Ligue 1', region: 'France' },
  { id: 'premier-league', name: 'Premier League', shortName: 'Premier League', region: 'Angleterre' },
  { id: 'la-liga', name: 'La Liga EA Sports', shortName: 'La Liga', region: 'Espagne' },
  { id: 'serie-a', name: 'Serie A Enilive', shortName: 'Serie A', region: 'Italie' },
  { id: 'bundesliga', name: 'Bundesliga', shortName: 'Bundesliga', region: 'Allemagne' },
  { id: 'national-teams', name: 'Sélections Nationales', shortName: 'Sélections', region: 'International' },
];

export const FOLLOWABLE_TEAMS: string[] = [
  'Paris Saint-Germain',
  'Marseille',
  'AS Monaco',
  'Lyon',
  'Lille',
  'Nice',
  'Arsenal',
  'Liverpool',
  'Manchester City',
  'Chelsea',
  'Newcastle United',
  'Real Madrid',
  'Barcelona',
  'Atlético Madrid',
  'Inter Milan',
  'AC Milan',
  'Juventus',
  'Napoli',
  'Bayern Munich',
  'Bayer Leverkusen',
  'Borussia Dortmund',
  'France',
  'Spain',
  'England',
  'Argentina',
  'Brazil',
];

export const EMPTY_STANDINGS: Record<Exclude<CompetitionId, 'all'>, StandingRow[]> = {
  'ligue-1': [],
  'premier-league': [],
  'la-liga': [],
  'serie-a': [],
  bundesliga: [],
  'national-teams': [],
};

export const INITIAL_DEBATES: DebateTopic[] = [
  {
    id: 'deb-live-1',
    title: 'Course au titre en Premier League : Arsenal peut-il tenir le rythme jusqu’au bout ?',
    description:
      'Avec Arsenal en tête du classement devant Brighton et Manchester City, le duel à distance de cette saison s’annonce très serré.',
    competitionId: 'premier-league',
    author: 'Gooner_Paris',
    createdAt: new Date().toISOString(),
    options: [
      { id: 'opt-1', label: 'Oui, Arsenal a l’effectif le plus complet', votes: 84 },
      { id: 'opt-2', label: 'Non, Manchester City ou Liverpool finiront plus fort', votes: 79 },
      { id: 'opt-3', label: 'Une surprise dans le top 4 reste possible', votes: 31 },
    ],
  },
  {
    id: 'deb-live-2',
    title: 'Ligue 1 : le PSG peut-il rester intouchable malgré la concurrence du LOSC et de l’OM ?',
    description:
      'Après le succès renversant à Nice (3-2), Paris garde la tête du championnat mais les poursuivants restent à portée.',
    competitionId: 'ligue-1',
    author: 'Supporter_L1',
    createdAt: new Date().toISOString(),
    options: [
      { id: 'opt-l1', label: 'Oui, la marge technique parisienne est trop grande', votes: 112 },
      { id: 'opt-l2', label: 'Non, le championnat sera disputé jusqu’au printemps', votes: 68 },
    ],
  },
];

export const INITIAL_COMMENTS: SupporterComment[] = [
  {
    id: 'com-live-1',
    targetType: 'debate',
    targetId: 'deb-live-1',
    author: 'Alex_NorthLondon',
    clubSupport: 'Arsenal',
    content: 'Le calendrier de novembre-décembre va être décisif pour garder notre avance au classement.',
    createdAt: new Date().toISOString(),
    likes: 14,
  },
  {
    id: 'com-live-2',
    targetType: 'debate',
    targetId: 'deb-live-2',
    author: 'Nissart06',
    clubSupport: 'OGC Nice',
    content: 'Beau match ouvert aujourd’hui contre Paris, dommage pour la blessure de Désiré Doué en fin de match.',
    createdAt: new Date().toISOString(),
    likes: 9,
  },
];

export const INITIAL_PREDICTIONS: PredictionVoteCounts[] = [];
