import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, ChevronRight, History, Search, Star } from 'lucide-react';
import { COMPETITIONS } from '../data/footballData';
import { useLanguage } from '../i18n/LanguageContext';
import {
  getLocalizedCompetitionLabel,
  getLocalizedCompetitionMeta,
  getLocalizedMatchday,
  getLocalizedStatusDetail,
} from '../i18n/translations';
import {
  CompetitionId,
  FavoriteFilterMode,
  FootballMatch,
  SupporterComment,
} from '../types/football';
import {
  matchInvolvesFavorite,
  prioritizeAndFilterMatches,
} from '../utils/favoriteClubs';
import { TeamLogo } from './TeamLogo';

interface MatchesCenterViewProps {
  matches: FootballMatch[];
  selectedCompetition: CompetitionId;
  onSelectCompetition: (id: CompetitionId) => void;
  onSelectMatch: (match: FootballMatch) => void;
  comments: SupporterComment[];
  initialSubTab?: 'live-upcoming' | 'history';
  loading?: boolean;
  favoriteClubs: string[];
  favoriteFilterMode: FavoriteFilterMode;
  onChangeFavoriteFilterMode: (mode: FavoriteFilterMode) => void;
  onOpenProfile: () => void;
}

export const MatchesCenterView: React.FC<MatchesCenterViewProps> = ({
  matches,
  selectedCompetition,
  onSelectCompetition,
  onSelectMatch,
  comments,
  initialSubTab = 'live-upcoming',
  loading = false,
  favoriteClubs,
  favoriteFilterMode,
  onChangeFavoriteFilterMode,
  onOpenProfile,
}) => {
  const { lang, t, locale, isRtl } = useLanguage();
  const [subTab, setSubTab] = useState<'live-upcoming' | 'history'>(initialSubTab);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setSubTab(initialSubTab);
  }, [initialSubTab]);

  const { items: scopedByFavorites } = useMemo(
    () => prioritizeAndFilterMatches(matches, favoriteClubs, favoriteFilterMode),
    [matches, favoriteClubs, favoriteFilterMode],
  );

  const filteredMatches = useMemo(() => {
    const q = search.trim().toLowerCase();
    return scopedByFavorites.filter((m) => {
      const compOk = selectedCompetition === 'all' || m.competitionId === selectedCompetition;
      const statusOk = subTab === 'history' ? m.status === 'finished' : m.status !== 'finished';
      const searchOk =
        !q ||
        m.homeTeam.name.toLowerCase().includes(q) ||
        m.awayTeam.name.toLowerCase().includes(q) ||
        m.competitionName.toLowerCase().includes(q) ||
        m.stadium.toLowerCase().includes(q);
      return compOk && statusOk && searchOk;
    });
  }, [scopedByFavorites, selectedCompetition, subTab, search]);

  const liveList = filteredMatches.filter((m) => m.status === 'live');
  const upcomingList = filteredMatches.filter((m) => m.status === 'upcoming');
  const finishedList = filteredMatches.filter((m) => m.status === 'finished');

  const renderMatchRow = (match: FootballMatch) => {
    const commentCount = comments.filter((c) => c.targetId === match.id).length;
    const goalEvents = match.events.filter(
      (ev) => ev.type === 'goal' || ev.type === 'penalty_goal',
    );
    const isFav = matchInvolvesFavorite(match, favoriteClubs);
    const localizedCompName = getLocalizedCompetitionLabel(
      match.competitionId,
      match.competitionName,
      lang,
    );
    const localizedStatusDetail = getLocalizedStatusDetail(match.statusDetail, match.status, lang);

    return (
      <button
        key={match.id}
        type="button"
        onClick={() => onSelectMatch(match)}
        className={`w-full text-start rounded-xl border bg-white dark:bg-[#111620] hover:border-emerald-500/50 transition-colors p-5 space-y-4 cursor-pointer ${
          isFav
            ? 'border-emerald-500/45 ring-1 ring-emerald-500/15'
            : 'border-slate-200 dark:border-white/10'
        }`}
      >
        <div className="flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="truncate flex items-center gap-1.5">
            {isFav && (
              <Star
                className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500 shrink-0"
                aria-label={t.matchesView.favClubAria}
              />
            )}
            <span className="truncate">
              {localizedCompName}
              {match.matchday ? ` · ${getLocalizedMatchday(match.matchday, lang)}` : ''}
            </span>
          </span>
          {match.status === 'live' ? (
            <span className="inline-flex items-center gap-1.5 font-mono tabular-nums font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
              {t.matchesView.liveLabel} · {localizedStatusDetail || `${match.minute ?? ''}'`}
            </span>
          ) : match.status === 'finished' ? (
            <span className="font-mono tabular-nums whitespace-nowrap shrink-0">
              {t.matchesView.finishedLabel} ·{' '}
              {new Date(match.date).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}
            </span>
          ) : (
            <span className="font-mono tabular-nums whitespace-nowrap shrink-0">
              {new Date(match.date).toLocaleDateString(locale, {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })}{' '}
              · <span dir="ltr">{match.kickoffTime}</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-12 items-center gap-3" dir="ltr">
          <div className="col-span-5 flex items-center gap-3 min-w-0">
            <TeamLogo
              name={match.homeTeam.name}
              code={match.homeTeam.code}
              logo={match.homeTeam.logo}
              accentColor={match.homeTeam.accentColor}
              size="md"
            />
            <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
              {match.homeTeam.name}
            </span>
          </div>

          <div className="col-span-2 text-center font-mono tabular-nums">
            {match.status === 'upcoming' ? (
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">vs</span>
            ) : (
              <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {match.homeTeam.score} – {match.awayTeam.score}
              </span>
            )}
          </div>

          <div className="col-span-5 flex items-center justify-end gap-3 min-w-0 text-right">
            <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
              {match.awayTeam.name}
            </span>
            <TeamLogo
              name={match.awayTeam.name}
              code={match.awayTeam.code}
              logo={match.awayTeam.logo}
              accentColor={match.awayTeam.accentColor}
              size="md"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200 dark:border-white/8 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="truncate max-w-full sm:max-w-[65%]">
            {goalEvents.length > 0 ? (
              <span>
                {t.matchesView.scorersPrefix}{' '}
                {goalEvents
                  .map((g) => `${g.player} (${g.clockDisplay || `${g.minute}'`})`)
                  .join(' · ')}
              </span>
            ) : (
              <span>
                {match.stadium}
                {match.city ? `, ${match.city}` : ''}
                {match.tvChannel ? ` · ${match.tvChannel}` : ''}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 font-mono tabular-nums shrink-0">
            {match.status !== 'upcoming' && (
              <span>{t.matchesView.possShort(match.stats.possession[0], match.stats.possession[1])}</span>
            )}
            <span>{t.matchesView.commentsCount(commentCount)}</span>
            <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-sans font-medium">
              {t.matchesView.statsLive}
              <ChevronRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} aria-hidden="true" />
            </span>
          </div>
        </div>
      </button>
    );
  };

  return (
    <section className="space-y-6" aria-label={t.matchesView.aria}>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-5">
        <div>
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            {t.matchesView.kicker}
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            {subTab === 'history' ? t.matchesView.titleHistory : t.matchesView.titleLive}
          </h2>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-[#111620] border border-slate-200 dark:border-white/8">
          <button
            type="button"
            onClick={() => setSubTab('live-upcoming')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-medium whitespace-nowrap cursor-pointer ${
              subTab === 'live-upcoming'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
            {t.matchesView.tabLiveUpcoming(scopedByFavorites.filter((m) => m.status !== 'finished').length)}
          </button>
          <button
            type="button"
            onClick={() => setSubTab('history')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-medium whitespace-nowrap cursor-pointer ${
              subTab === 'history'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" aria-hidden="true" />
            {t.matchesView.tabHistory(scopedByFavorites.filter((m) => m.status === 'finished').length)}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-[#111620] border border-slate-200 dark:border-white/8">
          {COMPETITIONS.map((comp) => (
            <button
              key={comp.id}
              type="button"
              onClick={() => onSelectCompetition(comp.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCompetition === comp.id
                  ? 'bg-white dark:bg-[#1A2231] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {getLocalizedCompetitionMeta(comp.id, lang).shortName}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {favoriteClubs.length > 0 ? (
            <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-[#111620] border border-slate-200 dark:border-white/8">
              {[
                { id: 'only' as const, label: t.matchesView.myClubsCount(favoriteClubs.length) },
                { id: 'prioritize' as const, label: t.matchesView.prioritize },
                { id: 'all' as const, label: t.matchesView.all },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChangeFavoriteFilterMode(opt.id)}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap cursor-pointer ${
                    favoriteFilterMode === opt.id
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenProfile}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111620] px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-emerald-500/50 whitespace-nowrap cursor-pointer"
            >
              <Star className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
              <span>{t.matchesView.pickFavClub}</span>
            </button>
          )}

          <div className="relative sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.matchesView.searchPlaceholder}
              className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111620] ps-9 pe-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>
        </div>
      </div>

      {loading && matches.length === 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-36 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111620] animate-pulse"
            />
          ))}
        </div>
      ) : subTab === 'live-upcoming' ? (
        <div className="space-y-8">
          {liveList.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                {t.matchesView.liveMatchesCount(liveList.length)}
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {liveList.map(renderMatchRow)}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200">
              {t.matchesView.upcomingScheduleCount(upcomingList.length)}
            </h3>
            {upcomingList.length === 0 ? (
              <div className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center border border-dashed border-slate-200 dark:border-white/10 rounded-xl space-y-3">
                <p>
                  {favoriteClubs.length > 0 && favoriteFilterMode === 'only'
                    ? t.matchesView.noUpcomingFav
                    : t.matchesView.noUpcomingDefault}
                </p>
                {favoriteClubs.length > 0 && favoriteFilterMode === 'only' && (
                  <button
                    type="button"
                    onClick={() => onChangeFavoriteFilterMode('prioritize')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 text-xs font-semibold text-white cursor-pointer"
                  >
                    {t.matchesView.showAllSchedule}
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {upcomingList.map(renderMatchRow)}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {finishedList.length === 0 ? (
            <div className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center border border-dashed border-slate-200 dark:border-white/10 rounded-xl space-y-3">
              <p>
                {favoriteClubs.length > 0 && favoriteFilterMode === 'only'
                  ? t.matchesView.noHistoryFav
                  : t.matchesView.noHistoryDefault}
              </p>
              {favoriteClubs.length > 0 && favoriteFilterMode === 'only' && (
                <button
                  type="button"
                  onClick={() => onChangeFavoriteFilterMode('prioritize')}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 text-xs font-semibold text-white cursor-pointer"
                >
                  {t.matchesView.showAllHistory}
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {finishedList.map(renderMatchRow)}
            </div>
          )}
        </div>
      )}
    </section>
  );
};


