import { Text } from '@react-email/components';
import {
  EMAIL_COLORS,
  EmailButton,
  EmailHeading,
  EmailLayout,
  EmailParagraph,
} from './_shared';

interface FirstLessonEmailProps {
  userName: string;
  lessonTitle: string;
  nextLessonUrl: string;
  nextLessonTitle?: string;
}

export default function FirstLessonEmail({
  userName,
  lessonTitle,
  nextLessonUrl,
  nextLessonTitle,
}: FirstLessonEmailProps) {
  const firstName = userName?.split(' ')[0] ?? 'hola';
  return (
    <EmailLayout preview="acabas de completar tu primera lección en itera">
      <EmailHeading>{firstName}, lo hiciste</EmailHeading>

      <EmailParagraph>
        terminaste tu primera lección: <strong>{lessonTitle}</strong>.
      </EmailParagraph>

      <EmailParagraph>
        el formato funciona así: lecciones cortas, ejercicios que puedes
        aplicar el mismo día, cero relleno. el siguiente paso ya está listo.
      </EmailParagraph>

      <EmailButton href={nextLessonUrl} variant="completado">
        {nextLessonTitle ? `ir a ${nextLessonTitle}` : 'siguiente lección'}
      </EmailButton>

      <Text
        style={{
          color: EMAIL_COLORS.textMuted,
          fontSize: 13,
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        consejo: el mayor salto de retención ocurre cuando aplicas lo de
        la lección en las próximas 24 horas. aunque sea una versión chica.
      </Text>
    </EmailLayout>
  );
}
