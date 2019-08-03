const {URLSearchParams} = require('url')
const vscode = require('vscode');
const request = require('request-promise');
const open = require('open');
const http = require('http');

/** * @param {vscode.ExtensionContext} context */
function activate(context) {

	let uploadFile = vscode.commands.registerCommand('extension.uploadFile', async (uri) => {
		const settings = vscode.workspace.getConfiguration('gcp-storage');

		if (!settings.get('bucket')) {
			const bucketName = await vscode.window.showInputBox({prompt: 'GCloud Bucket Name'});
			try {
				await settings.update('bucket', bucketName)
			} catch (error) {
				await vscode.window.showErrorMessage(JSON.stringify(error));
			}
		}

		const code = await getCode();
		const token = getAuthCode(code);

		await uploadToBucket(settings.get('bucket'), uri.fsPath, token);
	});

	//let setBucket = vscode.commands.registerCommand(, callback)

	context.subscriptions.push(uploadFile);
}
exports.activate = activate;

const port = 1234;

const config = {
	client_id: '756225017183-67sg3odsub287bf1bf1tjvl3fhumtfkq.apps.googleusercontent.com',
	redirect_uri: `http://127.0.0.1:${port}`,
	response_type: 'code',
	scope: 'https://www.googleapis.com/auth/devstorage.read_write'
}

function getCode() {
	const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.client_id}&redirect_uri=${config.redirect_uri}&response_type=${config.response_type}&scope=${config.scope}`;

	open(url);

	return new Promise(function (resolve, reject) {
		const server = http.createServer(function (req, res) {
			res.writeHead(200, {'Content-Type': 'text/plain'});
			res.write('Authorized');
			res.end();
			server.close();
			const params = new URLSearchParams(req.url);
			resolve(params.get('code'));
		}).listen(port);
	});
}

function getAuthCode(code) {
	request.post({
		url: 'https://www.googleapis.com/oauth2/v4/token',
		body: {
			code,
			client_id: config.client_id,
		}
	}).then(console.log);
}

async function uploadToBucket(bucket, filePath, authToken) {

}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {activate, deactivate}