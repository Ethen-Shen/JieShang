const express = require('express');
const db = require('../config/database');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { active } = req.query;
        let sql = 'SELECT * FROM services';
        const params = [];
        if (active !== undefined) { sql += ' WHERE active = ?'; params.push(active); }
        sql += ' ORDER BY id ASC';
        const [rows] = await db.query(sql, params);
        const result = rows.map(r => ({ ...r, features: JSON.parse(r.features || '[]') }));
        res.json(result);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM services WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: '未找到' });
        const row = rows[0];
        res.json({ ...row, features: JSON.parse(row.features || '[]') });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/', async (req, res) => {
    try {
        const { name, icon, description, features, active } = req.body;
        const [result] = await db.query(
            'INSERT INTO services (name, icon, description, features, active) VALUES (?, ?, ?, ?, ?)',
            [name, icon || 'fa-home', description, JSON.stringify(features || []), active !== undefined ? active : 1]
        );
        res.json({ success: true, id: result.insertId });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/:id', async (req, res) => {
    try {
        const { name, icon, description, features, active } = req.body;
        await db.query(
            'UPDATE services SET name=?, icon=?, description=?, features=?, active=? WHERE id=?',
            [name, icon, description, JSON.stringify(features || []), active, req.params.id]
        );
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM services WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
