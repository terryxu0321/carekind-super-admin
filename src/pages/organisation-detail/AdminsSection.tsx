import type { ApiClient, OrgAdminSummary } from '@carekind/shared';
import { type ReactElement, useCallback, useState } from 'react';
import { useApiData } from '../../api/use-api-data';
import { AsyncContent } from '../../components/AsyncContent';
import { Button } from '../../components/Button';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { type Column, DataTable } from '../../components/DataTable';
import { EmptyState } from '../../components/EmptyState';
import { StatusTag } from '../../components/StatusTag';
import { useToast } from '../../components/Toast';
import { STAFF_LIFECYCLE } from '../../format';
import { useSession } from '../../session/SessionContext';
import { InviteAdminDialog } from './InviteAdminDialog';

export interface AdminsSectionProps {
	organisationId: string;
}

// SA-03: organisation admins — the only staff the platform may see. Inviting and deactivating
// open dialogs, so the detail page still has a single form.
export function AdminsSection({ organisationId }: AdminsSectionProps): ReactElement {
	const { api } = useSession();
	const { showToast } = useToast();
	const [isInviteOpen, setIsInviteOpen] = useState(false);
	const [adminToDeactivate, setAdminToDeactivate] = useState<OrgAdminSummary | null>(null);
	const loadAdmins = useCallback(
		(client: ApiClient): Promise<OrgAdminSummary[]> =>
			client.platform.listOrganisationAdmins(organisationId),
		[organisationId],
	);
	const { state, reload } = useApiData(loadAdmins);

	const closeInvite = (wasInviteCreated: boolean): void => {
		setIsInviteOpen(false);
		if (wasInviteCreated) {
			reload();
		}
	};

	const deactivate = async (admin: OrgAdminSummary): Promise<void> => {
		await api.platform.deactivateOrganisationAdmin(admin.staffId);
		setAdminToDeactivate(null);
		showToast('Organisation admin deactivated');
		reload();
	};

	const columns: ReadonlyArray<Column<OrgAdminSummary>> = [
		{
			key: 'name',
			header: 'Name',
			render: (admin) => `${admin.givenName} ${admin.familyName}`,
		},
		{ key: 'email', header: 'Email', render: (admin) => admin.email },
		{
			key: 'status',
			header: 'Status',
			render: (admin) => <StatusTag {...STAFF_LIFECYCLE[admin.lifecycle]} />,
		},
		{
			key: 'actions',
			header: 'Actions',
			render: (admin) =>
				admin.lifecycle === 'deactivated' ? null : (
					<Button
						variant="utility"
						aria-label={`Deactivate ${admin.givenName} ${admin.familyName}`}
						onClick={() => setAdminToDeactivate(admin)}
					>
						Deactivate
					</Button>
				),
		},
	];

	return (
		<section className="section" aria-labelledby="admins-title">
			<div className="section__header">
				<h2 className="section__title" id="admins-title">
					Organisation admins
				</h2>
				<Button variant="utility" onClick={() => setIsInviteOpen(true)}>
					Invite org admin
				</Button>
			</div>
			<AsyncContent state={state} subject="organisation admins" onRetry={reload}>
				{(admins) =>
					admins.length === 0 ? (
						<EmptyState
							title="No organisation admins yet"
							body="Invite an admin so the organisation can set up its facilities and staff."
						/>
					) : (
						<DataTable
							caption="Organisation admins"
							columns={columns}
							rows={admins}
							getRowKey={(admin) => admin.staffId}
						/>
					)
				}
			</AsyncContent>
			{isInviteOpen ? (
				<InviteAdminDialog organisationId={organisationId} onClose={closeInvite} />
			) : null}
			{adminToDeactivate ? (
				<ConfirmDialog
					title={`Deactivate ${adminToDeactivate.givenName} ${adminToDeactivate.familyName}?`}
					body="They will be signed out and unable to sign in as an organisation admin. Their records are kept."
					confirmLabel="Deactivate admin"
					cancelLabel="Keep admin"
					onConfirm={() => deactivate(adminToDeactivate)}
					onClose={() => setAdminToDeactivate(null)}
				/>
			) : null}
		</section>
	);
}
