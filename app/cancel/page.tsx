import { redirect } from 'next/navigation';

/**
 * Legacy cancel route. The new Stripe checkout sends users back to
 * /checkout?canceled=1 so they land in the in-onboarding paywall.
 */
export default function CancelPage() {
  redirect('/checkout?canceled=1');
}
