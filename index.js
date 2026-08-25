const express = require("express");
const cookieParser = require("cookie-parser");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const storedCookies = [];
const PORT = 5000;

app.use(cookieParser());

const customProxy = createProxyMiddleware({
  target: "https://arsenic.smartfoloo.space/",
  changeOrigin: true,
  ws: true,
  onProxyReq: (proxyReq) => {
    storedCookies.forEach((cookie) => {
      proxyReq.setHeader("cookie", `${cookie.name}=${cookie.value}`);
    });
  }
});

app.use((req, res, next) => {
  const ignoredPaths = ["/404.html"];

  if (!ignoredPaths.includes(req.url)) {
    customProxy(req, res, next);
  } else {
    next();
  }
});

const server = app.listen(PORT, () => {
  console.log(`FA-v2 server listening on port ${PORT}`);
});

// Express never forwards the HTTP upgrade event to its middleware on its own,
// so without this, wisp's WebSocket handshake (proxied via customProxy) just
// hangs with no response - the shell loads but nothing can actually browse.
server.on("upgrade", customProxy.upgrade);