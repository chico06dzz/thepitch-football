import React, { useEffect, useState } from 'react';
import { MessageSquare, Send, ThumbsUp } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { SupporterComment } from '../types/football';
import { loadUserProfile } from '../utils/favoriteClubs';

interface SupporterCommentsProps {
  targetType: SupporterComment['targetType'];
  targetId: string;
  comments: SupporterComment[];
  onAddComment: (payload: {
    targetType: SupporterComment['targetType'];
    targetId: string;
    author: string;
    clubSupport?: string;
    content: string;
  }) => Promise<void>;
  onLikeComment: (commentId: string) => Promise<void>;
  title?: string;
}

export const SupporterComments: React.FC<SupporterCommentsProps> = ({
  targetType,
  targetId,
  comments,
  onAddComment,
  onLikeComment,
  title,
}) => {
  const { t, locale } = useLanguage();
  const [author, setAuthor] = useState(() => loadUserProfile().displayName);
  const [clubSupport, setClubSupport] = useState(
    () => loadUserProfile().favoriteClubs[0] ?? '',
  );
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const syncFromProfile = () => {
      const profile = loadUserProfile();
      setAuthor((prev) => (prev.trim() ? prev : profile.displayName));
      setClubSupport((prev) => (prev.trim() ? prev : profile.favoriteClubs[0] ?? ''));
    };
    window.addEventListener('thepitch:profile-updated', syncFromProfile);
    return () => window.removeEventListener('thepitch:profile-updated', syncFromProfile);
  }, []);

  const filtered = comments.filter((c) => c.targetId === targetId && c.targetType === targetType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim().length < 2) {
      setError(t.comments.minLengthError);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onAddComment({
        targetType,
        targetId,
        author: author.trim() || 'Supporter',
        clubSupport: clubSupport.trim() || undefined,
        content: content.trim(),
      });
      setContent('');
    } catch {
      setError(t.comments.submitError);
    } finally {
      setSubmitting(false);
    }
  };

  const formatRelativeTime = (iso: string) => {
    const diffMs = Date.now() - new Date(iso).getTime();
    const mins = Math.max(1, Math.floor(diffMs / 60000));
    if (mins < 2) return t.comments.justNow;
    if (mins < 60) return t.comments.minsAgo(mins);
    const hours = Math.floor(mins / 60);
    if (hours < 24) return t.comments.hoursAgo(hours);
    return new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'short' });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-emerald-500" aria-hidden="true" />
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {title ?? t.comments.defaultTitle}
          </h4>
        </div>
        <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
          {t.comments.reactionsCount(filtered.length)}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            maxLength={40}
            placeholder={t.comments.authorPlaceholder}
            className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B0E14] px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
          <input
            type="text"
            value={clubSupport}
            onChange={(e) => setClubSupport(e.target.value)}
            maxLength={40}
            placeholder={t.comments.clubPlaceholder}
            className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B0E14] px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={2}
            maxLength={600}
            placeholder={t.comments.contentPlaceholder}
            className="flex-1 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B0E14] px-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
          />
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-4 py-2.5 text-sm font-medium text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4" aria-hidden="true" />
            <span>{submitting ? t.comments.sending : t.comments.publish}</span>
          </button>
        </div>
        {error && <p className="text-xs text-rose-500">{error}</p>}
      </form>

      {filtered.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400 py-4 text-center border border-dashed border-slate-200 dark:border-white/10 rounded-lg">
          {t.comments.empty}
        </p>
      ) : (
        <div className="divide-y divide-slate-200 dark:divide-white/8">
          {filtered.map((comment) => (
            <div key={comment.id} className="py-3.5 space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 min-w-0">
                  <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {comment.author}
                  </span>
                  {comment.clubSupport && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium truncate">
                        {comment.clubSupport}
                      </span>
                    </>
                  )}
                  <span aria-hidden="true">·</span>
                  <span className="whitespace-nowrap">{formatRelativeTime(comment.createdAt)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onLikeComment(comment.id)}
                  className="inline-flex items-center gap-1.5 text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
                  aria-label={t.comments.likeAria(comment.author)}
                >
                  <ThumbsUp className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{comment.likes}</span>
                </button>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

