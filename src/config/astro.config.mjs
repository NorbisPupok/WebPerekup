// astro.config.mjs
import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'

// https://astro.build/config
export default defineConfig({
  // ГЛАВНОЕ ИЗМЕНЕНИЕ
  output: 'server', 
      
  build: {
    format: 'file'
  },
  compressHTML: false,
  markdown: {
    shikiConfig: {
      theme: 'dark-plus'
    }
  },
  integrations: [mdx()],
      
  // Ваши пути остаются без изменений
  srcDir: './src/html',
  publicDir: './src/html/public',
  cacheDir: './dist/.astro',
  outDir: './dist/html',
      
  server: {
    host: '0.0.0.0',
    port: 3000
  },
  vite: {
    resolve: {
      // Добавляем псевдоним @, который будет указывать на src/html
      alias: {
        '@': '/src/html'
      }
    },
    server: {
      host: '0.0.0.0',
      watch: {
        ignored: ['!**/dist/**']
      }
    }
  }
})