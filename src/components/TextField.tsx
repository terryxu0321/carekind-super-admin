import { type HTMLInputTypeAttribute, type ReactElement, useId } from 'react';
import { FieldError } from './FieldError';

export interface TextFieldProps {
	label: string;
	name: string;
	value: string;
	onChange: (value: string) => void;
	error?: string;
	hint?: string;
	type?: HTMLInputTypeAttribute;
	autoComplete?: string;
	inputMode?: 'text' | 'numeric' | 'email';
	isReadOnly?: boolean;
}

// DESIGN input / input-error: visible label above, hint and error tied to the input for screen readers.
export function TextField({
	label,
	name,
	value,
	onChange,
	error,
	hint,
	type = 'text',
	autoComplete,
	inputMode,
	isReadOnly = false,
}: TextFieldProps): ReactElement {
	const id = useId();
	const hintId = `${id}-hint`;
	const errorId = `${id}-error`;
	const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ');
	return (
		<div className="field">
			<label className="field__label" htmlFor={id}>
				{label}
			</label>
			{hint ? (
				<p className="field__hint" id={hintId}>
					{hint}
				</p>
			) : null}
			<input
				id={id}
				name={name}
				className={error ? 'input input--error' : 'input'}
				type={type}
				value={value}
				autoComplete={autoComplete}
				inputMode={inputMode}
				readOnly={isReadOnly}
				aria-invalid={error ? true : undefined}
				aria-describedby={describedBy || undefined}
				onChange={(event) => onChange(event.target.value)}
			/>
			{error ? <FieldError id={errorId} message={error} /> : null}
		</div>
	);
}
