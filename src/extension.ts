import * as vscode from 'vscode';

let outputChannel: vscode.OutputChannel | undefined;

function getOutputChannel(): vscode.OutputChannel {
    if (!outputChannel) {
        outputChannel = vscode.window.createOutputChannel('No-Send-Enter');
    }
    return outputChannel;
}

function isDebug(): boolean {
    try {
        return vscode.workspace.getConfiguration('noSendEnter').get<boolean>('debug', false) ?? false;
    } catch {
        return false;
    }
}

function log(message: string): void {
    if (!isDebug()) { return; }
    const timestamp = new Date().toISOString();
    getOutputChannel().appendLine(`[${timestamp}] ${message}`);
}

function isEnabled(): boolean {
    try {
        const value = vscode.workspace.getConfiguration('noSendEnter').get<boolean>('enabled', true);
        return value ?? true;
    } catch {
        return true;
    }
}

export function activate(context: vscode.ExtensionContext): void {
    log('=== No-Send-Enter activated ===');
    log(`VS Code version: ${vscode.version}`);
    log(`Extension mode: ${vscode.ExtensionMode[context.extensionMode]}`);

    const newlineCmd = vscode.commands.registerCommand('noSendEnter.newline', async () => {
        log('>>> newline command FIRED! <<<');

        if (!isEnabled()) {
            log('Extension disabled, skipping');
            return;
        }

        // Strategy 1: default:type (works in standard editors)
        try {
            log('Trying strategy 1: default:type');
            await vscode.commands.executeCommand('default:type', { text: '\n' });
            log('Strategy 1 succeeded');
            return;
        } catch (error) {
            log(`Strategy 1 failed: ${error}`);
        }

        // Strategy 2: type command
        try {
            log('Trying strategy 2: type');
            await vscode.commands.executeCommand('type', { text: '\n' });
            log('Strategy 2 succeeded');
            return;
        } catch (error) {
            log(`Strategy 2 failed: ${error}`);
        }

        // Strategy 3: editor.action.insertLineAfter
        try {
            log('Trying strategy 3: editor.action.insertLineAfter');
            await vscode.commands.executeCommand('editor.action.insertLineAfter');
            log('Strategy 3 succeeded');
            return;
        } catch (error) {
            log(`Strategy 3 failed: ${error}`);
        }

        log('All strategies failed');
    });

    const sendCmd = vscode.commands.registerCommand('noSendEnter.send', async () => {
        log('>>> send command FIRED! <<<');

        if (!isEnabled()) {
            log('Extension disabled, skipping');
            return;
        }

        const commands = [
            'antigravity.sendChatActionMessage',
            'antigravity.agent.submit',
            'workbench.action.chat.run',
            'workbench.action.chat.submit',
            'aichat.sendMessage',
        ];

        for (const cmd of commands) {
            try {
                log(`Trying send command: ${cmd}`);
                await vscode.commands.executeCommand(cmd);
                log(`Send command ${cmd} succeeded`);
                return;
            } catch (error: any) {
                log(`Send command ${cmd} failed: ${error?.message || error}`);
            }
        }

        log('All send commands failed');
    });

    context.subscriptions.push(newlineCmd, sendCmd);
    log('Commands registered successfully');
}

export function deactivate(): void { }
