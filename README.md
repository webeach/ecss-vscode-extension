<div align="center">
  <h1>ECSS — Extended CSS</h1>
  <br>
  <img alt="ECSS — Extended CSS" src="./assets/logo.png" height="240">
  <br>
  <br>
  <p style="text-decoration: none">
    <a href="https://marketplace.visualstudio.com/items?itemName=webeach.ecss-language-support">
      <img src="https://img.shields.io/visual-studio-marketplace/v/webeach.ecss-language-support?color=646fe1&labelColor=9B7AEF" alt="marketplace version" />
    </a>
    <a href="https://marketplace.visualstudio.com/items?itemName=webeach.ecss-language-support">
      <img src="https://img.shields.io/visual-studio-marketplace/i/webeach.ecss-language-support?color=646fe1&labelColor=9B7AEF" alt="installs" />
    </a>
    <a href="https://github.com/webeach/ecss-vscode-extension/actions">
      <img src="https://img.shields.io/github/actions/workflow/status/webeach/ecss-vscode-extension/ci.yml?color=646fe1&labelColor=9B7AEF" alt="build" />
    </a>
  </p>
  <p><a href="./README.md">🇺🇸 English version</a> | <a href="./README.ru.md">🇷🇺 Русская версия</a></p>
  <p>VS Code extension for ECSS — syntax highlighting and language server with diagnostics and hover hints.</p>
  <br>
  <p>
    <a href="https://marketplace.visualstudio.com/items?itemName=webeach.ecss-language-support" style="font-size: 1.5em">🛒 VS Code Marketplace</a> | <a href="https://ecss.webea.ch" style="font-size: 1.5em">📖 Documentation</a> | <a href="https://ecss.webea.ch/reference/spec.html" style="font-size: 1.5em">📋 Specification</a>
  </p>
</div>

---

## 💎 Features

- 🎨 **Syntax highlighting** — TextMate grammar for `.ecss` files
- 🔴 **Error diagnostics** — parse errors and semantic violations shown inline
- 💡 **Hover hints** — type info for `--param` variables, variant values, state definitions
- 📖 **CSS documentation** — hover on standard CSS properties shows MDN docs

---

## 📦 Installation

Find the extension in the VS Code Marketplace by name **ECSS Language Support**, or install it via the command palette:

```
ext install webeach.ecss-language-support
```

---

## 🚀 Quick start

After installation, open any `.ecss` file — syntax highlighting and language server features activate automatically.

```css
@state-variant Theme {
  values: light, dark;
}

@state-def Button(--theme Theme: "light", --disabled boolean: false) {
  border-radius: 6px;

  @if (--disabled) {
    opacity: 0.4;
    cursor: not-allowed;
  }

  @if (--theme == 'dark') {
    background: #1e1e1e;
    color: #f0f0f0;
  } @else  {
    background: #ffffff;
    color: #111111;
  }
}
```

---

## 💡 Language Server features

### Error diagnostics

Parse errors and semantic violations are highlighted inline:

```
[SEM-1] Duplicate @state-variant name: "Size"
[SEM-8] Unknown @state-variant reference: "Color"
[2:15] Expected ',' or ')'
```

### Hover hints

| Element                  | Shows                                             |
| ------------------------ | ------------------------------------------------- |
| `--param` in a condition | Parameter type and default value                  |
| `@state-variant Name`    | List of declared values                           |
| `@state-def Name(...)`   | Signature: all parameters with types and defaults |
| CSS property             | MDN documentation                                 |

---

## 📐 TypeScript types for `.ecss` imports

The extension handles editor features only. For TypeScript type support in your project, use `@ecss/typescript-plugin`:

```json
{
  "compilerOptions": {
    "plugins": [{ "name": "@ecss/typescript-plugin" }]
  }
}
```

> **Tip:** For VS Code to load TypeScript plugins from `node_modules`, switch to workspace TypeScript:
> `Cmd+Shift+P` → **TypeScript: Select TypeScript Version** → **Use Workspace Version**

---

## 🔧 Development

**Build:**

```bash
pnpm install
pnpm build    # production
pnpm watch    # watch mode
```

**Launch extension in development mode:**

Open `vscode-extension/` in VS Code and press `F5` — this starts the Extension Development Host with the built extension loaded.

**Type check:**

```bash
pnpm typecheck
```

**Lint and format:**

```bash
pnpm lint         # oxlint
pnpm lint:fix     # oxlint --fix
pnpm fmt          # oxfmt
pnpm fmt:check    # oxfmt --check
```

---

## 👨‍💻 Author

Developed and maintained by [Ruslan Martynov](https://github.com/ruslan-mart).

Found a bug or have a suggestion? Open an issue or submit a pull request.

---

## 📄 License

Distributed under the [MIT License](./LICENSE).
