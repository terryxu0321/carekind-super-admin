import '@carekind/shared/tokens.css';
import './styles/base.css';
import './styles/components.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { API_BASE_URL } from './config';

const rootElement = document.getElementById('root');
if (rootElement === null) {
	throw new Error('index.html is missing the #root element');
}

createRoot(rootElement).render(
	<StrictMode>
		<BrowserRouter>
			<App apiBaseUrl={API_BASE_URL} />
		</BrowserRouter>
	</StrictMode>,
);
