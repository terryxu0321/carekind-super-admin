import {
	type AdminInviteRequest,
	type InviteLinkResponse,
	adminInviteRequestSchema,
} from '@carekind/shared';
import { type FormEvent, type ReactElement, useState } from 'react';
import { describeError } from '../../api/describe-error';
import { Button } from '../../components/Button';
import { Dialog } from '../../components/Dialog';
import { SystemBanner } from '../../components/SystemBanner';
import { TextField } from '../../components/TextField';
import { type FieldErrors, validateForm } from '../../forms/validate-form';
import { formatDateTime } from '../../format';
import { useSession } from '../../session/SessionContext';

type InviteField = keyof AdminInviteRequest;

const FIELD_MESSAGES: Readonly<Record<InviteField, string>> = {
	givenName: 'Enter the admin’s given name.',
	familyName: 'Enter the admin’s family name.',
	email: 'Enter an email address, like name@example.com.',
};

const EMPTY_INVITE: AdminInviteRequest = { givenName: '', familyName: '', email: '' };

interface InviteLinkProps {
	invite: InviteLinkResponse;
	onDone: () => void;
}

// CareKind never sends the email (AGENTS hard rule 3): the inviter copies the link and sends it.
function InviteLink({ invite, onDone }: InviteLinkProps): ReactElement {
	const [copyMessage, setCopyMessage] = useState<string | null>(null);

	const copyLink = async (): Promise<void> => {
		try {
			await navigator.clipboard.writeText(invite.inviteUrl);
			setCopyMessage('Link copied.');
		} catch (error) {
			console.warn('Clipboard write failed', error);
			setCopyMessage('Could not copy. Select the link and copy it yourself.');
		}
	};

	return (
		<>
			<p className="dialog__body">
				CareKind does not send this email. Copy the link and send it to the new admin. It
				expires {formatDateTime(invite.expiresAt)}.
			</p>
			<TextField
				name="inviteUrl"
				label="Invite link"
				value={invite.inviteUrl}
				onChange={() => undefined}
				isReadOnly
			/>
			<p className="field__hint" role="status">
				{copyMessage}
			</p>
			<div className="dialog__actions">
				<Button variant="primary" onClick={copyLink}>
					Copy link
				</Button>
				<Button onClick={onDone}>Done</Button>
			</div>
		</>
	);
}

export interface InviteAdminDialogProps {
	organisationId: string;
	// true when an invite was created, so the admin list should reload.
	onClose: (wasInviteCreated: boolean) => void;
}

// SA-03: one form, one submit inside the dialog; after success the form is replaced by the link.
export function InviteAdminDialog({
	organisationId,
	onClose,
}: InviteAdminDialogProps): ReactElement {
	const { api } = useSession();
	const [values, setValues] = useState(EMPTY_INVITE);
	const [fieldErrors, setFieldErrors] = useState<FieldErrors<InviteField>>({});
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [isSending, setIsSending] = useState(false);
	const [invite, setInvite] = useState<InviteLinkResponse | null>(null);

	const setField = (field: InviteField) => (value: string) =>
		setValues((current) => ({ ...current, [field]: value }));

	const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
		event.preventDefault();
		const validation = validateForm(adminInviteRequestSchema, values, FIELD_MESSAGES);
		if (!validation.ok) {
			setFieldErrors(validation.fieldErrors);
			setSubmitError(validation.formError);
			return;
		}
		setFieldErrors({});
		setSubmitError(null);
		setIsSending(true);
		try {
			setInvite(await api.platform.inviteOrganisationAdmin(organisationId, validation.data));
		} catch (error) {
			setSubmitError(describeError(error));
		} finally {
			setIsSending(false);
		}
	};

	if (invite !== null) {
		return (
			<Dialog title="Invite link created" onClose={() => onClose(true)}>
				<InviteLink invite={invite} onDone={() => onClose(true)} />
			</Dialog>
		);
	}

	return (
		<Dialog title="Invite org admin" onClose={() => onClose(false)}>
			<form className="form" noValidate onSubmit={handleSubmit}>
				{submitError ? <SystemBanner tone="error">{submitError}</SystemBanner> : null}
				<TextField
					name="givenName"
					label="Given name"
					value={values.givenName}
					onChange={setField('givenName')}
					error={fieldErrors.givenName}
				/>
				<TextField
					name="familyName"
					label="Family name"
					value={values.familyName}
					onChange={setField('familyName')}
					error={fieldErrors.familyName}
				/>
				<TextField
					name="email"
					label="Email"
					type="email"
					inputMode="email"
					value={values.email}
					onChange={setField('email')}
					error={fieldErrors.email}
				/>
				<div className="dialog__actions">
					<Button type="submit" variant="primary" disabled={isSending}>
						Create invite link
					</Button>
					<Button onClick={() => onClose(false)}>Cancel</Button>
				</div>
			</form>
		</Dialog>
	);
}
