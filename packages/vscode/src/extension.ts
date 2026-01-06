import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

let watchProcess: cp.ChildProcess | null = null;
let statusBarItem: vscode.StatusBarItem;
let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
    outputChannel = vscode.window.createOutputChannel('PolyRPC');
    
    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.command = 'polyrpc.toggleWatch';
    updateStatusBar(false);
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('polyrpc.start', startWatching),
        vscode.commands.registerCommand('polyrpc.stop', stopWatching),
        vscode.commands.registerCommand('polyrpc.generate', generateTypes),
        vscode.commands.registerCommand('polyrpc.init', initProject),
        vscode.commands.registerCommand('polyrpc.toggleWatch', toggleWatch)
    );

    // Auto-start if configured
    const config = vscode.workspace.getConfiguration('polyrpc');
    if (config.get('autoStart') && hasPolyrpcConfig()) {
        startWatching();
    }

    outputChannel.appendLine('PolyRPC extension activated');
}

export function deactivate() {
    stopWatching();
}

function hasPolyrpcConfig(): boolean {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) return false;
    
    const configPath = path.join(workspaceFolder.uri.fsPath, 'polyrpc.toml');
    return fs.existsSync(configPath);
}

function getBinaryPath(): string {
    const config = vscode.workspace.getConfiguration('polyrpc');
    const customPath = config.get<string>('binaryPath');
    
    if (customPath && fs.existsSync(customPath)) {
        return customPath;
    }
    
    // Try to find in PATH
    return 'polyrpc';
}

async function startWatching() {
    if (watchProcess) {
        vscode.window.showInformationMessage('PolyRPC is already watching');
        return;
    }

    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder open');
        return;
    }

    if (!hasPolyrpcConfig()) {
        const init = await vscode.window.showWarningMessage(
            'No polyrpc.toml found. Initialize PolyRPC?',
            'Initialize',
            'Cancel'
        );
        if (init === 'Initialize') {
            await initProject();
        }
        return;
    }

    const binaryPath = getBinaryPath();
    
    try {
        watchProcess = cp.spawn(binaryPath, ['watch'], {
            cwd: workspaceFolder.uri.fsPath,
            shell: true
        });

        watchProcess.stdout?.on('data', (data) => {
            outputChannel.appendLine(data.toString());
        });

        watchProcess.stderr?.on('data', (data) => {
            outputChannel.appendLine(`[ERROR] ${data.toString()}`);
        });

        watchProcess.on('close', (code) => {
            outputChannel.appendLine(`PolyRPC process exited with code ${code}`);
            watchProcess = null;
            updateStatusBar(false);
        });

        watchProcess.on('error', (err) => {
            vscode.window.showErrorMessage(`Failed to start PolyRPC: ${err.message}`);
            outputChannel.appendLine(`[ERROR] ${err.message}`);
            watchProcess = null;
            updateStatusBar(false);
        });

        updateStatusBar(true);
        vscode.window.showInformationMessage('PolyRPC: Started watching');
        outputChannel.appendLine('Started watching for Python file changes');
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to start PolyRPC: ${error}`);
    }
}

function stopWatching() {
    if (watchProcess) {
        watchProcess.kill();
        watchProcess = null;
        updateStatusBar(false);
        vscode.window.showInformationMessage('PolyRPC: Stopped watching');
        outputChannel.appendLine('Stopped watching');
    }
}

function toggleWatch() {
    if (watchProcess) {
        stopWatching();
    } else {
        startWatching();
    }
}

async function generateTypes() {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder open');
        return;
    }

    const binaryPath = getBinaryPath();
    
    outputChannel.appendLine('Generating types...');
    
    cp.exec(`${binaryPath} generate`, { cwd: workspaceFolder.uri.fsPath }, (error, stdout, stderr) => {
        if (error) {
            vscode.window.showErrorMessage(`PolyRPC generate failed: ${error.message}`);
            outputChannel.appendLine(`[ERROR] ${error.message}`);
            return;
        }
        
        if (stderr) {
            outputChannel.appendLine(`[WARN] ${stderr}`);
        }
        
        outputChannel.appendLine(stdout);
        vscode.window.showInformationMessage('PolyRPC: Types generated successfully');
    });
}

async function initProject() {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder open');
        return;
    }

    const binaryPath = getBinaryPath();
    
    cp.exec(`${binaryPath} init`, { cwd: workspaceFolder.uri.fsPath }, (error, stdout, stderr) => {
        if (error) {
            vscode.window.showErrorMessage(`PolyRPC init failed: ${error.message}`);
            outputChannel.appendLine(`[ERROR] ${error.message}`);
            return;
        }
        
        outputChannel.appendLine(stdout);
        vscode.window.showInformationMessage('PolyRPC: Project initialized');
    });
}

function updateStatusBar(watching: boolean) {
    if (watching) {
        statusBarItem.text = '$(eye) PolyRPC';
        statusBarItem.tooltip = 'PolyRPC is watching (click to stop)';
        statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.activeBackground');
    } else {
        statusBarItem.text = '$(eye-closed) PolyRPC';
        statusBarItem.tooltip = 'PolyRPC is not watching (click to start)';
        statusBarItem.backgroundColor = undefined;
    }
}
