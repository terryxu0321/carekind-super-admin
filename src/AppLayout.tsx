import type { ReactElement } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { type NavItem, SideNav } from './components/SideNav';
import { useSession } from './session/SessionContext';

export const NAV_ITEMS: ReadonlyArray<NavItem> = [
	{ to: '/organisations', label: 'Organisations' },
	{ to: '/defaults', label: 'Platform defaults' },
	{ to: '/usage', label: 'Usage' },
	{ to: '/audit', label: 'Audit log' },
];

// Every page except login needs a platform session; without one, go to login and come back after.
export function AppLayout(): ReactElement {
	const { session, signOut } = useSession();
	const location = useLocation();
	if (session === null) {
		return <Navigate to="/login" replace state={{ from: location.pathname }} />;
	}
	return (
		<div className="app-layout">
			<a className="skip-link" href="#main">
				Skip to content
			</a>
			<SideNav items={NAV_ITEMS} userName={session.me.name} onSignOut={signOut} />
			<main className="app-layout__main" id="main" tabIndex={-1}>
				<Outlet />
			</main>
		</div>
	);
}
