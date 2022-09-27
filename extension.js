const vscode = require('vscode');
const connector = require('./connector');
const fs = require('fs');

const watchers = new Map();

function activate(context) {
	context.subscriptions.push(
		vscode.commands.registerCommand('acgstore.setHost', setHost),
		vscode.commands.registerCommand('acgstore.push', push),
	);
}


function getConfig() {
	return vscode.workspace.getConfiguration('acgstore');
}

async function setHost(host) {
	const ip = await vscode.window.showInputBox({
		ignoreFocusOut: true,
		placeHolder: '调试地址(eg. 192.168.31.104)',
		prompt: '保持和客户端在同一网络，客户端开启Debug模式，查看调试地址',
		value: host || getConfig().get('host') || ''
	});
	if (isIP(ip)) {
		let connected = await connector.ping(ip);
		if (connected) {
			let config = getConfig();
			config.update('host', ip, true);
			showMessage("IP地址已保存");
		} else {
			showError("连接失败，请保证和手机在同一网络");
			setHost(ip);
		}
	} else {
		showError("请输入正确的IP地址");
		setHost(ip);
	}
}

async function push() {
	try {
		let document = vscode.window.activeTextEditor.document.getText();
		let site = JSON.parse(document);
		if (!site.sid || !site.baseUrl) {
			showError('当前文件不是宅之便利店插件');
			return;
		}
		let fileName = vscode.window.activeTextEditor.document.fileName;
		let code = getCode(fileName)
		site.script.code = code;
		vscode.window.activeTextEditor.edit((edit) => {
			const start = new vscode.Position(0, 0);
			const end = new vscode.Position(vscode.window.activeTextEditor.document.lineCount + 1, 0);
			const text = JSON.stringify(site);
			edit.replace(new vscode.Range(start, end), text);
		});
		var success = await connector.push(site);
		if(success){
			showMessage("发送成功");
		}else{
			showError("发送失败，请检查网络");
		}
	} catch (e) {
		showError(e);
		return;
	}
}

function getCode(fileName) {
	let name = fileName.replace('.json', '.js');
	if (!fs.existsSync(name)) {
		throw "没有找到同名.js文件，请将同名.js文件放在当前目录";
	}
	var code = fs.readFileSync(name, 'utf-8');

	return Buffer.from(code).toString('base64');;
}

function showMessage(msg) {
	console.log(msg)
	vscode.window.showInformationMessage(`[ACG-Store] ${msg}`)
}

function showError(error) {
	console.error(error)
	if (vscode.debug) {
		vscode.window.showErrorMessage(`[ACG-Store] ${error}`)
	}
}

function isIP(str) {
	const pattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
	return pattern.test(str)
}

function deactivate() { }

module.exports = {
	activate,
	deactivate
}
