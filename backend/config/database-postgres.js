/**
 * PostgreSQL数据库连接模块
 * 适配Vercel Postgres
 * 
 * 使用方式:
 * const db = require('./database-postgres');
 * const [rows] = await db.query('SELECT * FROM users WHERE id = $1', [id]);
 */

// 使用 pg 库
const { Pool } = require('pg');

// 加载环境变量（本地开发时）
try { require('dotenv').config({ path: require('path').join(__dirname, '../../.env.local') }); } catch(e) {}

// 从环境变量获取Postgres连接字符串
// Vercel会自动注入 DATABASE_POSTGRES_URL
const connectionString = process.env.DATABASE_POSTGRES_URL || process.env.POSTGRES_URL;

// 创建连接池
const pool = new Pool({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false // Vercel Postgres需要SSL
    },
    max: 10, // 最大连接数
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000, // 增加到30秒
    statement_timeout: 60000,
});

// 测试连接
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});

/**
 * 执行SQL查询
 * @param {string} text - SQL语句，使用 $1, $2, $3 作为参数占位符
 * @param {Array} params - 参数数组
 * @returns {Promise<Array>} 查询结果数组
 */
async function query(text, params = []) {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        
        // 开发环境打印查询日志
        if (process.env.NODE_ENV !== 'production') {
            console.log('Executed query', { text: text.substring(0, 100), duration, rows: result.rowCount });
        }
        
        // 返回格式兼容MySQL: [rows, fields]
        // rows 是结果数组
        return [result.rows, result];
    } catch (error) {
        console.error('Database query error:', error.message);
        throw error;
    }
}

/**
 * 获取单个插入的ID
 * 对于PostgreSQL，需要使用 RETURNING id
 */
async function insertAndGetId(sql, params = []) {
    // 添加 RETURNING id 到SQL语句末尾
    const sqlWithReturning = sql.endsWith('RETURNING id') 
        ? sql 
        : sql + ' RETURNING id';
    
    const result = await pool.query(sqlWithReturning, params);
    
    // 返回兼容MySQL的insertId格式
    return {
        insertId: result.rows[0]?.id,
        rowCount: result.rowCount,
        rows: result.rows
    };
}

/**
 * 执行事务
 * @param {Function} callback - 回调函数，接收client参数
 */
async function transaction(callback) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

/**
 * 测试连接
 */
async function testConnection() {
    try {
        const [rows] = await query('SELECT NOW() as now');
        console.log('✅ PostgreSQL连接成功:', rows[0].now);
        return true;
    } catch (error) {
        console.error('❌ PostgreSQL连接失败:', error.message);
        return false;
    }
}

// 导出模块
module.exports = {
    query,
    insertAndGetId,
    transaction,
    testConnection,
    pool
};
