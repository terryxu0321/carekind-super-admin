import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// Ports are fixed by the M0 tech design §1 (API 3000, Super Admin 5173); the API's CORS allows this origin.
export default defineConfig({
	plugins: [react()],
	server: {
		port: 5173,
		strictPort: true,
	},
	test: {
		environment: 'jsdom',
		include: ['test/**/*.test.{ts,tsx}'],
		setupFiles: ['test/setup.ts'],
	},
});
