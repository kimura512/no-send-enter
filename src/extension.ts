import * as vscode from 'vscode';

function isEnabled(): boolean {
    return vscode.workspace.getConfiguration('noSendEnter').get<boolean>('enabled', true);
}

export function activate(context: vscode.ExtensionContext): void {
    const newlineCmd = vscode.commands.registerCommand('noSendEnter.newline', () => {
        if (!isEnabled()) {
            return;
        }
        return vscode.commands.executeCommand('type', { text: '\n' });
    });

    const sendCmd = vscode.commands.registerCommand('noSendEnter.send', () => {
        if (!isEnabled()) {
            return;
        }
        return Promise.allSettled([
            vscode.commands.executeCommand('workbench.action.chat.send'),
            vscode.commands.executeCommand('chat.action.submit'),
        ]);
    });

    context.subscriptions.push(newlineCmd, sendCmd);
}

export function deactivate(): void {}
