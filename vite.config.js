import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import * as fs from "node:fs"; //  npm install @types/node

export default defineConfig({
  plugins: [
    vue(),
    
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,  // 解决跨域问题
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },
    host: true, //开启局域网内访问
    https: {
      // 使用自签名证书   Windows10上 安装OpenSSL生成私钥和证书
      // openssl genpkey -algorithm RSA -out key.pem -pkeyopt rsa_keygen_bits:2048
      // openssl req -new -x509 -key key.pem -out cert.pem -days 365 -sha256
      key: fs.readFileSync(new URL('./key.pem', import.meta.url)),
      cert: fs.readFileSync(new URL('./cert.pem', import.meta.url)),
    },
  }
})
