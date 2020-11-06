'use strict';

import * as vscode from 'vscode';
import * as fs from 'fs';

const mitLicense = `The MIT License (MIT)

Copyright (c) <YEAR> <OWNER>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the \"Software\"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;

function writeToFile(path:string, data:string) {
	fs.writeFile(path, data, (err) => {
		if (err) {
			vscode.window.showErrorMessage(`Unable to write to file: ${err}`);
		} else {
			vscode.window.showInformationMessage(`License created at: ${path}`);
		}
	});
}

function addRootLicense (owner:string) {
	
	const { workspaceFolders } = vscode.workspace;
  if (!workspaceFolders || workspaceFolders?.length === 0) {
		vscode.window.showErrorMessage("You need to open a workspace (folder)");
		throw new Error("No workspace found");
	}
	var licensePath = workspaceFolders[0].uri.path + '/LICENSE.md';
	var licenseString = mitLicense.replace('<OWNER>', owner).replace('<YEAR>', new Date().getFullYear().toString());
	writeToFile(licensePath, licenseString);
}

function setOwner(owner: string) {
	vscode.workspace
		.getConfiguration("mitLicenseAdder")
		.update("owner", owner, false);
	vscode.window.showInformationMessage(`[Configuration] Set mitLicenseAdder.owner to: ${owner}`);
}

function getOwner(): string {
	return <string> vscode.workspace.getConfiguration("mitLicenseAdder").get("owner");
}

function getConfig(): vscode.WorkspaceConfiguration {
	return <vscode.WorkspaceConfiguration> vscode.workspace.getConfiguration("mitLicenseAdder");;
}

export function activate(context: vscode.ExtensionContext) {

	console.log('"mit-license-adder" is now active');
	let disposableAddLicense = vscode.commands.registerCommand('mitLicenseAdder.addMITLicense', () => {
		
		var owner = <string> getOwner();

		if (owner === undefined) {
			vscode.window.showWarningMessage("No Owner has been set, defaulting to 'Jane Doe'");
			owner = "Jane Doe";
		}

		addRootLicense(owner);
	});

	context.subscriptions.push(disposableAddLicense);

	let disposableConfigureOwner = vscode.commands.registerCommand('mitLicenseAdder.configureOwner', () => {
		
		vscode.window.showInputBox({ prompt: 'Enter the owner you would like in your license' }).then((owner) => {
			if (owner) {
				setOwner(owner);
			} else {
				vscode.window.showErrorMessage("[Configuration] No input given");
			}
		});

	});

	context.subscriptions.push(disposableConfigureOwner);
}

export function deactivate() {}
