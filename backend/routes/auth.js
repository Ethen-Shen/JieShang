const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

// 登录
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: '请输入用户名和密码' });
        }

        const [rows] = await db.query(
            'SELECT * FROM users WHERE username = ? AND active = 1',
            [username]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: '用户名或密码错误' });
        }

        const user = rows[0];
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ error: '用户名或密码错误' });
        }

        const token = generateToken(user);
        res.json({
            success: true,
            token,
            user: { id: user.id, username: user.username, role: user.role, displayName: user.display_name }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 修改密码
router.put('/change-password', async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user.id;

        const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
        if (rows.length === 0) return res.status(404).json({ error: '用户不存在' });

        const valid = await bcrypt.compare(oldPassword, rows[0].password);
        if (!valid) return res.status(400).json({ error: '原密码错误' });

        const hashed = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, userId]);
        res.json({ success: true, message: '密码修改成功' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 获取用户列表（管理员）
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT id, username, display_name, role, active, created_at FROM users ORDER BY created_at DESC'
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 创建用户（管理员）
router.post('/', async (req, res) => {
    try {
        const { username, password, displayName, role } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: '用户名和密码不能为空' });
        }

        const [existing] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
        if (existing.length > 0) {
            return res.status(400).json({ error: '用户名已存在' });
        }

        const hashed = await bcrypt.hash(password, 10);
        const [result] = await db.query(
            'INSERT INTO users (username, password, display_name, role) VALUES (?, ?, ?, ?)',
            [username, hashed, displayName || username, role || 'editor']
        );

        res.json({ success: true, id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 更新用户（管理员）
router.put('/:id', async (req, res) => {
    try {
        const { displayName, role, active, password } = req.body;
        const userId = req.params.id;

        if (password) {
            const hashed = await bcrypt.hash(password, 10);
            await db.query(
                'UPDATE users SET display_name = ?, role = ?, active = ?, password = ? WHERE id = ?',
                [displayName, role, active, hashed, userId]
            );
        } else {
            await db.query(
                'UPDATE users SET display_name = ?, role = ?, active = ? WHERE id = ?',
                [displayName, role, active, userId]
            );
        }

        res.json({ success: true, message: '用户更新成功' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 删除用户（管理员）
router.delete('/:id', async (req, res) => {
    try {
        if (req.user.id == req.params.id) {
            return res.status(400).json({ error: '不能删除自己的账号' });
        }
        await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
