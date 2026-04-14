<div align="center">
  <h1>ECSS — Extended CSS</h1>
  <br>
  <img alt="ECSS — Extended CSS" src="./assets/logo.png" height="128">
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
  <p>VS Code расширение для ECSS (Extended CSS) — подсветка синтаксиса и language server.</p>
  <br>
  <p>
    <a href="https://marketplace.visualstudio.com/items?itemName=webeach.ecss-language-support" style="font-size: 1.5em">🛒 VS Code Marketplace</a> | <a href="https://ecss.webea.ch/ru" style="font-size: 1.5em">📖 Документация</a> | <a href="https://ecss.webea.ch/ru/reference/spec.html" style="font-size: 1.5em">📋 Спецификация</a>
  </p>
</div>

---

## 💎 Особенности

- 🎨 **Подсветка синтаксиса** — TextMate-грамматика для `.ecss`-файлов
- 🔴 **Диагностика ошибок** — ошибки парсинга и семантические нарушения отображаются inline
- 💡 **Hover-подсказки** — информация о типах для `--param`-переменных, значения вариантов, описания state-дефиниций
- 📖 **CSS-документация** — hover на стандартных CSS-свойствах показывает документацию MDN

---

## 📦 Установка

Найди расширение в VS Code Marketplace по названию **ECSS Language Support**, или установи через командную палитру:

```
ext install webeach.ecss-language-support
```

---

## 🚀 Быстрый старт

После установки открой любой `.ecss`-файл — подсветка синтаксиса и функции language server активируются автоматически.

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

## 💡 Функции Language Server

### Диагностика ошибок

Ошибки парсинга и семантические нарушения подчёркиваются прямо в редакторе:

```
[SEM-1] Duplicate @state-variant name: "Size"
[SEM-8] Unknown @state-variant reference: "Color"
[2:15] Expected ',' or ')'
```

### Hover-подсказки

| Элемент                | Что показывает                                |
| ---------------------- | --------------------------------------------- |
| `--param` в условии    | Тип и значение по умолчанию параметра         |
| `@state-variant Name`  | Список объявленных значений                   |
| `@state-def Name(...)` | Сигнатура: все параметры с типами и дефолтами |
| CSS-свойство           | Документация MDN                              |

---

## 📐 TypeScript-типы для `.ecss`-импортов

Расширение отвечает только за функции редактора. Для поддержки TypeScript-типов в проекте используй `@ecss/typescript-plugin`:

```json
{
  "compilerOptions": {
    "plugins": [{ "name": "@ecss/typescript-plugin" }]
  }
}
```

> **Подсказка:** Чтобы VS Code загружал TypeScript-плагины из `node_modules`, переключись на рабочий TypeScript:
> `Cmd+Shift+P` → **TypeScript: Select TypeScript Version** → **Use Workspace Version**

---

## 🔧 Разработка

**Сборка:**

```bash
pnpm install
pnpm build    # production
pnpm watch    # watch mode
```

**Запуск расширения в режиме разработки:**

Открой папку `vscode-extension/` в VS Code и нажми `F5` — запустится Extension Development Host с загруженным расширением.

**Проверка типов:**

```bash
pnpm typecheck
```

**Линтинг и форматирование:**

```bash
pnpm lint         # oxlint
pnpm lint:fix     # oxlint --fix
pnpm fmt          # oxfmt
pnpm fmt:check    # oxfmt --check
```

---

## 👨‍💻 Автор

Разработка и поддержка: [Руслан Мартынов](https://github.com/ruslan-mart)

Если нашёл баг или есть предложение — открывай issue или отправляй pull request.

---

## 📄 Лицензия

Распространяется под [лицензией MIT](./LICENSE).
