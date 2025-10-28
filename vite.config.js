// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'
// export default defineConfig({
//   plugins: [react(),tailwindcss(),],
//   server: {
//     host: true,
//     port: 3000,
//     strictPort: true
//   }
// })
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 3000,
    strictPort: true,

    // 🧩 thêm 2 dòng này để Network hiển thị API thật
    hmr: false,             // tắt Hot Module Reload overlay → Chrome bắt được XHR
    proxy: undefined,       // tắt proxy nội bộ Vite (bắt buộc nếu gọi API ngoài domain)
  },
  define: {
    'process.env': {}       // fix axios ESM adapter compatibility (vite >=5)
  }
})
