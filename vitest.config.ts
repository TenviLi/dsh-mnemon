import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    // Source-linked DSH workspaces resolve through their real paths. Keep UI
    // packages on Mnemon's React instance just as the browser bundle does.
    dedupe: ['react', 'react-dom'],
  },
  test: {
    environment: 'node',
    coverage: { enabled: false },
    server: {
      deps: {
        inline: ['@deepseek-ai/dsh-client-ui-primitives'],
      },
    },
  },
})
