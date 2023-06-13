# Editorjs-Expand
**Inline tool for expanding content with header by AI.**

![intro](intro.gif)

## Installation
Use your package manager to install the package `editorjs-expand`.

```
npm install editorjs-expand

yarn add editorjs-expand
```

## Usage example
```js
    const editor = new EditorJS({
      tools: {
        header: {
          class: Header,
          tunes: ['expand']
        },
        expand: {
          class: Expand,
          config: {
            url: 'your_ai_endpoint',
            method: 'request_method',
            model: 'gpt-3.5-turbo',
            credential: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer xxxx'
            },
            genPrompts: (origin) => {
              return `What is :${origin}`
            }
          }
        }
      }
    });
```
