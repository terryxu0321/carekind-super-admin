import { type ReactElement, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from './Button';

export interface NavItem {
	to: string;
	label: string;
}

export interface SideNavProps {
	items: ReadonlyArray<NavItem>;
	userName: string;
	onSignOut: () => void;
}

// DESIGN side-nav (admin-web): 240px parchment column; the current page is white with primary
// text and aria-current="page" (NavLink sets it). Below 834px it collapses behind a Menu button.
export function SideNav({ items, userName, onSignOut }: SideNavProps): ReactElement {
	const [isOpen, setIsOpen] = useState(false);
	return (
		<nav className={isOpen ? 'side-nav side-nav--open' : 'side-nav'} aria-label="Main">
			<div className="side-nav__header">
				<p className="side-nav__product">CareKind Super Admin</p>
				<Button
					variant="utility"
					className="side-nav__toggle"
					aria-expanded={isOpen}
					onClick={() => setIsOpen(!isOpen)}
				>
					Menu
				</Button>
			</div>
			<div className="side-nav__body">
				<ul className="side-nav__list">
					{items.map((item) => (
						<li key={item.to}>
							<NavLink
								to={item.to}
								className="side-nav__link"
								onClick={() => setIsOpen(false)}
							>
								{item.label}
							</NavLink>
						</li>
					))}
				</ul>
				<div className="side-nav__footer">
					<p className="side-nav__user">Signed in as {userName}</p>
					<Button variant="utility" onClick={onSignOut}>
						Sign out
					</Button>
				</div>
			</div>
		</nav>
	);
}
