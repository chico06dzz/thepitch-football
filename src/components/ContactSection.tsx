import React, { useState } from 'react';
import { CheckCircle2, Mail, Send } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export const ContactSection: React.FC = () => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{ reference: string; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t.contact.errorFallback);
      } else {
        setConfirmation({ reference: data.reference, message: t.contact.sentSuccess });
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      }
    } catch {
      setError(t.contact.serverError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="contact-section"
      className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111620] p-6 sm:p-8"
      aria-label={t.contact.aria}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 space-y-4">
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            {t.contact.kicker}
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t.contact.title}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {t.contact.desc}
          </p>

          <div className="pt-2 space-y-2 text-sm">
            <a
              href="mailto:redaction@thepitch-football.com?subject=Contact%20THE%20PITCH"
              className="inline-flex items-center gap-2 font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              <Mail className="w-4 h-4" aria-hidden="true" />
              <span dir="ltr">redaction@thepitch-football.com</span>
            </a>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t.contact.responseSla}
            </p>
          </div>
        </div>

        <div className="lg:col-span-7">
          {confirmation ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                <h3 className="text-base font-bold">{t.contact.sentTitle}</h3>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-200">
                {confirmation.message} {t.contact.trackingRef}{' '}
                <span className="font-mono font-semibold" dir="ltr">
                  {confirmation.reference}
                </span>
                .
              </p>
              <button
                type="button"
                onClick={() => setConfirmation(null)}
                className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                {t.contact.sendAnother}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                    {t.contact.nameLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.contact.namePlaceholder}
                    className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B0E14] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                    {t.contact.emailLabel}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.contact.emailPlaceholder}
                    className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B0E14] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                  {t.contact.subjectLabel}
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={t.contact.subjectPlaceholder}
                  className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B0E14] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1.5">
                  {t.contact.messageLabel}
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t.contact.messagePlaceholder}
                  className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B0E14] px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
                />
              </div>

              {error && <p className="text-xs text-rose-500">{error}</p>}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <a
                  href={`mailto:redaction@thepitch-football.com?subject=${encodeURIComponent(subject || 'Contact THE PITCH')}&body=${encodeURIComponent(message)}`}
                  className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  {t.contact.openMailClient}
                </a>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-5 py-2.5 text-sm font-medium text-white transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" aria-hidden="true" />
                  <span>{submitting ? t.contact.sending : t.contact.sendBtn}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

