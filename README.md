# ElSQL Language Support

Based on the lsp-sample for VS Code: https://code.visualstudio.com/api/language-extensions/language-server-extension-guide

## Features

- Code completion proposals
- Hover information
- Function signature help
- Go to implementation (or definition?) for @NAME blocks
- Preview of @NAME blocks
- Supply document symbols overview (list of @NAME blocks for easy navigation)
- Rename variables and @NAME blocks

### Coming Soon

- Find all references to variables and @NAME blocks
- Format document

## Structure

```
.
├── client // Language Client
│   ├── src
│   │   └── extension.ts // Language Client entry point
├── package.json // The extension manifest.
└── server // Language Server
    └── src
        └── server.ts // Language Server entry point
```

## Launching the LS

- Run `npm install` in this folder. This installs all necessary npm modules in both the client and server folder
- Open VS Code on this folder.
- Press Ctrl+Shift+B to compile the client and server.
- Switch to the Debug viewlet.
- Select `Launch Client` from the drop down.
- Run the launch config.
- If you want to debug the server as well use the launch configuration `Attach to Server`
