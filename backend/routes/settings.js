const express = require('express');
const db = require('../config/database');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM settings LIMIT 1');
        res.json(rows[0] || {});
    } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/', async (req, res) => {
    try {
        const { site_title, site_phone, default_region } = req.body;
        await db.query(
            'UPDATE settings SET site_title=?, site_phone=?, default_region=? WHERE id=1',
            [site_title, site_phone, default_region]
        );
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
