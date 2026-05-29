const express = require('express');
const db = require('../config/database');
const router = express.Router();

// 获取所有口碑（支持地区筛选）
router.get('/', async (req, res) => {
    try {
        const { region, active } = req.query;
        let sql = 'SELECT * FROM testimonials';
        const params = [];
        const conditions = [];

        if (region) { conditions.push('region = ?'); params.push(region); }
        if (active !== undefined) { conditions.push('active = ?'); params.push(active); }

        if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
        sql += ' ORDER BY created_at DESC';

        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 获取单个口碑
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM testimonials WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: '未找到' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 创建口碑
router.post('/', async (req, res) => {
    try {
        const { name, region, content, rating, avatar, active } = req.body;
        const [result] = await db.query(
            'INSERT INTO testimonials (name, region, content, rating, avatar, active) VALUES (?, ?, ?, ?, ?, ?)',
            [name, region, content, rating || 5, avatar, active !== undefined ? active : 1]
        );
        res.json({ success: true, id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 更新口碑
router.put('/:id', async (req, res) => {
    try {
        const { name, region, content, rating, avatar, active } = req.body;
        await db.query(
            'UPDATE testimonials SET name=?, region=?, content=?, rating=?, avatar=?, active=? WHERE id=?',
            [name, region, content, rating, avatar, active, req.params.id]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 删除口碑
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM testimonials WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
