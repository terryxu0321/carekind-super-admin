import {
	type ReactElement,
	type ReactNode,
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';

// DESIGN toast: completed results only ("Limits saved"), one at a time, gone after 4 seconds.
const TOAST_DURATION_MS = 4000;

interface ToastMessage {
	id: number;
	text: string;
}

export interface ToastApi {
	showToast: (text: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export interface ToastProviderProps {
	children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps): ReactElement {
	const [toast, setToast] = useState<ToastMessage | null>(null);

	useEffect(() => {
		if (toast === null) {
			return undefined;
		}
		const timer = window.setTimeout(() => setToast(null), TOAST_DURATION_MS);
		return () => window.clearTimeout(timer);
	}, [toast]);

	const showToast = useCallback((text: string) => setToast({ id: Date.now(), text }), []);
	const value = useMemo(() => ({ showToast }), [showToast]);

	return (
		<ToastContext.Provider value={value}>
			{children}
			<div className="toast-region" role="status" aria-live="polite">
				{toast ? (
					<div className="toast" key={toast.id}>
						<span className="toast__icon" aria-hidden="true">
							✓
						</span>
						{toast.text}
					</div>
				) : null}
			</div>
		</ToastContext.Provider>
	);
}

export function useToast(): ToastApi {
	const value = useContext(ToastContext);
	if (value === null) {
		throw new Error('useToast must be used inside ToastProvider');
	}
	return value;
}
