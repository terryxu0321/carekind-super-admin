import {
	type KeyboardEvent,
	type ReactElement,
	type ReactNode,
	useEffect,
	useId,
	useRef,
} from 'react';
import { createPortal } from 'react-dom';

export interface DialogProps {
	title: string;
	children: ReactNode;
	onClose: () => void;
}

const FOCUSABLE =
	'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function focusableIn(container: HTMLElement): HTMLElement[] {
	return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
}

// DESIGN dialog: scrim + canvas card, title says the question, body says the consequence.
// Focus moves into the dialog, stays there (Tab wraps), and returns to the trigger on close.
export function Dialog({ title, children, onClose }: DialogProps): ReactElement {
	const titleId = useId();
	const cardRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const trigger =
			document.activeElement instanceof HTMLElement ? document.activeElement : null;
		const card = cardRef.current;
		if (card) {
			(focusableIn(card)[0] ?? card).focus();
		}
		return () => trigger?.focus();
	}, []);

	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
		if (event.key === 'Escape') {
			event.stopPropagation();
			onClose();
			return;
		}
		const card = cardRef.current;
		if (event.key !== 'Tab' || !card) {
			return;
		}
		const focusable = focusableIn(card);
		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last?.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first?.focus();
		}
	};

	return createPortal(
		<div className="dialog__scrim">
			<div
				ref={cardRef}
				className="dialog"
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				tabIndex={-1}
				onKeyDown={handleKeyDown}
			>
				<h2 className="dialog__title" id={titleId}>
					{title}
				</h2>
				{children}
			</div>
		</div>,
		document.body,
	);
}
