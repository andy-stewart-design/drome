# @drome/editor

A CodeMirror-based code editor component.

## Usage

Install the package and its peer dependencies:

```bash
pnpm add @drome/editor @codemirror/state @codemirror/view @codemirror/commands @codemirror/language @codemirror/lang-javascript
```

The CodeMirror packages must be installed as **direct dependencies** of the consuming app — not just transitively through this package. This is required so that the bundler resolves a single instance of `@codemirror/state` across all packages, avoiding the `Unrecognized extension value in extension set` error caused by multiple instances.

### Vite

If you're using Vite, add a `resolve.dedupe` config to ensure a single instance is used:

```ts
// vite.config.ts
export default defineConfig({
  resolve: {
    dedupe: [
      '@codemirror/state',
      '@codemirror/view',
      '@codemirror/commands',
      '@codemirror/language',
      '@codemirror/lang-javascript',
    ],
  },
});
```

### API

```ts
import { createCodeMirror } from '@drome/editor';

const view = createCodeMirror(document.getElementById('editor'), 'initial content');
```

`createCodeMirror(parent: HTMLElement, doc?: string): EditorView`
