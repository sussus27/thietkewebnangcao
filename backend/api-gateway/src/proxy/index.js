const { createProxyMiddleware } = require('http-proxy-middleware');

function proxy(target) {
    return createProxyMiddleware({
        target,
        changeOrigin: true,
        pathRewrite: (path, req) => req.originalUrl || path
    });
}

module.exports = proxy;