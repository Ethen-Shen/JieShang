const mysql = require('mysql2/promise');

(async () => {
    const db = await mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: 'Ethen112..',
        database: 'jieshang',
        charset: 'utf8mb4'
    });

    // 创建员工表
    await db.execute(`
        CREATE TABLE IF NOT EXISTS employees (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(100) NOT NULL COMMENT '员工姓名',
            phone VARCHAR(20) COMMENT '联系电话',
            email VARCHAR(100) COMMENT '邮箱',
            position VARCHAR(100) COMMENT '职位',
            department ENUM('sales', 'design', 'construction', 'customer_service') DEFAULT 'sales' COMMENT '部门',
            avatar VARCHAR(255) COMMENT '头像',
            active BOOLEAN DEFAULT TRUE COMMENT '是否在职',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='员工表'
    `);

    // 创建预约咨询表
    await db.execute(`
        CREATE TABLE IF NOT EXISTS consultations (
            id INT PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(100) NOT NULL COMMENT '客户姓名',
            phone VARCHAR(20) NOT NULL COMMENT '联系电话',
            region ENUM('gongji', 'lingang', 'nanqiao') NOT NULL COMMENT '预约门店',
            address VARCHAR(255) COMMENT '房屋地址',
            house_type ENUM('apartment', 'villa', 'penthouse', 'commercial', 'other') DEFAULT 'apartment' COMMENT '房屋类型',
            area INT COMMENT '房屋面积',
            budget VARCHAR(50) COMMENT '装修预算',
            preferred_time VARCHAR(100) COMMENT '期望量房时间',
            remark TEXT COMMENT '备注需求',
            status ENUM('pending', 'assigned', 'measured', 'quoted', 'contracted', 'construction', 'completed', 'cancelled') DEFAULT 'pending' COMMENT '预约状态',
            employee_id INT COMMENT '分配员工ID',
            source VARCHAR(50) DEFAULT 'website' COMMENT '来源渠道',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='预约咨询表'
    `);

    // 创建预约跟进记录表
    await db.execute(`
        CREATE TABLE IF NOT EXISTS consultation_logs (
            id INT PRIMARY KEY AUTO_INCREMENT,
            consultation_id INT NOT NULL COMMENT '预约ID',
            employee_id INT COMMENT '操作员工ID',
            action VARCHAR(50) NOT NULL COMMENT '操作类型',
            old_status VARCHAR(50) COMMENT '原状态',
            new_status VARCHAR(50) COMMENT '新状态',
            content TEXT COMMENT '跟进内容',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (consultation_id) REFERENCES consultations(id) ON DELETE CASCADE,
            FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='预约跟进记录表'
    `);

    // 插入示例员工
    const employees = [
        { name: '张经理', phone: '13800138001', position: '销售经理', department: 'sales' },
        { name: '李顾问', phone: '13800138002', position: '客户顾问', department: 'sales' },
        { name: '王设计师', phone: '13800138003', position: '首席设计师', department: 'design' },
        { name: '刘客服', phone: '13800138004', position: '客服专员', department: 'customer_service' }
    ];

    for (const emp of employees) {
        await db.execute(
            'INSERT IGNORE INTO employees (name, phone, position, department) VALUES (?, ?, ?, ?)',
            [emp.name, emp.phone, emp.position, emp.department]
        );
    }

    console.log('✅ 员工表创建完成');
    console.log('✅ 预约咨询表创建完成');
    console.log('✅ 跟进记录表创建完成');
    console.log('✅ 示例员工数据已插入');
    
    await db.end();
})();
