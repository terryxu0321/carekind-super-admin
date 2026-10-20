import type { ReactElement } from 'react';

export interface FieldErrorProps {
	id: string;
	message: string;
}

// DESIGN input-error: icon + text, never colour alone.
export function FieldError({ id, message }: FieldErrorProps): ReactElement {
	return (
		<p className="field__error" id={id}>
			<span className="field__error-icon" aria-hidden="true">
				!
			</span>
			{message}
		</p>
	);
}
