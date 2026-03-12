import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import svgr from 'vite-plugin-svgr';
// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), svgr()],
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
        alias: {
            '@': path.resolve(__dirname, 'src'),
            '@components': path.resolve(__dirname, 'src/components'),
            '@styles': path.resolve(__dirname, 'src/assets/styles'),
            '@pages': path.resolve(__dirname, 'src/pages'),
            '@layouts': path.resolve(__dirname, 'src/components/layouts'),
            '@icons': path.resolve(__dirname, 'src/assets/icons'),
            '@apis': path.resolve(__dirname, 'src/apis'),
            '@contexts': path.resolve(__dirname, 'src/contexts'),
            '@hooks': path.resolve(__dirname, 'src/hooks'),
            '@constants': path.resolve(__dirname, 'src/constants'),
            '@services': path.resolve(__dirname, 'src/services'),
            '@utils': path.resolve(__dirname, 'src/utils'),
            '@images': path.resolve(__dirname, 'src/assets/images')
        }
    },
    css: {
        preprocessorOptions: {
            scss: {
                // Tự động inject file variables và mixins vào tất cả file .scss
                additionalData: `
                    @use "@/assets/styles/variables" as *;
                    @use "@/assets/styles/mixins" as *;
                `
            }
        }
    }
});
