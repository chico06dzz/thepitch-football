import React from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { NewsArticle, SupporterComment } from '../types/football';
import { SupporterComments } from './SupporterComments';

interface ArticleReaderDrawerProps {
  article: NewsArticle | null;
  comments: SupporterComment[];
  onClose: () => void;
  onAddComment: (payload: {
    targetType: SupporterComment['targetType'];
    targetId: string;
    author: string;
    clubSupport?: string;
    content: string;
  }) => Promise<void>;
  onLikeComment: (commentId: string) => Promise<void>;
}

export const ArticleReaderDrawer: React.FC<ArticleReaderDrawerProps> = ({
  article,
  comments,
  onClose,
  onAddComment,
  onLikeComment,
}) => {
  const { t } = useLanguage();
  if (!article) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={article.title}
    >
      <div className="relative w-full max-w-2xl h-full overflow-y-auto bg-white dark:bg-[#111620] border-s border-slate-200 dark:border-white/10 shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-6 py-4 bg-white/95 dark:bg-[#111620]/95 backdrop-blur-md border-b border-slate-200 dark:border-white/10">
          <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {article.category} · {article.publishedAt}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
            aria-label={t.article.closeAria}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <article className="p-6 sm:p-8 space-y-6">
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              {article.title}
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {article.subtitle}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {article.author} · {article.readTime}
            </p>
          </div>

          <figure className="space-y-2">
            <div className="aspect-[16/9] rounded-xl overflow-hidden bg-slate-900">
              <img
                src={article.imageUrl}
                alt={article.title}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const fallback =
                    article.fallbackImageUrl ||
                    '/src/assets/images/editorial_match_action_1795348261245.jpg';
                  if (e.currentTarget.src !== fallback && !e.currentTarget.src.endsWith(fallback)) {
                    e.currentTarget.src = fallback;
                  }
                }}
                className="w-full h-full object-cover"
              />
            </div>
            <figcaption className="text-xs text-slate-500 dark:text-slate-400 italic">
              {article.imageCaption}
            </figcaption>
          </figure>

          <div className="space-y-4 max-w-prose text-[15px] sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
            {article.body.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {article.sourceUrl && (
            <div>
              <a
                href={article.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <span>{t.article.readSource}</span>
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
          )}

          <div className="pt-6 border-t border-slate-200 dark:border-white/10">
            <SupporterComments
              targetType="article"
              targetId={article.id}
              comments={comments}
              onAddComment={onAddComment}
              onLikeComment={onLikeComment}
              title={t.article.reactionsTitle}
            />
          </div>
        </article>
      </div>
    </div>
  );
};

