import type { ReactElement } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { AuditLogPage } from './pages/AuditLogPage';
import { CreateOrganisationPage } from './pages/CreateOrganisationPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { OrganisationLimitsPage } from './pages/OrganisationLimitsPage';
import { OrganisationListPage } from './pages/OrganisationListPage';
import { PlatformDefaultsPage } from './pages/PlatformDefaultsPage';
import { UsagePage } from './pages/UsagePage';
import { OrganisationDetailPage } from './pages/organisation-detail/OrganisationDetailPage';

// Tech design §5 Super Admin: login → organisations → create → detail (+ limits) → defaults → usage → audit.
export function AppRoutes(): ReactElement {
	return (
		<Routes>
			<Route path="/login" element={<LoginPage />} />
			<Route element={<AppLayout />}>
				<Route index element={<Navigate to="/organisations" replace />} />
				<Route path="/organisations" element={<OrganisationListPage />} />
				<Route path="/organisations/new" element={<CreateOrganisationPage />} />
				<Route path="/organisations/:organisationId" element={<OrganisationDetailPage />} />
				<Route
					path="/organisations/:organisationId/limits"
					element={<OrganisationLimitsPage />}
				/>
				<Route path="/defaults" element={<PlatformDefaultsPage />} />
				<Route path="/usage" element={<UsagePage />} />
				<Route path="/audit" element={<AuditLogPage />} />
				<Route path="*" element={<NotFoundPage />} />
			</Route>
		</Routes>
	);
}
