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
  <p>Расширение VS Code для ECSS: подсветка синтаксиса и языковой сервер для <code>.ecss</code>-файлов.</p>
  <p>
    <a href="https://ecss.webea.ch/ru/reference/editors.html" style="font-size: 1.5em">📖 Documentation</a>
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

## 📦 Установка

Установите расширение из [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=webeach.ecss-language-support): откройте панель Extensions (`Ctrl+Shift+X` / `Cmd+Shift+X`) и найдите **«ECSS — Extended CSS»**.

Либо через Quick Open (`Ctrl+P` / `Cmd+P`):

```
ext install webeach.ecss-language-support
```

---

## ✨ Возможности

Расширение регистрирует язык `ecss` для `.ecss`-файлов, подключает TextMate-грамматику для подсветки синтаксиса и запускает языковой сервер ECSS (`@ecss/language-service`):

- подсветка синтаксиса для `.ecss`-файлов;
- диагностика — ошибки подсвечиваются прямо в коде;
- всплывающие подсказки при наведении (hover);
- автодополнение директив, типов и значений `@enum`;
- переход к определению и поиск ссылок;
- символы документа (структура файла).

---

## 👨‍💻 Автор

Разработка и поддержка: [Руслан Мартынов](https://github.com/ruslan-mart)

Если нашёл баг или есть предложение — открывай issue или отправляй pull request.

---

## 📄 Лицензия

Распространяется под [лицензией MIT](https://github.com/webeach/ecss/blob/main/LICENSE).
