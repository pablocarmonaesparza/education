import { Text } from '@react-email/components';
import {
  EMAIL_COLORS,
  EmailButton,
  EmailHeading,
  EmailLayout,
  EmailParagraph,
} from './_shared';

interface PasswordResetEmailProps {
  userName?: string;
  resetUrl: string;
  /** Minutos antes de que el link expire. Por default 60min (Supabase default). */
  expiresInMinutes?: number;
}

export default function PasswordResetEmail({
  userName,
  resetUrl,
  expiresInMinutes = 60,
}: PasswordResetEmailProps) {
  const firstName = userName?.split(' ')[0] ?? 'hola';
  return (
    <EmailLayout preview="restablece tu contraseña de itera">
      <EmailHeading>{firstName}, restablece tu contraseña</EmailHeading>

      <EmailParagraph>
        recibimos una solicitud para cambiar la contraseña de tu cuenta.
        haz click en el botón de abajo para elegir una nueva.
      </EmailParagraph>

      <EmailButton href={resetUrl}>cambiar contraseña</EmailButton>

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

      <Text
        style={{
          color: EMAIL_COLORS.textMuted,
          fontSize: 13,
          lineHeight: 1.6,
          margin: '0 0 8px 0',
        }}
      >
        si no pediste este cambio, ignora este correo — tu contraseña
        actual sigue intacta.
      </Text>
    </EmailLayout>
  );
}
