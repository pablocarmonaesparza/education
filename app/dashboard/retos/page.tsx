import { redirect } from 'next/navigation';

/**
 * Retos feature was deprecated. The tables `user_exercises` and
 * `exercise_progress` were dropped in migration 000_nuke_legacy and never
 * rebuilt on the schema v1. The lesson `evaluate` slides already cover the
 * "practicar lo que aprendes" intent.
 *
 * Keep this file as a redirect so any stale bookmark/external link lands on
 * the dashboard instead of a 404.
 */
export default function RetosPage() {
  redirect('/dashboard');
}
