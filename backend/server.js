require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 静态文件（上传图片等）
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 路由
const { authMiddleware } = require('./middleware/auth');

// 公开路由
app.use('/api/auth', require('./routes/auth'));

// 需要认证的路由
app.use('/api/testimonials', authMiddleware, require('./routes/testimonials'));
app.use('/api/designers', authMiddleware, require('./routes/designers'));
app.use('/api/cases', authMiddleware, require('./routes/cases'));
app.use('/api/services', authMiddleware, require('./routes/services'));
app.use('/api/settings', authMiddleware, require('./routes/settings'));
app.use('/api/employees', authMiddleware, require('./routes/employees'));
app.use('/api/consultations', authMiddleware, require('./routes/consultations'));

// 公开预约接口（前台提交不需要认证）
app.use('/api/public/consultations', require('./routes/consultations'));

// 前端公开数据接口（不需要认证，供前台网站读取）
app.get('/api/public/testimonials', async (req, res) => {
    try {
        const db = require('./config/database');
        const { region } = req.query;
        let sql = 'SELECT id, name, region, content, rating, avatar, created_at FROM testimonials WHERE active = 1';
        const params = [];
        if (region) { sql += ' AND region = ?'; params.push(region); }
        sql += ' ORDER BY created_at DESC LIMIT 20';
        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/public/designers', async (req, res) => {
    try {
        const db = require('./config/database');
        const { region } = req.query;
        let sql = 'SELECT id, name, title, region, experience, styles, bio, photo FROM designers WHERE active = 1';
        const params = [];
        if (region) { sql += ' AND region = ?'; params.push(region); }
        sql += ' ORDER BY id ASC';
        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/public/cases', async (req, res) => {
    try {
        const db = require('./config/database');
        const { category } = req.query;
        let sql = 'SELECT * FROM cases WHERE active = 1';
        const params = [];
        if (category) { sql += ' AND category = ?'; params.push(category); }
        sql += ' ORDER BY created_at DESC';
        const [rows] = await db.query(sql, params);
        const result = rows.map(r => ({ ...r, images: JSON.parse(r.images || '[]') }));
        res.json(result);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/public/services', async (req, res) => {
    try {
        const db = require('./config/database');
        const [rows] = await db.query('SELECT * FROM services WHERE active = 1 ORDER BY id ASC');
        const result = rows.map(r => ({ ...r, features: JSON.parse(r.features || '[]') }));
        res.json(result);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/public/settings', async (req, res) => {
    try {
        const db = require('./config/database');
        const [rows] = await db.query('SELECT site_title, site_phone, default_region FROM settings LIMIT 1');
        res.json(rows[0] || {});
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 错误处理
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ error: '服务器内部错误' });
});

app.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`  洁尚装饰后端API已启动`);
    console.log(`  地址: http://localhost:${PORT}`);
    console.log(`  数据库: ${process.env.DB_NAME}`);
    console.log(`=================================`);
});
