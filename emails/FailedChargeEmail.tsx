import { Text } from '@react-email/components';
import {
  EMAIL_COLORS,
  EmailButton,
  EmailHeading,
  EmailLayout,
  EmailParagraph,
  InfoCard,
} from './_shared';

interface FailedChargeEmailProps {
  userName?: string;
  /** Monto en unidad menor (centavos). */
  amountCents: number;
  currency: string;
  /** ISO string de cuando Stripe intentará de nuevo. null = no hay reintento automático. */
  nextAttemptIso?: string | null;
  /** URL al portal de billing para actualizar la tarjeta. */
  updatePaymentUrl: string;
  attemptCount?: number | null;
}

function formatAmount(amountCents: number, currency: string): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  });
  return formatter.format(amountCents / 100);
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
    });
  } catch {
    return iso;
  }
}

export default function FailedChargeEmail({
  userName,
  amountCents,
  currency,
  nextAttemptIso,
  updatePaymentUrl,
  attemptCount,
}: FailedChargeEmailProps) {
  const firstName = userName?.split(' ')[0] ?? 'hola';
  const amount = formatAmount(amountCents, currency);
  return (
    <EmailLayout preview="no pudimos cobrar tu suscripción de itera">
      <EmailHeading>{firstName}, tu pago no se procesó</EmailHeading>

      <EmailParagraph>
        intentamos cobrar <strong>{amount} {currency.toUpperCase()}</strong> a
        tu método de pago y el banco lo rechazó. tu acceso sigue activo por
        ahora — necesitamos que actualices tu tarjeta para mantenerlo.
      </EmailParagraph>

      <InfoCard variant="warning">
        <Text
          style={{
            color: EMAIL_COLORS.textMain,
            fontSize: 14,
            lineHeight: 1.8,
            margin: 0,
          }}
        >
          <strong>causas comunes:</strong> fondos insuficientes, tarjeta
          vencida, o el banco bloqueó el cargo por seguridad. en la mayoría
          de casos se resuelve actualizando la tarjeta.
          {nextAttemptIso ? (
            <>
              <br />
              <br />
              <strong>próximo intento automático:</strong>{' '}
              {formatDate(nextAttemptIso)}.
            </>
          ) : null}
          {attemptCount && attemptCount > 1 ? (
            <>
              <br />
              <strong>intentos hasta ahora:</strong> {attemptCount}
            </>
          ) : null}
        </Text>
      </InfoCard>

      <EmailButton href={updatePaymentUrl} variant="danger">
        actualizar método de pago
      </EmailButton>

      <Text
        style={{
          color: EMAIL_COLORS.textMuted,
          fontSize: 13,
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        si no logras resolverlo, responde este correo y lo vemos juntos.
      </Text>
    </EmailLayout>
  );
}
