import React, { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, MessageSquare, Search, Star } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { getLocalizedTransferCategory } from '../i18n/translations';
import { FavoriteFilterMode, SupporterComment, TransferItem } from '../types/football';
import {
  prioritizeAndFilterTransfers,
  transferInvolvesFavorite,
} from '../utils/favoriteClubs';
import { SupporterComments } from './SupporterComments';

interface MercatoViewProps {
  transfers: TransferItem[];
  comments: SupporterComment[];
  favoriteClubs: string[];
  favoriteFilterMode: FavoriteFilterMode;
  onChangeFavoriteFilterMode: (mode: FavoriteFilterMode) => void;
  onAddComment: (payload: {
    targetType: SupporterComment['targetType'];
    targetId: string;
    author: string;
    clubSupport?: string;
    content: string;
  }) => Promise<void>;
  onLikeComment: (commentId: string) => Promise<void>;
}

export const MercatoView: React.FC<MercatoViewProps> = ({
  transfers,
  comments,
  favoriteClubs,
  favoriteFilterMode,
  onChangeFavoriteFilterMode,
  onAddComment,
  onLikeComment,
}) => {
  const { lang, t } = useLanguage();
  const [categoryFilter, setCategoryFilter] = useState<'all' | TransferItem['category']>('all');
  const [search, setSearch] = useState('');

  const { items: scopedTransfers } = useMemo(
    () => prioritizeAndFilterTransfers(transfers, favoriteClubs, favoriteFilterMode),
    [transfers, favoriteClubs, favoriteFilterMode],
  );

  const [selectedTransfer, setSelectedTransfer] = useState<TransferItem | null>(
    scopedTransfers[0] ?? null,
  );

  useEffect(() => {
    if (
      scopedTransfers.length > 0 &&
      (!selectedTransfer || !scopedTransfers.some((item) => item.id === selectedTransfer.id))
    ) {
      setSelectedTransfer(scopedTransfers[0]);
    }
  }, [scopedTransfers, selectedTransfer]);

  useEffect(() => {
    if (selectedTransfer) {
      const updated = scopedTransfers.find((item) => item.id === selectedTransfer.id);
      if (updated && updated.headline !== selectedTransfer.headline) {
        setSelectedTransfer(updated);
      }
    }
  }, [scopedTransfers, selectedTransfer]);

  const filtered = scopedTransfers.filter((tr) => {
    const matchesCat = categoryFilter === 'all' || tr.category === categoryFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      tr.headline.toLowerCase().includes(q) ||
      tr.summary.toLowerCase().includes(q) ||
      tr.competitionLabel.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  return (
    <section className="space-y-8" aria-label={t.mercato.aria}>
      {/* Mercato Editorial Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111620] overflow-hidden">
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              {t.mercato.kicker}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t.mercato.title}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              {t.mercato.desc}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search
                className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.mercato.searchPlaceholder}
                className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B0E14] ps-9 pe-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-[#0B0E14] border border-slate-200 dark:border-white/8">
              {[
                { id: 'all', label: t.mercato.filterAll },
                { id: 'Officiel / Transfert', label: t.mercato.filterOfficial },
                { id: 'Mercato & Rumeurs', label: t.mercato.filterRumors },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCategoryFilter(tab.id as typeof categoryFilter)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap cursor-pointer ${
                    categoryFilter === tab.id
                      ? 'bg-white dark:bg-[#1A2231] text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 relative min-h-[220px] bg-slate-900">
          <img
            src="/src/assets/images/mercato_tunnel_view_1795287057654.jpg"
            alt={t.mercato.bannerAlt}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
          <p className="absolute bottom-4 start-4 end-4 text-xs text-slate-200">
            {t.mercato.bannerCaption}
          </p>
        </div>
      </div>

      {/* Transfers List + Selected Transfer Detail */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        <div className="xl:col-span-7 divide-y divide-slate-200 dark:divide-white/8 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111620] overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-8 text-sm text-center text-slate-500 dark:text-slate-400 space-y-3">
              <p>
                {favoriteClubs.length > 0 && favoriteFilterMode === 'only'
                  ? t.mercato.noFavTransfers
                  : t.mercato.noSearchTransfers}
              </p>
              {favoriteClubs.length > 0 && favoriteFilterMode === 'only' && (
                <button
                  type="button"
                  onClick={() => onChangeFavoriteFilterMode('prioritize')}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 text-xs font-semibold text-white cursor-pointer"
                >
                  {t.mercato.showAllMercato}
                </button>
              )}
            </div>
          ) : (
            filtered.map((tr) => {
              const isSelected = selectedTransfer?.id === tr.id;
              const commentCount = comments.filter((c) => c.targetId === tr.id).length;
              const isFav = transferInvolvesFavorite(tr, favoriteClubs);
              return (
                <button
                  key={tr.id}
                  type="button"
                  onClick={() => setSelectedTransfer(tr)}
                  className={`w-full text-start p-5 transition-colors cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-emerald-500/[0.06] dark:bg-emerald-500/[0.08]'
                      : 'hover:bg-slate-50 dark:hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      {isFav && (
                        <Star
                          className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500 shrink-0"
                          aria-label={t.matchesView.favClubAria}
                        />
                      )}
                      <span
                        className={
                          tr.category === 'Officiel / Transfert'
                            ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                            : 'text-amber-600 dark:text-amber-400 font-semibold'
                        }
                      >
                        {getLocalizedTransferCategory(tr.category, lang)}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{tr.competitionLabel}</span>
                    </div>
                    <span className="font-mono tabular-nums">{tr.publishedAt}</span>
                  </div>

                  <div className="flex gap-4 items-start">
                    {(tr.imageUrl || tr.fallbackImageUrl) && (
                      <div className="w-24 h-16 sm:w-28 sm:h-20 rounded-lg overflow-hidden bg-slate-900 shrink-0">
                        <img
                          src={tr.imageUrl || tr.fallbackImageUrl}
                          alt={tr.headline}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const fallback =
                              tr.fallbackImageUrl ||
                              '/src/assets/images/mercato_tunnel_view_1795287057654.jpg';
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
                    )}
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                        {tr.headline}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                        {tr.summary}
                      </p>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
                      {t.mercato.supporterViews(commentCount)}
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      {t.mercato.reactToStory}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Selected Transfer Detail & Comments */}
        <div className="xl:col-span-5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111620] p-6 space-y-6">
          {selectedTransfer ? (
            <>
              <div className="space-y-3 border-b border-slate-200 dark:border-white/10 pb-4">
                {(selectedTransfer.imageUrl || selectedTransfer.fallbackImageUrl) && (
                  <div className="aspect-[16/9] rounded-lg overflow-hidden bg-slate-900">
                    <img
                      src={selectedTransfer.imageUrl || selectedTransfer.fallbackImageUrl}
                      alt={selectedTransfer.headline}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const fallback =
                          selectedTransfer.fallbackImageUrl ||
                          '/src/assets/images/mercato_tunnel_view_1795287057654.jpg';
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
                )}
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  {getLocalizedTransferCategory(selectedTransfer.category, lang)} ·{' '}
                  {selectedTransfer.publishedAt}
                </p>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-snug">
                  {selectedTransfer.headline}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedTransfer.summary}
                </p>
                {selectedTransfer.sourceUrl && (
                  <a
                    href={selectedTransfer.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline pt-1"
                  >
                    <span>{t.mercato.readFullWire}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </a>
                )}
              </div>

              <SupporterComments
                targetType="transfer"
                targetId={selectedTransfer.id}
                comments={comments}
                onAddComment={onAddComment}
                onLikeComment={onLikeComment}
                title={t.mercato.commentsTitle}
              />
            </>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t.mercato.selectPrompt}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
