import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUpRight,
  Bell,
  ChevronRight,
  History,
  Mail,
  Moon,
  RefreshCw,
  Star,
  Sun,
  X,
} from 'lucide-react';
import { ArticleReaderDrawer } from './components/ArticleReaderDrawer';
import { AlertsPushDrawer } from './components/AlertsPushDrawer';
import { ContactSection } from './components/ContactSection';
import { DebatesPredictionsView } from './components/DebatesPredictionsView';
import { MatchDetailDrawer } from './components/MatchDetailDrawer';
import { MatchesCenterView } from './components/MatchesCenterView';
import { MercatoView } from './components/MercatoView';
import { StandingsView } from './components/StandingsView';
import { TeamLogo } from './components/TeamLogo';
import { UserProfileDrawer } from './components/UserProfileDrawer';
import { useLanguage } from './i18n/LanguageContext';
import {
  getLocalizedCompetitionLabel,
  getLocalizedCompetitionMeta,
  getLocalizedDebateContent,
  getLocalizedStatusDetail,
} from './i18n/translations';
import {
  EMPTY_STANDINGS,
  INITIAL_COMMENTS,
  INITIAL_DEBATES,
  INITIAL_PREDICTIONS,
} from './data/footballData';
import {
  AppLanguage,
  CompetitionId,
  DebateTopic,
  FavoriteFilterMode,
  FootballMatch,
  GoalNotificationEvent,
  NewsArticle,
  PredictionVoteCounts,
  StandingRow,
  SupporterComment,
  TopPlayerStat,
  TransferItem,
  UserAlertRule,
  UserProfilePreferences,
} from './types/football';
import {
  articleInvolvesFavorite,
  collectAvailableClubs,
  isClubNameMatch,
  loadUserProfile,
  matchInvolvesFavorite,
  prioritizeAndFilterMatches,
  prioritizeAndFilterNews,
  prioritizeAndFilterTransfers,
  saveUserProfile,
} from './utils/favoriteClubs';
import {
  detectLiveGoalsClient,
  fetchClientFallbackBootstrap,
} from './services/clientFallbackService';

async function fetchApiJson<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, init);
    if (!res.ok) return null;
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

type ActiveSection = 'news' | 'matches' | 'standings' | 'mercato' | 'debates';

function playGoalChime(): void {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(660, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(990, ctx.currentTime + 0.14);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.36);
  } catch {
    // Ignore audio context restriction
  }
}

export default function App() {
  const { lang, setLang, t, locale, isRtl } = useLanguage();

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('thepitch_theme');
    return saved ? saved === 'dark' : true;
  });

  const [activeSection, setActiveSection] = useState<ActiveSection>('news');
  const [matchesSubTab, setMatchesSubTab] = useState<'live-upcoming' | 'history'>('live-upcoming');
  const [selectedCompetition, setSelectedCompetition] = useState<CompetitionId>('all');

  const [loadingLive, setLoadingLive] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>('');

  const [matches, setMatches] = useState<FootballMatch[]>([]);
  const [standingsByComp, setStandingsByComp] =
    useState<Record<Exclude<CompetitionId, 'all'>, StandingRow[]>>(EMPTY_STANDINGS);
  const [topPlayers, setTopPlayers] = useState<TopPlayerStat[]>([]);
  const [transfers, setTransfers] = useState<TransferItem[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [debates, setDebates] = useState<DebateTopic[]>(INITIAL_DEBATES);
  const [comments, setComments] = useState<SupporterComment[]>(INITIAL_COMMENTS);
  const [predictions, setPredictions] = useState<PredictionVoteCounts[]>(INITIAL_PREDICTIONS);
  const [alerts, setAlerts] = useState<UserAlertRule[]>([]);

  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [alertsDrawerOpen, setAlertsDrawerOpen] = useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfilePreferences>(() => loadUserProfile());

  const [browserPushEnabled, setBrowserPushEnabled] = useState<boolean>(() => {
    return typeof Notification !== 'undefined' && Notification.permission === 'granted';
  });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [onlyFollowedAlerts, setOnlyFollowedAlerts] = useState(false);
  const [goalToasts, setGoalToasts] = useState<GoalNotificationEvent[]>([]);

  const [userDebateVotes, setUserDebateVotes] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem('thepitch_debate_votes') || '{}');
    } catch {
      return {};
    }
  });
  const [userPredictions, setUserPredictions] = useState<
    Record<string, 'home' | 'draw' | 'away'>
  >(() => {
    try {
      return JSON.parse(localStorage.getItem('thepitch_predictions') || '{}');
    } catch {
      return {};
    }
  });

  const alertsRef = useRef(alerts);
  alertsRef.current = alerts;
  const onlyFollowedRef = useRef(onlyFollowedAlerts);
  onlyFollowedRef.current = onlyFollowedAlerts;
  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;
  const browserPushRef = useRef(browserPushEnabled);
  browserPushRef.current = browserPushEnabled;
  const langRef = useRef(lang);
  langRef.current = lang;
  const tRef = useRef(t);
  tRef.current = t;
  const matchesRef = useRef(matches);
  matchesRef.current = matches;
  const hasLoadedOnceRef = useRef(false);

  const handleIncomingGoal = useCallback((goal: GoalNotificationEvent, updatedMatch: FootballMatch | null) => {
    if (updatedMatch) {
      setMatches((prev) => prev.map((m) => (m.id === updatedMatch.id ? updatedMatch : m)));
    }
    const activeAlerts = alertsRef.current;
    const shouldFilter = onlyFollowedRef.current;
    const matchesUserAlert =
      !shouldFilter ||
      goal.isTest ||
      activeAlerts.some(
        (a) =>
          a.goalPush &&
          (goal.homeTeam.toLowerCase().includes(a.target.toLowerCase()) ||
            goal.awayTeam.toLowerCase().includes(a.target.toLowerCase()) ||
            goal.scoringTeam.toLowerCase().includes(a.target.toLowerCase()) ||
            goal.competitionName.toLowerCase().includes(a.target.toLowerCase())),
      );

    if (matchesUserAlert) {
      setGoalToasts((prev) => [goal, ...prev].slice(0, 3));
      if (soundEnabledRef.current) {
        playGoalChime();
      }
      if (
        browserPushRef.current &&
        typeof Notification !== 'undefined' &&
        Notification.permission === 'granted'
      ) {
        new Notification(tRef.current.toasts.pushGoalTitle(goal.scoringTeam, goal.minute), {
          body: `${goal.scorer} — ${goal.homeTeam} ${goal.homeScore} - ${goal.awayScore} ${goal.awayTeam}`,
        });
      }
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('thepitch_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Initial load & language-aware refresh of real live football data (backend API with direct CORS fallback)
  useEffect(() => {
    let active = true;
    if (!hasLoadedOnceRef.current) {
      setLoadingLive(true);
    }

    const loadBootstrap = async () => {
      try {
        const apiData = await fetchApiJson<{
          matches?: FootballMatch[];
          standings?: Record<Exclude<CompetitionId, 'all'>, StandingRow[]>;
          topPlayers?: TopPlayerStat[];
          transfers?: TransferItem[];
          news?: NewsArticle[];
          debates?: DebateTopic[];
          comments?: SupporterComment[];
          predictions?: PredictionVoteCounts[];
          alerts?: UserAlertRule[];
          lastSyncedAt?: string;
        }>(`/api/bootstrap?lang=${lang}`);

        const hasApiContent =
          apiData &&
          ((Array.isArray(apiData.matches) && apiData.matches.length > 0) ||
            (Array.isArray(apiData.news) && apiData.news.length > 0));

        if (active && hasApiContent && apiData) {
          hasLoadedOnceRef.current = true;
          if (apiData.matches) setMatches(apiData.matches);
          if (apiData.standings) setStandingsByComp(apiData.standings);
          if (apiData.topPlayers) setTopPlayers(apiData.topPlayers);
          if (apiData.transfers) setTransfers(apiData.transfers);
          if (apiData.news) setNews(apiData.news);
          if (apiData.debates) setDebates(apiData.debates);
          if (apiData.comments) setComments(apiData.comments);
          if (apiData.predictions) setPredictions(apiData.predictions);
          if (apiData.alerts) setAlerts(apiData.alerts);
          if (apiData.lastSyncedAt) setLastSyncedAt(apiData.lastSyncedAt);
          return;
        }

        const fallback = await fetchClientFallbackBootstrap(lang);
        if (!active) return;
        hasLoadedOnceRef.current = true;
        if (fallback.matches.length > 0) setMatches(fallback.matches);
        setStandingsByComp(fallback.standings);
        if (fallback.topPlayers.length > 0) setTopPlayers(fallback.topPlayers);
        if (fallback.transfers.length > 0) setTransfers(fallback.transfers);
        if (fallback.news.length > 0) setNews(fallback.news);
        setLastSyncedAt(fallback.lastSyncedAt);
      } catch {
        // Keep current state gracefully
      } finally {
        if (active) setLoadingLive(false);
      }
    };

    void loadBootstrap();
    return () => {
      active = false;
    };
  }, [lang]);

  // Real-time SSE stream for Express/Node, with automatic 35s polling failover on Netlify serverless/static
  useEffect(() => {
    let pollTimer: number | null = null;
    let sseOpened = false;
    let closed = false;

    const startPollingFallback = () => {
      if (closed || pollTimer !== null) return;
      pollTimer = window.setInterval(async () => {
        const apiData = await fetchApiJson<{
          matches?: FootballMatch[];
          standings?: Record<Exclude<CompetitionId, 'all'>, StandingRow[]>;
          topPlayers?: TopPlayerStat[];
          transfers?: TransferItem[];
          news?: NewsArticle[];
          lastSyncedAt?: string;
        }>(`/api/bootstrap?lang=${langRef.current}`);

        const nextData =
          apiData && Array.isArray(apiData.matches) && apiData.matches.length > 0
            ? apiData
            : await fetchClientFallbackBootstrap(langRef.current).catch(() => null);

        if (!nextData || closed) return;
        if (Array.isArray(nextData.matches) && nextData.matches.length > 0) {
          if (matchesRef.current.length > 0) {
            const goals = detectLiveGoalsClient(matchesRef.current, nextData.matches);
            for (const goal of goals) {
              const updatedMatch = nextData.matches.find((m) => m.id === goal.matchId) ?? null;
              handleIncomingGoal(goal, updatedMatch);
            }
          }
          setMatches(nextData.matches);
        }
        if (nextData.standings) setStandingsByComp(nextData.standings);
        if (nextData.topPlayers && nextData.topPlayers.length > 0) setTopPlayers(nextData.topPlayers);
        if (nextData.news && nextData.news.length > 0) setNews(nextData.news);
        if (nextData.transfers && nextData.transfers.length > 0) setTransfers(nextData.transfers);
        if (nextData.lastSyncedAt) setLastSyncedAt(nextData.lastSyncedAt);
      }, 35000);
    };

    const es = new EventSource('/api/events/stream');

    es.addEventListener('connected', () => {
      sseOpened = true;
    });

    es.onopen = () => {
      sseOpened = true;
    };

    es.onerror = () => {
      if (!sseOpened) {
        es.close();
        startPollingFallback();
      }
    };

    const connectGuardTimer = window.setTimeout(() => {
      if (!sseOpened && es.readyState !== EventSource.OPEN) {
        es.close();
        startPollingFallback();
      }
    }, 4500);

    es.addEventListener('sync', (event) => {
      try {
        const payload = JSON.parse((event as MessageEvent).data) as {
          matches: FootballMatch[];
          lastSyncedAt?: string;
        };
        if (Array.isArray(payload.matches) && payload.matches.length > 0) {
          setMatches(payload.matches);
        }
        if (payload.lastSyncedAt) {
          setLastSyncedAt(payload.lastSyncedAt);
        }
      } catch {
        // Ignore malformed sync
      }
    });

    es.addEventListener('full_sync', (event) => {
      try {
        const payload = JSON.parse((event as MessageEvent).data) as {
          standings?: Record<Exclude<CompetitionId, 'all'>, StandingRow[]>;
          topPlayers?: TopPlayerStat[];
          news?: NewsArticle[];
          transfers?: TransferItem[];
          lastSyncedAt?: string;
        };
        if (payload.standings) setStandingsByComp(payload.standings);
        if (payload.topPlayers) setTopPlayers(payload.topPlayers);
        if (langRef.current === 'fr') {
          if (payload.news) setNews(payload.news);
          if (payload.transfers) setTransfers(payload.transfers);
        } else {
          void fetchApiJson<{ news?: NewsArticle[]; transfers?: TransferItem[] }>(
            `/api/bootstrap?lang=${langRef.current}`,
          ).then((data) => {
            if (!data) return;
            if (data.news) setNews(data.news);
            if (data.transfers) setTransfers(data.transfers);
          });
        }
        if (payload.lastSyncedAt) setLastSyncedAt(payload.lastSyncedAt);
      } catch {
        // Ignore malformed full_sync
      }
    });

    es.addEventListener('goal', (event) => {
      try {
        const payload = JSON.parse((event as MessageEvent).data) as {
          goal: GoalNotificationEvent;
          match: FootballMatch | null;
        };
        handleIncomingGoal(payload.goal, payload.match);
      } catch {
        // Ignore malformed goal event
      }
    });

    es.addEventListener('comment', (event) => {
      try {
        const incoming = JSON.parse((event as MessageEvent).data) as SupporterComment;
        setComments((prev) =>
          prev.some((c) => c.id === incoming.id) ? prev : [incoming, ...prev],
        );
      } catch {
        // Ignore malformed comment
      }
    });

    return () => {
      closed = true;
      window.clearTimeout(connectGuardTimer);
      if (pollTimer !== null) window.clearInterval(pollTimer);
      es.close();
    };
  }, [handleIncomingGoal]);

  useEffect(() => {
    if (goalToasts.length === 0) return;
    const timer = setTimeout(() => {
      setGoalToasts((prev) => prev.slice(0, -1));
    }, 8000);
    return () => clearTimeout(timer);
  }, [goalToasts]);

  const selectedMatch = useMemo(
    () => matches.find((m) => m.id === selectedMatchId) ?? null,
    [matches, selectedMatchId],
  );

  const availableClubs = useMemo(
    () => collectAvailableClubs(matches, standingsByComp),
    [matches, standingsByComp],
  );

  const { items: scopedMatches } = useMemo(
    () =>
      prioritizeAndFilterMatches(
        matches,
        userProfile.favoriteClubs,
        userProfile.favoriteFilterMode,
      ),
    [matches, userProfile.favoriteClubs, userProfile.favoriteFilterMode],
  );

  const { items: scopedNews, matchedCount: matchedNewsCount } = useMemo(
    () =>
      prioritizeAndFilterNews(
        news,
        userProfile.favoriteClubs,
        userProfile.favoriteFilterMode,
      ),
    [news, userProfile.favoriteClubs, userProfile.favoriteFilterMode],
  );

  const { items: scopedTransfers } = useMemo(
    () =>
      prioritizeAndFilterTransfers(
        transfers,
        userProfile.favoriteClubs,
        userProfile.favoriteFilterMode,
      ),
    [transfers, userProfile.favoriteClubs, userProfile.favoriteFilterMode],
  );

  const liveMatches = useMemo(
    () => scopedMatches.filter((m) => m.status === 'live'),
    [scopedMatches],
  );

  // Recent spotlight matches (live first, otherwise today's finished/upcoming matches)
  const spotlightMatches = useMemo(() => {
    if (liveMatches.length >= 4) return liveMatches.slice(0, 4);
    const nonLive = scopedMatches.filter((m) => m.status !== 'live');
    return [...liveMatches, ...nonLive].slice(0, 4);
  }, [liveMatches, scopedMatches]);

  // Snapshot standings league: default Ligue 1, or switch to the league of the user's first favorite club
  const snapshotCompId = useMemo<Exclude<CompetitionId, 'all'>>(() => {
    if (userProfile.favoriteClubs.length > 0) {
      const leagueOrder: Exclude<CompetitionId, 'all'>[] = [
        'ligue-1',
        'premier-league',
        'la-liga',
        'serie-a',
        'bundesliga',
        'algerian-ligue-1',
        'national-teams',
      ];
      for (const compId of leagueOrder) {
        const rows = standingsByComp[compId] ?? [];
        if (
          rows.some((r) =>
            userProfile.favoriteClubs.some((club) => isClubNameMatch(club, r.team)),
          )
        ) {
          return compId;
        }
      }
    }
    return 'ligue-1';
  }, [standingsByComp, userProfile.favoriteClubs]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await fetchApiJson<{
        matches?: FootballMatch[];
        standings?: Record<Exclude<CompetitionId, 'all'>, StandingRow[]>;
        topPlayers?: TopPlayerStat[];
        transfers?: TransferItem[];
        news?: NewsArticle[];
        lastSyncedAt?: string;
      }>(`/api/live/refresh?lang=${lang}`, { method: 'POST' });

      if (data && ((data.matches && data.matches.length > 0) || (data.news && data.news.length > 0))) {
        if (data.matches) setMatches(data.matches);
        if (data.standings) setStandingsByComp(data.standings);
        if (data.topPlayers) setTopPlayers(data.topPlayers);
        if (data.transfers) setTransfers(data.transfers);
        if (data.news) setNews(data.news);
        if (data.lastSyncedAt) setLastSyncedAt(data.lastSyncedAt);
        return;
      }

      const fallback = await fetchClientFallbackBootstrap(lang);
      if (fallback.matches.length > 0) setMatches(fallback.matches);
      setStandingsByComp(fallback.standings);
      if (fallback.topPlayers.length > 0) setTopPlayers(fallback.topPlayers);
      if (fallback.transfers.length > 0) setTransfers(fallback.transfers);
      if (fallback.news.length > 0) setNews(fallback.news);
      setLastSyncedAt(fallback.lastSyncedAt);
    } finally {
      setRefreshing(false);
    }
  };

  const handleToggleBrowserPush = async () => {
    if (typeof Notification === 'undefined') {
      setBrowserPushEnabled((prev) => !prev);
      return;
    }
    if (browserPushEnabled) {
      setBrowserPushEnabled(false);
      return;
    }
    if (Notification.permission === 'granted') {
      setBrowserPushEnabled(true);
      return;
    }
    const perm = await Notification.requestPermission();
    setBrowserPushEnabled(perm === 'granted');
  };

  const handleTriggerTestGoal = async (matchId?: string) => {
    const data = await fetchApiJson<{ goal?: GoalNotificationEvent }>('/api/live/trigger-goal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId }),
    });
    if (data?.goal) {
      handleIncomingGoal(data.goal, null);
      return;
    }
    const target = matchesRef.current.find((m) => m.status === 'live') ?? matchesRef.current[0];
    handleIncomingGoal(
      {
        id: `test-goal-${Date.now()}`,
        matchId: target?.id || 'test-match',
        competitionId: target?.competitionId || 'premier-league',
        competitionName: target?.competitionName || 'Multiplex Direct',
        scoringTeam: target?.homeTeam.name || 'THE PITCH Live',
        homeTeam: target?.homeTeam.shortName || 'DOM',
        awayTeam: target?.awayTeam.shortName || 'EXT',
        homeScore: (target?.homeTeam.score ?? 1) + 1,
        awayScore: target?.awayTeam.score ?? 0,
        scorer: 'Alerte Test En Direct',
        minute: target?.minute ?? 75,
        timestamp: new Date().toISOString(),
        isTest: true,
      },
      null,
    );
  };

  const handleAddComment = useCallback(
    async (payload: {
      targetType: SupporterComment['targetType'];
      targetId: string;
      author: string;
      clubSupport?: string;
      content: string;
    }) => {
      const data = await fetchApiJson<{ comment?: SupporterComment }>('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const comment: SupporterComment = data?.comment ?? {
        id: `com-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        targetType: payload.targetType,
        targetId: payload.targetId,
        author: payload.author.trim() || 'Supporter Anonyme',
        clubSupport: payload.clubSupport?.trim() || undefined,
        content: payload.content.trim(),
        createdAt: new Date().toISOString(),
        likes: 0,
      };
      setComments((prev) => (prev.some((c) => c.id === comment.id) ? prev : [comment, ...prev]));
    },
    [],
  );

  const handleLikeComment = useCallback(async (commentId: string) => {
    const data = await fetchApiJson<{ comment?: SupporterComment }>(
      `/api/comments/${encodeURIComponent(commentId)}/like`,
      { method: 'POST' },
    );
    if (data?.comment) {
      setComments((prev) => prev.map((c) => (c.id === commentId ? data.comment! : c)));
      return;
    }
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, likes: c.likes + 1 } : c)),
    );
  }, []);

  const handleCreateDebate = async (payload: {
    title: string;
    description: string;
    author: string;
    options: string[];
  }) => {
    const data = await fetchApiJson<{ debate?: DebateTopic }>('/api/debates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const debate: DebateTopic = data?.debate ?? {
      id: `deb-${Date.now()}`,
      title: payload.title.trim(),
      description: payload.description.trim(),
      competitionId: 'all',
      author: payload.author.trim() || 'Supporter',
      createdAt: new Date().toISOString(),
      options: payload.options
        .filter((o) => o.trim().length > 0)
        .slice(0, 4)
        .map((label, idx) => ({ id: `opt-${Date.now()}-${idx}`, label: label.trim(), votes: 0 })),
    };
    setDebates((prev) => [debate, ...prev]);
  };

  const handleVoteDebate = async (debateId: string, optionId: string) => {
    const data = await fetchApiJson<{ debate?: DebateTopic }>(
      `/api/debates/${encodeURIComponent(debateId)}/vote`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId }),
      },
    );
    if (data?.debate) {
      setDebates((prev) => prev.map((d) => (d.id === debateId ? data.debate! : d)));
    } else {
      setDebates((prev) =>
        prev.map((d) =>
          d.id === debateId
            ? {
                ...d,
                options: d.options.map((o) =>
                  o.id === optionId ? { ...o, votes: o.votes + 1 } : o,
                ),
              }
            : d,
        ),
      );
    }
    const nextVotes = { ...userDebateVotes, [debateId]: optionId };
    setUserDebateVotes(nextVotes);
    localStorage.setItem('thepitch_debate_votes', JSON.stringify(nextVotes));
  };

  const handleVotePrediction = async (
    matchId: string,
    choice: 'home' | 'draw' | 'away',
  ) => {
    const data = await fetchApiJson<{ prediction?: PredictionVoteCounts }>(
      `/api/predictions/${encodeURIComponent(matchId)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ choice }),
      },
    );
    if (data?.prediction) {
      setPredictions((prev) => {
        const exists = prev.some((p) => p.matchId === matchId);
        return exists
          ? prev.map((p) => (p.matchId === matchId ? data.prediction! : p))
          : [...prev, data.prediction!];
      });
    } else {
      setPredictions((prev) => {
        const existing = prev.find((p) => p.matchId === matchId) ?? {
          matchId,
          homeVotes: 0,
          drawVotes: 0,
          awayVotes: 0,
        };
        const updated: PredictionVoteCounts = {
          ...existing,
          homeVotes: existing.homeVotes + (choice === 'home' ? 1 : 0),
          drawVotes: existing.drawVotes + (choice === 'draw' ? 1 : 0),
          awayVotes: existing.awayVotes + (choice === 'away' ? 1 : 0),
        };
        return prev.some((p) => p.matchId === matchId)
          ? prev.map((p) => (p.matchId === matchId ? updated : p))
          : [...prev, updated];
      });
    }
    const nextPreds = { ...userPredictions, [matchId]: choice };
    setUserPredictions(nextPreds);
    localStorage.setItem('thepitch_predictions', JSON.stringify(nextPreds));
  };

  const handleAddAlert = async (payload: {
    type: 'team' | 'competition';
    target: string;
    label: string;
    goalPush: boolean;
    lineupAlert: boolean;
    mercatoAlert: boolean;
  }) => {
    const data = await fetchApiJson<{ alerts?: UserAlertRule[] }>('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (data?.alerts) {
      setAlerts(data.alerts);
      return;
    }
    setAlerts((prev) => {
      const idx = prev.findIndex(
        (a) => a.target.toLowerCase() === payload.target.toLowerCase() && a.type === payload.type,
      );
      if (idx >= 0) {
        return prev.map((a, i) => (i === idx ? { ...a, ...payload } : a));
      }
      return [
        {
          id: `al-${Date.now()}`,
          ...payload,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ];
    });
  };

  const handleDeleteAlert = async (id: string) => {
    const data = await fetchApiJson<{ alerts?: UserAlertRule[] }>(
      `/api/alerts/${encodeURIComponent(id)}`,
      { method: 'DELETE' },
    );
    if (data?.alerts) {
      setAlerts(data.alerts);
      return;
    }
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handleUpdateProfile = (next: UserProfilePreferences) => {
    setUserProfile(next);
    saveUserProfile(next);
  };

  const handleChangeFavoriteFilterMode = (mode: FavoriteFilterMode) => {
    const next = { ...userProfile, favoriteFilterMode: mode };
    setUserProfile(next);
    saveUserProfile(next);
  };

  const handleSyncClubsToAlerts = async (clubs: string[]) => {
    for (const club of clubs) {
      await handleAddAlert({
        type: 'team',
        target: club,
        label: club,
        goalPush: true,
        lineupAlert: true,
        mercatoAlert: true,
      });
    }
  };

  const navigateTo = (section: ActiveSection, subTab?: 'live-upcoming' | 'history') => {
    setActiveSection(section);
    if (subTab) setMatchesSubTab(subTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToContact = () => {
    const el = document.getElementById('contact-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const featuredArticle =
    userProfile.favoriteClubs.length > 0 && userProfile.favoriteFilterMode !== 'all'
      ? scopedNews[0]
      : (scopedNews.find((a) => a.featured) ?? scopedNews[0]);
  const secondaryArticles = scopedNews.filter((a) => a.id !== featuredArticle?.id).slice(0, 4);

  const formattedSyncTime = lastSyncedAt
    ? new Date(lastSyncedAt).toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '';

  const featuredDebate = debates[0] ? getLocalizedDebateContent(debates[0], lang) : null;

  const navItems: { id: ActiveSection; label: string }[] = [
    { id: 'news', label: t.nav.news },
    { id: 'matches', label: t.nav.matches },
    { id: 'standings', label: t.nav.standings },
    { id: 'mercato', label: t.nav.mercato },
    { id: 'debates', label: t.nav.debates },
  ];

  const langOptions: { id: AppLanguage; label: string }[] = [
    { id: 'fr', label: 'FR' },
    { id: 'ar', label: 'عربي' },
    { id: 'en', label: 'EN' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A] dark:bg-[#090C11] dark:text-[#F1F5F9]">
      {/* Real-Time Goal Push Toasts */}
      {goalToasts.length > 0 && (
        <div
          className="fixed bottom-5 end-5 z-50 flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2.5rem)]"
          aria-live="polite"
        >
          {goalToasts.map((toast) => (
            <div
              key={toast.id}
              className="rounded-xl border border-emerald-500/40 bg-[#0F172A] text-white p-4 shadow-2xl flex items-start justify-between gap-3"
            >
              <div className="space-y-1 min-w-0">
                <p className="text-xs font-mono font-bold text-emerald-400">
                  {toast.isTest ? t.toasts.testAlert : t.toasts.liveGoal} ·{' '}
                  <span dir="ltr">{toast.minute}&apos;</span> · {toast.competitionName}
                </p>
                <p className="text-sm font-bold truncate">
                  {toast.scorer} ({toast.scoringTeam})
                </p>
                <p className="text-xs font-mono tabular-nums text-slate-300" dir="ltr">
                  {toast.homeTeam} {toast.homeScore} – {toast.awayScore} {toast.awayTeam}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setGoalToasts((prev) => prev.filter((g) => g.id !== toast.id))
                }
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
                aria-label={t.toasts.closeAria}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Top Navigation Bar — Strictly 3 Zones separated by gap-8 */}
      <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#090C11]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          <button
            type="button"
            onClick={() => navigateTo('news')}
            className="font-display-heading text-2xl font-bold tracking-tight uppercase text-slate-900 dark:text-white whitespace-nowrap shrink-0 cursor-pointer"
          >
            THE PITCH
          </button>

          <nav
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300"
            aria-label={t.nav.mainAria}
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => navigateTo(item.id)}
                className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeSection === item.id
                    ? 'border-emerald-500 text-slate-900 dark:text-white font-semibold'
                    : 'border-transparent hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setProfileDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/15 bg-white dark:bg-[#111620] hover:border-emerald-500/50 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              aria-label={t.header.profileAria}
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  userProfile.favoriteClubs.length > 0
                    ? 'text-emerald-500 fill-emerald-500'
                    : 'text-slate-400'
                }`}
                aria-hidden="true"
              />
              <span>
                {userProfile.favoriteClubs.length > 0
                  ? t.header.favCount(userProfile.favoriteClubs.length)
                  : t.header.favClub}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setAlertsDrawerOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">{t.header.goalAlerts}</span>
              <span className="sm:hidden">{t.header.alertsShort}</span>
            </button>
          </div>
        </div>

        <nav
          className="md:hidden flex items-center gap-1 overflow-x-auto px-4 pb-2.5 text-xs font-medium border-t border-slate-100 dark:border-white/5 pt-2"
          aria-label={t.nav.mobileAria}
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => navigateTo(item.id)}
              className={`px-3 py-1.5 rounded-md whitespace-nowrap shrink-0 cursor-pointer ${
                activeSection === item.id
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Workspace Utility Strip */}
      <div className="border-b border-slate-200 dark:border-white/8 bg-slate-50 dark:bg-[#0D1118]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-medium text-slate-800 dark:text-slate-200 capitalize">
              {new Date().toLocaleDateString(locale, {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                timeZone: 'Europe/Paris',
              })}
            </span>
            <span aria-hidden="true">·</span>
            <span>{t.utility.leaguesBanner}</span>
            {formattedSyncTime && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums inline-flex items-center gap-1.5">
                  <span>{t.utility.realtime}</span>
                  <span aria-hidden="true">·</span>
                  <span dir="ltr">{formattedSyncTime}</span>
                </span>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-500' : ''}`}
                aria-hidden="true"
              />
              <span>{refreshing ? t.utility.syncing : t.utility.refresh}</span>
            </button>
            <button
              type="button"
              onClick={() => navigateTo('matches', 'history')}
              className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <History className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t.utility.matchHistory}</span>
            </button>
            <button
              type="button"
              onClick={scrollToContact}
              className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t.utility.contact}</span>
            </button>
            <button
              type="button"
              onClick={() => setDarkMode((prev) => !prev)}
              className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              aria-label={darkMode ? t.utility.toLightAria : t.utility.toDarkAria}
            >
              {darkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                  <span>{t.utility.lightMode}</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-700" aria-hidden="true" />
                  <span>{t.utility.darkMode}</span>
                </>
              )}
            </button>

            <div
              className="flex items-center gap-0.5 p-0.5 rounded-lg bg-slate-200/70 dark:bg-[#090C11] border border-slate-200 dark:border-white/10 shrink-0"
              role="group"
              aria-label={t.langSwitcherLabel}
            >
              {langOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setLang(opt.id)}
                  aria-pressed={lang === opt.id}
                  className={`px-2 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    lang === opt.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        {userProfile.favoriteClubs.length > 0 && (
          <div className="border-t border-slate-200 dark:border-white/8 bg-white/60 dark:bg-[#111620]/70">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-2 text-slate-700 dark:text-slate-300">
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                  <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" aria-hidden="true" />
                  <span>{t.utility.myFavClubs}</span>
                </span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {userProfile.favoriteClubs.join(' · ')}
                </span>
                <button
                  type="button"
                  onClick={() => setProfileDrawerOpen(true)}
                  className="text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  {t.utility.edit}
                </button>
              </div>
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-[#0B0E14] border border-slate-200 dark:border-white/8">
                {[
                  { id: 'only' as const, label: t.utility.onlyMyClubs },
                  { id: 'prioritize' as const, label: t.utility.prioritize },
                  { id: 'all' as const, label: t.utility.all },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleChangeFavoriteFilterMode(opt.id)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap cursor-pointer ${
                      userProfile.favoriteFilterMode === opt.id
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-12">
        {activeSection === 'news' && (
          <div className="space-y-10">
            {/* Editorial Cover Banner ("Photo de couverture avec sous-titre") */}
            <section
              aria-label={t.cover.aria}
              className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-900 min-h-[280px] sm:min-h-[340px] lg:min-h-[380px] flex items-end"
            >
              <img
                src="/src/assets/images/cover_pitch_stadium_1795348262737.jpg"
                alt={t.cover.imageAlt}
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
              <div className="relative z-10 w-full p-6 sm:p-10 lg:p-12 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-3 max-w-2xl">
                  <p className="text-xs sm:text-sm font-medium text-emerald-400">
                    {t.cover.kicker}
                  </p>
                  <h1 className="font-display-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight uppercase text-white leading-none">
                    THE PITCH
                  </h1>
                  <p className="text-base sm:text-lg lg:text-xl font-medium text-slate-100 leading-relaxed">
                    {t.cover.subtitle}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => navigateTo('matches', 'live-upcoming')}
                    className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors whitespace-nowrap cursor-pointer"
                  >
                    {t.cover.ctaScores}
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfileDrawerOpen(true)}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/15 hover:bg-white/25 backdrop-blur-sm px-4 py-2.5 text-sm font-semibold text-white transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <Star className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                    <span>
                      {userProfile.favoriteClubs.length > 0
                        ? t.cover.ctaFavCount(userProfile.favoriteClubs.length)
                        : t.cover.ctaMyFav}
                    </span>
                  </button>
                </div>
              </div>
            </section>

            {/* Live & Today's Multiplex Scoreboard Strip */}
            <section aria-label={t.home.spotlightDefault}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                  {liveMatches.length > 0
                    ? t.home.spotlightLive(liveMatches.length)
                    : t.home.spotlightDefault}
                </h2>
                <button
                  type="button"
                  onClick={() => navigateTo('matches', 'live-upcoming')}
                  className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  <span>{t.home.allSchedule}</span>
                  <ChevronRight
                    className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  />
                </button>
              </div>

              {loadingLive && spotlightMatches.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map((n) => (
                    <div
                      key={n}
                      className="h-28 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111620] animate-pulse"
                    />
                  ))}
                </div>
              ) : spotlightMatches.length === 0 &&
                userProfile.favoriteClubs.length > 0 &&
                userProfile.favoriteFilterMode === 'only' ? (
                <div className="rounded-xl border border-dashed border-slate-200 dark:border-white/10 bg-white dark:bg-[#111620] p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-600 dark:text-slate-300">
                  <p>
                    {t.home.noFavMatchesToday(userProfile.favoriteClubs.join(', '))}
                  </p>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleChangeFavoriteFilterMode('prioritize')}
                      className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-white cursor-pointer"
                    >
                      {t.home.showAllMultiplex}
                    </button>
                    <button
                      type="button"
                      onClick={() => setProfileDrawerOpen(true)}
                      className="rounded-lg border border-slate-200 dark:border-white/15 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
                    >
                      {t.home.manageFavs}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {spotlightMatches.map((m) => {
                    const isFav = matchInvolvesFavorite(m, userProfile.favoriteClubs);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedMatchId(m.id)}
                        className={`text-start rounded-xl border bg-white dark:bg-[#111620] hover:border-emerald-500/50 transition-colors p-4 space-y-2.5 cursor-pointer ${
                          isFav
                            ? 'border-emerald-500/45 ring-1 ring-emerald-500/15'
                            : 'border-slate-200 dark:border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="truncate flex items-center gap-1">
                            {isFav && (
                              <Star
                                className="w-3 h-3 text-emerald-500 fill-emerald-500 shrink-0"
                                aria-label={t.matchesView.favClubAria}
                              />
                            )}
                            <span className="truncate">
                              {getLocalizedCompetitionLabel(m.competitionId, m.competitionName, lang)}
                            </span>
                          </span>
                          {m.status === 'live' ? (
                            <span className="inline-flex items-center gap-1.5 font-mono tabular-nums font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                              {t.home.liveBadge}{' '}
                              <span dir="ltr">
                                {getLocalizedStatusDetail(m.statusDetail, m.status, lang) ||
                                  `${m.minute ?? ''}'`}
                              </span>
                            </span>
                          ) : m.status === 'finished' ? (
                            <span className="font-mono tabular-nums shrink-0">
                              {t.home.finishedBadge}
                            </span>
                          ) : (
                            <span className="font-mono tabular-nums shrink-0" dir="ltr">
                              {m.kickoffTime}
                            </span>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                            <span className="inline-flex items-center gap-2 min-w-0">
                              <TeamLogo
                                name={m.homeTeam.name}
                                code={m.homeTeam.code}
                                logo={m.homeTeam.logo}
                                accentColor={m.homeTeam.accentColor}
                                size="xs"
                              />
                              <span className="truncate">{m.homeTeam.shortName}</span>
                            </span>
                            <span className="font-mono tabular-nums font-bold shrink-0">
                              {m.status === 'upcoming' ? '–' : m.homeTeam.score}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                            <span className="inline-flex items-center gap-2 min-w-0">
                              <TeamLogo
                                name={m.awayTeam.name}
                                code={m.awayTeam.code}
                                logo={m.awayTeam.logo}
                                accentColor={m.awayTeam.accentColor}
                                size="xs"
                              />
                              <span className="truncate">{m.awayTeam.shortName}</span>
                            </span>
                            <span className="font-mono tabular-nums font-bold shrink-0">
                              {m.status === 'upcoming' ? '–' : m.awayTeam.score}
                            </span>
                          </div>
                        </div>
                        <p className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-white/5 truncate">
                          {m.status === 'upcoming'
                            ? m.stadium
                            : t.home.possSeeStats(m.stats.possession[0], m.stats.possession[1])}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Front-Page Lead Editorial Story */}
            {featuredArticle ? (
              <section
                aria-label={t.nav.news}
                className="space-y-3"
              >
                {userProfile.favoriteClubs.length > 0 &&
                  userProfile.favoriteFilterMode !== 'all' &&
                  matchedNewsCount > 0 && (
                    <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      {t.home.favNewsCount(matchedNewsCount)}
                    </p>
                  )}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  <button
                    type="button"
                    onClick={() => setSelectedArticle(featuredArticle)}
                    className="lg:col-span-7 text-start group rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111620] overflow-hidden flex flex-col cursor-pointer"
                  >
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900 flex-1">
                      <img
                        src={featuredArticle.imageUrl}
                        alt={featuredArticle.title}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const fallback =
                            featuredArticle.fallbackImageUrl ||
                            '/src/assets/images/editorial_match_action_1795348261245.jpg';
                          if (
                            e.currentTarget.src !== fallback &&
                            !e.currentTarget.src.endsWith(fallback)
                          ) {
                            e.currentTarget.src = fallback;
                          }
                        }}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                      <div className="absolute bottom-0 start-0 end-0 p-6 sm:p-8 space-y-2">
                        <p className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                          {articleInvolvesFavorite(featuredArticle, userProfile.favoriteClubs) && (
                            <Star className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400 shrink-0" aria-hidden="true" />
                          )}
                          <span>
                            {featuredArticle.category} · {featuredArticle.publishedAt}
                          </span>
                        </p>
                        <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                          {featuredArticle.title}
                        </h2>
                        <p className="text-sm sm:text-base text-slate-200 max-w-2xl line-clamp-2">
                          {featuredArticle.subtitle}
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Right Editorial Column: Real-Time News Feed */}
                  <div className="lg:col-span-5 flex flex-col justify-between gap-3">
                    {secondaryArticles.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-slate-200 dark:border-white/10 bg-white dark:bg-[#111620] p-6 flex-1 flex flex-col items-center justify-center text-center gap-3">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {t.home.onlyFavNewsDisplayed}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleChangeFavoriteFilterMode('prioritize')}
                          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                        >
                          {t.home.showRestEuroNews}
                        </button>
                      </div>
                    ) : (
                      secondaryArticles.map((art) => {
                        const isArtFav = articleInvolvesFavorite(art, userProfile.favoriteClubs);
                        return (
                          <button
                            key={art.id}
                            type="button"
                            onClick={() => setSelectedArticle(art)}
                            className={`text-start flex-1 rounded-xl border bg-white dark:bg-[#111620] hover:border-emerald-500/40 transition-colors p-4 flex gap-4 items-center cursor-pointer ${
                              isArtFav
                                ? 'border-emerald-500/40'
                                : 'border-slate-200 dark:border-white/10'
                            }`}
                          >
                            <div className="w-24 h-20 rounded-lg overflow-hidden bg-slate-900 shrink-0">
                              <img
                                src={art.imageUrl}
                                alt={art.title}
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  const fallback =
                                    art.fallbackImageUrl ||
                                    '/src/assets/images/news_match_duel_1795287057563.jpg';
                                  if (
                                    e.currentTarget.src !== fallback &&
                                    !e.currentTarget.src.endsWith(fallback)
                                  ) {
                                    e.currentTarget.src = fallback;
                                  }
                                }}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0 space-y-1">
                              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium truncate flex items-center gap-1">
                                {isArtFav && (
                                  <Star className="w-3 h-3 fill-emerald-500 text-emerald-500 shrink-0" aria-hidden="true" />
                                )}
                                <span className="truncate">
                                  {art.category} · {art.publishedAt}
                                </span>
                              </p>
                              <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                                {art.title}
                              </h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                {art.author}
                              </p>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </section>
            ) : (
              !loadingLive &&
              userProfile.favoriteClubs.length > 0 &&
              userProfile.favoriteFilterMode === 'only' && (
                <section className="rounded-xl border border-dashed border-slate-200 dark:border-white/10 bg-white dark:bg-[#111620] p-8 text-center space-y-3">
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    {t.home.noFavNewsToday(userProfile.favoriteClubs.join(', '))}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleChangeFavoriteFilterMode('prioritize')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-semibold text-white cursor-pointer"
                  >
                    {t.home.showAllNewsToday}
                  </button>
                </section>
              )
            )}

            {/* Quick Snapshot: Live Standings + Real-Time Mercato + Debate */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Mini Standings Snapshot */}
              <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111620] overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-white/10">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {getLocalizedCompetitionMeta(snapshotCompId, lang).shortName}{' '}
                    {t.home.top5LiveSuffix}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCompetition(snapshotCompId);
                      navigateTo('standings');
                    }}
                    className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    <span>{t.home.allStandings}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
                <table className="w-full text-start border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/10 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#0B0E14]">
                      <th className="py-2.5 ps-5 pe-2 text-start">#</th>
                      <th className="py-2.5 px-2 text-start">{t.home.colClub}</th>
                      <th className="py-2.5 px-2 text-end">{t.home.colPlayed}</th>
                      <th className="py-2.5 px-2 text-end">{t.home.colDiff}</th>
                      <th className="py-2.5 ps-2 pe-5 text-end">{t.home.colPts}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-white/8">
                    {(standingsByComp[snapshotCompId] ?? []).slice(0, 5).map((row) => {
                      const isFav = userProfile.favoriteClubs.some((club) =>
                        isClubNameMatch(club, row.team),
                      );
                      return (
                        <tr
                          key={row.team}
                          className={isFav ? 'bg-emerald-500/[0.08]' : undefined}
                        >
                          <td className="py-2.5 ps-5 pe-2 font-mono tabular-nums text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                            {row.position}
                          </td>
                          <td className="py-2.5 px-2 font-medium text-slate-900 dark:text-white">
                            <span className="inline-flex items-center gap-1.5">
                              <TeamLogo
                                name={row.team}
                                code={row.shortName.slice(0, 3).toUpperCase()}
                                logo={row.logo}
                                accentColor="#334155"
                                size="xs"
                              />
                              {isFav && (
                                <Star
                                  className="w-3 h-3 text-emerald-500 fill-emerald-500 shrink-0"
                                  aria-label={t.matchesView.favClubAria}
                                />
                              )}
                              <span>{row.shortName}</span>
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-end font-mono tabular-nums text-xs text-slate-500 dark:text-slate-400">
                            {row.played}
                          </td>
                          <td
                            className="py-2.5 px-2 text-end font-mono tabular-nums text-xs text-slate-600 dark:text-slate-300"
                            dir="ltr"
                          >
                            {row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}
                          </td>
                          <td className="py-2.5 ps-2 pe-5 text-end font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                            {row.points}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mini Mercato & Hot Debate */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111620] p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {t.home.liveMercato}
                    </h3>
                    <button
                      type="button"
                      onClick={() => navigateTo('mercato')}
                      className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      {t.home.seeAll}
                    </button>
                  </div>
                  <div className="divide-y divide-slate-200 dark:divide-white/8">
                    {(scopedTransfers.length > 0 ? scopedTransfers : transfers)
                      .slice(0, 3)
                      .map((tr) => (
                        <button
                          key={tr.id}
                          type="button"
                          onClick={() => navigateTo('mercato')}
                          className="w-full text-start py-3 first:pt-0 last:pb-0 space-y-1 hover:opacity-80 cursor-pointer"
                        >
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            {tr.competitionLabel} · {tr.publishedAt}
                          </p>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2">
                            {tr.headline}
                          </p>
                        </button>
                      ))}
                  </div>
                </div>

                {featuredDebate && (
                  <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111620] p-5 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>{t.home.featuredDebate}</span>
                        <button
                          type="button"
                          onClick={() => navigateTo('debates')}
                          className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                        >
                          {t.home.participate}
                        </button>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {featuredDebate.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3">
                        {featuredDebate.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigateTo('debates')}
                      className="w-full rounded-lg border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 transition-colors cursor-pointer"
                    >
                      {t.home.voteDebateCta}
                    </button>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {activeSection === 'matches' && (
          <MatchesCenterView
            matches={matches}
            selectedCompetition={selectedCompetition}
            onSelectCompetition={setSelectedCompetition}
            onSelectMatch={(match) => setSelectedMatchId(match.id)}
            comments={comments}
            initialSubTab={matchesSubTab}
            loading={loadingLive}
            favoriteClubs={userProfile.favoriteClubs}
            favoriteFilterMode={userProfile.favoriteFilterMode}
            onChangeFavoriteFilterMode={handleChangeFavoriteFilterMode}
            onOpenProfile={() => setProfileDrawerOpen(true)}
          />
        )}

        {activeSection === 'standings' && (
          <StandingsView
            selectedCompetition={selectedCompetition}
            onSelectCompetition={setSelectedCompetition}
            standingsByComp={standingsByComp}
            topPlayers={topPlayers}
            favoriteClubs={userProfile.favoriteClubs}
          />
        )}

        {activeSection === 'mercato' && (
          <MercatoView
            transfers={transfers}
            comments={comments}
            favoriteClubs={userProfile.favoriteClubs}
            favoriteFilterMode={userProfile.favoriteFilterMode}
            onChangeFavoriteFilterMode={handleChangeFavoriteFilterMode}
            onAddComment={handleAddComment}
            onLikeComment={handleLikeComment}
          />
        )}

        {activeSection === 'debates' && (
          <DebatesPredictionsView
            debates={debates}
            matches={matches}
            predictions={predictions}
            userVotes={userDebateVotes}
            userPredictions={userPredictions}
            comments={comments}
            onCreateDebate={handleCreateDebate}
            onVoteDebate={handleVoteDebate}
            onVotePrediction={handleVotePrediction}
            onAddComment={handleAddComment}
            onLikeComment={handleLikeComment}
          />
        )}

        <ContactSection />
      </main>

      <footer className="border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#090C11] mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>{t.home.footerCopy(new Date().getFullYear())}</p>
          <div className="flex flex-wrap items-center gap-5">
            <button
              type="button"
              onClick={() => navigateTo('matches', 'live-upcoming')}
              className="hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              {t.home.footerSchedule}
            </button>
            <button
              type="button"
              onClick={() => navigateTo('matches', 'history')}
              className="hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              {t.home.footerHistory}
            </button>
            <button
              type="button"
              onClick={() => setAlertsDrawerOpen(true)}
              className="hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              {t.home.footerAlerts}
            </button>
            <a
              href="mailto:redaction@thepitch-football.com"
              dir="ltr"
              className="hover:text-slate-900 dark:hover:text-white"
            >
              redaction@thepitch-football.com
            </a>
          </div>
        </div>
      </footer>

      <MatchDetailDrawer
        match={selectedMatch}
        prediction={predictions.find((p) => p.matchId === selectedMatch?.id)}
        userPrediction={selectedMatch ? userPredictions[selectedMatch.id] : undefined}
        comments={comments}
        onClose={() => setSelectedMatchId(null)}
        onVotePrediction={handleVotePrediction}
        onAddComment={handleAddComment}
        onLikeComment={handleLikeComment}
      />

      <ArticleReaderDrawer
        article={selectedArticle}
        comments={comments}
        onClose={() => setSelectedArticle(null)}
        onAddComment={handleAddComment}
        onLikeComment={handleLikeComment}
      />

      <AlertsPushDrawer
        isOpen={alertsDrawerOpen}
        onClose={() => setAlertsDrawerOpen(false)}
        alerts={alerts}
        liveMatches={liveMatches}
        browserPushEnabled={browserPushEnabled}
        soundEnabled={soundEnabled}
        onlyFollowedAlerts={onlyFollowedAlerts}
        onToggleBrowserPush={handleToggleBrowserPush}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        onToggleOnlyFollowed={() => setOnlyFollowedAlerts((prev) => !prev)}
        onAddAlert={handleAddAlert}
        onDeleteAlert={handleDeleteAlert}
        onTriggerTestGoal={handleTriggerTestGoal}
      />

      <UserProfileDrawer
        isOpen={profileDrawerOpen}
        onClose={() => setProfileDrawerOpen(false)}
        profile={userProfile}
        availableClubs={availableClubs}
        alerts={alerts}
        onUpdateProfile={handleUpdateProfile}
        onSyncClubsToAlerts={handleSyncClubsToAlerts}
      />
    </div>
  );
}
