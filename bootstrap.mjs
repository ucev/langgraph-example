import './loadenv.mjs'
import nodeFetch from 'node-fetch'
import { HttpsProxyAgent } from "https-proxy-agent";

// node fetch原生不支持代理
if (process.env.PROXY_URL) {
    const agent = new HttpsProxyAgent(process.env.PROXY_URL);
    global.fetch = (url, params) => {
        return nodeFetch(url, { agent, ...params })
    }
}