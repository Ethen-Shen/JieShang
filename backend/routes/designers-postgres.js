/**
 * 设计师路由 - PostgreSQL版本
 */
const express = require('express');
const db = require('../config/database-postgres');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { region, active } = req.query;
        let sql = 'SELECT id, name, title, region, experience, styles, bio, photo FROM designers';
        const params = [];
        const conditions = [];
        let paramIndex = 1;
        
        if (region) { 
            conditions.push(`region = $${paramIndex}`); 
            params.push(region);
            paramIndex++;
        }
        if (active !== undefined) { 
            conditions.push(`active = $${paramIndex}`); 
            params.push(active);
            paramIndex++;
        }
        if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
        sql += ' ORDER BY id ASC';
        
        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM designers WHERE id = $1', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: '未找到' });
        res.json(rows[0]);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/', async (req, res) => {
    try {
        const { name, title, region, experience, styles, bio, photo, active } = req.body;
        const sql = `INSERT INTO designers (name, title, region, experience, styles, bio, photo, active) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`;
        
        const result = await db.query(sql, [name, title, region, experience, styles, bio, photo, active !== undefined ? active : 1]);
        res.json({ success: true, id: result.rows[0].id });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/:id', async (req, res) => {
    try {
        const { name, title, region, experience, styles, bio, photo, active } = req.body;
        await db.query(
            'UPDATE designers SET name=$1, title=$2, region=$3, experience=$4, styles=$5, bio=$6, photo=$7, active=$8 WHERE id=$9',
            [name, title, region, experience, styles, bio, photo, active, req.params.id]
        );
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM designers WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
