import type { Organisation } from '@carekind/shared';
import { type ReactElement, useState } from 'react';
import { Button } from '../../components/Button';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useToast } from '../../components/Toast';
import { useSession } from '../../session/SessionContext';

export interface AccessSectionProps {
	organisation: Organisation;
	onOrganisationChange: (organisation: Organisation) => void;
}

// SA-01: suspending blocks every sign-in for the organisation but keeps all data; it can be
// undone, and both directions need a confirm dialog (SPEC-010 §6).
export function AccessSection({
	organisation,
	onOrganisationChange,
}: AccessSectionProps): ReactElement {
	const { api } = useSession();
	const { showToast } = useToast();
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const isSuspended = organisation.status === 'suspended';

	const changeStatus = async (): Promise<void> => {
		const updated = isSuspended
			? await api.platform.reactivateOrganisation(organisation.id)
			: await api.platform.suspendOrganisation(organisation.id);
		setIsDialogOpen(false);
		onOrganisationChange(updated);
		showToast(isSuspended ? 'Organisation reactivated' : 'Organisation suspended');
	};

	return (
		<section className="section" aria-labelledby="access-title">
			<h2 className="section__title" id="access-title">
				Access
			</h2>
			<p className="section__text">
				{isSuspended
					? 'This organisation is suspended. Its users cannot sign in. Its data is kept.'
					: 'This organisation is active. Its users can sign in.'}
			</p>
			<Button onClick={() => setIsDialogOpen(true)}>
				{isSuspended ? 'Reactivate organisation' : 'Suspend organisation'}
			</Button>
			{isDialogOpen ? (
				<ConfirmDialog
					title={
						isSuspended
							? `Reactivate ${organisation.name}?`
							: `Suspend ${organisation.name}?`
					}
					body={
						isSuspended
							? 'Users at this organisation will be able to sign in again.'
							: 'All users at this organisation will be signed out and unable to sign in. No data is deleted. You can reactivate the organisation later.'
					}
					confirmLabel={isSuspended ? 'Reactivate organisation' : 'Suspend organisation'}
					cancelLabel={isSuspended ? 'Keep suspended' : 'Keep active'}
					onConfirm={changeStatus}
					onClose={() => setIsDialogOpen(false)}
				/>
			) : null}
		</section>
	);
}
