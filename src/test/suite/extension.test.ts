import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { after } from 'mocha';

let root = path.dirname(path.dirname(__dirname));
let fixtureSrcDir = path.join(root, "../fixtures");

const id = "petems.mit-license-adder";
const cmd = "mitLicenseAdder.addMITLicense";

var chai = require('chai');
var chaiFiles = require('chai-files');

chai.use(chaiFiles);

var expect = chai.expect;
var file = chaiFiles.file;
var dir = chaiFiles.dir;

suite('Extension test suite', () => {
	
	const projectUri = vscode.Uri.file(fixtureSrcDir);
	const licensePath = fixtureSrcDir.toString() + "/LICENSE.md";
	
	after(function(done) {
		try {
			fs.unlinkSync(licensePath);
		} catch(err) {
			console.log("No file to delete", licensePath);
		}
		done();
	});
	
	test('extension', async () => {
		const ext = getExtension();
		
		await ext.activate();
		assert.ok(ext.isActive);
		assert.strictEqual(ext.id, id);
	});
	
	test(`exec command ${cmd}`, async () => {
		await vscode.commands.executeCommand("vscode.openFolder", projectUri);
		await sleep(500);
		await vscode.commands.executeCommand(cmd);
		await sleep(750);
		expect(file(licensePath)).to.exist;
		expect(file(licensePath)).to.contain('MIT License');
	});

	test("extension commands", async () => {

		return vscode.commands.getCommands(true).then((commands) => {
			const extensionCommands = [
				"mitLicenseAdder.addMITLicense",
				"mitLicenseAdder.configureOwner",
			];
			
			const foundCommands = commands.filter((value) => {
				return extensionCommands.indexOf(value) >= 0 || value.startsWith("mitLicenseAdder.");
			});
			
			const errorMsg = "Some extensions commands are not registered properly or a new command is not added to the test";
			assert.strictEqual(foundCommands.length, extensionCommands.length, errorMsg);
		});
	});
});

function getExtension(): vscode.Extension<any> {
	const ext = vscode.extensions.getExtension(id);
	assert.notStrictEqual(undefined, ext);
	return ext as vscode.Extension<any>;
}

function sleep(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}