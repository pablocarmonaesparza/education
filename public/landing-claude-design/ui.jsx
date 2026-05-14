// itera ui kit — espejo de components/ui/*
// componentes: Button, Card, Tag, Input, Typography, IconButton

const Button = ({ variant = "primary", size = "md", children, className = "", as = "button", ...props }) => {
  const cls = [
    "btn",
    `btn-${variant}`,
    size !== "md" && `btn-${size}`,
    className,
  ].filter(Boolean).join(" ");
  const Tag = as;
  return <Tag className={cls} {...props}>{children}</Tag>;
};

const IconButton = ({ variant = "outline", children, label, ...props }) => (
  <button className={`btn btn-${variant}`} aria-label={label} style={{ padding: 0, width: 48, minHeight: 48 }} {...props}>
    {children}
  </button>
);

const Card = ({ variant = "neutral", interactive = false, children, className = "", ...props }) => {
  const cls = [
    "card",
    variant === "primary" && "card-primary",
    variant === "completado" && "card-completado",
    variant === "flat" && "card-flat",
    interactive && "card-interactive",
    className,
  ].filter(Boolean).join(" ");
  return <div className={cls} {...props}>{children}</div>;
};

const Tag = ({ variant = "neutral", children, className = "", ...props }) => (
  <span className={`tag tag-${variant} ${className}`} {...props}>{children}</span>
);

const Input = ({ variant = "default", className = "", ...props }) => (
  <input className={`input ${className}`} {...props} />
);

// === typography ===
const Display = ({ children, className = "", ...p }) => <h1 className={`it-display ${className}`} {...p}>{children}</h1>;
const Title = ({ as: T = "h2", children, className = "", ...p }) => <T className={`it-title ${className}`} {...p}>{children}</T>;
const Subtitle = ({ children, className = "", ...p }) => <p className={`it-subtitle ${className}`} {...p}>{children}</p>;
const Headline = ({ children, className = "", ...p }) => <span className={`it-headline ${className}`} {...p}>{children}</span>;
const Body = ({ as: T = "p", children, className = "", ...p }) => <T className={`it-body ${className}`} {...p}>{children}</T>;
const BodyLg = ({ as: T = "p", children, className = "", ...p }) => <T className={`it-body-lg ${className}`} {...p}>{children}</T>;
const Caption = ({ children, className = "", ...p }) => <span className={`it-caption ${className}`} {...p}>{children}</span>;

// === icons (inline svg, stroke-based) ===
const Icon = {
  arrow: (p) => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>),
  play: (p) => (<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...p}><path d="M8 5l11 7-11 7V5z"/></svg>),
  check: (p) => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="4 12 10 18 20 6"/></svg>),
  x: (p) => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" {...p}><path d="M6 6l12 12M18 6L6 18"/></svg>),
  spark: (p) => (<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" {...p}><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z"/></svg>),
  bolt: (p) => (<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" {...p}><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/></svg>),
  menu: (p) => (<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" {...p}><path d="M4 7h16M4 12h16M4 17h16"/></svg>),
  chev: (p) => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="6 9 12 15 18 9"/></svg>),
  users: (p) => (<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>),
  rocket: (p) => (<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>),
  shield: (p) => (<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>),
};

Object.assign(window, {
  Button, IconButton, Card, Tag, Input,
  Display, Title, Subtitle, Headline, Body, BodyLg, Caption,
  Icon,
});
