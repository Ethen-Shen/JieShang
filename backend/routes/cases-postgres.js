/**
 * 装修案例路由 - PostgreSQL版本
 */
const express = require('express');
const db = require('../config/database-postgres');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { category, active } = req.query;
        let sql = 'SELECT * FROM cases';
        const params = [];
        const conditions = [];
        let paramIndex = 1;
        
        if (category) { 
            conditions.push(`category = $${paramIndex}`); 
            params.push(category);
            paramIndex++;
        }
        if (active !== undefined) { 
            conditions.push(`active = $${paramIndex}`); 
            params.push(active);
            paramIndex++;
        }
        if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
        sql += ' ORDER BY created_at DESC';
        
        const [rows] = await db.query(sql, params);
        const result = rows.map(r => ({ ...r, images: r.images ? JSON.parse(r.images) : [] }));
        res.json(result);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM cases WHERE id = $1', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: '未找到' });
        const row = rows[0];
        res.json({ ...row, images: row.images ? JSON.parse(row.images) : [] });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/', async (req, res) => {
    try {
        const { name, category, area, style, description, images, active } = req.body;
        const sql = `INSERT INTO cases (name, category, area, style, description, images, active) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`;
        
        const result = await db.query(sql, [
            name, category, area, style, description, 
            JSON.stringify(images || []), 
            active !== undefined ? active : 1
        ]);
        res.json({ success: true, id: result.rows[0].id });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/:id', async (req, res) => {
    try {
        const { name, category, area, style, description, images, active } = req.body;
        await db.query(
            'UPDATE cases SET name=$1, category=$2, area=$3, style=$4, description=$5, images=$6, active=$7 WHERE id=$8',
            [name, category, area, style, description, JSON.stringify(images || []), active, req.params.id]
        );
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM cases WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
