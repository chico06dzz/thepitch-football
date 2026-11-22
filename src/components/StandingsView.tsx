import React, { useEffect, useMemo, useState } from 'react';
import { Globe, Search, Star, Trophy } from 'lucide-react';
import { COMPETITIONS } from '../data/footballData';
import { useLanguage } from '../i18n/LanguageContext';
import { getLocalizedCompetitionMeta } from '../i18n/translations';
import {
  CompetitionId,
  FifaRankingData,
  FifaRankingEntry,
  NationalCupId,
  NationalCupStandingsMap,
  StandingRow,
  TopPlayerStat,
} from '../types/football';
import { isClubNameMatch } from '../utils/favoriteClubs';
import { TeamLogo } from './TeamLogo';

interface StandingsViewProps {
  selectedCompetition: CompetitionId;
  onSelectCompetition: (id: CompetitionId) => void;
  standingsByComp: Record<Exclude<CompetitionId, 'all'>, StandingRow[]>;
  nationalCupsStandings: NationalCupStandingsMap;
  fifaRanking: FifaRankingData;
  topPlayers: TopPlayerStat[];
  favoriteClubs?: string[];
}

const CUP_ORDER: Exclude<NationalCupId, 'friendlies'>[] = [
  'world-cup',
  'afcon',
  'euro',
  'asian-cup',
  'copa-america',
  'gold-cup',
  'nations-league',
  'world-qualifiers',
];

const CONFED_OPTIONS = ['ALL', 'CAF', 'UEFA', 'CONMEBOL', 'AFC', 'CONCACAF', 'OFC'] as const;

export const StandingsView: React.FC<StandingsViewProps> = ({
  selectedCompetition,
  onSelectCompetition,
  standingsByComp,
  nationalCupsStandings,
  fifaRanking,
  topPlayers,
  favoriteClubs = [],
}) => {
  const { lang, t, locale } = useLanguage();
  const [viewMode, setViewMode] = useState<'competitions' | 'fifa-ranking'>('competitions');

  const activeComp: Exclude<CompetitionId, 'all'> =
    selectedCompetition === 'all' ? 'ligue-1' : selectedCompetition;

  const [activeCup, setActiveCup] = useState<Exclude<NationalCupId, 'friendlies'>>('world-cup');
  const [activeGroup, setActiveGroup] = useState<string>('ALL');
  const [playerFilter, setPlayerFilter] = useState<'goals' | 'assists' | 'contributions'>('goals');

  // FIFA Ranking filters
  const [fifaSearch, setFifaSearch] = useState('');
  const [fifaConfed, setFifaConfed] = useState<(typeof CONFED_OPTIONS)[number]>('ALL');
  const [fifaLimit, setFifaLimit] = useState<30 | 100 | 300>(30);

  // Switch to competitions view automatically when parent selects a different competition
  useEffect(() => {
    setViewMode('competitions');
  }, [selectedCompetition]);

  // Pick first populated national cup automatically if current cup has no rows
  useEffect(() => {
    const current = nationalCupsStandings[activeCup];
    if (!current || current.length === 0) {
      const firstPopulated = CUP_ORDER.find((c) => (nationalCupsStandings[c]?.length ?? 0) > 0);
      if (firstPopulated && firstPopulated !== activeCup) {
        setActiveCup(firstPopulated);
      }
    }
    setActiveGroup('ALL');
  }, [activeCup, nationalCupsStandings]);

  const rawRows = useMemo(() => {
    if (activeComp === 'national-teams') {
      const cupRows = nationalCupsStandings[activeCup];
      if (cupRows && cupRows.length > 0) return cupRows;
      if (activeCup === 'nations-league') return standingsByComp['national-teams'] ?? [];
      return [];
    }
    return standingsByComp[activeComp] ?? [];
  }, [activeComp, activeCup, nationalCupsStandings, standingsByComp]);

  const availableGroups = useMemo(() => {
    const seen = new Set<string>();
    for (const r of rawRows) {
      if (r.groupName) seen.add(r.groupName);
    }
    return Array.from(seen);
  }, [rawRows]);

  const rows = useMemo(() => {
    if (activeComp !== 'national-teams' || activeGroup === 'ALL') return rawRows;
    return rawRows.filter((r) => r.groupName === activeGroup);
  }, [activeComp, activeGroup, rawRows]);

  const activeCompMeta = getLocalizedCompetitionMeta(activeComp, lang);

  const sortedPlayers = [...topPlayers]
    .filter((p) => (selectedCompetition === 'all' ? true : p.competitionId === selectedCompetition))
    .sort((a, b) => {
      if (playerFilter === 'goals') return b.goals - a.goals || b.assists - a.assists;
      if (playerFilter === 'assists') return b.assists - a.assists || b.goals - a.goals;
      return b.goalContributions - a.goalContributions;
    })
    .slice(0, 12);

  // FIFA Ranking derived data
  const filteredFifaEntries = useMemo(() => {
    const q = fifaSearch.trim().toLowerCase();
    const filtered = fifaRanking.entries.filter((entry) => {
      const confedOk = fifaConfed === 'ALL' || entry.confederation === fifaConfed;
      const searchOk =
        !q ||
        entry.team.toLowerCase().includes(q) ||
        entry.code.toLowerCase().includes(q);
      return confedOk && searchOk;
    });
    if (q || fifaConfed !== 'ALL') {
      return fifaLimit === 300 ? filtered : filtered.slice(0, fifaLimit);
    }
    return filtered.slice(0, fifaLimit);
  }, [fifaRanking.entries, fifaSearch, fifaConfed, fifaLimit]);

  const confedLeaders = useMemo(() => {
    const confeds: Exclude<(typeof CONFED_OPTIONS)[number], 'ALL'>[] = [
      'UEFA',
      'CONMEBOL',
      'CAF',
      'AFC',
      'CONCACAF',
      'OFC',
    ];
    return confeds
      .map((conf) => ({
        confed: conf,
        leader: fifaRanking.entries.find((e) => e.confederation === conf),
      }))
      .filter((x): x is { confed: typeof x.confed; leader: FifaRankingEntry } => Boolean(x.leader));
  }, [fifaRanking.entries]);

  const spotlightNations = useMemo(() => {
    const spotlightCodes = new Set(['ALG', 'MAR', 'TUN', 'EGY', 'SEN', 'FRA']);
    return fifaRanking.entries.filter(
      (e) =>
        spotlightCodes.has(e.code) ||
        favoriteClubs.some((club) => isClubNameMatch(club, e.team)),
    );
  }, [fifaRanking.entries, favoriteClubs]);

  const formattedFifaDate = useMemo(() => {
    if (!fifaRanking.updatedAt) return '';
    const dt = new Date(fifaRanking.updatedAt);
    if (Number.isNaN(dt.getTime())) return '';
    return dt.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [fifaRanking.updatedAt, locale]);

  const zoneLabel = (zone?: StandingRow['zone']) => {
    switch (zone) {
      case 'ucl':
        return activeComp === 'national-teams' ? t.standings.zoneUclNational : t.standings.zoneUcl;
      case 'uel':
        return t.standings.zoneUel;
      case 'playoff':
        return t.standings.zonePlayoff;
      case 'relegation':
        return t.standings.zoneRelegation;
      default:
        return '';
    }
  };

  return (
    <section className="space-y-8" aria-label={t.standings.aria}>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-5">
        <div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            {viewMode === 'fifa-ranking' ? t.standings.fifaKicker : t.standings.kicker}
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            {viewMode === 'fifa-ranking' ? t.standings.fifaTitle : t.standings.title}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-[#111620] border border-slate-200 dark:border-white/8">
          {COMPETITIONS.filter((c) => c.id !== 'all').map((comp) => {
            const isSelected = viewMode === 'competitions' && activeComp === comp.id;
            return (
              <button
                key={comp.id}
                type="button"
                onClick={() => {
                  setViewMode('competitions');
                  onSelectCompetition(comp.id);
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {comp.id === 'national-teams'
                  ? t.standings.tabNationalCups
                  : getLocalizedCompetitionMeta(comp.id, lang).shortName}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setViewMode('fifa-ranking')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              viewMode === 'fifa-ranking'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t.standings.tabFifaRanking}</span>
          </button>
        </div>
      </div>

      {/* Mode 1: FIFA World Ranking */}
      {viewMode === 'fifa-ranking' ? (
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-[#111620] border border-slate-200 dark:border-white/8">
              {CONFED_OPTIONS.map((conf) => (
                <button
                  key={conf}
                  type="button"
                  onClick={() => setFifaConfed(conf)}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    fifaConfed === conf
                      ? 'bg-white dark:bg-[#1A2231] text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {conf === 'ALL' ? t.standings.fifaAllConfeds : conf}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-[#111620] border border-slate-200 dark:border-white/8">
                {[
                  { val: 30 as const, label: t.standings.fifaLimitTop30 },
                  { val: 100 as const, label: t.standings.fifaLimitTop100 },
                  { val: 300 as const, label: t.standings.fifaLimitAll },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setFifaLimit(opt.val)}
                    className={`px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap cursor-pointer ${
                      fifaLimit === opt.val
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="relative sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  type="search"
                  value={fifaSearch}
                  onChange={(e) => setFifaSearch(e.target.value)}
                  placeholder={t.standings.fifaSearchPlaceholder}
                  className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111620] ps-9 pe-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            {/* Main FIFA World Ranking Table */}
            <div className="xl:col-span-8 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111620] overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 border-b border-slate-200 dark:border-white/10">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t.standings.fifaTitle}
                </h3>
                {formattedFifaDate && (
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {t.standings.fifaUpdatedPrefix} {formattedFifaDate}
                  </span>
                )}
              </div>

              {filteredFifaEntries.length === 0 ? (
                <p className="p-8 text-sm text-center text-slate-500 dark:text-slate-400">
                  {fifaRanking.entries.length === 0 ? t.standings.loading : t.standings.fifaEmpty}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-start border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-white/10 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#0B0E14]">
                        <th className="py-3 ps-5 pe-2 w-12">#</th>
                        <th className="py-3 px-2">{t.standings.colTeam}</th>
                        <th className="py-3 px-2 hidden sm:table-cell">{t.standings.fifaColConfed}</th>
                        <th className="py-3 px-2 text-end">{t.standings.fifaColChange}</th>
                        <th className="py-3 ps-2 pe-5 text-end font-semibold text-slate-900 dark:text-white">
                          {t.standings.fifaColPoints}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-white/8 text-sm">
                      {filteredFifaEntries.map((entry) => {
                        const isFav = favoriteClubs.some((club) =>
                          isClubNameMatch(club, entry.team),
                        );
                        return (
                          <tr
                            key={`${entry.rank}-${entry.code}-${entry.team}`}
                            className={`transition-colors ${
                              isFav
                                ? 'bg-emerald-500/[0.08] hover:bg-emerald-500/[0.12]'
                                : 'hover:bg-slate-50 dark:hover:bg-white/[0.03]'
                            }`}
                          >
                            <td className="py-3 ps-5 pe-2 font-mono tabular-nums text-xs font-bold">
                              <span
                                className={
                                  entry.rank <= 10
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-slate-600 dark:text-slate-300'
                                }
                              >
                                {entry.rank}
                              </span>
                            </td>
                            <td className="py-3 px-2 font-medium text-slate-900 dark:text-slate-100">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <TeamLogo
                                  name={entry.team}
                                  code={entry.code}
                                  logo={entry.logo}
                                  accentColor="#0F766E"
                                  size="xs"
                                />
                                {isFav && (
                                  <Star
                                    className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500 shrink-0"
                                    aria-label={t.matchesView.favClubAria}
                                  />
                                )}
                                <span className="truncate font-semibold">{entry.team}</span>
                                <span className="font-mono text-[11px] text-slate-400 dark:text-slate-500 shrink-0">
                                  {entry.code}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-2 hidden sm:table-cell font-mono text-xs text-slate-500 dark:text-slate-400">
                              {entry.confederation || '—'}
                            </td>
                            <td
                              dir="ltr"
                              className={`py-3 px-2 text-end font-mono tabular-nums text-xs font-semibold ${
                                entry.previousChange > 0
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : entry.previousChange < 0
                                    ? 'text-rose-500'
                                    : 'text-slate-400'
                              }`}
                            >
                              {entry.previousChange > 0
                                ? `+${entry.previousChange}`
                                : entry.previousChange < 0
                                  ? entry.previousChange
                                  : '='}
                            </td>
                            <td className="py-3 ps-2 pe-5 text-end font-mono tabular-nums text-sm font-bold text-slate-900 dark:text-white">
                              {entry.points.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Right Sidebar: Confederation Leaders + Maghreb & Followed Nations */}
            <div className="xl:col-span-4 space-y-6">
              <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111620] overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {t.standings.fifaConfedLeadersTitle}
                  </h3>
                  <Trophy className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                </div>
                <div className="divide-y divide-slate-200 dark:divide-white/8">
                  {confedLeaders.map(({ confed, leader }) => (
                    <div
                      key={confed}
                      className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400 w-16 shrink-0">
                          {confed}
                        </span>
                        <TeamLogo
                          name={leader.team}
                          code={leader.code}
                          logo={leader.logo}
                          accentColor="#0F766E"
                          size="xs"
                        />
                        <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {leader.team}
                        </span>
                      </div>
                      <span className="font-mono tabular-nums text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">
                        #{leader.rank} · {leader.points.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {spotlightNations.length > 0 && (
                <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111620] overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-200 dark:border-white/10">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {t.standings.fifaFavNationsTitle}
                    </h3>
                  </div>
                  <div className="divide-y divide-slate-200 dark:divide-white/8">
                    {spotlightNations.map((entry) => (
                      <div
                        key={`spot-${entry.code}`}
                        className="flex items-center justify-between gap-3 px-5 py-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="font-mono tabular-nums text-xs font-bold text-emerald-600 dark:text-emerald-400 w-7">
                            #{entry.rank}
                          </span>
                          <TeamLogo
                            name={entry.team}
                            code={entry.code}
                            logo={entry.logo}
                            accentColor="#059669"
                            size="xs"
                          />
                          <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {entry.team}
                          </span>
                        </div>
                        <span className="font-mono tabular-nums text-xs font-semibold text-slate-600 dark:text-slate-300 shrink-0">
                          {entry.points.toFixed(2)} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Mode 2: Club Leagues & National Team Cups */
        <div className="space-y-6">
          {activeComp === 'national-teams' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-[#111620] border border-slate-200 dark:border-white/8">
                {CUP_ORDER.map((cupId) => {
                  const hasRows = (nationalCupsStandings[cupId]?.length ?? 0) > 0;
                  return (
                    <button
                      key={cupId}
                      type="button"
                      onClick={() => {
                        setActiveCup(cupId);
                        setActiveGroup('ALL');
                      }}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        activeCup === cupId
                          ? 'bg-white dark:bg-[#1A2231] text-slate-900 dark:text-white shadow-sm'
                          : hasRows
                            ? 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            : 'text-slate-400 dark:text-slate-600'
                      }`}
                    >
                      {t.standings.nationalCupLabels[cupId]}
                    </button>
                  );
                })}
              </div>

              {availableGroups.length > 1 && (
                <select
                  value={activeGroup}
                  onChange={(e) => setActiveGroup(e.target.value)}
                  className="rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111620] px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="ALL">
                    {t.standings.fifaAllConfeds} ({availableGroups.length})
                  </option>
                  {availableGroups.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            {/* Standings Table */}
            <div className="xl:col-span-8 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111620] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-white/10">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {activeComp === 'national-teams'
                    ? t.standings.nationalCupLabels[activeCup]
                    : activeCompMeta.name}
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {activeComp === 'national-teams'
                    ? t.standings.nationalCupsTitle
                    : activeCompMeta.region}
                </span>
              </div>

              {rows.length === 0 ? (
                <p className="p-8 text-sm text-center text-slate-500 dark:text-slate-400">
                  {activeComp === 'national-teams'
                    ? t.standings.nationalCupEmpty
                    : t.standings.loading}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-start border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-white/10 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#0B0E14]">
                        <th className="py-3 ps-5 pe-2 w-10">#</th>
                        <th className="py-3 px-2">{t.standings.colTeam}</th>
                        <th className="py-3 px-2 text-end">{t.standings.colPlayed}</th>
                        <th className="py-3 px-2 text-end">{t.standings.colWon}</th>
                        <th className="py-3 px-2 text-end">{t.standings.colDrawn}</th>
                        <th className="py-3 px-2 text-end">{t.standings.colLost}</th>
                        <th className="py-3 px-2 text-end hidden sm:table-cell">{t.standings.colGoals}</th>
                        <th className="py-3 px-2 text-end">{t.standings.colDiff}</th>
                        <th className="py-3 ps-2 pe-5 text-end font-semibold text-slate-900 dark:text-white">
                          {t.standings.colPts}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-white/8 text-sm">
                      {rows.map((row, idx) => {
                        const isFav = favoriteClubs.some((club) => isClubNameMatch(club, row.team));
                        const showGroupDivider =
                          activeComp === 'national-teams' &&
                          row.groupName &&
                          (idx === 0 || rows[idx - 1].groupName !== row.groupName);

                        return (
                          <React.Fragment key={`${row.groupName ?? ''}-${row.team}-${idx}`}>
                            {showGroupDivider && (
                              <tr className="bg-slate-50/80 dark:bg-[#0B0E14]/80">
                                <td
                                  colSpan={9}
                                  className="py-2 ps-5 pe-5 text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400"
                                >
                                  {row.groupName}
                                </td>
                              </tr>
                            )}
                            <tr
                              className={`transition-colors ${
                                isFav
                                  ? 'bg-emerald-500/[0.08] hover:bg-emerald-500/[0.12]'
                                  : 'hover:bg-slate-50 dark:hover:bg-white/[0.03]'
                              }`}
                            >
                              <td className="py-3 ps-5 pe-2 font-mono tabular-nums text-xs font-semibold">
                                <span
                                  className={
                                    row.zone === 'ucl'
                                      ? 'text-emerald-600 dark:text-emerald-400'
                                      : row.zone === 'uel'
                                        ? 'text-sky-600 dark:text-sky-400'
                                        : row.zone === 'relegation'
                                          ? 'text-rose-500'
                                          : row.zone === 'playoff'
                                            ? 'text-amber-500'
                                            : 'text-slate-500 dark:text-slate-400'
                                  }
                                  title={zoneLabel(row.zone)}
                                >
                                  {row.position}
                                </span>
                              </td>
                              <td className="py-3 px-2 font-medium text-slate-900 dark:text-slate-100">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="inline-flex items-center gap-2 min-w-0">
                                    <TeamLogo
                                      name={row.team}
                                      code={row.shortName.slice(0, 3).toUpperCase()}
                                      logo={row.logo}
                                      accentColor="#334155"
                                      size="xs"
                                    />
                                    {isFav && (
                                      <Star
                                        className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500 shrink-0"
                                        aria-label={t.matchesView.favClubAria}
                                      />
                                    )}
                                    <span className="truncate">{row.team}</span>
                                  </span>
                                  {activeComp !== 'national-teams' && (
                                    <span className="hidden lg:inline text-[11px] text-slate-400 dark:text-slate-500 font-normal shrink-0">
                                      {zoneLabel(row.zone)}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-2 text-end font-mono tabular-nums text-xs text-slate-600 dark:text-slate-300">
                                {row.played}
                              </td>
                              <td className="py-3 px-2 text-end font-mono tabular-nums text-xs text-slate-600 dark:text-slate-300">
                                {row.won}
                              </td>
                              <td className="py-3 px-2 text-end font-mono tabular-nums text-xs text-slate-600 dark:text-slate-300">
                                {row.drawn}
                              </td>
                              <td className="py-3 px-2 text-end font-mono tabular-nums text-xs text-slate-600 dark:text-slate-300">
                                {row.lost}
                              </td>
                              <td
                                dir="ltr"
                                className="py-3 px-2 text-end font-mono tabular-nums text-xs text-slate-500 dark:text-slate-400 hidden sm:table-cell"
                              >
                                {row.goalsFor}:{row.goalsAgainst}
                              </td>
                              <td
                                dir="ltr"
                                className={`py-3 px-2 text-end font-mono tabular-nums text-xs font-medium ${
                                  row.goalDiff > 0
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : row.goalDiff < 0
                                      ? 'text-rose-500'
                                      : 'text-slate-500'
                                }`}
                              >
                                {row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}
                              </td>
                              <td className="py-3 ps-2 pe-5 text-end font-mono tabular-nums text-sm font-bold text-slate-900 dark:text-white">
                                {row.points}
                              </td>
                            </tr>
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="px-5 py-3 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B0E14] flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                <span className="text-emerald-600 dark:text-emerald-400">
                  {activeComp === 'national-teams' ? t.standings.zoneUclNational : t.standings.legendQualTop4}
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-sky-600 dark:text-sky-400">{t.standings.legendUel}</span>
                <span aria-hidden="true">·</span>
                <span className="text-rose-500">{t.standings.legendRelegation}</span>
              </div>
            </div>

            {/* Top Players / Individual Stats */}
            <div className="xl:col-span-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111620] overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 dark:border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {t.standings.leadersTitle}
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {t.standings.seasonShort}
                  </span>
                </div>
                <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-[#0B0E14] border border-slate-200 dark:border-white/8">
                  <button
                    type="button"
                    onClick={() => setPlayerFilter('goals')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md cursor-pointer ${
                      playerFilter === 'goals'
                        ? 'bg-white dark:bg-[#1A2231] text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {t.standings.tabScorers}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlayerFilter('assists')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md cursor-pointer ${
                      playerFilter === 'assists'
                        ? 'bg-white dark:bg-[#1A2231] text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {t.standings.tabAssists}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlayerFilter('contributions')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md cursor-pointer ${
                      playerFilter === 'contributions'
                        ? 'bg-white dark:bg-[#1A2231] text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {t.standings.tabDecisive}
                  </button>
                </div>
              </div>

              <div className="divide-y divide-slate-200 dark:divide-white/8">
                {sortedPlayers.length === 0 ? (
                  <p className="p-6 text-sm text-center text-slate-500 dark:text-slate-400">
                    {t.standings.leadersNote}
                  </p>
                ) : (
                  sortedPlayers.map((player, index) => (
                    <div
                      key={`${player.competitionId}-${player.player}`}
                      className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-mono tabular-nums text-xs font-semibold text-slate-400 w-4">
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {player.player}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {player.club} · {t.standings.matchesPlayed(player.appearances)}
                          </p>
                        </div>
                      </div>
                      <div className="text-end font-mono tabular-nums shrink-0">
                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          {playerFilter === 'goals'
                            ? t.standings.goalsUnit(player.goals)
                            : playerFilter === 'assists'
                              ? t.standings.assistsUnit(player.assists)
                              : t.standings.contribUnit(player.goalContributions)}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {player.goals} {t.standings.shortGoals} · {player.assists}{' '}
                          {t.standings.shortAssists}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};


