import { type ReactElement, useId } from 'react';

export interface CheckboxFieldProps {
	label: string;
	name: string;
	isChecked: boolean;
	onChange: (isChecked: boolean) => void;
	hint?: string;
}

// DESIGN checkbox: 24px box in a 48px target; clicking the label toggles it.
export function CheckboxField({
	label,
	name,
	isChecked,
	onChange,
	hint,
}: CheckboxFieldProps): ReactElement {
	const id = useId();
	const hintId = `${id}-hint`;
	return (
		<div className="checkbox">
			<input
				id={id}
				name={name}
				className="checkbox__input"
				type="checkbox"
				checked={isChecked}
				aria-describedby={hint ? hintId : undefined}
				onChange={(event) => onChange(event.target.checked)}
			/>
			<label className="checkbox__label" htmlFor={id}>
				{label}
				{hint ? (
					<span className="checkbox__hint" id={hintId}>
						{hint}
					</span>
				) : null}
			</label>
		</div>
	);
}
