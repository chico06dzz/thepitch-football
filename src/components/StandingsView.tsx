import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { COMPETITIONS } from '../data/footballData';
import { useLanguage } from '../i18n/LanguageContext';
import { getLocalizedCompetitionMeta } from '../i18n/translations';
import { CompetitionId, StandingRow, TopPlayerStat } from '../types/football';
import { isClubNameMatch } from '../utils/favoriteClubs';
import { TeamLogo } from './TeamLogo';

interface StandingsViewProps {
  selectedCompetition: CompetitionId;
  onSelectCompetition: (id: CompetitionId) => void;
  standingsByComp: Record<Exclude<CompetitionId, 'all'>, StandingRow[]>;
  topPlayers: TopPlayerStat[];
  favoriteClubs?: string[];
}

export const StandingsView: React.FC<StandingsViewProps> = ({
  selectedCompetition,
  onSelectCompetition,
  standingsByComp,
  topPlayers,
  favoriteClubs = [],
}) => {
  const { lang, t } = useLanguage();
  const activeComp: Exclude<CompetitionId, 'all'> =
    selectedCompetition === 'all' ? 'ligue-1' : selectedCompetition;

  const [playerFilter, setPlayerFilter] = useState<'goals' | 'assists' | 'contributions'>('goals');

  const rows = standingsByComp[activeComp] ?? [];
  const activeCompMeta = getLocalizedCompetitionMeta(activeComp, lang);

  const sortedPlayers = [...topPlayers]
    .filter((p) => (selectedCompetition === 'all' ? true : p.competitionId === selectedCompetition))
    .sort((a, b) => {
      if (playerFilter === 'goals') return b.goals - a.goals || b.assists - a.assists;
      if (playerFilter === 'assists') return b.assists - a.assists || b.goals - a.goals;
      return b.goalContributions - a.goalContributions;
    })
    .slice(0, 12);

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
            {t.standings.kicker}
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            {t.standings.title}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-[#111620] border border-slate-200 dark:border-white/8">
          {COMPETITIONS.filter((c) => c.id !== 'all').map((comp) => (
            <button
              key={comp.id}
              type="button"
              onClick={() => onSelectCompetition(comp.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeComp === comp.id
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {getLocalizedCompetitionMeta(comp.id, lang).shortName}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Standings Table */}
        <div className="xl:col-span-8 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111620] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-white/10">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {activeCompMeta.name}
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {activeCompMeta.region}
            </span>
          </div>

          {rows.length === 0 ? (
            <p className="p-8 text-sm text-center text-slate-500 dark:text-slate-400">
              {t.standings.loading}
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
                    return (
                      <tr
                        key={`${row.groupName ?? ''}-${row.team}-${idx}`}
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
                            <span className="hidden lg:inline text-[11px] text-slate-400 dark:text-slate-500 font-normal shrink-0">
                              {row.groupName || zoneLabel(row.zone)}
                            </span>
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="px-5 py-3 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B0E14] flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="text-emerald-600 dark:text-emerald-400">{t.standings.legendQualTop4}</span>
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
    </section>
  );
};

