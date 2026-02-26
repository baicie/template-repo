import * as vscode from 'vscode';
import { add } from '@repo/utils';

export function activate(context: vscode.ExtensionContext) {
  console.info('Congratulations, your extension "vscode-ext" is now active!');

  let disposable = vscode.commands.registerCommand('vscode-ext.helloWorld', () => {
    vscode.window.showInformationMessage(`Hello World from VSCode Ext! 1 + 2 = ${add(1, 2)}`);
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}
