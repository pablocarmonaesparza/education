'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import IconButton from '@/components/ui/IconButton';
import Button from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Input';
import { Caption, Headline } from '@/components/ui/Typography';
import { FLAG_REASON_LABEL, type SlideFlagReason } from '@/lib/analytics/types';

const REASON_ORDER: SlideFlagReason[] = [
  'wrong_correct_answer',
  'wrong_incorrect_answer',
  'unclear_explanation',
  'typo_or_grammar',
  'visual_issue',
  'other',
];

type Props = {
  slideId?: string;
  lectureId?: string;
  /** Snapshot del intento del usuario al momento de flagear. Útil para
   * que triage interno pueda reproducir el caso. */
  userAttempt?: unknown;
};

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

export default function SlideFlagButton({
  slideId,
  lectureId,
  userAttempt,
}: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<SlideFlagReason | null>(null);
  const [comment, setComment] = useState('');
  const [state, setState] = useState<SubmitState>('idle');

  // Sin id de slide no podemos reportar nada — esto pasa en demo (DEFAULT_STEPS)
  // o si la página upstream no propaga el uuid.
  if (!slideId) return null;

  const reset = () => {
    setOpen(false);
    setReason(null);
    setComment('');
    setState('idle');
  };

  const submit = async () => {
    if (!reason) return;
    setState('submitting');
    try {
      const res = await fetch(`/api/slides/${slideId}/flag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason,
          comment: comment.trim() || null,
          lecture_id: lectureId ?? null,
          user_attempt: userAttempt ?? null,
        }),
      });
      if (!res.ok && res.status !== 201) {
        const body = await res.json().catch(() => ({}));
        console.error('[flag] insert failed:', res.status, body);
        setState('error');
        return;
      }
      setState('success');
      // Auto-cerrar tras un beat para que el usuario vea el ack.
      setTimeout(reset, 1200);
    } catch (err) {
      console.error('[flag] network error:', err);
      setState('error');
    }
  };

  return (
    <>
      <IconButton
        variant="outline"
        aria-label="Reportar problema en este slide"
        onClick={() => setOpen(true)}
        className="w-[50px] h-[50px]"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.2}
            d="M4 4v16M4 4h12.5l-2 4 2 4H4"
          />
        </svg>
      </IconButton>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 px-4 py-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={reset}
          >
            <motion.div
              className="w-full max-w-md bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-900 rounded-2xl p-6 shadow-xl"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Headline>reportar problema</Headline>
              <Caption>
                ¿qué pasa con este slide? esto nos ayuda a mejorarlo.
              </Caption>

              <div className="mt-4 space-y-2">
                {REASON_ORDER.map((r) => {
                  const selected = reason === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setReason(r)}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-colors ${
                        selected
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-gray-200 dark:border-gray-900 text-ink dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700'
                      }`}
                    >
                      <span className="text-sm font-medium">
                        {FLAG_REASON_LABEL[r]}
                      </span>
                    </button>
                  );
                })}
              </div>

              {reason === 'other' && (
                <div className="mt-3">
                  <Textarea
                    placeholder="cuéntanos qué pasa (máx 500 caracteres)"
                    value={comment}
                    onChange={(e) => setComment(e.target.value.slice(0, 500))}
                    rows={3}
                  />
                </div>
              )}

              {state === 'error' && (
                <p className="mt-3 text-sm text-red-600 dark:text-red-400">
                  no se pudo enviar el reporte. intenta de nuevo.
                </p>
              )}
              {state === 'success' && (
                <p className="mt-3 text-sm text-green-600 dark:text-green-400">
                  gracias, lo revisamos.
                </p>
              )}

              <div className="mt-5 flex justify-end gap-3">
                <Button variant="ghost" onClick={reset} disabled={state === 'submitting'}>
                  cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={submit}
                  disabled={!reason || state === 'submitting' || state === 'success'}
                >
                  {state === 'submitting' ? 'enviando…' : 'enviar'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
