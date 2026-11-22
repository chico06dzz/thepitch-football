import {
  EMPTY_FIFA_RANKING,
  EMPTY_NATIONAL_CUPS_STANDINGS,
  EMPTY_STANDINGS,
  INITIAL_COMMENTS,
  INITIAL_DEBATES,
  INITIAL_PREDICTIONS,
} from '../../src/data/footballData.ts';
import {
  createTestGoalEvent,
  fetchAllLiveMatches,
  fetchAllStandings,
  fetchAllTopPlayers,
  fetchMatchDetails,
  fetchNationalCupsAndFifa,
  fetchRealNewsAndMercato,
  getLocalizedNewsAndMercato,
  getParisDayKey,
} from '../../src/services/liveFootballService.ts';
import {
  AppLanguage,
  CompetitionId,
  ContactSubmission,
  DebateTopic,
  FifaRankingData,
  FootballMatch,
  NationalCupStandingsMap,
  NewsArticle,
  PredictionVoteCounts,
  StandingRow,
  SupporterComment,
  TopPlayerStat,
  TransferItem,
  UserAlertRule,
} from '../../src/types/football.ts';

interface LiveCache {
  matches: FootballMatch[];
  standings: Record<Exclude<CompetitionId, 'all'>, StandingRow[]>;
  nationalCupsStandings: NationalCupStandingsMap;
  fifaRanking: FifaRankingData;
  topPlayers: TopPlayerStat[];
  news: NewsArticle[];
  transfers: TransferItem[];
  lastSyncedAt: string;
  fetchedAtMs: number;
  dayKey: string;
}

interface UserStoreData {
  debates: DebateTopic[];
  comments: SupporterComment[];
  predictions: PredictionVoteCounts[];
  alerts: UserAlertRule[];
  contacts: ContactSubmission[];
}

const CACHE_TTL_MS = 45 * 1000;

const liveCache: LiveCache = {
  matches: [],
  standings: { ...EMPTY_STANDINGS },
  nationalCupsStandings: { ...EMPTY_NATIONAL_CUPS_STANDINGS },
  fifaRanking: { ...EMPTY_FIFA_RANKING },
  topPlayers: [],
  news: [],
  transfers: [],
  lastSyncedAt: '',
  fetchedAtMs: 0,
  dayKey: '',
};

const userStore: UserStoreData = {
  debates: [...INITIAL_DEBATES],
  comments: [...INITIAL_COMMENTS],
  predictions: [...INITIAL_PREDICTIONS],
  alerts: [
    {
      id: 'al-default-1',
      type: 'team',
      target: 'Paris Saint-Germain',
      label: 'Paris Saint-Germain',
      goalPush: true,
      lineupAlert: true,
      mercatoAlert: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'al-default-2',
      type: 'team',
      target: 'Arsenal',
      label: 'Arsenal',
      goalPush: true,
      lineupAlert: true,
      mercatoAlert: false,
      createdAt: new Date().toISOString(),
    },
  ],
  contacts: [],
};

const matchDetailCache = new Map<string, { data: FootballMatch; fetchedAt: number }>();
let inFlightSync: Promise<void> | null = null;

function parseLangParam(raw: string | null): AppLanguage {
  if (raw === 'ar' || raw === 'en' || raw === 'fr') return raw;
  return 'fr';
}

function sanitizeText(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

async function syncAllLiveData(lang: AppLanguage, force = false): Promise<void> {
  const currentDayKey = getParisDayKey();
  const isFresh =
    !force &&
    liveCache.matches.length > 0 &&
    liveCache.news.length > 0 &&
    liveCache.dayKey === currentDayKey &&
    Date.now() - liveCache.fetchedAtMs < CACHE_TTL_MS;

  if (isFresh) return;

  if (inFlightSync && !force) {
    await inFlightSync;
    return;
  }

  inFlightSync = (async () => {
    try {
      // Wave 1: club standings + top players + news & transfers
      const [standings, topPlayers, newsAndTransfers] = await Promise.all([
        fetchAllStandings(),
        fetchAllTopPlayers(),
        fetchRealNewsAndMercato(lang),
      ]);

      if (Object.values(standings).some((rows) => rows.length > 0)) {
        liveCache.standings = standings;
      }
      if (topPlayers.length > 0) liveCache.topPlayers = topPlayers;
      if (newsAndTransfers.news.length > 0) liveCache.news = newsAndTransfers.news;
      if (newsAndTransfers.transfers.length > 0) liveCache.transfers = newsAndTransfers.transfers;

      // Wave 2: national cups standings & FIFA ranking + compact live/recent matches
      const [cupsAndFifa, matches] = await Promise.all([
        fetchNationalCupsAndFifa(),
        fetchAllLiveMatches('compact'),
      ]);
      if (Object.keys(cupsAndFifa.nationalCupsStandings).length > 0) {
        liveCache.nationalCupsStandings = cupsAndFifa.nationalCupsStandings;
      }
      if (cupsAndFifa.fifaRanking.entries.length > 0) {
        liveCache.fifaRanking = cupsAndFifa.fifaRanking;
      }
      if (matches.length > 0) liveCache.matches = matches;

      liveCache.lastSyncedAt = new Date().toISOString();
      liveCache.fetchedAtMs = Date.now();
      liveCache.dayKey = currentDayKey;
    } finally {
      inFlightSync = null;
    }
  })();

  await inFlightSync;
}

async function readJsonBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const parsed = await request.json();
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  const url = new URL(request.url);
  const apiPath = url.pathname
    .replace(/^\/\.netlify\/functions\/api/, '/api')
    .replace(/\/+$/, '') || '/api';
  const method = request.method.toUpperCase();

  try {
    // GET /api/bootstrap
    if (method === 'GET' && apiPath === '/api/bootstrap') {
      const lang = parseLangParam(url.searchParams.get('lang'));
      await syncAllLiveData(lang, false);
      const localized = await getLocalizedNewsAndMercato(lang);

      return jsonResponse({
        matches: liveCache.matches,
        standings: liveCache.standings,
        nationalCupsStandings: liveCache.nationalCupsStandings,
        fifaRanking: liveCache.fifaRanking,
        topPlayers: liveCache.topPlayers,
        transfers: localized.transfers.length > 0 ? localized.transfers : liveCache.transfers,
        news: localized.news.length > 0 ? localized.news : liveCache.news,
        debates: userStore.debates,
        comments: userStore.comments,
        predictions: userStore.predictions,
        alerts: userStore.alerts,
        lastSyncedAt: liveCache.lastSyncedAt,
      });
    }

    // POST /api/live/refresh
    if (method === 'POST' && apiPath === '/api/live/refresh') {
      const lang = parseLangParam(url.searchParams.get('lang'));
      await syncAllLiveData(lang, true);
      const localized = await getLocalizedNewsAndMercato(lang);

      return jsonResponse({
        matches: liveCache.matches,
        standings: liveCache.standings,
        nationalCupsStandings: liveCache.nationalCupsStandings,
        fifaRanking: liveCache.fifaRanking,
        topPlayers: liveCache.topPlayers,
        transfers: localized.transfers.length > 0 ? localized.transfers : liveCache.transfers,
        news: localized.news.length > 0 ? localized.news : liveCache.news,
        lastSyncedAt: liveCache.lastSyncedAt,
      });
    }

    // GET /api/matches/:id/details
    const matchDetailMatch = apiPath.match(/^\/api\/matches\/([^/]+)\/details$/);
    if (method === 'GET' && matchDetailMatch) {
      const matchId = decodeURIComponent(matchDetailMatch[1]).slice(0, 64);
      const existing = liveCache.matches.find((m) => m.id === matchId);
      const espnSlug =
        sanitizeText(url.searchParams.get('league'), 32) || existing?.espnLeagueSlug || 'eng.1';

      const cached = matchDetailCache.get(matchId);
      const ttl = existing?.status === 'live' ? 15000 : 300000;
      if (cached && Date.now() - cached.fetchedAt < ttl) {
        return jsonResponse({ match: cached.data });
      }

      const detailed = await fetchMatchDetails(matchId, espnSlug, existing);
      if (!detailed) {
        return jsonResponse({ error: 'Détails du match indisponibles.' }, 404);
      }

      matchDetailCache.set(matchId, { data: detailed, fetchedAt: Date.now() });
      return jsonResponse({ match: detailed });
    }

    // POST /api/live/trigger-goal
    if (method === 'POST' && apiPath === '/api/live/trigger-goal') {
      const testGoal = createTestGoalEvent(liveCache.matches);
      return jsonResponse({ goal: testGoal });
    }

    // GET /api/comments
    if (method === 'GET' && apiPath === '/api/comments') {
      const targetId = sanitizeText(url.searchParams.get('targetId'), 80);
      const list = targetId
        ? userStore.comments.filter((c) => c.targetId === targetId)
        : userStore.comments;
      return jsonResponse({ comments: list });
    }

    // POST /api/comments
    if (method === 'POST' && apiPath === '/api/comments') {
      const body = await readJsonBody(request);
      const targetType = body.targetType as SupporterComment['targetType'];
      if (!['match', 'article', 'transfer', 'debate'].includes(targetType)) {
        return jsonResponse({ error: 'Type de cible invalide.' }, 400);
      }
      const targetId = sanitizeText(body.targetId, 80);
      const author = sanitizeText(body.author, 40) || 'Supporter Anonyme';
      const clubSupport = sanitizeText(body.clubSupport, 40) || undefined;
      const content = sanitizeText(body.content, 600);

      if (!targetId || content.length < 2) {
        return jsonResponse({ error: 'Le commentaire doit contenir au moins 2 caractères.' }, 400);
      }

      const comment: SupporterComment = {
        id: `com-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        targetType,
        targetId,
        author,
        clubSupport,
        content,
        createdAt: new Date().toISOString(),
        likes: 0,
      };
      userStore.comments.unshift(comment);
      return jsonResponse({ comment }, 201);
    }

    // POST /api/comments/:id/like
    const commentLikeMatch = apiPath.match(/^\/api\/comments\/([^/]+)\/like$/);
    if (method === 'POST' && commentLikeMatch) {
      const id = decodeURIComponent(commentLikeMatch[1]);
      const comment = userStore.comments.find((c) => c.id === id);
      if (!comment) {
        return jsonResponse({ error: 'Commentaire introuvable.' }, 404);
      }
      comment.likes += 1;
      return jsonResponse({ comment });
    }

    // POST /api/debates
    if (method === 'POST' && apiPath === '/api/debates') {
      const body = await readJsonBody(request);
      const title = sanitizeText(body.title, 160);
      const description = sanitizeText(body.description, 500);
      const author = sanitizeText(body.author, 40) || 'Supporter';
      const competitionId = sanitizeText(body.competitionId, 32) || 'all';
      const rawOptions = Array.isArray(body.options) ? body.options : [];
      const options = rawOptions
        .map((opt: unknown, idx: number) => ({
          id: `opt-${Date.now()}-${idx}`,
          label: sanitizeText(opt, 90),
          votes: 0,
        }))
        .filter((o) => o.label.length > 0)
        .slice(0, 4);

      if (title.length < 5 || options.length < 2) {
        return jsonResponse(
          { error: 'Veuillez saisir une question (min 5 caractères) et au moins 2 choix.' },
          400,
        );
      }

      const debate: DebateTopic = {
        id: `deb-${Date.now()}`,
        title,
        description,
        competitionId: competitionId as DebateTopic['competitionId'],
        author,
        createdAt: new Date().toISOString(),
        options,
      };
      userStore.debates.unshift(debate);
      return jsonResponse({ debate }, 201);
    }

    // POST /api/debates/:id/vote
    const debateVoteMatch = apiPath.match(/^\/api\/debates\/([^/]+)\/vote$/);
    if (method === 'POST' && debateVoteMatch) {
      const id = decodeURIComponent(debateVoteMatch[1]);
      const debate = userStore.debates.find((d) => d.id === id);
      if (!debate) {
        return jsonResponse({ error: 'Débat introuvable.' }, 404);
      }
      const body = await readJsonBody(request);
      const optionId = sanitizeText(body.optionId, 64);
      const option = debate.options.find((o) => o.id === optionId);
      if (!option) {
        return jsonResponse({ error: 'Option invalide.' }, 400);
      }
      option.votes += 1;
      return jsonResponse({ debate });
    }

    // POST /api/predictions/:matchId
    const predMatch = apiPath.match(/^\/api\/predictions\/([^/]+)$/);
    if (method === 'POST' && predMatch) {
      const matchId = decodeURIComponent(predMatch[1]).slice(0, 64);
      const body = await readJsonBody(request);
      const choice = body.choice;
      if (choice !== 'home' && choice !== 'draw' && choice !== 'away') {
        return jsonResponse({ error: 'Choix de pronostic invalide.' }, 400);
      }
      let pred = userStore.predictions.find((p) => p.matchId === matchId);
      if (!pred) {
        pred = { matchId, homeVotes: 0, drawVotes: 0, awayVotes: 0 };
        userStore.predictions.push(pred);
      }
      if (choice === 'home') pred.homeVotes += 1;
      if (choice === 'draw') pred.drawVotes += 1;
      if (choice === 'away') pred.awayVotes += 1;
      return jsonResponse({ prediction: pred });
    }

    // POST /api/alerts
    if (method === 'POST' && apiPath === '/api/alerts') {
      const body = await readJsonBody(request);
      const type = body.type === 'competition' ? 'competition' : 'team';
      const target = sanitizeText(body.target, 80);
      const label = sanitizeText(body.label, 80) || target;
      if (!target) {
        return jsonResponse({ error: 'Équipe ou compétition requise.' }, 400);
      }
      const existing = userStore.alerts.find(
        (a) => a.target.toLowerCase() === target.toLowerCase() && a.type === type,
      );
      if (existing) {
        existing.goalPush = Boolean(body.goalPush ?? existing.goalPush);
        existing.lineupAlert = Boolean(body.lineupAlert ?? existing.lineupAlert);
        existing.mercatoAlert = Boolean(body.mercatoAlert ?? existing.mercatoAlert);
        return jsonResponse({ alert: existing, alerts: userStore.alerts });
      }
      const alert: UserAlertRule = {
        id: `al-${Date.now()}`,
        type,
        target,
        label,
        goalPush: Boolean(body.goalPush ?? true),
        lineupAlert: Boolean(body.lineupAlert ?? true),
        mercatoAlert: Boolean(body.mercatoAlert ?? false),
        createdAt: new Date().toISOString(),
      };
      userStore.alerts.unshift(alert);
      return jsonResponse({ alert, alerts: userStore.alerts }, 201);
    }

    // DELETE /api/alerts/:id
    const alertDelMatch = apiPath.match(/^\/api\/alerts\/([^/]+)$/);
    if (method === 'DELETE' && alertDelMatch) {
      const id = decodeURIComponent(alertDelMatch[1]);
      userStore.alerts = userStore.alerts.filter((a) => a.id !== id);
      return jsonResponse({ alerts: userStore.alerts });
    }

    // POST /api/contact
    if (method === 'POST' && apiPath === '/api/contact') {
      const body = await readJsonBody(request);
      const name = sanitizeText(body.name, 80);
      const email = sanitizeText(body.email, 120);
      const subject = sanitizeText(body.subject, 140);
      const message = sanitizeText(body.message, 2000);

      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (name.length < 2 || !emailValid || subject.length < 3 || message.length < 10) {
        return jsonResponse(
          {
            error:
              'Veuillez renseigner un nom, un email valide, un sujet et un message (min 10 caractères).',
          },
          400,
        );
      }

      const submission: ContactSubmission = {
        id: `msg-${Date.now().toString(36).toUpperCase()}`,
        name,
        email,
        subject,
        message,
        createdAt: new Date().toISOString(),
      };
      userStore.contacts.unshift(submission);

      return jsonResponse(
        {
          ok: true,
          reference: submission.id,
          message: 'Votre message a bien été transmis à la rédaction THE PITCH.',
        },
        201,
      );
    }

    return jsonResponse({ error: `Route API introuvable (${method} ${apiPath}).` }, 404);
  } catch (err) {
    console.error('Netlify API error:', err);
    return jsonResponse({ error: 'Erreur interne lors de la synchronisation live.' }, 500);
  }
}
