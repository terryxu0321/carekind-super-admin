import {
	AUDIO_RETENTION_DAYS_MAX,
	type OrganisationLimits,
	RECORD_TYPES,
	type RecordType,
	organisationLimitsSchema,
} from '@carekind/shared';
import { type FormEvent, type ReactElement, useId, useState } from 'react';
import { describeError } from '../api/describe-error';
import { Button } from '../components/Button';
import { CheckboxField } from '../components/CheckboxField';
import { FieldError } from '../components/FieldError';
import { SystemBanner } from '../components/SystemBanner';
import { TextField } from '../components/TextField';
import { RECORD_TYPE_LABELS } from '../format';
import { type FieldErrors, validateForm } from './validate-form';

type LimitsField = keyof OrganisationLimits;

const FIELD_MESSAGES: Readonly<Record<LimitsField, string>> = {
	enabledRecordTypes: 'Choose at least one record type.',
	pcwRequiresRnReview: 'Choose whether PCW records need RN review.',
	audioRetentionDaysMax: `Enter a whole number of days from 0 to ${AUDIO_RETENTION_DAYS_MAX}.`,
	aiProcessingEnabled: 'Choose whether AI processing is on.',
	facilityLimit: 'Enter a whole number of facilities, 1 or more.',
};

// Number inputs are edited as text; an empty box becomes NaN so the schema rejects it.
function toNumber(text: string): number {
	return text.trim() === '' ? Number.NaN : Number(text);
}

export interface LimitsFormProps {
	initialLimits: OrganisationLimits;
	submitLabel: string;
	onSubmit: (limits: OrganisationLimits) => Promise<void>;
}

// SA-02 / SA-02a: one form for platform defaults and for one organisation's limits; the
// shared schema enforces audio retention ≤ 7 days (PRD C7).
export function LimitsForm({
	initialLimits,
	submitLabel,
	onSubmit,
}: LimitsFormProps): ReactElement {
	const recordTypesErrorId = useId();
	const [recordTypes, setRecordTypes] = useState<RecordType[]>(initialLimits.enabledRecordTypes);
	const [pcwRequiresRnReview, setPcwRequiresRnReview] = useState(
		initialLimits.pcwRequiresRnReview,
	);
	const [retentionDays, setRetentionDays] = useState(String(initialLimits.audioRetentionDaysMax));
	const [aiProcessingEnabled, setAiProcessingEnabled] = useState(
		initialLimits.aiProcessingEnabled,
	);
	const [facilityLimit, setFacilityLimit] = useState(String(initialLimits.facilityLimit));
	const [fieldErrors, setFieldErrors] = useState<FieldErrors<LimitsField>>({});
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);

	const toggleRecordType = (type: RecordType, isChecked: boolean): void => {
		setRecordTypes((current) =>
			isChecked ? [...current, type] : current.filter((item) => item !== type),
		);
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
		event.preventDefault();
		const validation = validateForm(
			organisationLimitsSchema,
			{
				// Keep the shared enum order so saved values are stable.
				enabledRecordTypes: RECORD_TYPES.filter((type) => recordTypes.includes(type)),
				pcwRequiresRnReview,
				audioRetentionDaysMax: toNumber(retentionDays),
				aiProcessingEnabled,
				facilityLimit: toNumber(facilityLimit),
			},
			FIELD_MESSAGES,
		);
		if (!validation.ok) {
			setFieldErrors(validation.fieldErrors);
			setSubmitError(validation.formError);
			return;
		}
		setFieldErrors({});
		setSubmitError(null);
		setIsSaving(true);
		try {
			await onSubmit(validation.data);
		} catch (error) {
			setSubmitError(describeError(error));
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<form className="form" noValidate onSubmit={handleSubmit}>
			{submitError ? <SystemBanner tone="error">{submitError}</SystemBanner> : null}
			<fieldset
				className="fieldset"
				aria-describedby={fieldErrors.enabledRecordTypes ? recordTypesErrorId : undefined}
			>
				<legend className="field__label">Enabled record types</legend>
				{RECORD_TYPES.map((type) => (
					<CheckboxField
						key={type}
						name="enabledRecordTypes"
						label={RECORD_TYPE_LABELS[type]}
						isChecked={recordTypes.includes(type)}
						onChange={(isChecked) => toggleRecordType(type, isChecked)}
					/>
				))}
				{fieldErrors.enabledRecordTypes ? (
					<FieldError id={recordTypesErrorId} message={fieldErrors.enabledRecordTypes} />
				) : null}
			</fieldset>
			<CheckboxField
				name="pcwRequiresRnReview"
				label="PCW records need RN review"
				hint="Default for new facilities. Facilities can change it in their workflow settings."
				isChecked={pcwRequiresRnReview}
				onChange={setPcwRequiresRnReview}
			/>
			<TextField
				name="audioRetentionDaysMax"
				label="Maximum audio retention (days)"
				hint={`Raw audio is kept for at most ${AUDIO_RETENTION_DAYS_MAX} days.`}
				inputMode="numeric"
				value={retentionDays}
				onChange={setRetentionDays}
				error={fieldErrors.audioRetentionDaysMax}
			/>
			<CheckboxField
				name="aiProcessingEnabled"
				label="AI processing on"
				isChecked={aiProcessingEnabled}
				onChange={setAiProcessingEnabled}
			/>
			<TextField
				name="facilityLimit"
				label="Facility limit"
				hint="The most facilities this organisation can add."
				inputMode="numeric"
				value={facilityLimit}
				onChange={setFacilityLimit}
				error={fieldErrors.facilityLimit}
			/>
			<div className="form__actions">
				<Button type="submit" variant="primary" disabled={isSaving}>
					{submitLabel}
				</Button>
			</div>
		</form>
	);
}
