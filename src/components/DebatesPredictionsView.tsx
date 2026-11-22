import React, { useState } from 'react';
import { MessageSquare, Plus, Trophy } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import {
  getLocalizedCompetitionLabel,
  getLocalizedDebateContent,
} from '../i18n/translations';
import {
  DebateTopic,
  FootballMatch,
  PredictionVoteCounts,
  SupporterComment,
} from '../types/football';
import { SupporterComments } from './SupporterComments';
import { TeamLogo } from './TeamLogo';

interface DebatesPredictionsViewProps {
  debates: DebateTopic[];
  matches: FootballMatch[];
  predictions: PredictionVoteCounts[];
  userVotes: Record<string, string>;
  userPredictions: Record<string, 'home' | 'draw' | 'away'>;
  comments: SupporterComment[];
  onCreateDebate: (payload: {
    title: string;
    description: string;
    author: string;
    options: string[];
  }) => Promise<void>;
  onVoteDebate: (debateId: string, optionId: string) => Promise<void>;
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

export const DebatesPredictionsView: React.FC<DebatesPredictionsViewProps> = ({
  debates,
  matches,
  predictions,
  userVotes,
  userPredictions,
  comments,
  onCreateDebate,
  onVoteDebate,
  onVotePrediction,
  onAddComment,
  onLikeComment,
}) => {
  const { lang, t } = useLanguage();
  const [showNewDebate, setShowNewDebate] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState('');
  const [opt1, setOpt1] = useState('');
  const [opt2, setOpt2] = useState('');
  const [opt3, setOpt3] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [openCommentsId, setOpenCommentsId] = useState<string>(debates[0]?.id ?? '');

  const predictableMatches = matches.filter((m) => m.status !== 'finished');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const options = [opt1.trim(), opt2.trim(), opt3.trim()].filter(Boolean);
    if (title.trim().length < 5 || options.length < 2) {
      setError(t.debates.formError);
      return;
    }
    setError(null);
    await onCreateDebate({
      title: title.trim(),
      description: description.trim(),
      author: author.trim() || 'Supporter',
      options,
    });
    setTitle('');
    setDescription('');
    setOpt1('');
    setOpt2('');
    setOpt3('');
    setShowNewDebate(false);
  };

  return (
    <section className="space-y-8" aria-label={t.debates.aria}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111620] overflow-hidden">
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between gap-6">
          <div className="space-y-2">
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              {t.debates.kicker}
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t.debates.title}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              {t.debates.desc}
            </p>
          </div>
          <div>
            <button
              type="button"
              onClick={() => setShowNewDebate((prev) => !prev)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-sm font-medium text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>{showNewDebate ? t.debates.closeForm : t.debates.startDebate}</span>
            </button>
          </div>
        </div>
        <div className="lg:col-span-5 relative min-h-[200px] bg-slate-900">
          <img
            src="/src/assets/images/editorial_supporters_stands_1795348260566.jpg"
            alt={t.debates.bannerAlt}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
          <p className="absolute bottom-4 start-4 end-4 text-xs text-slate-200">
            {t.debates.bannerCaption}
          </p>
        </div>
      </div>

      {showNewDebate && (
        <form
          onSubmit={handleCreate}
          className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111620] p-6 space-y-4"
        >
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {t.debates.formTitle}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={160}
              placeholder={t.debates.qPlaceholder}
              className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B0E14] px-3 py-2.5 text-sm text-slate-900 dark:text-white"
            />
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              maxLength={40}
              placeholder={t.debates.authorPlaceholder}
              className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B0E14] px-3 py-2.5 text-sm text-slate-900 dark:text-white"
            />
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            maxLength={500}
            placeholder={t.debates.descPlaceholder}
            className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B0E14] px-3 py-2.5 text-sm text-slate-900 dark:text-white resize-none"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              value={opt1}
              onChange={(e) => setOpt1(e.target.value)}
              maxLength={90}
              placeholder={t.debates.opt1Placeholder}
              className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B0E14] px-3 py-2 text-sm text-slate-900 dark:text-white"
            />
            <input
              type="text"
              value={opt2}
              onChange={(e) => setOpt2(e.target.value)}
              maxLength={90}
              placeholder={t.debates.opt2Placeholder}
              className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B0E14] px-3 py-2 text-sm text-slate-900 dark:text-white"
            />
            <input
              type="text"
              value={opt3}
              onChange={(e) => setOpt3(e.target.value)}
              maxLength={90}
              placeholder={t.debates.opt3Placeholder}
              className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B0E14] px-3 py-2 text-sm text-slate-900 dark:text-white"
            />
          </div>
          {error && <p className="text-xs text-rose-500">{error}</p>}
          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-5 py-2 text-sm font-medium text-white cursor-pointer"
            >
              {t.debates.publishDebate}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Debates Column */}
        <div className="xl:col-span-7 space-y-5">
          {debates.map((rawDebate) => {
            const debate = getLocalizedDebateContent(rawDebate, lang);
            const totalVotes = debate.options.reduce((acc, opt) => acc + opt.votes, 0);
            const votedOptionId = userVotes[debate.id];
            const debateComments = comments.filter(
              (c) => c.targetType === 'debate' && c.targetId === debate.id,
            );
            const isExpanded = openCommentsId === debate.id;

            return (
              <article
                key={debate.id}
                className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111620] p-6 space-y-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span>{t.debates.proposedBy(debate.author)}</span>
                    <span className="font-mono tabular-nums">{t.debates.votesCount(totalVotes)}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {debate.title}
                  </h3>
                  {debate.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {debate.description}
                    </p>
                  )}
                </div>

                <div className="space-y-2.5">
                  {debate.options.map((opt) => {
                    const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                    const isSelected = votedOptionId === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => onVoteDebate(debate.id, opt.id)}
                        className={`relative w-full text-start rounded-lg border overflow-hidden px-4 py-3 transition-colors cursor-pointer ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500/10'
                            : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50 dark:bg-[#0B0E14]'
                        }`}
                      >
                        <div
                          className="absolute inset-y-0 start-0 bg-emerald-500/15 transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                        <div className="relative flex items-center justify-between gap-4 text-sm">
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            {opt.label}
                          </span>
                          <span className="font-mono tabular-nums text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                            {pct}%
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-white/8">
                  <button
                    type="button"
                    onClick={() => setOpenCommentsId(isExpanded ? '' : debate.id)}
                    className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-500 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>
                      {isExpanded
                        ? t.debates.hideDiscussion
                        : t.debates.seeArguments(debateComments.length)}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="mt-4">
                      <SupporterComments
                        targetType="debate"
                        targetId={debate.id}
                        comments={comments}
                        onAddComment={onAddComment}
                        onLikeComment={onLikeComment}
                        title={t.debates.supporterArgumentsTitle}
                      />
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {/* Predictions Grille Column */}
        <div className="xl:col-span-5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111620] p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-emerald-500" aria-hidden="true" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {t.debates.predictionsTitle}
              </h3>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t.debates.liveTrends}
            </span>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-white/8">
            {predictableMatches.map((m) => {
              const pred = predictions.find((p) => p.matchId === m.id) ?? {
                matchId: m.id,
                homeVotes: 1,
                drawVotes: 1,
                awayVotes: 1,
              };
              const total = pred.homeVotes + pred.drawVotes + pred.awayVotes || 1;
              const hPct = Math.round((pred.homeVotes / total) * 100);
              const dPct = Math.round((pred.drawVotes / total) * 100);
              const aPct = Math.max(0, 100 - hPct - dPct);
              const picked = userPredictions[m.id];

              return (
                <div key={m.id} className="py-4 first:pt-0 last:pb-0 space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>
                      {getLocalizedCompetitionLabel(m.competitionId, m.competitionName, lang)}
                    </span>
                    <span className="font-mono tabular-nums" dir="ltr">
                      {m.status === 'live' ? `${m.minute}'` : m.kickoffTime}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => onVotePrediction(m.id, 'home')}
                      className={`py-2 px-2.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                        picked === 'home'
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B0E14] text-slate-800 dark:text-slate-200 hover:border-emerald-500/40'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1.5 min-w-0">
                        <TeamLogo
                          name={m.homeTeam.name}
                          code={m.homeTeam.code}
                          logo={m.homeTeam.logo}
                          accentColor={m.homeTeam.accentColor}
                          size="xs"
                        />
                        <span className="truncate">{m.homeTeam.shortName}</span>
                      </div>
                      <div className="font-mono tabular-nums font-bold mt-0.5">{hPct}%</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => onVotePrediction(m.id, 'draw')}
                      className={`py-2 px-2.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                        picked === 'draw'
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B0E14] text-slate-800 dark:text-slate-200 hover:border-emerald-500/40'
                      }`}
                    >
                      <div>{t.debates.drawShort}</div>
                      <div className="font-mono tabular-nums font-bold mt-0.5">{dPct}%</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => onVotePrediction(m.id, 'away')}
                      className={`py-2 px-2.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                        picked === 'away'
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B0E14] text-slate-800 dark:text-slate-200 hover:border-emerald-500/40'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1.5 min-w-0">
                        <TeamLogo
                          name={m.awayTeam.name}
                          code={m.awayTeam.code}
                          logo={m.awayTeam.logo}
                          accentColor={m.awayTeam.accentColor}
                          size="xs"
                        />
                        <span className="truncate">{m.awayTeam.shortName}</span>
                      </div>
                      <div className="font-mono tabular-nums font-bold mt-0.5">{aPct}%</div>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
