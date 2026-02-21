import * as vscode from 'vscode';

let outputChannel: vscode.OutputChannel | undefined;

function getOutputChannel(): vscode.OutputChannel {
    if (!outputChannel) {
        outputChannel = vscode.window.createOutputChannel('No-Send-Enter');
    }
    return outputChannel;
}

function isDebugEnabled(): boolean {
    try {
        const value = vscode.workspace.getConfiguration('noSendEnter').get<boolean>('debug', false);
        return value ?? false;
    } catch {
        return false;
    }
}

function log(message: string): void {
    if (isDebugEnabled()) {
        const timestamp = new Date().toISOString();
        getOutputChannel().appendLine(`[${timestamp}] ${message}`);
    }
}

/**
 * Two-layer enable/disable check:
 * 1. package.json keybindings when clause (declarative) - prevents binding activation entirely
 * 2. This isEnabled() check (imperative) - safety net for runtime configuration changes
 * Both checks are kept for defense in depth.
 */
function isEnabled(): boolean {
    try {
        const value = vscode.workspace.getConfiguration('noSendEnter').get<boolean>('enabled', true);
        return value ?? true;
    } catch {
        return true;
    }
}

export function activate(context: vscode.ExtensionContext): void {
    const newlineCmd = vscode.commands.registerCommand('noSendEnter.newline', () => {
        if (!isEnabled()) {
            return Promise.resolve();
        }
        log('newline command executed');
        try {
            return vscode.commands.executeCommand('default:type', { text: '\n' });
        } catch (error) {
            log(`newline error: ${error}`);
            return Promise.resolve();
        }
    });

    const sendCmd = vscode.commands.registerCommand('noSendEnter.send', () => {
        if (!isEnabled()) {
            return Promise.resolve();
        }
        log('send command executed');
        try {
            const result = Promise.allSettled([
                vscode.commands.executeCommand('workbench.action.chat.submit'),
                vscode.commands.executeCommand('aichat.sendMessage'),
            ]);
            result.then((results) => {
                results.forEach((r, i) => {
                    if (r.status === 'rejected') {
                        log(`send command ${i} failed: ${r.reason}`);
                    }
                });
            });
            return result;
        } catch (error) {
            log(`send error: ${error}`);
            return Promise.resolve();
        }
    });

    context.subscriptions.push(newlineCmd, sendCmd);
}

export function deactivate(): void {}
