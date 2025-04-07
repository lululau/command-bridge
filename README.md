# Command Bridge

Command Bridge is a VS Code extension that helps you execute custom commands and scripts directly from VS Code. It provides a bridge between your editor and your command-line tools, making it easier to run frequently used commands without leaving your development environment.

## Features

- Execute custom commands directly from VS Code
- Configure and save frequently used commands
- Run commands in integrated terminal or background
- View command output in a dedicated output channel

## Installation

1. Open VS Code
2. Press `Ctrl+P` / `Cmd+P` to open the Quick Open dialog
3. Type `ext install command-bridge`
4. Press Enter to install

## Usage

### Contributed Commands

The extension provides the following commands:

#### `command-bridge.createTerminal`
Creates a new integrated terminal with specified options.
```json
{
    "command": "command-bridge.createTerminal",
    "args": {
        "name": "My Terminal",
        "cwd": "~/projects",
        "shellPath": "/bin/zsh",
        "shellArgs": ["-l"]
    }
}
```

#### `command-bridge.exec`
Executes a shell command.
```json
{
    "command": "command-bridge.exec",
    "args": {
        "command": "echo Hello World"
    }
}
```

#### `command-bridge.copy`
Copies specified text to clipboard.
```json
{
    "command": "command-bridge.copy",
    "args": {
        "lines": ["Line 1", "Line 2"]
    }
}
```

#### `command-bridge.remember`
Stores text in memory for later use with the {memory} placeholder.
```json
{
    "command": "command-bridge.remember",
    "args": {
        "namespace": "myKey",
        "text": "Value to remember"
    }
}
```

#### `command-bridge.openFile`
Opens one or multiple files in the editor. Supports both absolute and relative paths. The `~` symbol can be used to represent the home directory.
```json
{
    "command": "command-bridge.openFile",
    "args": {
        "paths": [
            "~/Documents/file1.txt",
            "{workspaceFolder}/src/file2.js"
        ]
    }
}
```

### Available Placeholders

The following placeholders can be used in command arguments:

- `{memory:namespace}`: Retrieves previously stored text using command-bridge.remember
- `{userHome}`: User's home directory
- `{workspaceFolder}`: Current workspace folder path
- `{workspaceFolderBasename}`: Name of the workspace folder
- `{file}`: Current file's full path
- `{fileBasename}`: Current file's name with extension
- `{fileBasenameNoExtension}`: Current file's name without extension
- `{fileDirname}`: Directory containing the current file
- `{fileExtname}`: Current file's extension
- `{fileExtnameNoLeadingDot}`: Current file's extension without the leading dot
- `{lineNumber}`: Current line number
- `{columnNumber}`: Current column number
- `{selection}`: Currently selected text
- `{word}`: Word at current cursor position

## Requirements

- Visual Studio Code version 1.96.0 or higher

## Extension Settings

This extension contributes the following settings:

* `command-bridge.enable`: Enable/disable the extension
* More settings coming soon...

## Release Notes

### 0.0.1

- Initial release
- Implemented createTerminal, exec, copy, and openFile commands
- Added support for path placeholders and home directory expansion

## Contributing

The source code for this extension is available on [GitHub](https://github.com/command-bridge). Contributions are welcome!

## License

This extension is licensed under the [MIT License](LICENSE).

---

**Enjoy using Command Bridge!**
