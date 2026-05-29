/**
 * Vercel Postgres 服务器入口
 * 用于本地开发测试 Vercel Postgres 数据库
 * 
 * 运行方式: node server.postgres.js
 * 
 * 特点:
 * - 使用PostgreSQL数据库
 * - 适配Vercel环境变量
 */

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

// 认证中间件（简化版）
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    // 简化验证，实际使用JWT
    if (!token) return res.status(401).json({ error: '未授权' });
    next();
};

// PostgreSQL路由
const consultationsRoutes = require('./routes/consultations-postgres');
const employeesRoutes = require('./routes/employees-postgres');
const testimonialsRoutes = require('./routes/testimonials-postgres');
const designersRoutes = require('./routes/designers-postgres');
const casesRoutes = require('./routes/cases-postgres');
const servicesRoutes = require('./routes/services-postgres');
const settingsRoutes = require('./routes/settings-postgres');

// 公开路由
app.use('/api/auth', require('./routes/auth'));

// 需要认证的路由
app.use('/api/testimonials', authMiddleware, testimonialsRoutes);
app.use('/api/designers', authMiddleware, designersRoutes);
app.use('/api/cases', authMiddleware, casesRoutes);
app.use('/api/services', authMiddleware, servicesRoutes);
app.use('/api/settings', authMiddleware, settingsRoutes);
app.use('/api/employees', authMiddleware, employeesRoutes);
app.use('/api/consultations', authMiddleware, consultationsRoutes);

// 公开预约接口（前台提交不需要认证）
app.use('/api/public/consultations', consultationsRoutes);

// 前端公开数据接口（不需要认证，供前台网站读取）
app.get('/api/public/testimonials', async (req, res) => {
    try {
        const db = require('./config/database-postgres');
        const { region } = req.query;
        let sql = 'SELECT id, name, region, content, rating, avatar, created_at FROM testimonials WHERE active = 1';
        const params = [];
        let paramIndex = 1;
        if (region) { sql += ` AND region = $${paramIndex}`; params.push(region); paramIndex++; }
        sql += ' ORDER BY created_at DESC LIMIT 20';
        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/public/designers', async (req, res) => {
    try {
        const db = require('./config/database-postgres');
        const { region } = req.query;
        let sql = 'SELECT id, name, title, region, experience, styles, bio, photo FROM designers WHERE active = 1';
        const params = [];
        let paramIndex = 1;
        if (region) { sql += ` AND region = $${paramIndex}`; params.push(region); paramIndex++; }
        sql += ' ORDER BY id ASC';
        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/public/cases', async (req, res) => {
    try {
        const db = require('./config/database-postgres');
        const { category } = req.query;
        let sql = 'SELECT * FROM cases WHERE active = 1';
        const params = [];
        let paramIndex = 1;
        if (category) { sql += ` AND category = $${paramIndex}`; params.push(category); paramIndex++; }
        sql += ' ORDER BY created_at DESC';
        const [rows] = await db.query(sql, params);
        const result = rows.map(r => ({ ...r, images: r.images ? JSON.parse(r.images) : [] }));
        res.json(result);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/public/services', async (req, res) => {
    try {
        const db = require('./config/database-postgres');
        const [rows] = await db.query('SELECT * FROM services WHERE active = 1 ORDER BY id ASC');
        const result = rows.map(r => ({ ...r, features: r.features ? JSON.parse(r.features) : [] }));
        res.json(result);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/public/settings', async (req, res) => {
    try {
        const db = require('./config/database-postgres');
        const [rows] = await db.query('SELECT site_title, site_phone, default_region FROM settings LIMIT 1');
        res.json(rows[0] || {});
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', database: 'PostgreSQL', timestamp: new Date().toISOString() });
});

// 错误处理
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ error: '服务器内部错误' });
});

app.listen(PORT, async () => {
    console.log(`=================================`);
    console.log(`  洁尚装饰后端API (PostgreSQL版)`);
    console.log(`  地址: http://localhost:${PORT}`);
    console.log(`  数据库: Vercel Postgres`);
    console.log(`=================================`);
    
    // 测试数据库连接
    const db = require('./config/database-postgres');
    await db.testConnection();
});
