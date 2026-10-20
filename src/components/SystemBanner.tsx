import type { ReactElement, ReactNode } from 'react';
import { Button } from './Button';

export type BannerTone = 'error' | 'info';

export interface SystemBannerProps {
	tone: BannerTone;
	children: ReactNode;
	retryLabel?: string;
	onRetry?: () => void;
}

// DESIGN system-banner: stays until the problem is solved; errors use role="alert", never a toast.
export function SystemBanner({
	tone,
	children,
	retryLabel,
	onRetry,
}: SystemBannerProps): ReactElement {
	return (
		<div className={`banner banner--${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
			<span className="banner__icon" aria-hidden="true">
				{tone === 'error' ? '!' : 'i'}
			</span>
			<div className="banner__text">{children}</div>
			{onRetry ? (
				<Button variant="utility" onClick={onRetry}>
					{retryLabel ?? 'Try again'}
				</Button>
			) : null}
		</div>
	);
}
