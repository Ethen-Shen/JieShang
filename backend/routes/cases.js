const express = require('express');
const db = require('../config/database');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { category, active } = req.query;
        let sql = 'SELECT * FROM cases';
        const params = [];
        const conditions = [];
        if (category) { conditions.push('category = ?'); params.push(category); }
        if (active !== undefined) { conditions.push('active = ?'); params.push(active); }
        if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
        sql += ' ORDER BY created_at DESC';
        const [rows] = await db.query(sql, params);
        const result = rows.map(r => ({ ...r, images: JSON.parse(r.images || '[]') }));
        res.json(result);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM cases WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: '未找到' });
        const row = rows[0];
        res.json({ ...row, images: JSON.parse(row.images || '[]') });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/', async (req, res) => {
    try {
        const { name, category, area, style, description, images, active } = req.body;
        const [result] = await db.query(
            'INSERT INTO cases (name, category, area, style, description, images, active) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, category, area, style, description, JSON.stringify(images || []), active !== undefined ? active : 1]
        );
        res.json({ success: true, id: result.insertId });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/:id', async (req, res) => {
    try {
        const { name, category, area, style, description, images, active } = req.body;
        await db.query(
            'UPDATE cases SET name=?, category=?, area=?, style=?, description=?, images=?, active=? WHERE id=?',
            [name, category, area, style, description, JSON.stringify(images || []), active, req.params.id]
        );
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM cases WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
