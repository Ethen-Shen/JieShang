/**
 * 网站设置路由 - PostgreSQL版本
 */
const express = require('express');
const db = require('../config/database-postgres');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT site_title, site_phone, default_region FROM settings LIMIT 1');
        res.json(rows[0] || {});
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/', async (req, res) => {
    try {
        const { site_title, site_phone, default_region } = req.body;
        await db.query(
            'UPDATE settings SET site_title=$1, site_phone=$2, default_region=$3 WHERE id=1',
            [site_title, site_phone, default_region]
        );
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
