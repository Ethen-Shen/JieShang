/**
 * 员工管理路由 - PostgreSQL版本
 */
const express = require('express');
const db = require('../config/database-postgres');
const router = express.Router();

// 获取所有员工
router.get('/', async (req, res) => {
    try {
        const { department, active } = req.query;
        let sql = 'SELECT * FROM employees';
        const params = [];
        const conditions = [];
        let paramIndex = 1;
        
        if (department) { 
            conditions.push(`department = $${paramIndex}`); 
            params.push(department);
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
        res.json(rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// 获取单个员工
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM employees WHERE id = $1', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: '未找到' });
        res.json(rows[0]);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// 创建员工
router.post('/', async (req, res) => {
    try {
        const { name, phone, email, position, department, avatar } = req.body;
        const sql = `INSERT INTO employees (name, phone, email, position, department, avatar) 
                     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`;
        
        const result = await db.query(sql, [name, phone, email, position, department, avatar]);
        res.json({ success: true, id: result.rows[0].id });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// 更新员工
router.put('/:id', async (req, res) => {
    try {
        const { name, phone, email, position, department, avatar, active } = req.body;
        await db.query(
            'UPDATE employees SET name=$1, phone=$2, email=$3, position=$4, department=$5, avatar=$6, active=$7 WHERE id=$8',
            [name, phone, email, position, department, avatar, active, req.params.id]
        );
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// 删除员工
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM employees WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
