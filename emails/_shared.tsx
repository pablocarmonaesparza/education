import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import type { CSSProperties, ReactNode } from 'react';

/**
 * Tokens visuales consistentes con `CLAUDE.md` adaptados a clientes de
 * correo (que no soportan tailwind ni la mayoría de pseudo-classes).
 * Depth en email se simula con `border-bottom` más grueso.
 */
export const EMAIL_COLORS = {
  primary: '#1472FF',
  primaryDark: '#0E5FCC',
  completado: '#22c55e',
  completadoDark: '#16a34a',
  textMain: '#4b4b4b',
  textMuted: '#777777',
  bgSurface: '#ffffff',
  bgPage: '#f9fafb',
  border: '#e5e7eb',
  danger: '#dc2626',
  dangerDark: '#b91c1c',
} as const;

const FONT_FAMILY =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

interface EmailLayoutProps {
  preview: string;
  children: ReactNode;
  /** Texto del footer legal. Default: "recibiste este correo porque tienes una cuenta en itera.la." */
  footer?: string;
}

/**
 * Layout base para todos los correos transaccionales de Itera. Mantiene
 * chrome consistente — header con wordmark, container con depth sutil,
 * footer legal. Cada correo específico pasa su contenido como children.
 */
export function EmailLayout({ preview, children, footer }: EmailLayoutProps) {
  const footerText =
    footer ?? 'recibiste este correo porque tienes una cuenta en itera.la.';

  return (
    <Html lang="es">
      <Head />
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: EMAIL_COLORS.bgPage,
          fontFamily: FONT_FAMILY,
          margin: 0,
          padding: '32px 0',
        }}
      >
        <Container
          style={{
            backgroundColor: EMAIL_COLORS.bgSurface,
            borderRadius: 16,
            border: `2px solid ${EMAIL_COLORS.border}`,
            borderBottom: `8px solid ${EMAIL_COLORS.border}`,
            maxWidth: 520,
            margin: '0 auto',
            padding: '40px 32px',
          }}
        >
          <Section style={{ textAlign: 'center', marginBottom: 24 }}>
            <Text
              style={{
                color: EMAIL_COLORS.primary,
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                margin: 0,
              }}
            >
              itera
            </Text>
          </Section>

          {children}

          <Hr
            style={{
              borderColor: EMAIL_COLORS.border,
              margin: '32px 0 24px 0',
            }}
          />

          <Text
            style={{
              color: EMAIL_COLORS.textMuted,
              fontSize: 12,
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            ¿dudas? respóndenos este correo o escríbenos a{' '}
            <Link
              href="mailto:hola@itera.la"
              style={{ color: EMAIL_COLORS.primary, textDecoration: 'none' }}
            >
              hola@itera.la
            </Link>
            .
          </Text>
        </Container>

        <Text
          style={{
            color: EMAIL_COLORS.textMuted,
            fontSize: 11,
            textAlign: 'center',
            margin: '16px auto 0 auto',
          }}
        >
          {footerText}
        </Text>
      </Body>
    </Html>
  );
}

interface EmailHeadingProps {
  children: ReactNode;
}

export function EmailHeading({ children }: EmailHeadingProps) {
  return (
    <Text
      style={{
        color: EMAIL_COLORS.textMain,
        fontSize: 28,
        fontWeight: 800,
        lineHeight: 1.2,
        margin: '0 0 16px 0',
        letterSpacing: '-0.02em',
      }}
    >
      {children}
    </Text>
  );
}

interface EmailParagraphProps {
  children: ReactNode;
  style?: CSSProperties;
}

export function EmailParagraph({ children, style }: EmailParagraphProps) {
  return (
    <Text
      style={{
        color: EMAIL_COLORS.textMain,
        fontSize: 16,
        lineHeight: 1.6,
        margin: '0 0 16px 0',
        ...style,
      }}
    >
      {children}
    </Text>
  );
}

interface EmailButtonProps {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'completado' | 'danger';
}

/**
 * Botón estilo "bottom-depth" que el DS usa en landing. 4px border-bottom
 * oscuro simula la profundidad sin necesidad de pseudo-classes activas
 * (que no todos los clientes de correo soportan).
 */
export function EmailButton({
  href,
  children,
  variant = 'primary',
}: EmailButtonProps) {
  const palette = {
    primary: { bg: EMAIL_COLORS.primary, border: EMAIL_COLORS.primaryDark },
    completado: {
      bg: EMAIL_COLORS.completado,
      border: EMAIL_COLORS.completadoDark,
    },
    danger: { bg: EMAIL_COLORS.danger, border: EMAIL_COLORS.dangerDark },
  }[variant];

  return (
    <Section style={{ textAlign: 'center', margin: '32px 0' }}>
      <Link
        href={href}
        style={{
          backgroundColor: palette.bg,
          color: '#ffffff',
          fontSize: 16,
          fontWeight: 700,
          padding: '14px 28px',
          borderRadius: 12,
          borderBottom: `4px solid ${palette.border}`,
          textDecoration: 'none',
          display: 'inline-block',
        }}
      >
        {children}
      </Link>
    </Section>
  );
}

interface InfoCardProps {
  children: ReactNode;
  variant?: 'neutral' | 'warning';
}

/**
 * Card gris claro para meter detalles de una transacción (monto, plan, etc.)
 * sin competir con el CTA principal.
 */
export function InfoCard({ children, variant = 'neutral' }: InfoCardProps) {
  const bg = variant === 'warning' ? '#fef3c7' : '#f3f4f6';
  const border = variant === 'warning' ? '#f59e0b' : EMAIL_COLORS.border;
  return (
    <Section
      style={{
        backgroundColor: bg,
        border: `1px solid ${border}`,
        borderRadius: 12,
        padding: '16px 20px',
        margin: '16px 0 24px 0',
      }}
    >
      {children}
    </Section>
  );
}
