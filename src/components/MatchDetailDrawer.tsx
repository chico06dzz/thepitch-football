import React, { useEffect, useState } from 'react';
import { X, MapPin, UserCheck, Tv, Clock, BarChart3, Activity } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import {
  getLocalizedCompetitionLabel,
  getLocalizedMatchday,
  getLocalizedStatusDetail,
} from '../i18n/translations';
import { fetchEspnMatchDetailsDirect } from '../services/clientFallbackService';
import { FootballMatch, PredictionVoteCounts, SupporterComment } from '../types/football';
import { SupporterComments } from './SupporterComments';
import { TeamLogo } from './TeamLogo';

interface MatchDetailDrawerProps {
  match: FootballMatch | null;
  prediction?: PredictionVoteCounts;
  userPrediction?: 'home' | 'draw' | 'away';
  comments: SupporterComment[];
  onClose: () => void;
  onVotePrediction: (matchId: string, choice: 'home' | 'draw' | 'away') => Promise<void>;
  onAddComment: (payload: {
    targetType: SupporterComment['targetType'];
    targetId: string;
    author: string;
    clubSupport?: string;
    content: string;
  }) => Promise<void>;
  onLikeComment: (commentId: string) => Promise<void>;
}

export const MatchDetailDrawer: React.FC<MatchDetailDrawerProps> = ({
  match,
  prediction,
  userPrediction,
  comments,
  onClose,
  onVotePrediction,
  onAddComment,
  onLikeComment,
}) => {
  const { lang, t, locale } = useLanguage();
  const [activeTab, setActiveTab] = useState<'stats' | 'timeline' | 'comments'>('stats');
  const [detailedMatch, setDetailedMatch] = useState<FootballMatch | null>(match);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    setDetailedMatch(match);
    if (!match) return;
    let active = true;
    setLoadingDetails(true);
    const leagueParam = match.espnLeagueSlug ? `?league=${encodeURIComponent(match.espnLeagueSlug)}` : '';
    fetch(`/api/matches/${encodeURIComponent(match.id)}/details${leagueParam}`)
      .then(async (res) => {
        if (!res.ok) return null;
        const ct = res.headers.get('content-type') || '';
        if (!ct.includes('application/json')) return null;
        return res.json();
      })
      .then(async (data) => {
        if (!active) return;
        if (data?.match) {
          setDetailedMatch(data.match);
          return;
        }
        const direct = await fetchEspnMatchDetailsDirect(match);
        if (active) setDetailedMatch(direct);
      })
      .catch(async () => {
        const direct = await fetchEspnMatchDetailsDirect(match);
        if (active) setDetailedMatch(direct);
      })
      .finally(() => {
        if (active) setLoadingDetails(false);
      });
    return () => {
      active = false;
    };
  }, [match]);

  const current = detailedMatch ?? match;
  if (!current) return null;

  const totalVotes = prediction
    ? prediction.homeVotes + prediction.drawVotes + prediction.awayVotes
    : 0;
  const homePct = totalVotes > 0 && prediction ? Math.round((prediction.homeVotes / totalVotes) * 100) : 34;
  const drawPct = totalVotes > 0 && prediction ? Math.round((prediction.drawVotes / totalVotes) * 100) : 33;
  const awayPct = totalVotes > 0 && prediction ? Math.max(0, 100 - homePct - drawPct) : 33;

  const statRows: { label: string; home: number | string; away: number | string; rawHome: number; rawAway: number }[] = [
    {
      label: t.matchDetail.statsLabels.possession,
      home: `${current.stats.possession[0]}%`,
      away: `${current.stats.possession[1]}%`,
      rawHome: current.stats.possession[0],
      rawAway: current.stats.possession[1],
    },
    {
      label: t.matchDetail.statsLabels.shotsTotal,
      home: current.stats.shotsTotal[0],
      away: current.stats.shotsTotal[1],
      rawHome: current.stats.shotsTotal[0],
      rawAway: current.stats.shotsTotal[1],
    },
    {
      label: t.matchDetail.statsLabels.shotsOnTarget,
      home: current.stats.shotsOnTarget[0],
      away: current.stats.shotsOnTarget[1],
      rawHome: current.stats.shotsOnTarget[0],
      rawAway: current.stats.shotsOnTarget[1],
    },
    {
      label: t.matchDetail.statsLabels.passesCompleted,
      home: `${current.stats.passesCompleted[0]} (${current.stats.passAccuracy[0]}%)`,
      away: `${current.stats.passesCompleted[1]} (${current.stats.passAccuracy[1]}%)`,
      rawHome: current.stats.passesCompleted[0],
      rawAway: current.stats.passesCompleted[1],
    },
    {
      label: t.matchDetail.statsLabels.corners,
      home: current.stats.corners[0],
      away: current.stats.corners[1],
      rawHome: current.stats.corners[0],
      rawAway: current.stats.corners[1],
    },
    {
      label: t.matchDetail.statsLabels.saves,
      home: current.stats.saves[0],
      away: current.stats.saves[1],
      rawHome: current.stats.saves[0],
      rawAway: current.stats.saves[1],
    },
    {
      label: t.matchDetail.statsLabels.offsides,
      home: current.stats.offsides[0],
      away: current.stats.offsides[1],
      rawHome: current.stats.offsides[0],
      rawAway: current.stats.offsides[1],
    },
    {
      label: t.matchDetail.statsLabels.fouls,
      home: current.stats.fouls[0],
      away: current.stats.fouls[1],
      rawHome: current.stats.fouls[0],
      rawAway: current.stats.fouls[1],
    },
    {
      label: t.matchDetail.statsLabels.yellowCards,
      home: current.stats.yellowCards[0],
      away: current.stats.yellowCards[1],
      rawHome: current.stats.yellowCards[0],
      rawAway: current.stats.yellowCards[1],
    },
  ];

  const localizedCompName = getLocalizedCompetitionLabel(
    current.competitionId,
    current.competitionName,
    lang,
  );
  const localizedStatusDetail = getLocalizedStatusDetail(current.statusDetail, current.status, lang);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`${current.homeTeam.name} - ${current.awayTeam.name}`}
    >
      <div className="relative w-full max-w-2xl h-full overflow-y-auto bg-white dark:bg-[#111620] border-s border-slate-200 dark:border-white/10 shadow-2xl">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-6 py-4 bg-white/95 dark:bg-[#111620]/95 backdrop-blur-md border-b border-slate-200 dark:border-white/10">
          <div className="min-w-0">
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {localizedCompName} · {getLocalizedMatchday(current.matchday, lang)}
            </p>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">
              {current.homeTeam.shortName} – {current.awayTeam.shortName}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            aria-label={t.matchDetail.closeAria}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Match Scoreboard */}
          <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B0E14] p-6">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-5">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                {current.status === 'live' ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-500 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                    {t.matchesView.liveLabel} · {localizedStatusDetail || `${current.minute ?? ''}'`}
                  </span>
                ) : current.status === 'finished' ? (
                  <span>
                    {t.matchesView.finishedLabel} · {new Date(current.date).toLocaleDateString(locale)}
                  </span>
                ) : (
                  <span>
                    {new Date(current.date).toLocaleDateString(locale, {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    })}{' '}
                    · <span dir="ltr">{current.kickoffTime}</span>
                  </span>
                )}
              </span>
              {current.tvChannel && (
                <span className="flex items-center gap-1">
                  <Tv className="w-3.5 h-3.5" aria-hidden="true" />
                  {current.tvChannel}
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 items-center gap-4 text-center" dir="ltr">
              <div className="space-y-1.5">
                <TeamLogo
                  name={current.homeTeam.name}
                  code={current.homeTeam.code}
                  logo={current.homeTeam.logo}
                  accentColor={current.homeTeam.accentColor}
                  size="lg"
                  className="mx-auto"
                />
                <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  {current.homeTeam.name}
                </p>
                {current.homeTeam.formation && (
                  <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    {current.homeTeam.formation}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                {current.status === 'upcoming' ? (
                  <div className="text-2xl sm:text-3xl font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                    {current.kickoffTime}
                  </div>
                ) : (
                  <div className="text-4xl sm:text-5xl font-mono font-bold tabular-nums tracking-tight text-slate-900 dark:text-white">
                    {current.homeTeam.score} – {current.awayTeam.score}
                  </div>
                )}
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {current.status === 'upcoming'
                    ? t.matchDetail.kickoff
                    : localizedStatusDetail || t.matchDetail.liveScore}
                </p>
              </div>

              <div className="space-y-1.5">
                <TeamLogo
                  name={current.awayTeam.name}
                  code={current.awayTeam.code}
                  logo={current.awayTeam.logo}
                  accentColor={current.awayTeam.accentColor}
                  size="lg"
                  className="mx-auto"
                />
                <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  {current.awayTeam.name}
                </p>
                {current.awayTeam.formation && (
                  <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    {current.awayTeam.formation}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                {current.stadium}
                {current.city ? `, ${current.city}` : ''}
              </span>
              {current.referee && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" aria-hidden="true" />
                    {t.matchDetail.referee} {current.referee}
                  </span>
                </>
              )}
              {current.attendance && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    {current.attendance} {t.matchDetail.spectators}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Interactive Match Prediction Bar (1 / N / 2) */}
          {current.status !== 'finished' && (
            <div className="rounded-xl border border-slate-200 dark:border-white/10 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {t.matchDetail.supporterPrediction}
                </span>
                <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                  {t.matchDetail.votesCount(totalVotes)}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => onVotePrediction(current.id, 'home')}
                  className={`py-2.5 px-3 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                    userPrediction === 'home'
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <div className="truncate">{current.homeTeam.shortName}</div>
                  <div className="font-mono tabular-nums font-bold mt-0.5">{homePct}%</div>
                </button>
                <button
                  type="button"
                  onClick={() => onVotePrediction(current.id, 'draw')}
                  className={`py-2.5 px-3 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                    userPrediction === 'draw'
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <div>{t.matchDetail.draw}</div>
                  <div className="font-mono tabular-nums font-bold mt-0.5">{drawPct}%</div>
                </button>
                <button
                  type="button"
                  onClick={() => onVotePrediction(current.id, 'away')}
                  className={`py-2.5 px-3 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                    userPrediction === 'away'
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <div className="truncate">{current.awayTeam.shortName}</div>
                  <div className="font-mono tabular-nums font-bold mt-0.5">{awayPct}%</div>
                </button>
              </div>
            </div>
          )}

          {/* Segmented Drawer Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-[#0B0E14] border border-slate-200 dark:border-white/8 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('stats')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'stats'
                  ? 'bg-white dark:bg-[#1A2231] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" aria-hidden="true" />
              {t.matchDetail.tabStats}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('timeline')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'timeline'
                  ? 'bg-white dark:bg-[#1A2231] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" aria-hidden="true" />
              {t.matchDetail.tabTimeline(current.events.length)}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('comments')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'comments'
                  ? 'bg-white dark:bg-[#1A2231] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t.matchDetail.tabComments(comments.filter((c) => c.targetId === current.id).length)}
            </button>
          </div>

          {loadingDetails && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.matchDetail.syncingStats}
            </p>
          )}

          {/* Tab Content */}
          {activeTab === 'stats' && (
            <div className="space-y-4">
              {current.status === 'upcoming' ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center border border-dashed border-slate-200 dark:border-white/10 rounded-xl">
                  {t.matchDetail.statsUpcomingHint}
                </p>
              ) : (
                <div className="space-y-3.5">
                  {statRows.map((row) => {
                    const total = row.rawHome + row.rawAway || 1;
                    const homeShare = Math.round((row.rawHome / total) * 100);
                    return (
                      <div key={row.label} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs" dir="ltr">
                          <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                            {row.home}
                          </span>
                          <span className="text-slate-500 dark:text-slate-400">{row.label}</span>
                          <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                            {row.away}
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full overflow-hidden bg-slate-200 dark:bg-white/10 flex" dir="ltr">
                          <div
                            className="h-full bg-emerald-500 transition-all duration-300"
                            style={{ width: `${homeShare}%` }}
                          />
                          <div
                            className="h-full bg-slate-400 dark:bg-slate-600 transition-all duration-300"
                            style={{ width: `${100 - homeShare}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-2">
              {current.events.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center border border-dashed border-slate-200 dark:border-white/10 rounded-xl">
                  {t.matchDetail.noEventsYet}
                </p>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-white/8 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden">
                  {current.events.map((ev) => (
                    <div
                      key={ev.id}
                      className="flex items-center justify-between gap-4 px-4 py-3 text-sm bg-white dark:bg-[#0B0E14]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-mono tabular-nums text-xs font-bold text-emerald-600 dark:text-emerald-400 w-12 shrink-0" dir="ltr">
                          {ev.clockDisplay || `${ev.minute}'`}
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                            {ev.player}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {t.matchDetail.eventTypes[ev.type]}
                            {ev.assist ? ` · ${t.matchDetail.assistBy(ev.assist)}` : ''}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {ev.team === 'home' ? current.homeTeam.shortName : current.awayTeam.shortName}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <SupporterComments
              targetType="match"
              targetId={current.id}
              comments={comments}
              onAddComment={onAddComment}
              onLikeComment={onLikeComment}
              title={t.matchDetail.reactionsTitle(current.homeTeam.shortName, current.awayTeam.shortName)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

