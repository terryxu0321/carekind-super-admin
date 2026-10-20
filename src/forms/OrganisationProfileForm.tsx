import { type OrganisationCreateRequest, organisationCreateRequestSchema } from '@carekind/shared';
import { type FormEvent, type ReactElement, type ReactNode, useState } from 'react';
import { describeError } from '../api/describe-error';
import { Button } from '../components/Button';
import { SystemBanner } from '../components/SystemBanner';
import { TextField } from '../components/TextField';
import { type FieldErrors, validateForm } from './validate-form';

type ProfileField = keyof OrganisationCreateRequest;

const FIELD_MESSAGES: Readonly<Record<ProfileField, string>> = {
	name: 'Enter the organisation name.',
	abn: 'Enter the 11-digit ABN, for example 12 345 678 901.',
	contactName: 'Enter the contact person’s name.',
	contactEmail: 'Enter an email address, like name@example.com.',
};

export const EMPTY_PROFILE: OrganisationCreateRequest = {
	name: '',
	abn: '',
	contactName: '',
	contactEmail: '',
};

export interface OrganisationProfileFormProps {
	initialProfile: OrganisationCreateRequest;
	submitLabel: string;
	onSubmit: (profile: OrganisationCreateRequest) => Promise<void>;
	// Non-submit controls shown next to the submit, such as a Cancel link.
	secondaryAction?: ReactNode;
}

// SA-01: name, ABN and contact. Used to create an organisation and to edit its profile; the full
// profile also satisfies the update schema, so one validation covers both.
export function OrganisationProfileForm({
	initialProfile,
	submitLabel,
	onSubmit,
	secondaryAction,
}: OrganisationProfileFormProps): ReactElement {
	const [profile, setProfile] = useState(initialProfile);
	const [fieldErrors, setFieldErrors] = useState<FieldErrors<ProfileField>>({});
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);

	const setField = (field: ProfileField) => (value: string) =>
		setProfile((current) => ({ ...current, [field]: value }));

	const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
		event.preventDefault();
		const validation = validateForm(organisationCreateRequestSchema, profile, FIELD_MESSAGES);
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
			<TextField
				name="name"
				label="Organisation name"
				autoComplete="organization"
				value={profile.name}
				onChange={setField('name')}
				error={fieldErrors.name}
			/>
			<TextField
				name="abn"
				label="ABN"
				inputMode="numeric"
				value={profile.abn}
				onChange={setField('abn')}
				error={fieldErrors.abn}
			/>
			<TextField
				name="contactName"
				label="Contact name"
				autoComplete="name"
				value={profile.contactName}
				onChange={setField('contactName')}
				error={fieldErrors.contactName}
			/>
			<TextField
				name="contactEmail"
				label="Contact email"
				type="email"
				autoComplete="email"
				inputMode="email"
				value={profile.contactEmail}
				onChange={setField('contactEmail')}
				error={fieldErrors.contactEmail}
			/>
			<div className="form__actions">
				<Button type="submit" variant="primary" disabled={isSaving}>
					{submitLabel}
				</Button>
				{secondaryAction}
			</div>
		</form>
	);
}
