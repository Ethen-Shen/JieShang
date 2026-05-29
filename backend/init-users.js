const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

(async () => {
    const db = await mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: 'Ethen112..',
        database: 'jieshang',
        charset: 'utf8mb4'
    });

    await db.execute(`
        CREATE TABLE IF NOT EXISTS users (
            id INT PRIMARY KEY AUTO_INCREMENT,
            username VARCHAR(50) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            display_name VARCHAR(100),
            role ENUM('admin', 'editor') DEFAULT 'editor',
            active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    const hash = await bcrypt.hash('admin123', 10);
    await db.execute(
        'INSERT IGNORE INTO users (username, password, display_name, role) VALUES (?, ?, ?, ?)',
        ['admin', hash, '系统管理员', 'admin']
    );

    console.log('users表创建完成');
    console.log('默认管理员账号: admin / admin123');
    await db.end();
})();
