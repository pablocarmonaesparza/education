import { Text } from '@react-email/components';
import {
  EMAIL_COLORS,
  EmailButton,
  EmailHeading,
  EmailLayout,
  EmailParagraph,
} from './_shared';

interface WelcomeEmailProps {
  userName: string;
  dashboardUrl: string;
}

export default function WelcomeEmail({
  userName,
  dashboardUrl,
}: WelcomeEmailProps) {
  const firstName = userName.split(' ')[0] || 'hola';
  return (
    <EmailLayout preview="bienvenido a itera — tu proyecto arranca hoy">
      <EmailHeading>{firstName}, bienvenido a itera</EmailHeading>

      <EmailParagraph>
        ya te inscribiste. ahora empieza lo bueno: aprender ia aplicada a
        <strong> tu proyecto</strong>, con ejercicios cortos y sin teoría de
        relleno.
      </EmailParagraph>

      <EmailParagraph>
        el método es simple: <strong>retención + ejecución</strong>. cada
        lección dura pocos minutos y termina con algo que ya puedes usar.
      </EmailParagraph>

      <EmailButton href={dashboardUrl}>entrar al dashboard</EmailButton>

      <Text
        style={{
          color: EMAIL_COLORS.textMuted,
          fontSize: 13,
          lineHeight: 1.6,
          margin: '0 0 8px 0',
          fontWeight: 700,
        }}
      >
        siguientes pasos:
      </Text>
      <Text
        style={{
          color: EMAIL_COLORS.textMuted,
          fontSize: 13,
          lineHeight: 1.8,
          margin: 0,
        }}
      >
        1. describe tu proyecto para generar tu ruta personalizada
        <br />
        2. completa la primera lección (5-10 min)
        <br />
        3. aplica lo aprendido en las próximas 24 horas
      </Text>
    </EmailLayout>
  );
}
