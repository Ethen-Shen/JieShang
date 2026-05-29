const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'jieshang_secret_key_2024';

function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: '未登录，请先登录' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: '登录已过期，请重新登录' });
    }
}

function generateToken(user) {
    return jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
}

module.exports = { authMiddleware, generateToken };
