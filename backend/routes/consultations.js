const express = require('express');
const db = require('../config/database');
const router = express.Router();

// 装修流程状态定义
const WORKFLOW_STEPS = [
    { status: 'pending', name: '待分配', color: '#FF9800' },
    { status: 'assigned', name: '已分配', color: '#2196F3' },
    { status: 'measured', name: '已量房', color: '#9C27B0' },
    { status: 'quoted', name: '已报价', color: '#00BCD4' },
    { status: 'contracted', name: '已签约', color: '#4CAF50' },
    { status: 'construction', name: '施工中', color: '#FF5722' },
    { status: 'completed', name: '已完成', color: '#795548' },
    { status: 'cancelled', name: '已取消', color: '#9E9E9E' }
];

// 获取所有预约
router.get('/', async (req, res) => {
    try {
        const { status, region, employee_id } = req.query;
        let sql = `
            SELECT c.*, e.name as employee_name, e.position as employee_position
            FROM consultations c
            LEFT JOIN employees e ON c.employee_id = e.id
        `;
        const params = [];
        const conditions = [];
        if (status) { conditions.push('c.status = ?'); params.push(status); }
        if (region) { conditions.push('c.region = ?'); params.push(region); }
        if (employee_id) { conditions.push('c.employee_id = ?'); params.push(employee_id); }
        if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
        sql += ' ORDER BY c.created_at DESC';
        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// 获取单个预约详情（含跟进记录）
router.get('/:id', async (req, res) => {
    try {
        const [consultation] = await db.query(`
            SELECT c.*, e.name as employee_name, e.position as employee_position
            FROM consultations c
            LEFT JOIN employees e ON c.employee_id = e.id
            WHERE c.id = ?
        `, [req.params.id]);
        if (consultation.length === 0) return res.status(404).json({ error: '未找到' });
        
        // 获取跟进记录
        const [logs] = await db.query(`
            SELECT l.*, e.name as employee_name
            FROM consultation_logs l
            LEFT JOIN employees e ON l.employee_id = e.id
            WHERE l.consultation_id = ?
            ORDER BY l.created_at DESC
        `, [req.params.id]);
        
        res.json({ ...consultation[0], logs, workflow: WORKFLOW_STEPS });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// 创建预约（前台提交）
router.post('/', async (req, res) => {
    try {
        const { name, phone, region, address, house_type, area, budget, preferred_time, remark, source } = req.body;
        const [result] = await db.query(
            `INSERT INTO consultations (name, phone, region, address, house_type, area, budget, preferred_time, remark, source) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, phone, region, address, house_type, area, budget, preferred_time, remark, source || 'website']
        );
        
        // 添加初始跟进记录
        await db.query(
            'INSERT INTO consultation_logs (consultation_id, action, new_status, content) VALUES (?, ?, ?, ?)',
            [result.insertId, 'create', 'pending', '客户提交预约申请']
        );
        
        res.json({ success: true, id: result.insertId });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// 分配员工
router.post('/:id/assign', async (req, res) => {
    try {
        const { employee_id, employeeId } = req.body;
        const empId = employee_id || employeeId;
        const [old] = await db.query('SELECT status FROM consultations WHERE id = ?', [req.params.id]);
        if (old.length === 0) return res.status(404).json({ error: '预约不存在' });
        
        await db.query(
            'UPDATE consultations SET employee_id = ?, status = ? WHERE id = ?',
            [empId, 'assigned', req.params.id]
        );
        
        // 添加跟进记录
        await db.query(
            'INSERT INTO consultation_logs (consultation_id, employee_id, action, old_status, new_status, content) VALUES (?, ?, ?, ?, ?, ?)',
            [req.params.id, empId, 'assign', old[0].status, 'assigned', '分配员工跟进']
        );
        
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// 更新预约状态
router.post('/:id/status', async (req, res) => {
    try {
        const { status, employee_id, content } = req.body;
        const [old] = await db.query('SELECT status FROM consultations WHERE id = ?', [req.params.id]);
        if (old.length === 0) return res.status(404).json({ error: '预约不存在' });
        
        await db.query('UPDATE consultations SET status = ? WHERE id = ?', [status, req.params.id]);
        
        // 添加跟进记录
        const stepName = WORKFLOW_STEPS.find(s => s.status === status)?.name || status;
        await db.query(
            'INSERT INTO consultation_logs (consultation_id, employee_id, action, old_status, new_status, content) VALUES (?, ?, ?, ?, ?, ?)',
            [req.params.id, employee_id, 'status_change', old[0].status, status, content || `状态更新为: ${stepName}`]
        );
        
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// 更新预约信息
router.put('/:id', async (req, res) => {
    try {
        const { name, phone, region, address, house_type, area, budget, preferred_time, remark } = req.body;
        await db.query(
            'UPDATE consultations SET name=?, phone=?, region=?, address=?, house_type=?, area=?, budget=?, preferred_time=?, remark=? WHERE id=?',
            [name, phone, region, address, house_type, area, budget, preferred_time, remark, req.params.id]
        );
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// 删除预约
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM consultations WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// 获取装修流程定义
router.get('/workflow/steps', (req, res) => {
    res.json(WORKFLOW_STEPS);
});

module.exports = router;
