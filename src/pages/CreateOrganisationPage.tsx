import type { OrganisationCreateRequest } from '@carekind/shared';
import type { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { LinkButton } from '../components/Button';
import { PageHeader } from '../components/PageHeader';
import { useToast } from '../components/Toast';
import { EMPTY_PROFILE, OrganisationProfileForm } from '../forms/OrganisationProfileForm';
import { useSession } from '../session/SessionContext';

// SA-01: one form, one submit. Limits are copied from platform defaults by the API (tech design §3).
export function CreateOrganisationPage(): ReactElement {
	const { api } = useSession();
	const { showToast } = useToast();
	const navigate = useNavigate();

	const createOrganisation = async (profile: OrganisationCreateRequest): Promise<void> => {
		const organisation = await api.platform.createOrganisation(profile);
		showToast('Organisation created');
		navigate(`/organisations/${organisation.id}`);
	};

	return (
		<div className="page-narrow">
			<PageHeader
				title="Create organisation"
				description="The organisation starts with the platform default limits. You can change them after it is created."
			/>
			<OrganisationProfileForm
				initialProfile={EMPTY_PROFILE}
				submitLabel="Create organisation"
				onSubmit={createOrganisation}
				secondaryAction={<LinkButton to="/organisations">Cancel</LinkButton>}
			/>
		</div>
	);
}
