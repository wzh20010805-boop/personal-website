import type { ReactNode } from "react";

type CandyButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary";
  describedBy?: string;
} & ({ href: string; disabled?: false } | { href?: never; disabled: true });

export function CandyButton({ children, variant = "primary", describedBy, ...props }: CandyButtonProps) {
  const className = `candy-button candy-button--${variant}`;
  if (props.disabled) {
    return <button type="button" className={className} disabled aria-describedby={describedBy}>{children}</button>;
  }
  return <a className={className} href={props.href} aria-describedby={describedBy}>{children}</a>;
}
