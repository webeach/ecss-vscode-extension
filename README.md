<div align="center">
  <h1>ECSS for VS Code</h1>
  <p style="text-decoration: none">
    <a href="https://marketplace.visualstudio.com/items?itemName=webeach.ecss-language-support">
       <img src="https://img.shields.io/visual-studio-marketplace/v/webeach.ecss-language-support?color=c856c6&labelColor=a440a4" alt="VS Code Marketplace version" />
    </a>
    <a href="https://github.com/webeach/ecss/actions">
      <img src="https://img.shields.io/github/actions/workflow/status/webeach/ecss/ci.yml?color=c856c6&labelColor=a440a4" alt="build" />
    </a>
    <a href="https://marketplace.visualstudio.com/items?itemName=webeach.ecss-language-support">
      <img src="https://img.shields.io/visual-studio-marketplace/i/webeach.ecss-language-support?color=c856c6&labelColor=a440a4" alt="VS Code Marketplace installs" />
    </a>
  </p>
  <p><a href="./README.md">🇺🇸 English version</a> | <a href="./README.ru.md">🇷🇺 Русская версия</a></p>
  <p>VS Code extension for ECSS: syntax highlighting and a language server for <code>.ecss</code> files.</p>
  <p>
    <a href="https://ecss.webea.ch/reference/editors.html" style="font-size: 1.5em">📖 Documentation</a>
  </p>
</div>

```ecss
@enum Variant {
  values: "primary", "ghost";
}

@block Button {
  @param --variant Variant;

  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;

  @if (--variant == "primary") {
    background: #6c2bd9;
    color: white;
  }

  @element Icon {
    margin-right: 8px;
  }
}
```

---

## 📦 Installation

Install the extension from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=webeach.ecss-language-support): open the Extensions view (`Ctrl+Shift+X` / `Cmd+Shift+X`) and search for **“ECSS — Extended CSS”**.

Or via Quick Open (`Ctrl+P` / `Cmd+P`):

```
ext install webeach.ecss-language-support
```

---

## ✨ Features

The extension registers the `ecss` language for `.ecss` files, wires up a TextMate grammar for syntax highlighting, and runs the ECSS language server (`@ecss/language-service`):

- syntax highlighting for `.ecss` files;
- diagnostics — errors are reported inline;
- hover hints;
- autocompletion of directives, types, and `@enum` values;
- go-to-definition and find references;
- document symbols (file outline).

---

## 👨‍💻 Author

Built and maintained by [Ruslan Martynov](https://github.com/ruslan-mart)

Found a bug or have a suggestion? Open an issue or send a pull request.

---

## 📄 License

Distributed under the [MIT License](https://github.com/webeach/ecss/blob/main/LICENSE).
