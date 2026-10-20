import type { ButtonHTMLAttributes, ReactElement } from 'react';
import { Link, type LinkProps } from 'react-router-dom';

// DESIGN §7.1: primary = the one main action per screen; secondary pill = second action;
// utility = compact admin-web tool button (button-dark-utility).
export type ButtonVariant = 'primary' | 'secondary' | 'utility';

function buttonClass(variant: ButtonVariant, extra?: string): string {
	return ['button', `button--${variant}`, extra].filter(Boolean).join(' ');
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
}

// type defaults to "button" so only an explicit submit can submit a form (DESIGN §7.3).
export function Button({
	variant = 'secondary',
	type = 'button',
	className,
	...rest
}: ButtonProps): ReactElement {
	return <button type={type} className={buttonClass(variant, className)} {...rest} />;
}

export interface LinkButtonProps extends LinkProps {
	variant?: ButtonVariant;
}

// Navigation that looks like a button (e.g. "Create organisation" on a list page) — not a submit.
export function LinkButton({
	variant = 'secondary',
	className,
	...rest
}: LinkButtonProps): ReactElement {
	return <Link className={buttonClass(variant, className)} {...rest} />;
}
