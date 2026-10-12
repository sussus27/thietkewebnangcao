const { createProxyMiddleware } = require('http-proxy-middleware');

function proxy(target) {
    return createProxyMiddleware({
        target,
        changeOrigin: true
    });
}

module.exports = proxy;