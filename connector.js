
const axios = require('axios');
const vscode = require('vscode');

async function ping(ip) {
    try {
        let resp = await axios.get(`http://${ip}:8889/site/ping`, { timeout: 3000 });
        return resp.data = 'pong';
    } catch (e) {
        return false;
    }
}

async function push(site) {
    // console.log(123)
    try {
        let resp = await axios.post(`${endpoint()}/site/add`, site, { timeout: 3000 });
        return resp.data === "SUCCESS";
    } catch (e) {
        return false;
    }

}

function endpoint() {
    const config = vscode.workspace.getConfiguration('acgstore');
    const host = config.get('host');
    if (!host) {
        throw "没有设置手机IP地址";
    }
    return `http://${host}:8889`;
}

module.exports = {
    ping,
    push
}