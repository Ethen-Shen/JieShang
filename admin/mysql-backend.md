# 洁尚装饰后台管理系统 - MySQL 后端集成方案

## 数据库表结构

根据您提供的 Navicat 截图，以下是推荐的数据库表结构：

```sql
-- 创建数据库
CREATE DATABASE IF NOT EXISTS jieshang CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE jieshang;

-- 用户口碑表
CREATE TABLE testimonials (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '客户姓名',
    region ENUM('gongji', 'lingang', 'nanqiao') NOT NULL COMMENT '所属地区',
    content TEXT NOT NULL COMMENT '评价内容',
    rating TINYINT DEFAULT 5 COMMENT '评分 1-5',
    avatar VARCHAR(255) COMMENT '头像图片路径',
    active BOOLEAN DEFAULT TRUE COMMENT '是否显示',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户口碑表';

-- 设计师表
CREATE TABLE designers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '姓名',
    title VARCHAR(100) NOT NULL COMMENT '职位',
    region ENUM('gongji', 'lingang', 'nanqiao') NOT NULL COMMENT '所属地区',
    experience INT COMMENT '从业年限',
    styles VARCHAR(255) COMMENT '擅长风格',
    bio TEXT COMMENT '个人简介',
    photo VARCHAR(255) COMMENT '照片路径',
    active BOOLEAN DEFAULT TRUE COMMENT '是否显示',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='设计师表';

-- 案例表
CREATE TABLE cases (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL COMMENT '案例名称',
    category ENUM('villa', 'penthouse', 'residential', 'commercial') NOT NULL COMMENT '案例类型',
    area INT COMMENT '面积(㎡)',
    style VARCHAR(100) COMMENT '风格',
    description TEXT COMMENT '案例描述',
    images JSON COMMENT '图片数组',
    active BOOLEAN DEFAULT TRUE COMMENT '是否显示',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='案例表';

-- 服务项目表
CREATE TABLE services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '服务名称',
    icon VARCHAR(50) DEFAULT 'fa-home' COMMENT '图标',
    description TEXT COMMENT '服务描述',
    features JSON COMMENT '服务特点数组',
    active BOOLEAN DEFAULT TRUE COMMENT '是否显示',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='服务项目表';

-- 系统设置表
CREATE TABLE settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    site_title VARCHAR(200) DEFAULT '上海洁尚装饰集团' COMMENT '网站标题',
    site_phone VARCHAR(50) DEFAULT '021-58008116' COMMENT '联系电话',
    default_region ENUM('gongji', 'lingang', 'nanqiao') DEFAULT 'gongji' COMMENT '默认地区',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统设置表';

-- 插入默认设置
INSERT INTO settings (site_title, site_phone, default_region) VALUES 
('上海洁尚装饰集团', '021-58008116', 'gongji');

-- 插入示例数据
INSERT INTO testimonials (name, region, content, rating) VALUES
('张女士', 'gongji', '从设计到完工整整4个月，洁尚团队非常专业，每个细节都处理得很到位。', 5),
('王总', 'lingang', '公司的办公室是洁尚装的，效果非常好，后来家里的别墅也毫不犹豫找他们做。', 5);

INSERT INTO designers (name, title, region, experience, styles, bio) VALUES
('王建华', '首席设计师', 'gongji', 15, '现代简约、新中式、轻奢', '毕业于中央美术学院，15年室内设计经验'),
('李雅婷', '高级设计师', 'lingang', 10, '北欧风、日式、现代', '专注住宅空间设计，注重功能性与美观性的平衡');

INSERT INTO cases (name, category, area, style, description) VALUES
('浦东世纪公园·独栋别墅', 'villa', 800, '新中式风格', '融合传统中式元素与现代设计理念'),
('陆家嘴·滨江大平层', 'penthouse', 280, '现代简约', '充分利用江景资源，打造开阔通透的都市精英居所');

INSERT INTO services (name, icon, description, features) VALUES
('家庭住宅装修', 'fa-home', '专注普通住宅、公寓的全案设计与施工', '["个性化定制设计方案", "环保材料严格把控", "标准化施工工艺", "全程项目管理"]'),
('平层大宅设计', 'fa-building', '针对大平层户型的高端定制服务', '["高端设计师一对一服务", "智能家居系统集成", "进口材料精选配置", "专属项目经理负责制"]');
```

## 后端 API 方案（Node.js + Express + MySQL）

### 1. 安装依赖

```bash
npm init -y
npm install express mysql2 cors dotenv
npm install --save-dev nodemon
```

### 2. 项目结构

```
backend/
├── config/
│   └── database.js      # 数据库配置
├── routes/
│   ├── testimonials.js  # 口碑路由
│   ├── designers.js     # 设计师路由
│   ├── cases.js         # 案例路由
│   ├── services.js      # 服务路由
│   └── settings.js      # 设置路由
├── .env                 # 环境变量
├── server.js            # 入口文件
└── package.json
```

### 3. 数据库配置 (config/database.js)

```javascript
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'jieshang',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;
```

### 4. 主入口 (server.js)

```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 路由
app.use('/api/testimonials', require('./routes/testimonials'));
app.use('/api/designers', require('./routes/designers'));
app.use('/api/cases', require('./routes/cases'));
app.use('/api/services', require('./routes/services'));
app.use('/api/settings', require('./routes/settings'));

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// 同步所有数据
app.post('/api/sync', async (req, res) => {
    try {
        const db = require('./config/database');
        const data = req.body;
        
        // 同步口碑
        if (data.testimonials) {
            await db.query('DELETE FROM testimonials');
            for (const item of data.testimonials) {
                await db.query(
                    'INSERT INTO testimonials (id, name, region, content, rating, avatar, active) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [item.id, item.name, item.region, item.content, item.rating, item.avatar, item.active]
                );
            }
        }
        
        // 同步设计师
        if (data.designers) {
            await db.query('DELETE FROM designers');
            for (const item of data.designers) {
                await db.query(
                    'INSERT INTO designers (id, name, title, region, experience, styles, bio, photo, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                    [item.id, item.name, item.title, item.region, item.experience, item.styles, item.bio, item.photo, item.active]
                );
            }
        }
        
        // 同步案例
        if (data.cases) {
            await db.query('DELETE FROM cases');
            for (const item of data.cases) {
                await db.query(
                    'INSERT INTO cases (id, name, category, area, style, description, images, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [item.id, item.name, item.category, item.area, item.style, item.description, JSON.stringify(item.images), item.active]
                );
            }
        }
        
        // 同步服务
        if (data.services) {
            await db.query('DELETE FROM services');
            for (const item of data.services) {
                await db.query(
                    'INSERT INTO services (id, name, icon, description, features, active) VALUES (?, ?, ?, ?, ?, ?)',
                    [item.id, item.name, item.icon, item.description, JSON.stringify(item.features), item.active]
                );
            }
        }
        
        res.json({ success: true, message: '数据同步成功' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 获取所有数据
app.get('/api/all', async (req, res) => {
    try {
        const db = require('./config/database');
        
        const [testimonials] = await db.query('SELECT * FROM testimonials WHERE active = 1');
        const [designers] = await db.query('SELECT * FROM designers WHERE active = 1');
        const [cases] = await db.query('SELECT * FROM cases WHERE active = 1');
        const [services] = await db.query('SELECT * FROM services WHERE active = 1');
        const [settings] = await db.query('SELECT * FROM settings LIMIT 1');
        
        res.json({
            testimonials,
            designers,
            cases: cases.map(c => ({ ...c, images: JSON.parse(c.images || '[]') })),
            services: services.map(s => ({ ...s, features: JSON.parse(s.features || '[]') })),
            settings: settings[0]
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
});
```

### 5. 路由示例 (routes/testimonials.js)

```javascript
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// 获取所有口碑
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM testimonials ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 根据地区获取口碑
router.get('/region/:region', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM testimonials WHERE region = ? AND active = 1 ORDER BY created_at DESC',
            [req.params.region]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 获取单个口碑
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM testimonials WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: '未找到' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 创建口碑
router.post('/', async (req, res) => {
    try {
        const { name, region, content, rating, avatar, active } = req.body;
        const [result] = await db.query(
            'INSERT INTO testimonials (name, region, content, rating, avatar, active) VALUES (?, ?, ?, ?, ?, ?)',
            [name, region, content, rating, avatar, active]
        );
        res.json({ id: result.insertId, success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 更新口碑
router.put('/:id', async (req, res) => {
    try {
        const { name, region, content, rating, avatar, active } = req.body;
        await db.query(
            'UPDATE testimonials SET name = ?, region = ?, content = ?, rating = ?, avatar = ?, active = ? WHERE id = ?',
            [name, region, content, rating, avatar, active, req.params.id]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 删除口碑
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM testimonials WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
```

### 6. 环境变量 (.env)

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=jieshang
PORT=3001
```

### 7. package.json 脚本

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

## 运行步骤

1. **安装 MySQL**（如果尚未安装）
   - 下载地址：https://dev.mysql.com/downloads/mysql/
   - 安装时记住 root 密码

2. **创建数据库**
   ```bash
   mysql -u root -p
   # 输入密码后，复制粘贴上面的 SQL 语句创建表
   ```

3. **安装后端**
   ```bash
   cd c:\TraeIde\JieShang\backend
   npm install
   ```

4. **配置环境变量**
   - 修改 `.env` 文件中的数据库密码

5. **启动后端服务**
   ```bash
   npm run dev
   ```

6. **访问后台管理**
   - 打开 `http://localhost:8083/admin/index.html`

## API 端点列表

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | /api/health | 健康检查 |
| GET | /api/all | 获取所有数据 |
| POST | /api/sync | 同步所有数据到MySQL |
| GET | /api/testimonials | 获取所有口碑 |
| GET | /api/testimonials/region/:region | 按地区获取口碑 |
| POST | /api/testimonials | 创建口碑 |
| PUT | /api/testimonials/:id | 更新口碑 |
| DELETE | /api/testimonials/:id | 删除口碑 |
| GET | /api/designers | 获取所有设计师 |
| GET | /api/designers/region/:region | 按地区获取设计师 |
| POST | /api/designers | 创建设计师 |
| PUT | /api/designers/:id | 更新设计师 |
| DELETE | /api/designers/:id | 删除设计师 |
| GET | /api/cases | 获取所有案例 |
| GET | /api/cases/category/:category | 按类型获取案例 |
| POST | /api/cases | 创建案例 |
| PUT | /api/cases/:id | 更新案例 |
| DELETE | /api/cases/:id | 删除案例 |
| GET | /api/services | 获取所有服务 |
| POST | /api/services | 创建服务 |
| PUT | /api/services/:id | 更新服务 |
| DELETE | /api/services/:id | 删除服务 |
| GET | /api/settings | 获取设置 |
| PUT | /api/settings | 更新设置 |

## 注意事项

1. 浏览器无法直接连接 MySQL，必须通过后端 API
2. 后台管理页面使用 localStorage 存储数据，可与 MySQL 双向同步
3. 图片上传需要额外的文件服务器或云存储（如阿里云OSS、七牛云）
4. 生产环境需要添加身份验证（JWT 或 Session）
