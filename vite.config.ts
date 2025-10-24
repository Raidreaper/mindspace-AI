import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
	base: "/",
	server: {
		host: "::",
		port: 8080,
		headers: {
			'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
			'Pragma': 'no-cache',
			'Expires': '0',
			'Last-Modified': new Date().toUTCString(),
			'ETag': `"${Date.now()}"`
		},
		force: true
	},
	plugins: [
		react(),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	build: {
		rollupOptions: {
			output: {
				entryFileNames: `assets/[name]-${Date.now()}.js`,
				chunkFileNames: `assets/[name]-${Date.now()}.js`,
				assetFileNames: `assets/[name]-${Date.now()}.[ext]`,
				manualChunks: {
					vendor: ['react', 'react-dom'],
					supabase: ['@supabase/supabase-js'],
					ui: ['@radix-ui/react-dialog', '@radix-ui/react-tabs', '@radix-ui/react-select']
				}
			}
		}
	},
         define: {
           __APP_VERSION__: JSON.stringify(Date.now()),
           __BUILD_TIMESTAMP__: JSON.stringify(Date.now())
         },
	optimizeDeps: {
		force: true
	}
}));
