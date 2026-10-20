import { type ReactElement, useState } from 'react';
import { describeError } from '../api/describe-error';
import { Button } from './Button';
import { Dialog } from './Dialog';
import { SystemBanner } from './SystemBanner';

export interface ConfirmDialogProps {
	title: string;
	body: string;
	confirmLabel: string;
	cancelLabel: string;
	onConfirm: () => Promise<void>;
	onClose: () => void;
}

// For consequential actions (suspend, deactivate): buttons name the action, no red button
// (DESIGN §7.3 dialog). A failure stays visible inside the dialog instead of a toast.
export function ConfirmDialog({
	title,
	body,
	confirmLabel,
	cancelLabel,
	onConfirm,
	onClose,
}: ConfirmDialogProps): ReactElement {
	const [isBusy, setIsBusy] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const confirm = async (): Promise<void> => {
		setIsBusy(true);
		setErrorMessage(null);
		try {
			await onConfirm();
		} catch (error) {
			setErrorMessage(describeError(error));
			setIsBusy(false);
		}
	};

	return (
		<Dialog title={title} onClose={onClose}>
			<p className="dialog__body">{body}</p>
			{errorMessage ? <SystemBanner tone="error">{errorMessage}</SystemBanner> : null}
			<div className="dialog__actions">
				<Button variant="primary" disabled={isBusy} onClick={confirm}>
					{confirmLabel}
				</Button>
				<Button onClick={onClose}>{cancelLabel}</Button>
			</div>
		</Dialog>
	);
}
