// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import path from 'path';
import os from 'os';
import * as vscode from 'vscode';
import * as child from "child_process";

const MEMORY_STORE: { [key: string]: string } = {};

function expandTilde(filePath: string | vscode.Uri | undefined | null): string | vscode.Uri | undefined | null {
	if (typeof filePath !== 'string') {
		return filePath || undefined;
	}
	if (filePath.startsWith('~/') || filePath === '~') {
		return filePath.replace('~', os.homedir());
	}
	return filePath;
}

function processTextPlaceholders(text: string | vscode.Uri | undefined | null, editor: vscode.TextEditor | undefined): string | vscode.Uri | undefined | null {
	if (!text || typeof text !== 'string') {
		return text;
	}
	let currentWord = "";
	if (editor) {
		currentWord = editor.document.getText(editor.document.getWordRangeAtPosition(editor.selection.active)) || "";
	}

	return text
		.replace(/\{memory:(.*)\}/g, (match, p1) => { return MEMORY_STORE[p1] || ""; })
		.replace("{userHome}", os.homedir())
		.replace("{workspaceFolder}", vscode.workspace.rootPath || '')
		.replace("{workspaceFolderBasename}", path.basename(vscode.workspace.rootPath || ''))
		.replace("{file}", editor?.document.fileName || '')
		.replace("{fileBasename}", path.basename(editor?.document.fileName || ''))
		.replace("{fileBasenameNoExtension}", path.basename(editor?.document.fileName || '', path.extname(editor?.document.fileName || '')))
		.replace("{fileDirname}", path.dirname(editor?.document.fileName || ''))
		.replace("{fileExtname}", path.extname(editor?.document.fileName || ''))
		.replace("{fileExtnameNoLeadingDot}", path.extname(editor?.document.fileName || '').slice(1))
		.replace("{lineNumber}", `${(editor?.selection.active.line || 0) + 1}`)
		.replace("{columnNumber}", `${(editor?.selection.active.character || 0) + 1}`)
		.replace("{selection}", editor?.document.getText(editor?.selection || new vscode.Selection(0, 0, 0, 0)) || '')
		.replace("{selectionOrWord}", (editor?.selection.isEmpty ? currentWord : editor?.document.getText(editor?.selection)) || currentWord || '')
		.replace("{selectionStart}", `${(editor?.selection.start.line || 0) + 1}:${(editor?.selection.start.character || 0) + 1}`)
		.replace("{selectionEnd}", `${(editor?.selection.end.line || 0) + 1}:${(editor?.selection.end.character || 0) + 1}`)
		.replace("{selectionStartLine}", `${(editor?.selection.start.line || 0) + 1}`)
		.replace("{selectionStartColumn}", `${(editor?.selection.start.character || 0) + 1}`)
		.replace("{selectionEndLine}", `${(editor?.selection.end.line || 0) + 1}`)
		.replace("{selectionEndColumn}", `${(editor?.selection.end.character || 0) + 1}`)
		.replace("{word}", currentWord);
}

function processEnvPlaceholders(env: { [key: string]: string | undefined | null } | undefined, editor: vscode.TextEditor | undefined): { [key: string]: string | undefined | null } | undefined {
	if (!env) {
		return env;
	}
	const result: { [key: string]: string | undefined | null } = {};
	for (const [key, value] of Object.entries(env)) {
		const processedValue = processTextPlaceholders(value, editor);
		if (typeof processedValue === 'string') {
			result[key] = processedValue;
		}
	}
	return result;
}

function processShellArgs(shellArgs: string | string[] | undefined, editor: vscode.TextEditor | undefined): string | string[] | undefined {
	if (!shellArgs) {
		return shellArgs;
	}
	if (typeof shellArgs === 'string') {
		return processTextPlaceholders(shellArgs, editor) as string;
	}
	return shellArgs.map((arg) => processTextPlaceholders(arg, editor) as string);
}


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	// console.log('Congratulations, your extension "command-bridge" is now active!');


	const create_terminal_disposable = vscode.commands.registerCommand("command-bridge.createTerminal", async (args: vscode.TerminalOptions) => {
		const editor = vscode.window.activeTextEditor;
		const options: vscode.TerminalOptions = {
			color: args.color,
			cwd: processTextPlaceholders(expandTilde(args.cwd), vscode.window.activeTextEditor) as string | vscode.Uri | undefined,
			env: processEnvPlaceholders(args.env, vscode.window.activeTextEditor),
			hideFromUser: args.hideFromUser,
			iconPath: args.iconPath,
			isTransient: args.isTransient,
			location: args.location, // 1: Panel, 2: Editor
			message: processTextPlaceholders(args.message, vscode.window.activeTextEditor) as string | undefined,
			name: processTextPlaceholders(args.name, vscode.window.activeTextEditor) as string | undefined,
			shellArgs: processShellArgs(args.shellArgs, vscode.window.activeTextEditor),
			shellPath: processTextPlaceholders(args.shellPath, vscode.window.activeTextEditor) as string | undefined,
			strictEnv: args.strictEnv,
		};
		vscode.window.createTerminal(options);
	});
	context.subscriptions.push(create_terminal_disposable);


	const exec_disposable = vscode.commands.registerCommand("command-bridge.exec", async (args: any) => {
		const editor = vscode.window.activeTextEditor;
		const cmd = processTextPlaceholders(args.command, editor);
		try {
			child.exec(cmd as string);
		} catch (error) {
			vscode.window.setStatusBarMessage(`Error running ${cmd}: ${error}`);
		}
		
	});
	context.subscriptions.push(exec_disposable);


	const copy_disposable = vscode.commands.registerCommand("command-bridge.copy", async (args: any) => {
		const editor = vscode.window.activeTextEditor;
		const result = args.lines.map((line: string) => {
			return processTextPlaceholders(line, editor);
		}).join("\n");

		vscode.env.clipboard.writeText(result);
	});
	context.subscriptions.push(copy_disposable);

	const open_file_disposable = vscode.commands.registerCommand("command-bridge.openFile", async (args: { paths: string[] | string }) => {
		const editor = vscode.window.activeTextEditor;
		const filePaths = Array.isArray(args.paths) ? args.paths : [args.paths];
		
		for (const path of filePaths) {
			const processedPath = processTextPlaceholders(path, editor) as string;
			const filePath = expandTilde(processedPath) as string;
			
			try {
				const uri = vscode.Uri.file(filePath);
				const document = await vscode.workspace.openTextDocument(uri);
				await vscode.window.showTextDocument(document, { preview: false });
			} catch (error) {
				vscode.window.showErrorMessage(`Failed to open file ${filePath}: ${error}`);
			}
		}
	});
	context.subscriptions.push(open_file_disposable);

	const remember_disposable = vscode.commands.registerCommand("command-bridge.remember", async (args: { namespace: string, text: string}) => {
		const editor = vscode.window.activeTextEditor;
		const namespace = processTextPlaceholders(args.namespace, editor) as string;
		const text = processTextPlaceholders(args.text, editor) as string;
		MEMORY_STORE[namespace] = text;
	});
	context.subscriptions.push(remember_disposable);

	vscode.window.onDidCloseTerminal((event) => {
		const terminal = event;
		const terminalLocation = terminal.creationOptions.location;
		if (terminalLocation === vscode.TerminalLocation.Editor) {
			// active first editor group
			vscode.commands.executeCommand("workbench.action.focusFirstEditorGroup");
		}
	});
}

// This method is called when your extension is deactivated
export function deactivate() {}
