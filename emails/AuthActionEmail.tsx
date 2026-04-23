import { Text } from '@react-email/components';
import {
  EMAIL_COLORS,
  EmailButton,
  EmailHeading,
  EmailLayout,
  EmailParagraph,
} from './_shared';

export type AuthActionVariant = 'signup' | 'magiclink' | 'email_change';

interface AuthActionEmailProps {
  userName?: string;
  actionUrl: string;
  variant: AuthActionVariant;
  expiresInMinutes?: number;
}

interface Copy {
  preview: string;
  heading: (firstName: string) => string;
  paragraphs: string[];
  button: string;
  disclaimer?: string;
}

const COPY: Record<AuthActionVariant, Copy> = {
  signup: {
    preview: 'confirma tu correo para activar tu cuenta en itera',
    heading: (n) => `${n}, confirma tu correo`,
    paragraphs: [
      'dale click al botón para activar tu cuenta. después de eso ya puedes entrar al dashboard.',
    ],
    button: 'confirmar correo',
    disclaimer:
      'si no te registraste en itera, ignora este correo — la cuenta no se activará.',
  },
  magiclink: {
    preview: 'tu link para entrar a itera',
    heading: (n) => `${n}, aquí está tu link`,
    paragraphs: [
      'dale click para entrar sin contraseña. el link solo funciona una vez.',
    ],
    button: 'entrar a itera',
    disclaimer: 'si no pediste este link, ignora este correo.',
  },
  email_change: {
    preview: 'confirma tu nuevo correo en itera',
    heading: (n) => `${n}, confirma tu nuevo correo`,
    paragraphs: [
      'pediste cambiar el correo asociado a tu cuenta. dale click para confirmar la nueva dirección.',
    ],
    button: 'confirmar nuevo correo',
    disclaimer:
      'si no pediste este cambio, ignora este correo — tu correo anterior sigue en uso.',
  },
};

export default function AuthActionEmail({
  userName,
  actionUrl,
  variant,
  expiresInMinutes = 60,
}: AuthActionEmailProps) {
  const firstName = userName?.split(' ')[0] ?? 'hola';
  const copy = COPY[variant];
  return (
    <EmailLayout preview={copy.preview}>
      <EmailHeading>{copy.heading(firstName)}</EmailHeading>

      {copy.paragraphs.map((p, i) => (
        <EmailParagraph key={i}>{p}</EmailParagraph>
      ))}

      <EmailButton href={actionUrl}>{copy.button}</EmailButton>

      <Text
        style={{
          color: EMAIL_COLORS.textMuted,
          fontSize: 13,
          lineHeight: 1.6,
          margin: '0 0 8px 0',
        }}
      >
        el link expira en {expiresInMinutes} minutos por seguridad.
      </Text>

      {copy.disclaimer ? (
        <Text
          style={{
            color: EMAIL_COLORS.textMuted,
            fontSize: 13,
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {copy.disclaimer}
        </Text>
      ) : null}
    </EmailLayout>
  );
}
