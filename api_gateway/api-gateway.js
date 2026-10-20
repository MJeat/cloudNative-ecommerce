const express = require('express');
const os = require('os');
const app = express();

const path = require('path');
require('dotenv').config({
    path: path.join(__dirname, '.env')
});

const httpProxy = require('http-proxy');
const proxy = httpProxy.createProxyServer();
const { authenticateToken, authorizeRole } = require('./auth.js');

const services = {
    admin: process.env.ADMIN_SERVICE_URL || 'http://localhost:5001',
    user: process.env.USER_SERVICE_URL || 'http://localhost:5002',
    registration: process.env.REGISTRATION_SERVICE_URL || 'http://localhost:5003',
    login: process.env.LOGIN_SERVICE_URL || 'http://localhost:5004',
    inventory: process.env.INVENTORY_SERVICE_URL || 'http://localhost:5005',
    product: process.env.PRODUCT_SERVICE_URL || 'http://localhost:5006',
    category: process.env.CATEGORY_SERVICE_URL || 'http://localhost:5007',
    review: process.env.REVIEW_SERVICE_URL || 'http://localhost:5008',
    order: process.env.ORDER_SERVICE_URL || 'http://localhost:5009',
    payment: process.env.PAYMENT_SERVICE_URL || 'http://localhost:5010'
};

const proxyTo = (target, servicePrefix = '') => (req, res) => {
    if (servicePrefix) {
        const requestPath = req.url === '/' ? '' : req.url;
        req.url = `${servicePrefix}${requestPath}` || '/';
    }

    proxy.web(req, res, { target });
};

const adminOnlyForWrites = (req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }

    return authenticateToken(req, res, () =>
        authorizeRole('admin')(req, res, next)
    );
};

app.get('/', (req, res) => {
    res.json({
        service: 'api-gateway',
        status: 'ok',
        gateway: process.env.GATEWAY_ID || os.hostname()
    });
});

app.use('/login', proxyTo(services.login));
app.use(['/register', '/reg'], proxyTo(services.registration));
app.use(['/admin', '/ad'], authenticateToken, authorizeRole('admin'), proxyTo(services.admin));
app.use('/user', authenticateToken, authorizeRole(['admin', 'user', 'student']), (req, res, next) => {
    req.headers['x-user-id'] = req.user.sub;
    proxyTo(services.user, '/users')(req, res, next);
});

app.use('/products', adminOnlyForWrites, proxyTo(services.product, '/products'));
app.use('/categories', adminOnlyForWrites, proxyTo(services.category, '/categories'));
app.use('/inventory', authenticateToken, authorizeRole('admin'), proxyTo(services.inventory, '/inventory'));
app.use('/orders', authenticateToken, authorizeRole(['admin', 'user', 'student']), proxyTo(services.order, '/orders'));
app.use('/payments', authenticateToken, authorizeRole(['admin', 'user', 'student']), proxyTo(services.payment, '/payments'));
app.use('/reviews', authenticateToken, authorizeRole(['admin', 'user', 'student']), proxyTo(services.review, '/reviews'));

proxy.on('error', (error, req, res) => {
    console.error(`Proxy request failed: ${error.code}`);

    if (res.destroyed) {
        return;
    }

    if (res.headersSent) {
        return res.end();
    }

    res.status(502).json({ error: 'Service unavailable' });
});

const port = Number(process.env.GATEWAY_PORT || 5011);

app.listen(port, () => {
    console.log(
        "API Gateway Service is running on PORT NO : ",
        port
    );
});