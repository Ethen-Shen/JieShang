/**
 * PostgreSQL数据库初始化脚本
 * 运行方式: node init-postgres.js
 * 
 * 表结构说明：
 * 1. testimonials - 客户口碑评价
 * 2. designers - 设计师团队
 * 3. cases - 装修案例
 * 4. services - 服务项目
 * 5. settings - 网站设置
 * 6. employees - 员工管理
 * 7. consultations - 预约咨询
 * 8. consultation_logs - 咨询跟进记录
 */

require('dotenv').config();
const { pool, testConnection } = require('./config/database-postgres');

const initSQL = `
-- ============================================
-- 1. 客户口碑评价表
-- ============================================
CREATE TABLE IF NOT EXISTS testimonials (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    region VARCHAR(50),
    content TEXT NOT NULL,
    rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    avatar TEXT,
    active INTEGER DEFAULT 1 CHECK (active IN (0, 1)),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. 设计师团队表
-- ============================================
CREATE TABLE IF NOT EXISTS designers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    title VARCHAR(100),
    region VARCHAR(50),
    experience INTEGER,
    styles TEXT, -- JSON数组格式
    bio TEXT,
    photo TEXT,
    active INTEGER DEFAULT 1 CHECK (active IN (0, 1)),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. 装修案例表
-- ============================================
CREATE TABLE IF NOT EXISTS cases (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(50),
    area DECIMAL(10,2),
    style VARCHAR(50),
    description TEXT,
    images TEXT, -- JSON数组格式
    active INTEGER DEFAULT 1 CHECK (active IN (0, 1)),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 4. 服务项目表
-- ============================================
CREATE TABLE IF NOT EXISTS services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    icon VARCHAR(100),
    description TEXT,
    features TEXT, -- JSON数组格式
    active INTEGER DEFAULT 1 CHECK (active IN (0, 1)),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. 网站设置表
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    site_title VARCHAR(200) DEFAULT '洁尚装饰',
    site_phone VARCHAR(50),
    default_region VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 插入默认设置
INSERT INTO settings (site_title, site_phone, default_region)
VALUES ('洁尚装饰', '021-58008116', 'gongji')
ON CONFLICT DO NOTHING;

-- ============================================
-- 6. 员工管理表
-- ============================================
CREATE TABLE IF NOT EXISTS employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(100),
    position VARCHAR(100),
    department VARCHAR(100),
    avatar TEXT,
    active INTEGER DEFAULT 1 CHECK (active IN (0, 1)),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 7. 预约咨询表
-- ============================================
CREATE TABLE IF NOT EXISTS consultations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    region VARCHAR(50),
    address TEXT,
    house_type VARCHAR(50),
    area DECIMAL(10,2),
    budget VARCHAR(50),
    preferred_time TEXT,
    remark TEXT,
    source VARCHAR(50) DEFAULT 'website',
    status VARCHAR(50) DEFAULT 'pending',
    employee_id INTEGER REFERENCES employees(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 8. 咨询跟进记录表
-- ============================================
CREATE TABLE IF NOT EXISTS consultation_logs (
    id SERIAL PRIMARY KEY,
    consultation_id INTEGER NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
    employee_id INTEGER REFERENCES employees(id),
    action VARCHAR(50),
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 创建索引提升查询性能
-- ============================================
CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations(status);
CREATE INDEX IF NOT EXISTS idx_consultations_region ON consultations(region);
CREATE INDEX IF NOT EXISTS idx_consultations_created ON consultations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_testimonials_region ON testimonials(region);
CREATE INDEX IF NOT EXISTS idx_designers_region ON designers(region);
CREATE INDEX IF NOT EXISTS idx_cases_category ON cases(category);
`;

async function initDatabase() {
    console.log('🚀 开始初始化PostgreSQL数据库...\n');
    
    // 测试连接
    const connected = await testConnection();
    if (!connected) {
        console.error('❌ 无法连接到数据库，请检查环境变量配置');
        process.exit(1);
    }
    
    try {
        console.log('📦 创建数据表...');
        await pool.query(initSQL);
        console.log('✅ 所有数据表创建成功！\n');
        
        // 插入示例员工数据
        console.log('👥 插入示例员工...');
        await pool.query(`
            INSERT INTO employees (name, phone, position, department, active)
            VALUES 
                ('张经理', '13800138001', '客户经理', '客服部', 1),
                ('李设计师', '13800138002', '资深设计师', '设计部', 1),
                ('王监理', '13800138003', '工程监理', '工程部', 1),
                ('陈顾问', '13800138004', '高级顾问', '客服部', 1)
            ON CONFLICT DO NOTHING
        `);
        console.log('✅ 示例员工数据插入成功！\n');
        
        // 插入示例口碑
        console.log('⭐ 插入示例口碑评价...');
        await pool.query(`
            INSERT INTO testimonials (name, region, content, rating, active)
            VALUES 
                ('王女士', 'gongji', '服务非常专业，设计师很有耐心，整个装修过程省心省力！', 5, 1),
                ('李先生', 'lingang', '施工质量很好，监理认真负责，按时完工，推荐！', 5, 1),
                ('张女士', 'nanqiao', '价格透明，没有增项，设计师审美在线，非常满意！', 5, 1)
            ON CONFLICT DO NOTHING
        `);
        console.log('✅ 示例口碑数据插入成功！\n');
        
        console.log('========================================');
        console.log('  🎉 数据库初始化完成！');
        console.log('========================================\n');
        
    } catch (error) {
        console.error('❌ 初始化失败:', error.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

// 运行初始化
initDatabase();
