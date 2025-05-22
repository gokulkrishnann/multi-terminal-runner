import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "multiCmdTerminal.openUI",
    async () => {
      const panel = vscode.window.createWebviewPanel(
        "multiCmdTerminalUI",
        "Multi Cmd Terminal",
        vscode.ViewColumn.One,
        {
          enableScripts: true,
        }
      );

      const config = vscode.workspace.getConfiguration("multiCmdTerminal");
      let commands = config.get<any[]>("commands") || [];

      // Auto-detect npm scripts from package.json
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (workspaceFolders) {
        const packageJsonPath = path.join(
          workspaceFolders[0].uri.fsPath,
          "package.json"
        );
        if (fs.existsSync(packageJsonPath)) {
          try {
            const packageJson = JSON.parse(
              fs.readFileSync(packageJsonPath, "utf-8")
            );
            const scripts = packageJson.scripts || {};
            const scriptCommands = Object.keys(scripts).map((name) => ({
              name: `npm run ${name}`,
              command: `npm run ${name}`,
            }));

            // Filter out duplicates by command string
            const seen = new Set(commands.map((c) => c.command));
            for (const cmd of scriptCommands) {
              if (!seen.has(cmd.command)) {
                commands.push(cmd);
                seen.add(cmd.command);
              }
            }
          } catch (err) {
            console.error("Failed to read package.json scripts", err);
          }
        }
      }

      panel.webview.html = getWebviewContent(commands);

      panel.webview.onDidReceiveMessage(
        (message) => {
          if (message.type === "runCommand") {
            const cmd = commands[message.index];
            const terminal = vscode.window.createTerminal({ name: cmd.name });
            terminal.show();
            terminal.sendText(cmd.command);
          } else if (message.type === "runSelected") {
            message.indices.forEach((i: number) => {
              const cmd = commands[i];
              const terminal = vscode.window.createTerminal({ name: cmd.name });
              terminal.show();
              terminal.sendText(cmd.command);
            });
          }
        },
        undefined,
        context.subscriptions
      );
    }
  );

  context.subscriptions.push(disposable);
}

function getWebviewContent(commands: any[]): string {
  if (commands.length === 0) {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Multi Terminal Runner</title>
      </head>
      <body>
        <h2>No commands found</h2>
        <p>Please configure commands in settings or add npm scripts to package.json.</p>
      </body>
      </html>
    `;
  }

  const commandListHtml = commands
    .map(
      (cmd, index) => `
    <li>
      <input type="checkbox" class="cmd-checkbox" id="check-${index}" />
      <label for="check-${index}"><strong>${cmd.name}</strong></label>
      <button onclick="runCommand(${index})">Run</button>
    </li>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Multi Terminal Runner</title>
    </head>
    <body>
      <h2>Multi Terminal Runner</h2>
      <div>
        <input type="checkbox" id="check-all" onchange="toggleAll(this)" /> <label for="check-all"><strong>Select/Deselect All</strong></label>
      </div>
      <ul>${commandListHtml}</ul>
      <button onclick="runSelected()">Run Selected</button>

      <script>
        const vscode = acquireVsCodeApi();

        function runCommand(index) {
          vscode.postMessage({ type: 'runCommand', index });
        }

        function runSelected() {
          const indices = Array.from(document.querySelectorAll('.cmd-checkbox'))
            .map((el, i) => el.checked ? i : -1)
            .filter(i => i !== -1);
          vscode.postMessage({ type: 'runSelected', indices });
        }

        function toggleAll(source) {
          const checkboxes = document.querySelectorAll('.cmd-checkbox');
          checkboxes.forEach(cb => cb.checked = source.checked);
        }
      </script>
    </body>
    </html>
  `;
}

export function deactivate() {}
