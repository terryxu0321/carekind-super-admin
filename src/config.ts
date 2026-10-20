// The local default matches the API port in the M0 admin tech design §1.
const DEFAULT_API_BASE_URL = 'http://localhost:3000';

export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;
