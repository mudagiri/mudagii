import{defineConfig}from'vite';import react from'@vitejs/plugin-react';
// The Chapter 3 pilot is a separate static page; production index and routes are unchanged.
export default defineConfig({plugins:[react()],base:'./',build:{rollupOptions:{input:['index.html','chapter3-pilot.html']}}});
