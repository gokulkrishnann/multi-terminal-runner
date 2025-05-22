# Multi Terminal Runner

A VS Code extension that allows you to run multiple commands in separate terminals with a single click — with a simple UI.

## Features

- Automatically detects `npm`/`yarn` scripts from `package.json`
- Run selected or all commands in parallel terminals
- Visual Command Manager UI with checkboxes
- Each command runs in its own terminal
- Optionally configure custom commands via settings
- Supports specifying working directory per command

## Usage

### Open the Command Manager UI

1. Open the command palette:

```

Ctrl+Shift+P / Cmd+Shift+P → Multi Terminal Runner: Open Command Manager

```

2. The webview UI will display a list of commands:

- **Auto-detected** from your `package.json` scripts
- **User-defined** from VS Code settings

3. Check the boxes next to the commands you want to run, or click **Run** beside any command.
4. Click **Run Selected** to execute all selected commands in separate terminals.

## Optional: Add Custom Commands

If your project uses other tools (e.g., Python, Django, Bash), you can define commands manually in your VS Code settings.

Example:

```json
{
  "multiCmdTerminal.commands": [
    {
      "name": "Start Frontend",
      "command": "npm run dev",
      "cwd": "${workspaceFolder}/frontend"
    },
    {
      "name": "Start Backend",
      "command": "python main.py",
      "cwd": "${workspaceFolder}/backend"
    }
  ]
}
```

## Configuration

Each command has the following properties:

- `name`: A descriptive label for the terminal
- `command`: The shell command to execute
- `cwd`: (Optional) Working directory to run the command in

## Extension Settings

This extension contributes the following setting:

- `multiCmdTerminal.commands`: An array of custom commands to be run in separate terminals

## Requirements

- Visual Studio Code version `^1.85.0` or later

## Future Improvements

- Support for detecting commands from Django, FastAPI, and other frameworks
- Save last used command selections
- Command history and logging
