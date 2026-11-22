import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  EMPTY_FIFA_RANKING,
  EMPTY_NATIONAL_CUPS_STANDINGS,
  EMPTY_STANDINGS,
  INITIAL_COMMENTS,
  INITIAL_DEBATES,
  INITIAL_PREDICTIONS,
} from './src/data/footballData.ts';
import {
  createTestGoalEvent,
  detectLiveGoals,
  fetchAllLiveMatches,
  fetchAllStandings,
  fetchAllTopPlayers,
  fetchMatchDetails,
  fetchNationalCupsAndFifa,
  fetchRealNewsAndMercato,
  getLocalizedNewsAndMercato,
  getParisDayKey,
} from './src/services/liveFootballService.ts';
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
} from './src/types/football.ts';

function parseLangParam(raw: unknown): AppLanguage {
  if (raw === 'ar' || raw === 'en' || raw === 'fr') return raw;
  return 'fr';
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface UserStoreData {
  debates: DebateTopic[];
  comments: SupporterComment[];
  predictions: PredictionVoteCounts[];
  alerts: UserAlertRule[];
  contacts: ContactSubmission[];
}

interface LiveCache {
  matches: FootballMatch[];
  standings: Record<Exclude<CompetitionId, 'all'>, StandingRow[]>;
  nationalCupsStandings: NationalCupStandingsMap;
  fifaRanking: FifaRankingData;
  topPlayers: TopPlayerStat[];
  news: NewsArticle[];
  transfers: TransferItem[];
  lastSyncedAt: string;
}

const DATA_DIR = path.join(__dirname, 'data');
const STORE_PATH = path.join(DATA_DIR, 'pitch-user-store.json');

function loadUserStore(): UserStoreData {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (fs.existsSync(STORE_PATH)) {
    try {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<UserStoreData>;
      return {
        debates: parsed.debates && parsed.debates.length > 0 ? parsed.debates : INITIAL_DEBATES,
        comments: parsed.comments && parsed.comments.length > 0 ? parsed.comments : INITIAL_COMMENTS,
        predictions: parsed.predictions ?? INITIAL_PREDICTIONS,
        alerts: parsed.alerts ?? [
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
        contacts: parsed.contacts ?? [],
      };
    } catch {
      // Fallback if malformed
    }
  }
  const initial: UserStoreData = {
    debates: INITIAL_DEBATES,
    comments: INITIAL_COMMENTS,
    predictions: INITIAL_PREDICTIONS,
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
  saveUserStore(initial);
  return initial;
}

function saveUserStore(data: UserStoreData): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

const userStore = loadUserStore();

const liveCache: LiveCache = {
  matches: [],
  standings: EMPTY_STANDINGS,
  nationalCupsStandings: EMPTY_NATIONAL_CUPS_STANDINGS,
  fifaRanking: EMPTY_FIFA_RANKING,
  topPlayers: [],
  news: [],
  transfers: [],
  lastSyncedAt: '',
};

const matchDetailCache = new Map<string, { data: FootballMatch; fetchedAt: number }>();

const sseClients = new Set<Response>();

function broadcastSse(event: string, payload: unknown): void {
  const message = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const client of sseClients) {
    client.write(message);
  }
}

let isRefreshingMatches = false;
async function refreshMatches(includeHistory = true): Promise<void> {
  if (isRefreshingMatches) return;
  isRefreshingMatches = true;
  try {
    const nextMatches = await fetchAllLiveMatches(includeHistory);
    if (nextMatches.length > 0) {
      if (liveCache.matches.length > 0) {
        const goals = detectLiveGoals(liveCache.matches, nextMatches);
        for (const goal of goals) {
          const updatedMatch = nextMatches.find((m) => m.id === goal.matchId);
          broadcastSse('goal', { goal, match: updatedMatch });
        }
      }

      if (includeHistory) {
        liveCache.matches = nextMatches;
      } else {
        // Merge live/today updates into existing schedule + history
        const merged = new Map(liveCache.matches.map((m) => [m.id, m]));
        for (const m of nextMatches) {
          merged.set(m.id, m);
        }
        const orderWeight = { live: 0, upcoming: 1, finished: 2 };
        liveCache.matches = Array.from(merged.values()).sort((a, b) => {
          const wDiff = orderWeight[a.status] - orderWeight[b.status];
          if (wDiff !== 0) return wDiff;
          const tA = new Date(a.date).getTime();
          const tB = new Date(b.date).getTime();
          return a.status === 'finished' ? tB - tA : tA - tB;
        });
      }
      liveCache.lastSyncedAt = new Date().toISOString();
      broadcastSse('sync', {
        matches: liveCache.matches,
        lastSyncedAt: liveCache.lastSyncedAt,
      });
    }
  } catch (err) {
    console.error('Error refreshing live matches:', err);
  } finally {
    isRefreshingMatches = false;
  }
}

let isRefreshingTablesAndNews = false;
async function refreshTablesAndNews(): Promise<void> {
  if (isRefreshingTablesAndNews) return;
  isRefreshingTablesAndNews = true;
  try {
    const [standings, topPlayers, newsAndTransfers] = await Promise.all([
      fetchAllStandings(),
      fetchAllTopPlayers(),
      fetchRealNewsAndMercato(),
    ]);
    const cupsAndFifa = await fetchNationalCupsAndFifa();
    liveCache.standings = standings;
    if (Object.keys(cupsAndFifa.nationalCupsStandings).length > 0) {
      liveCache.nationalCupsStandings = cupsAndFifa.nationalCupsStandings;
    }
    if (cupsAndFifa.fifaRanking.entries.length > 0) {
      liveCache.fifaRanking = cupsAndFifa.fifaRanking;
    }
    liveCache.topPlayers = topPlayers;
    liveCache.news = newsAndTransfers.news;
    liveCache.transfers = newsAndTransfers.transfers;
    liveCache.lastSyncedAt = new Date().toISOString();
    broadcastSse('full_sync', {
      standings: liveCache.standings,
      nationalCupsStandings: liveCache.nationalCupsStandings,
      fifaRanking: liveCache.fifaRanking,
      topPlayers: liveCache.topPlayers,
      news: liveCache.news,
      transfers: liveCache.transfers,
      lastSyncedAt: liveCache.lastSyncedAt,
    });
  } catch (err) {
    console.error('Error refreshing standings/news:', err);
  } finally {
    isRefreshingTablesAndNews = false;
  }
}

function sanitizeText(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

async function createApp() {
  const app = express();
  app.use(express.json({ limit: '256kb' }));

  let currentDayKey = getParisDayKey();

  // Warm up tables/cups/news & today's live matches sequentially across 2 fast waves, then hydrate full history
  const initialWarmup = refreshTablesAndNews()
    .then(() => refreshMatches(false))
    .then(() => {
      void refreshMatches(true);
    });

  // Poll live scores every 25 seconds & auto-rollover when a new day starts in Paris
  setInterval(() => {
    const nextDayKey = getParisDayKey();
    if (nextDayKey !== currentDayKey) {
      currentDayKey = nextDayKey;
      matchDetailCache.clear();
      void refreshMatches(true);
      void refreshTablesAndNews();
    } else {
      void refreshMatches(false);
    }
  }, 25000);

  // Refresh full history, standings, top scorers, news & mercato every 2 minutes
  setInterval(() => {
    void refreshMatches(true);
    void refreshTablesAndNews();
  }, 120000);

  // SSE stream for real-time match updates & goal push notifications
  app.get('/api/events/stream', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    res.write(`event: connected\ndata: ${JSON.stringify({ ok: true, lastSyncedAt: liveCache.lastSyncedAt })}\n\n`);
    sseClients.add(res);

    const heartbeat = setInterval(() => {
      res.write(': heartbeat\n\n');
    }, 25000);

    req.on('close', () => {
      clearInterval(heartbeat);
      sseClients.delete(res);
    });
  });

  // Bootstrap endpoint returning live & recent real data + user persistence
  app.get('/api/bootstrap', async (req: Request, res: Response) => {
    const lang = parseLangParam(req.query.lang);
    await initialWarmup;
    if (liveCache.matches.length === 0) {
      await refreshMatches(true);
    }
    if (liveCache.news.length === 0 || liveCache.standings['ligue-1'].length === 0) {
      await refreshTablesAndNews();
    }
    const localized =
      lang === 'fr'
        ? { news: liveCache.news, transfers: liveCache.transfers }
        : await getLocalizedNewsAndMercato(lang);

    res.json({
      matches: liveCache.matches,
      standings: liveCache.standings,
      nationalCupsStandings: liveCache.nationalCupsStandings,
      fifaRanking: liveCache.fifaRanking,
      topPlayers: liveCache.topPlayers,
      transfers: localized.transfers,
      news: localized.news,
      debates: userStore.debates,
      comments: userStore.comments,
      predictions: userStore.predictions,
      alerts: userStore.alerts,
      lastSyncedAt: liveCache.lastSyncedAt,
    });
  });

  // Manual force refresh endpoint
  app.post('/api/live/refresh', async (req: Request, res: Response) => {
    const lang = parseLangParam(req.query.lang);
    await Promise.all([refreshMatches(true), refreshTablesAndNews()]);
    const localized =
      lang === 'fr'
        ? { news: liveCache.news, transfers: liveCache.transfers }
        : await getLocalizedNewsAndMercato(lang);

    res.json({
      matches: liveCache.matches,
      standings: liveCache.standings,
      nationalCupsStandings: liveCache.nationalCupsStandings,
      fifaRanking: liveCache.fifaRanking,
      topPlayers: liveCache.topPlayers,
      transfers: localized.transfers,
      news: localized.news,
      lastSyncedAt: liveCache.lastSyncedAt,
    });
  });

  // Detailed boxscore + timeline for any match (real-time ESPN summary)
  app.get('/api/matches/:id/details', async (req: Request, res: Response) => {
    const matchId = sanitizeText(req.params.id, 64);
    const existing = liveCache.matches.find((m) => m.id === matchId);
    const espnSlug =
      sanitizeText(req.query.league, 32) || existing?.espnLeagueSlug || 'eng.1';

    const cached = matchDetailCache.get(matchId);
    const ttl = existing?.status === 'live' ? 15000 : 300000;
    if (cached && Date.now() - cached.fetchedAt < ttl) {
      res.json({ match: cached.data });
      return;
    }

    const detailed = await fetchMatchDetails(matchId, espnSlug, existing);
    if (!detailed) {
      res.status(404).json({ error: 'Détails du match indisponibles.' });
      return;
    }

    matchDetailCache.set(matchId, { data: detailed, fetchedAt: Date.now() });
    res.json({ match: detailed });
  });

  // Test notification endpoint (does NOT corrupt official live scores)
  app.post('/api/live/trigger-goal', (_req: Request, res: Response) => {
    const testGoal = createTestGoalEvent(liveCache.matches);
    broadcastSse('goal', { goal: testGoal, match: null });
    res.json({ goal: testGoal });
  });

  // Comments endpoints
  app.get('/api/comments', (req: Request, res: Response) => {
    const targetId = sanitizeText(req.query.targetId, 80);
    const list = targetId
      ? userStore.comments.filter((c) => c.targetId === targetId)
      : userStore.comments;
    res.json({ comments: list });
  });

  app.post('/api/comments', (req: Request, res: Response) => {
    const targetType = req.body?.targetType;
    if (!['match', 'article', 'transfer', 'debate'].includes(targetType)) {
      res.status(400).json({ error: 'Type de cible invalide.' });
      return;
    }
    const targetId = sanitizeText(req.body?.targetId, 80);
    const author = sanitizeText(req.body?.author, 40) || 'Supporter Anonyme';
    const clubSupport = sanitizeText(req.body?.clubSupport, 40) || undefined;
    const content = sanitizeText(req.body?.content, 600);

    if (!targetId || content.length < 2) {
      res.status(400).json({ error: 'Le commentaire doit contenir au moins 2 caractères.' });
      return;
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
    saveUserStore(userStore);
    broadcastSse('comment', comment);
    res.status(201).json({ comment });
  });

  app.post('/api/comments/:id/like', (req: Request, res: Response) => {
    const comment = userStore.comments.find((c) => c.id === req.params.id);
    if (!comment) {
      res.status(404).json({ error: 'Commentaire introuvable.' });
      return;
    }
    comment.likes += 1;
    saveUserStore(userStore);
    res.json({ comment });
  });

  // Debates endpoints
  app.post('/api/debates', (req: Request, res: Response) => {
    const title = sanitizeText(req.body?.title, 160);
    const description = sanitizeText(req.body?.description, 500);
    const author = sanitizeText(req.body?.author, 40) || 'Supporter';
    const competitionId = sanitizeText(req.body?.competitionId, 32) || 'all';
    const rawOptions = Array.isArray(req.body?.options) ? req.body.options : [];
    const options = rawOptions
      .map((opt: unknown, idx: number) => ({
        id: `opt-${Date.now()}-${idx}`,
        label: sanitizeText(opt, 90),
        votes: 0,
      }))
      .filter((o: { label: string }) => o.label.length > 0)
      .slice(0, 4);

    if (title.length < 5 || options.length < 2) {
      res.status(400).json({
        error: 'Veuillez saisir une question (min 5 caractères) et au moins 2 choix de réponse.',
      });
      return;
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
    saveUserStore(userStore);
    res.status(201).json({ debate });
  });

  app.post('/api/debates/:id/vote', (req: Request, res: Response) => {
    const debate = userStore.debates.find((d) => d.id === req.params.id);
    if (!debate) {
      res.status(404).json({ error: 'Débat introuvable.' });
      return;
    }
    const optionId = sanitizeText(req.body?.optionId, 64);
    const option = debate.options.find((o) => o.id === optionId);
    if (!option) {
      res.status(400).json({ error: 'Option invalide.' });
      return;
    }
    option.votes += 1;
    saveUserStore(userStore);
    res.json({ debate });
  });

  // Predictions endpoint (1 / N / 2)
  app.post('/api/predictions/:matchId', (req: Request, res: Response) => {
    const matchId = sanitizeText(req.params.matchId, 64);
    const choice = req.body?.choice;
    if (!['home', 'draw', 'away'].includes(choice)) {
      res.status(400).json({ error: 'Choix de pronostic invalide.' });
      return;
    }

    let pred = userStore.predictions.find((p) => p.matchId === matchId);
    if (!pred) {
      pred = { matchId, homeVotes: 0, drawVotes: 0, awayVotes: 0 };
      userStore.predictions.push(pred);
    }

    if (choice === 'home') pred.homeVotes += 1;
    if (choice === 'draw') pred.drawVotes += 1;
    if (choice === 'away') pred.awayVotes += 1;

    saveUserStore(userStore);
    res.json({ prediction: pred });
  });

  // Personalized User Alerts endpoints
  app.post('/api/alerts', (req: Request, res: Response) => {
    const type = req.body?.type === 'competition' ? 'competition' : 'team';
    const target = sanitizeText(req.body?.target, 80);
    const label = sanitizeText(req.body?.label, 80) || target;
    if (!target) {
      res.status(400).json({ error: 'Équipe ou compétition requise.' });
      return;
    }
    const existing = userStore.alerts.find(
      (a) => a.target.toLowerCase() === target.toLowerCase() && a.type === type,
    );
    if (existing) {
      existing.goalPush = Boolean(req.body?.goalPush ?? existing.goalPush);
      existing.lineupAlert = Boolean(req.body?.lineupAlert ?? existing.lineupAlert);
      existing.mercatoAlert = Boolean(req.body?.mercatoAlert ?? existing.mercatoAlert);
      saveUserStore(userStore);
      res.json({ alert: existing, alerts: userStore.alerts });
      return;
    }

    const alert: UserAlertRule = {
      id: `al-${Date.now()}`,
      type,
      target,
      label,
      goalPush: Boolean(req.body?.goalPush ?? true),
      lineupAlert: Boolean(req.body?.lineupAlert ?? true),
      mercatoAlert: Boolean(req.body?.mercatoAlert ?? false),
      createdAt: new Date().toISOString(),
    };
    userStore.alerts.unshift(alert);
    saveUserStore(userStore);
    res.status(201).json({ alert, alerts: userStore.alerts });
  });

  app.delete('/api/alerts/:id', (req: Request, res: Response) => {
    userStore.alerts = userStore.alerts.filter((a) => a.id !== req.params.id);
    saveUserStore(userStore);
    res.json({ alerts: userStore.alerts });
  });

  // Contact email endpoint
  app.post('/api/contact', (req: Request, res: Response) => {
    const name = sanitizeText(req.body?.name, 80);
    const email = sanitizeText(req.body?.email, 120);
    const subject = sanitizeText(req.body?.subject, 140);
    const message = sanitizeText(req.body?.message, 2000);

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (name.length < 2 || !emailValid || subject.length < 3 || message.length < 10) {
      res.status(400).json({
        error: 'Veuillez renseigner un nom, un email valide, un sujet et un message (min 10 caractères).',
      });
      return;
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
    saveUserStore(userStore);

    res.status(201).json({
      ok: true,
      reference: submission.id,
      message: 'Votre message a bien été transmis à la rédaction THE PITCH.',
    });
  });

  // Serve frontend via Vite middleware (dev) or dist/ (prod)
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`THE PITCH server running on http://0.0.0.0:${PORT} (${liveCache.matches.length} real matches loaded)`);
  });
}

createApp();
