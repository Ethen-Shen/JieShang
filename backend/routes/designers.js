const express = require('express');
const db = require('../config/database');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { region, active } = req.query;
        let sql = 'SELECT * FROM designers';
        const params = [];
        const conditions = [];
        if (region) { conditions.push('region = ?'); params.push(region); }
        if (active !== undefined) { conditions.push('active = ?'); params.push(active); }
        if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
        sql += ' ORDER BY created_at DESC';
        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM designers WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: '未找到' });
        res.json(rows[0]);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/', async (req, res) => {
    try {
        const { name, title, region, experience, styles, bio, photo, active } = req.body;
        const [result] = await db.query(
            'INSERT INTO designers (name, title, region, experience, styles, bio, photo, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [name, title, region, experience, styles, bio, photo, active !== undefined ? active : 1]
        );
        res.json({ success: true, id: result.insertId });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/:id', async (req, res) => {
    try {
        const { name, title, region, experience, styles, bio, photo, active } = req.body;
        await db.query(
            'UPDATE designers SET name=?, title=?, region=?, experience=?, styles=?, bio=?, photo=?, active=? WHERE id=?',
            [name, title, region, experience, styles, bio, photo, active, req.params.id]
        );
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM designers WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
