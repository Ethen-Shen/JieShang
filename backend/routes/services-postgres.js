/**
 * 服务项目路由 - PostgreSQL版本
 */
const express = require('express');
const db = require('../config/database-postgres');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { active } = req.query;
        let sql = 'SELECT * FROM services';
        const params = [];
        let paramIndex = 1;
        
        if (active !== undefined) { 
            sql += ` WHERE active = $${paramIndex}`; 
            params.push(active);
            paramIndex++;
        }
        sql += ' ORDER BY id ASC';
        
        const [rows] = await db.query(sql, params);
        const result = rows.map(r => ({ ...r, features: r.features ? JSON.parse(r.features) : [] }));
        res.json(result);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM services WHERE id = $1', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: '未找到' });
        const row = rows[0];
        res.json({ ...row, features: row.features ? JSON.parse(row.features) : [] });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/', async (req, res) => {
    try {
        const { name, icon, description, features, active } = req.body;
        const sql = `INSERT INTO services (name, icon, description, features, active) 
                     VALUES ($1, $2, $3, $4, $5) RETURNING id`;
        
        const result = await db.query(sql, [
            name, icon || 'fa-home', description, 
            JSON.stringify(features || []), 
            active !== undefined ? active : 1
        ]);
        res.json({ success: true, id: result.rows[0].id });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/:id', async (req, res) => {
    try {
        const { name, icon, description, features, active } = req.body;
        await db.query(
            'UPDATE services SET name=$1, icon=$2, description=$3, features=$4, active=$5 WHERE id=$6',
            [name, icon, description, JSON.stringify(features || []), active, req.params.id]
        );
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM services WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
