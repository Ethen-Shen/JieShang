const express = require('express');
const db = require('../config/database');
const router = express.Router();

// 获取所有员工
router.get('/', async (req, res) => {
    try {
        const { department, active } = req.query;
        let sql = 'SELECT * FROM employees';
        const params = [];
        const conditions = [];
        if (department) { conditions.push('department = ?'); params.push(department); }
        if (active !== undefined) { conditions.push('active = ?'); params.push(active); }
        if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
        sql += ' ORDER BY created_at DESC';
        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// 获取单个员工
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM employees WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: '未找到' });
        res.json(rows[0]);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// 创建员工
router.post('/', async (req, res) => {
    try {
        const { name, phone, email, position, department, avatar } = req.body;
        const [result] = await db.query(
            'INSERT INTO employees (name, phone, email, position, department, avatar) VALUES (?, ?, ?, ?, ?, ?)',
            [name, phone, email, position, department, avatar]
        );
        res.json({ success: true, id: result.insertId });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// 更新员工
router.put('/:id', async (req, res) => {
    try {
        const { name, phone, email, position, department, avatar, active } = req.body;
        await db.query(
            'UPDATE employees SET name=?, phone=?, email=?, position=?, department=?, avatar=?, active=? WHERE id=?',
            [name, phone, email, position, department, avatar, active, req.params.id]
        );
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// 删除员工
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM employees WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
