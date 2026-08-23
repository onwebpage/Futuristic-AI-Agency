/**
 * Thinkatic Design System — Typography
 *
 * A strict type scale built on Satoshi. Use these components everywhere
 * instead of raw Tailwind classes so the scale stays consistent.
 *
 * Scale:
 *   Display    → hero / massive brand moments
 *   H1–H4      → page / section / card headings
 *   Body       → prose content (lg / base / sm)
 *   Label      → UI labels, eyebrows, captions
 *   Mono       → numbers, codes, metadata
 */

import { type ReactNode, type ElementType } from 'react';
import { cn } from '@/lib/utils';

// ─── Shared interface ─────────────────────────────────────────────────────────

interface TypographyProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  gradient?: boolean; // applies .text-gradient
  gradientBlue?: boolean; // applies .text-gradient-blue
  muted?: boolean;
}

// ─── Display ─────────────────────────────────────────────────────────────────
// Intended for hero-level headings. Clamp ensures fluid scaling.

export function Display({ children, className, as: Tag = 'h1', gradient, gradientBlue, muted }: TypographyProps) {
  return (
    <Tag
      className={cn(
        'font-display font-black tracking-tight leading-[1.0]',
        'text-[clamp(2.75rem,6vw,5rem)]',
        muted && 'text-muted-foreground',
        gradient && 'text-gradient',
        gradientBlue && 'text-gradient-blue',
        className,
      )}
    >
      {children}
    </Tag>
  );
}

// ─── DisplaySm ───────────────────────────────────────────────────────────────

export function DisplaySm({ children, className, as: Tag = 'h1', gradient, gradientBlue, muted }: TypographyProps) {
  return (
    <Tag
      className={cn(
        'font-display font-black tracking-tight leading-[1.0]',
        'text-[clamp(2rem,4.5vw,3.75rem)]',
        muted && 'text-muted-foreground',
        gradient && 'text-gradient',
        gradientBlue && 'text-gradient-blue',
        className,
      )}
    >
      {children}
    </Tag>
  );
}

// ─── H1 ──────────────────────────────────────────────────────────────────────

export function H1({ children, className, as: Tag = 'h1', gradient, gradientBlue, muted }: TypographyProps) {
  return (
    <Tag
      className={cn(
        'font-display font-bold tracking-tight leading-[1.05]',
        'text-[clamp(1.875rem,3.5vw,3rem)]',
        muted && 'text-muted-foreground',
        gradient && 'text-gradient',
        gradientBlue && 'text-gradient-blue',
        className,
      )}
    >
      {children}
    </Tag>
  );
}

// ─── H2 ──────────────────────────────────────────────────────────────────────

export function H2({ children, className, as: Tag = 'h2', gradient, gradientBlue, muted }: TypographyProps) {
  return (
    <Tag
      className={cn(
        'font-display font-bold tracking-tight leading-[1.1]',
        'text-[clamp(1.5rem,2.5vw,2.5rem)]',
        muted && 'text-muted-foreground',
        gradient && 'text-gradient',
        gradientBlue && 'text-gradient-blue',
        className,
      )}
    >
      {children}
    </Tag>
  );
}

// ─── H3 ──────────────────────────────────────────────────────────────────────

export function H3({ children, className, as: Tag = 'h3', gradient, gradientBlue, muted }: TypographyProps) {
  return (
    <Tag
      className={cn(
        'font-display font-semibold tracking-tight leading-[1.15]',
        'text-[clamp(1.125rem,1.75vw,1.625rem)]',
        muted && 'text-muted-foreground',
        gradient && 'text-gradient',
        gradientBlue && 'text-gradient-blue',
        className,
      )}
    >
      {children}
    </Tag>
  );
}

// ─── H4 ──────────────────────────────────────────────────────────────────────

export function H4({ children, className, as: Tag = 'h4', gradient, gradientBlue, muted }: TypographyProps) {
  return (
    <Tag
      className={cn(
        'font-display font-semibold leading-[1.2]',
        'text-[clamp(1rem,1.5vw,1.25rem)]',
        muted && 'text-muted-foreground',
        gradient && 'text-gradient',
        gradientBlue && 'text-gradient-blue',
        className,
      )}
    >
      {children}
    </Tag>
  );
}

// ─── BodyLg ──────────────────────────────────────────────────────────────────

export function BodyLg({ children, className, as: Tag = 'p', muted }: Omit<TypographyProps, 'gradient' | 'gradientBlue'>) {
  return (
    <Tag
      className={cn(
        'text-lg leading-relaxed font-normal',
        muted ? 'text-muted-foreground' : 'text-foreground/80',
        className,
      )}
    >
      {children}
    </Tag>
  );
}

// ─── Body ─────────────────────────────────────────────────────────────────────

export function Body({ children, className, as: Tag = 'p', muted }: Omit<TypographyProps, 'gradient' | 'gradientBlue'>) {
  return (
    <Tag
      className={cn(
        'text-base leading-relaxed font-normal',
        muted ? 'text-muted-foreground' : 'text-foreground/80',
        className,
      )}
    >
      {children}
    </Tag>
  );
}

// ─── BodySm ───────────────────────────────────────────────────────────────────

export function BodySm({ children, className, as: Tag = 'p', muted }: Omit<TypographyProps, 'gradient' | 'gradientBlue'>) {
  return (
    <Tag
      className={cn(
        'text-sm leading-relaxed font-normal',
        muted ? 'text-muted-foreground' : 'text-foreground/80',
        className,
      )}
    >
      {children}
    </Tag>
  );
}

// ─── Label ────────────────────────────────────────────────────────────────────
// UI labels — uppercase, tight tracking, small size.

interface LabelTypographyProps extends TypographyProps {
  size?: 'xs' | 'sm';
}

export function LabelText({ children, className, as: Tag = 'span', size = 'xs', muted }: LabelTypographyProps) {
  return (
    <Tag
      className={cn(
        'font-semibold uppercase tracking-widest',
        size === 'xs' ? 'text-xs' : 'text-sm',
        muted ? 'text-muted-foreground' : 'text-foreground/60',
        className,
      )}
    >
      {children}
    </Tag>
  );
}

// ─── Eyebrow ──────────────────────────────────────────────────────────────────
// The tiny category label that floats above section headings.

interface EyebrowProps extends TypographyProps {
  dot?: boolean; // prepend a glowing dot
  variant?: 'default' | 'primary' | 'secondary';
}

export function Eyebrow({ children, className, as: Tag = 'span', dot, variant = 'default' }: EyebrowProps) {
  return (
    <Tag
      className={cn(
        'inline-flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-[0.18em]',
        variant === 'default' && 'text-muted-foreground',
        variant === 'primary' && 'text-primary',
        variant === 'secondary' && 'text-secondary',
        className,
      )}
    >
      {dot && (
        <span
          className={cn(
            'inline-block w-1.5 h-1.5 rounded-full shrink-0',
            variant === 'primary' ? 'bg-primary shadow-[0_0_6px_rgba(71,163,255,0.8)]' : 'bg-muted-foreground',
          )}
          aria-hidden="true"
        />
      )}
      {children}
    </Tag>
  );
}

// ─── Mono ─────────────────────────────────────────────────────────────────────
// Numbers, codes, metadata.

export function MonoText({ children, className, as: Tag = 'span', muted }: Omit<TypographyProps, 'gradient' | 'gradientBlue'>) {
  return (
    <Tag
      className={cn(
        'font-mono text-sm tracking-tight',
        muted ? 'text-muted-foreground' : 'text-foreground',
        className,
      )}
    >
      {children}
    </Tag>
  );
}
