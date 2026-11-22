import React, { useMemo, useState } from 'react';
import { BellPlus, Check, Globe, Plus, Search, Star, Trash2, User, X } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { AppLanguage, FavoriteFilterMode, UserAlertRule, UserProfilePreferences } from '../types/football';

interface UserProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfilePreferences;
  availableClubs: string[];
  alerts: UserAlertRule[];
  onUpdateProfile: (next: UserProfilePreferences) => void;
  onSyncClubsToAlerts: (clubs: string[]) => Promise<void>;
}

export const UserProfileDrawer: React.FC<UserProfileDrawerProps> = ({
  isOpen,
  onClose,
  profile,
  availableClubs,
  alerts,
  onUpdateProfile,
  onSyncClubsToAlerts,
}) => {
  const { lang, setLang, t } = useLanguage();
  const [clubSearch, setClubSearch] = useState('');
  const [syncingAlerts, setSyncingAlerts] = useState(false);
  const [syncDone, setSyncDone] = useState(false);

  const filteredClubs = useMemo(() => {
    const q = clubSearch.trim().toLowerCase();
    const list = q
      ? availableClubs.filter((club) => club.toLowerCase().includes(q))
      : availableClubs;
    return list.slice(0, 60);
  }, [availableClubs, clubSearch]);

  if (!isOpen) return null;

  const isClubFollowed = (club: string) =>
    profile.favoriteClubs.some((c) => c.toLowerCase() === club.toLowerCase());

  const handleToggleClub = (club: string) => {
    const trimmed = club.trim();
    if (!trimmed) return;
    const exists = isClubFollowed(trimmed);
    const nextClubs = exists
      ? profile.favoriteClubs.filter((c) => c.toLowerCase() !== trimmed.toLowerCase())
      : [...profile.favoriteClubs, trimmed];

    onUpdateProfile({
      ...profile,
      favoriteClubs: nextClubs,
    });
    setSyncDone(false);
  };

  const handleAddCustomClub = (e: React.FormEvent) => {
    e.preventDefault();
    const custom = clubSearch.trim();
    if (custom.length < 2) return;
    if (!isClubFollowed(custom)) {
      onUpdateProfile({
        ...profile,
        favoriteClubs: [...profile.favoriteClubs, custom],
      });
    }
    setClubSearch('');
    setSyncDone(false);
  };

  const handleClearFavorites = () => {
    onUpdateProfile({
      ...profile,
      favoriteClubs: [],
    });
    setSyncDone(false);
  };

  const handleModeChange = (mode: FavoriteFilterMode) => {
    onUpdateProfile({
      ...profile,
      favoriteFilterMode: mode,
    });
  };

  const unalertedClubs = profile.favoriteClubs.filter(
    (club) => !alerts.some((al) => al.target.toLowerCase() === club.toLowerCase()),
  );

  const handleSyncAlerts = async () => {
    if (unalertedClubs.length === 0) return;
    setSyncingAlerts(true);
    try {
      await onSyncClubsToAlerts(unalertedClubs);
      setSyncDone(true);
    } finally {
      setSyncingAlerts(false);
    }
  };

  const trimmedQuery = clubSearch.trim();
  const canAddCustom =
    trimmedQuery.length >= 2 &&
    !availableClubs.some((c) => c.toLowerCase() === trimmedQuery.toLowerCase()) &&
    !isClubFollowed(trimmedQuery);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={t.profile.aria}
    >
      <div className="relative w-full max-w-lg h-full overflow-y-auto bg-white dark:bg-[#111620] border-s border-slate-200 dark:border-white/10 shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-white/95 dark:bg-[#111620]/95 backdrop-blur-md border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <User className="w-5 h-5 text-emerald-500" aria-hidden="true" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t.profile.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
            aria-label={t.profile.closeAria}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Language Switcher */}
          <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B0E14] p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {t.profile.languageTitle}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                FR · AR · EN
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'fr', label: 'Français' },
                  { id: 'ar', label: 'العربية' },
                  { id: 'en', label: 'English' },
                ] as { id: AppLanguage; label: string }[]
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setLang(item.id)}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    lang === item.id
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'border-slate-200 dark:border-white/10 bg-white dark:bg-[#111620] text-slate-700 dark:text-slate-200 hover:border-emerald-500/40'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.profile.languageHint}
            </p>
          </div>

          {/* Supporter Identity */}
          <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B0E14] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor="supporter-display-name"
                className="text-sm font-semibold text-slate-900 dark:text-white"
              >
                {t.profile.identityLabel}
              </label>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {t.profile.savedLocally}
              </span>
            </div>
            <input
              id="supporter-display-name"
              type="text"
              value={profile.displayName}
              maxLength={40}
              onChange={(e) =>
                onUpdateProfile({
                  ...profile,
                  displayName: e.target.value,
                })
              }
              placeholder={t.profile.identityPlaceholder}
              className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111620] px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.profile.identityHelp}
            </p>
          </div>

          {/* Display / Filter Preference */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              {t.profile.displayTitle}
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {[
                {
                  id: 'only' as const,
                  title: t.profile.modeOnlyTitle,
                  desc: t.profile.modeOnlyDesc,
                },
                {
                  id: 'prioritize' as const,
                  title: t.profile.modePrioritizeTitle,
                  desc: t.profile.modePrioritizeDesc,
                },
                {
                  id: 'all' as const,
                  title: t.profile.modeAllTitle,
                  desc: t.profile.modeAllDesc,
                },
              ].map((option) => {
                const active = profile.favoriteFilterMode === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleModeChange(option.id)}
                    className={`w-full text-start rounded-xl border p-3.5 transition-colors cursor-pointer ${
                      active
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B0E14] hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {option.title}
                      </span>
                      {active && (
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" aria-hidden="true" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {option.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Currently Followed Clubs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                {t.profile.followedTitle(profile.favoriteClubs.length)}
              </h4>
              {profile.favoriteClubs.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearFavorites}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-rose-500 cursor-pointer"
                >
                  {t.profile.clearAll}
                </button>
              )}
            </div>

            {profile.favoriteClubs.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 p-4 rounded-xl border border-dashed border-slate-200 dark:border-white/10 text-center">
                {t.profile.emptyFollowed}
              </p>
            ) : (
              <div className="space-y-3">
                <div className="divide-y divide-slate-200 dark:divide-white/8 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden">
                  {profile.favoriteClubs.map((club) => (
                    <div
                      key={club}
                      className="flex items-center justify-between gap-3 px-4 py-2.5 bg-white dark:bg-[#0B0E14]"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Star
                          className="w-4 h-4 text-emerald-500 fill-emerald-500 shrink-0"
                          aria-hidden="true"
                        />
                        <span className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {club}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleClub(club)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                        aria-label={t.profile.removeAria(club)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {unalertedClubs.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSyncAlerts}
                    disabled={syncingAlerts}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 px-4 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <BellPlus className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>
                      {syncingAlerts
                        ? t.profile.syncingAlerts
                        : t.profile.syncAlertsBtn(unalertedClubs.length)}
                    </span>
                  </button>
                )}

                {syncDone && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    {t.profile.syncDone}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Club Picker */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              {t.profile.addClubTitle}
            </h4>

            <form onSubmit={handleAddCustomClub} className="flex gap-2">
              <div className="relative flex-1">
                <Search
                  className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={clubSearch}
                  onChange={(e) => setClubSearch(e.target.value)}
                  placeholder={t.profile.searchPlaceholder}
                  className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B0E14] ps-9 pe-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>
              {canAddCustom && (
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-xs font-semibold text-white whitespace-nowrap cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{t.profile.addBtn}</span>
                </button>
              )}
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pe-1">
              {filteredClubs.map((club) => {
                const followed = isClubFollowed(club);
                return (
                  <button
                    key={club}
                    type="button"
                    onClick={() => handleToggleClub(club)}
                    className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border text-start text-xs font-medium transition-colors cursor-pointer ${
                      followed
                        ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B0E14] text-slate-700 dark:text-slate-200 hover:border-emerald-500/40'
                    }`}
                  >
                    <span className="truncate">{club}</span>
                    <Star
                      className={`w-3.5 h-3.5 shrink-0 ${
                        followed
                          ? 'text-emerald-500 fill-emerald-500'
                          : 'text-slate-300 dark:text-slate-600'
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

