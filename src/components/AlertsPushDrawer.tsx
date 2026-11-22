import React, { useState } from 'react';
import { Bell, BellRing, Plus, Trash2, Volume2, VolumeX, X, Zap } from 'lucide-react';
import { COMPETITIONS, FOLLOWABLE_TEAMS } from '../data/footballData';
import { useLanguage } from '../i18n/LanguageContext';
import { getLocalizedCompetitionMeta } from '../i18n/translations';
import { FootballMatch, UserAlertRule } from '../types/football';

interface AlertsPushDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: UserAlertRule[];
  liveMatches: FootballMatch[];
  browserPushEnabled: boolean;
  soundEnabled: boolean;
  onlyFollowedAlerts: boolean;
  onToggleBrowserPush: () => Promise<void>;
  onToggleSound: () => void;
  onToggleOnlyFollowed: () => void;
  onAddAlert: (payload: {
    type: 'team' | 'competition';
    target: string;
    label: string;
    goalPush: boolean;
    lineupAlert: boolean;
    mercatoAlert: boolean;
  }) => Promise<void>;
  onDeleteAlert: (id: string) => Promise<void>;
  onTriggerTestGoal: (matchId?: string) => Promise<void>;
}

export const AlertsPushDrawer: React.FC<AlertsPushDrawerProps> = ({
  isOpen,
  onClose,
  alerts,
  liveMatches,
  browserPushEnabled,
  soundEnabled,
  onlyFollowedAlerts,
  onToggleBrowserPush,
  onToggleSound,
  onToggleOnlyFollowed,
  onAddAlert,
  onDeleteAlert,
  onTriggerTestGoal,
}) => {
  const { lang, t } = useLanguage();
  const [selectedType, setSelectedType] = useState<'team' | 'competition'>('team');
  const [selectedTarget, setSelectedTarget] = useState<string>(FOLLOWABLE_TEAMS[0]);
  const [goalPush, setGoalPush] = useState(true);
  const [lineupAlert, setLineupAlert] = useState(true);
  const [mercatoAlert, setMercatoAlert] = useState(true);
  const [simulating, setSimulating] = useState(false);

  if (!isOpen) return null;

  const handleTypeChange = (type: 'team' | 'competition') => {
    setSelectedType(type);
    if (type === 'team') {
      setSelectedTarget(FOLLOWABLE_TEAMS[0]);
    } else {
      setSelectedTarget(COMPETITIONS[1].name);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTarget) return;
    await onAddAlert({
      type: selectedType,
      target: selectedTarget,
      label: selectedTarget,
      goalPush,
      lineupAlert,
      mercatoAlert,
    });
  };

  const handleSimulateGoal = async () => {
    setSimulating(true);
    try {
      await onTriggerTestGoal(liveMatches[0]?.id);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={t.alerts.aria}
    >
      <div className="relative w-full max-w-lg h-full overflow-y-auto bg-white dark:bg-[#111620] border-s border-slate-200 dark:border-white/10 shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white/95 dark:bg-[#111620]/95 backdrop-blur-md border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <BellRing className="w-5 h-5 text-emerald-500" aria-hidden="true" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t.alerts.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
            aria-label={t.alerts.closeAria}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Push Settings Card */}
          <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B0E14] p-4 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {t.alerts.browserPushTitle}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t.alerts.browserPushDesc}
                </p>
              </div>
              <button
                type="button"
                onClick={onToggleBrowserPush}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  browserPushEnabled
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-white/20'
                }`}
              >
                {browserPushEnabled ? t.alerts.enabled : t.alerts.enable}
              </button>
            </div>

            <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-200 dark:border-white/8">
              <div className="flex items-center gap-2">
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400" aria-hidden="true" />
                )}
                <span className="text-sm text-slate-700 dark:text-slate-200">
                  {t.alerts.goalSound}
                </span>
              </div>
              <button
                type="button"
                onClick={onToggleSound}
                className={`px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer ${
                  soundEnabled
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    : 'bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400'
                }`}
              >
                {soundEnabled ? t.alerts.soundOn : t.alerts.soundMuted}
              </button>
            </div>

            <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-200 dark:border-white/8">
              <div>
                <p className="text-sm text-slate-700 dark:text-slate-200">
                  {t.alerts.filterNotifs}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {onlyFollowedAlerts ? t.alerts.filterFollowedDesc : t.alerts.filterAllDesc}
                </p>
              </div>
              <button
                type="button"
                onClick={onToggleOnlyFollowed}
                className="px-3 py-1.5 rounded-md text-xs font-medium border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-white/5 whitespace-nowrap cursor-pointer"
              >
                {onlyFollowedAlerts ? t.alerts.myFollowedBtn : t.alerts.allMultiplexBtn}
              </button>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-white/8">
              <button
                type="button"
                onClick={handleSimulateGoal}
                disabled={simulating}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-4 py-2.5 text-sm font-medium text-white transition-colors cursor-pointer"
              >
                <Zap className="w-4 h-4" aria-hidden="true" />
                <span>{simulating ? t.alerts.testSending : t.alerts.testBtn}</span>
              </button>
            </div>
          </div>

          {/* Create Personalized Alert */}
          <form onSubmit={handleAdd} className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              {t.alerts.createTitle}
            </h4>
            <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-[#0B0E14] border border-slate-200 dark:border-white/8">
              <button
                type="button"
                onClick={() => handleTypeChange('team')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md cursor-pointer ${
                  selectedType === 'team'
                    ? 'bg-white dark:bg-[#1A2231] text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {t.alerts.typeTeam}
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('competition')}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md cursor-pointer ${
                  selectedType === 'competition'
                    ? 'bg-white dark:bg-[#1A2231] text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {t.alerts.typeComp}
              </button>
            </div>

            <select
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B0E14] px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              {selectedType === 'team'
                ? FOLLOWABLE_TEAMS.map((team) => (
                    <option key={team} value={team}>
                      {team}
                    </option>
                  ))
                : COMPETITIONS.filter((c) => c.id !== 'all').map((comp) => (
                    <option key={comp.id} value={comp.name}>
                      {getLocalizedCompetitionMeta(comp.id, lang).name}
                    </option>
                  ))}
            </select>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-white/10 cursor-pointer">
                <input
                  type="checkbox"
                  checked={goalPush}
                  onChange={(e) => setGoalPush(e.target.checked)}
                  className="accent-emerald-500"
                />
                <span className="text-slate-700 dark:text-slate-200">{t.alerts.liveGoals}</span>
              </label>
              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-white/10 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lineupAlert}
                  onChange={(e) => setLineupAlert(e.target.checked)}
                  className="accent-emerald-500"
                />
                <span className="text-slate-700 dark:text-slate-200">{t.alerts.lineups}</span>
              </label>
              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-white/10 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mercatoAlert}
                  onChange={(e) => setMercatoAlert(e.target.checked)}
                  className="accent-emerald-500"
                />
                <span className="text-slate-700 dark:text-slate-200">{t.alerts.mercato}</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 px-4 py-2.5 text-sm font-medium text-emerald-700 dark:text-emerald-300 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>{t.alerts.saveAlert}</span>
            </button>
          </form>

          {/* Saved Alerts List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                {t.alerts.activeAlerts}
              </h4>
              <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                {alerts.length}
              </span>
            </div>

            {alerts.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 py-6 text-center border border-dashed border-slate-200 dark:border-white/10 rounded-xl">
                {t.alerts.emptyAlerts}
              </p>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-white/8 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden">
                {alerts.map((al) => (
                  <div
                    key={al.id}
                    className="flex items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-[#0B0E14]"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Bell className="w-3.5 h-3.5 text-emerald-500 shrink-0" aria-hidden="true" />
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {al.label}
                        </p>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {[
                          al.goalPush ? t.alerts.liveGoalsLabel : null,
                          al.lineupAlert ? t.alerts.lineupsLabel : null,
                          al.mercatoAlert ? t.alerts.mercatoLabel : null,
                        ]
                          .filter(Boolean)
                          .join(' · ') || t.alerts.generalAlerts}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteAlert(al.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                      aria-label={t.alerts.deleteAria(al.label)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

