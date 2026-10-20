import { loginRequestSchema } from '@carekind/shared';
import { type FormEvent, type ReactElement, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { describeError, isUnauthorised } from '../api/describe-error';
import { Button } from '../components/Button';
import { SystemBanner } from '../components/SystemBanner';
import { TextField } from '../components/TextField';
import { type FieldErrors, validateForm } from '../forms/validate-form';
import { SignInRejectedError, useSession } from '../session/SessionContext';

type LoginField = 'email' | 'password';

const FIELD_MESSAGES: Readonly<Record<LoginField, string>> = {
	email: 'Enter your email address, like name@example.com.',
	password: 'Enter your password.',
};

const DEFAULT_DESTINATION = '/organisations';

// Where to go after sign-in: the page that sent the user here, if any.
function destinationFrom(state: unknown): string {
	if (typeof state === 'object' && state !== null && 'from' in state) {
		const from = (state as { from: unknown }).from;
		if (typeof from === 'string' && from.startsWith('/') && from !== '/login') {
			return from;
		}
	}
	return DEFAULT_DESTINATION;
}

function signInErrorMessage(error: unknown): string {
	if (error instanceof SignInRejectedError) {
		return error.message;
	}
	if (isUnauthorised(error)) {
		return 'Email or password is incorrect. Check them and try again.';
	}
	return describeError(error);
}

// SPEC-010 SA-03: invite + password sign-in for the platform audience (no MFA in M0).
export function LoginPage(): ReactElement {
	const { session, endReason, signIn } = useSession();
	const location = useLocation();
	const navigate = useNavigate();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [fieldErrors, setFieldErrors] = useState<FieldErrors<LoginField>>({});
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [isSigningIn, setIsSigningIn] = useState(false);
	const destination = destinationFrom(location.state);

	if (session !== null && !isSigningIn) {
		return <Navigate to={destination} replace />;
	}

	const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
		event.preventDefault();
		const validation = validateForm(
			loginRequestSchema,
			{ audience: 'platform', email: email.trim(), password },
			FIELD_MESSAGES,
		);
		if (!validation.ok) {
			setFieldErrors(validation.fieldErrors);
			setSubmitError(validation.formError);
			return;
		}
		setFieldErrors({});
		setSubmitError(null);
		setIsSigningIn(true);
		try {
			await signIn(validation.data.email, validation.data.password);
			navigate(destination, { replace: true });
		} catch (error) {
			setSubmitError(signInErrorMessage(error));
			setIsSigningIn(false);
		}
	};

	return (
		<main className="login" id="main">
			<div className="login__card">
				<p className="login__product">CareKind Super Admin</p>
				<h1 className="login__title">Sign in</h1>
				{endReason === 'expired' ? (
					<SystemBanner tone="info">
						Your session has ended. Sign in again to continue.
					</SystemBanner>
				) : null}
				<form className="form" noValidate onSubmit={handleSubmit}>
					{submitError ? <SystemBanner tone="error">{submitError}</SystemBanner> : null}
					<TextField
						name="email"
						label="Email"
						type="email"
						autoComplete="username"
						inputMode="email"
						value={email}
						onChange={setEmail}
						error={fieldErrors.email}
					/>
					<TextField
						name="password"
						label="Password"
						type="password"
						autoComplete="current-password"
						value={password}
						onChange={setPassword}
						error={fieldErrors.password}
					/>
					<div className="form__actions">
						<Button type="submit" variant="primary" disabled={isSigningIn}>
							Sign in
						</Button>
					</div>
				</form>
			</div>
		</main>
	);
}
