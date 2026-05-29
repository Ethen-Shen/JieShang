const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001/api';
let authToken = '';

async function login() {
    const res = await fetch(API_BASE + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    const data = await res.json();
    if (data.success) {
        authToken = data.token;
        console.log('✅ 登录成功');
        return true;
    }
    console.log('❌ 登录失败:', data.error);
    return false;
}

async function api(method, path, body) {
    const opts = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + authToken
        }
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(API_BASE + path, opts);
    return res.json();
}

async function test() {
    console.log('=== 洁尚装饰API测试 ===\n');

    // 1. 登录
    if (!await login()) return;

    // 2. 测试员工API
    console.log('\n--- 员工管理API测试 ---');
    const employees = await api('GET', '/employees');
    console.log('员工列表:', employees.length, '条记录');
    if (employees.length > 0) {
        console.log('  示例:', employees[0].name, '-', employees[0].position);
    }

    // 3. 测试预约API
    console.log('\n--- 预约管理API测试 ---');
    const consultations = await api('GET', '/consultations');
    console.log('预约列表:', consultations.length, '条记录');

    // 4. 测试公开预约提交
    console.log('\n--- 公开预约提交API测试 ---');
    const newConsult = await fetch(API_BASE + '/public/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: '测试客户',
            phone: '13800138000',
            region: 'gongji',
            house_type: 'apartment',
            area: 100,
            budget: '10-20万',
            address: '测试地址123号',
            preferred_time: '周末',
            remark: '这是一个测试预约',
            source: 'website'
        })
    }).then(r => r.json());

    if (newConsult.success) {
        console.log('✅ 预约提交成功, ID:', newConsult.id);

        // 5. 分配员工
        console.log('\n--- 分配员工测试 ---');
        const assignResult = await api('POST', '/consultations/' + newConsult.id + '/assign', {
            employee_id: 1
        });
        console.log('分配结果:', assignResult.success ? '✅ 成功' : '❌ 失败');

        // 6. 更新状态
        console.log('\n--- 更新状态测试 ---');
        const statusResult = await api('POST', '/consultations/' + newConsult.id + '/status', {
            status: 'measured',
            content: '已上门量房，客户意向强烈'
        });
        console.log('状态更新结果:', statusResult.success ? '✅ 成功' : '❌ 失败');

        // 7. 查看详情
        console.log('\n--- 预约详情测试 ---');
        const detail = await api('GET', '/consultations/' + newConsult.id);
        console.log('客户姓名:', detail.name);
        console.log('当前状态:', detail.status);
        console.log('跟进员工:', detail.employee_name || '未分配');
    } else {
        console.log('❌ 预约提交失败:', newConsult.error);
    }

    console.log('\n=== 测试完成 ===');
}

test().catch(console.error);
