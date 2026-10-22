import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [tailwindcss(), react()],
	root: 'client',
	server: {
		port: 3000,
		proxy: {
			'/api': {
				target: 'http://localhost:8787',
				changeOrigin: true,
			},
		},
	},
	build: {
		outDir: '../dist/client',
		emptyOutDir: true,
	},
});
