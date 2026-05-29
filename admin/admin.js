// 洁尚装饰后台管理系统 - API版
const API_BASE = 'http://localhost:3001/api';
let authToken = localStorage.getItem('jieshang_token');
let currentUser = JSON.parse(localStorage.getItem('jieshang_user') || 'null');

const REGION_MAP = { gongji: '拱极路总部', lingang: '临港店', nanqiao: '南桥店' };
const CATEGORY_MAP = { villa: '别墅豪宅', penthouse: '平层大宅', residential: '家庭住宅', commercial: '商业空间' };
const ROLE_MAP = { admin: '管理员', editor: '编辑员' };
const DEPT_MAP = { sales: '销售部', design: '设计部', construction: '工程部', customer_service: '客服部' };
const HOUSE_TYPE_MAP = { apartment: '普通住宅', villa: '别墅', penthouse: '复式/跃层', commercial: '商业空间', other: '其他' };

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

const STATUS_MAP = {
    pending: '待分配', assigned: '已分配', measured: '已量房', quoted: '已报价',
    contracted: '已签约', construction: '施工中', completed: '已完成', cancelled: '已取消'
};

let employeesCache = [];

// ===== API 请求封装 =====
async function api(method, path, data) {
    const opts = {
        method,
        headers: { 'Content-Type': 'application/json' }
    };
    if (authToken) opts.headers['Authorization'] = 'Bearer ' + authToken;
    if (data) opts.body = JSON.stringify(data);
    const res = await fetch(API_BASE + path, opts);
    if (res.status === 401) { handleLogout(); return null; }
    return res.json();
}

// ===== Toast =====
function showToast(msg, type = 'success') {
    const c = document.getElementById('toast-container');
    const t = document.createElement('div');
    t.className = 'toast ' + type;
    const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    t.innerHTML = '<i class="fas ' + icon + '"></i> ' + msg;
    c.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3000);
}

// ===== 登录/登出 =====
async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    try {
        const res = await fetch(API_BASE + '/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (!res.ok) {
            document.getElementById('login-error').textContent = data.error;
            return;
        }
        authToken = data.token;
        currentUser = data.user;
        localStorage.setItem('jieshang_token', authToken);
        localStorage.setItem('jieshang_user', JSON.stringify(currentUser));
        showAdmin();
    } catch (err) {
        document.getElementById('login-error').textContent = '连接后端失败，请确认后端已启动';
    }
}

function handleLogout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('jieshang_token');
    localStorage.removeItem('jieshang_user');
    document.getElementById('login-page').style.display = 'flex';
    document.getElementById('admin-panel').style.display = 'none';
}

function showAdmin() {
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'flex';
    document.getElementById('current-user').textContent = currentUser.displayName;
    document.getElementById('info-user').textContent = currentUser.displayName + ' (' + ROLE_MAP[currentUser.role] + ')';
    document.getElementById('api-url').textContent = API_BASE;
    loadDashboard();
}

// ===== 导航 =====
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => {
        e.preventDefault();
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        item.classList.add('active');
        const section = item.dataset.section;
        document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
        document.getElementById(section + '-section').classList.add('active');
        const titles = { dashboard:'仪表盘', testimonials:'用户口碑管理', designers:'设计师管理', cases:'案例管理', services:'服务项目', users:'用户管理', settings:'系统设置' };
        document.getElementById('page-title').textContent = titles[section];
        refreshSection(section);
    });
});

function refreshSection(s) {
    switch(s) {
        case 'dashboard': loadDashboard(); break;
        case 'testimonials': loadTestimonials(); break;
        case 'consultations': loadConsultations(); break;
        case 'employees': loadEmployees(); break;
        case 'designers': loadDesigners(); break;
        case 'cases': loadCases(); break;
        case 'services': loadServices(); break;
        case 'users': loadUsers(); break;
        case 'settings': loadSettings(); break;
    }
}

// ===== 仪表盘 =====
async function loadDashboard() {
    try {
        const [consultations, employees, testimonials] = await Promise.all([
            api('GET', '/consultations'),
            api('GET', '/employees'),
            api('GET', '/testimonials')
        ]);

        const consultList = consultations || [];
        const employeeList = employees || [];
        const testimonialList = testimonials || [];

        // 统计数据
        document.getElementById('stat-consultations').textContent = consultList.length;
        document.getElementById('stat-pending').textContent = consultList.filter(c => c.status === 'pending').length;
        document.getElementById('stat-employees').textContent = employeeList.length;
        document.getElementById('stat-testimonials').textContent = testimonialList.length;

        // 预约状态概览
        const statusCounts = {};
        WORKFLOW_STEPS.forEach(s => statusCounts[s.status] = 0);
        consultList.forEach(c => {
            if (statusCounts[c.status] !== undefined) statusCounts[c.status]++;
        });

        const statsHtml = WORKFLOW_STEPS.map(s => {
            const count = statusCounts[s.status] || 0;
            const icon = s.status === 'pending' ? 'fa-clock' :
                        s.status === 'completed' ? 'fa-check-circle' :
                        s.status === 'cancelled' ? 'fa-times-circle' : 'fa-circle';
            return '<li><i class="fas ' + icon + '" style="color:' + s.color + '"></i> ' + s.name + ': <strong>' + count + '</strong></li>';
        }).join('');

        document.getElementById('consultation-stats').innerHTML = statsHtml;
    } catch (err) {
        document.getElementById('consultation-stats').innerHTML = '<li><i class="fas fa-times-circle" style="color:#f44336"></i> 后端连接失败</li>';
    }
}

// ===== 用户口碑 =====
async function loadTestimonials() {
    const region = document.getElementById('testimonial-region-filter').value;
    const keyword = document.getElementById('testimonial-search').value;
    let data = await api('GET', '/testimonials' + (region ? '?region=' + region : ''));
    if (!data) return;
    if (keyword) data = data.filter(t => t.name.includes(keyword));
    const tbody = document.getElementById('testimonials-tbody');
    if (data.length === 0) { tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:#999">暂无数据</td></tr>'; return; }
    tbody.innerHTML = data.map(t => '<tr><td>' + t.id + '</td><td>' + t.name + '</td><td>' + REGION_MAP[t.region] + '</td><td>' + t.content.substring(0, 40) + '...</td><td class="rating">' + '★'.repeat(t.rating) + '</td><td><span class="status-badge ' + (t.active ? 'status-active' : 'status-inactive') + '">' + (t.active ? '显示' : '隐藏') + '</span></td><td><div class="action-btns"><button class="btn btn-sm btn-secondary" onclick="editTestimonial(' + t.id + ')"><i class="fas fa-edit"></i></button><button class="btn btn-sm btn-danger" onclick="deleteTestimonial(' + t.id + ')"><i class="fas fa-trash"></i></button></div></td></tr>').join('');
}

async function saveTestimonial() {
    const id = document.getElementById('testimonial-id').value;
    const body = {
        name: document.getElementById('testimonial-name').value,
        region: document.getElementById('testimonial-region').value,
        content: document.getElementById('testimonial-content').value,
        rating: parseInt(document.getElementById('testimonial-rating').value),
        active: document.getElementById('testimonial-active').checked ? 1 : 0
    };
    if (!body.name || !body.content) { showToast('请填写必填项', 'error'); return; }
    const res = id ? await api('PUT', '/testimonials/' + id, body) : await api('POST', '/testimonials', body);
    if (res && res.success) { showToast(id ? '更新成功' : '添加成功'); closeModal('testimonial-modal'); loadTestimonials(); }
    else { showToast('操作失败', 'error'); }
}

function editTestimonial(id) {
    api('GET', '/testimonials/' + id).then(t => {
        if (!t) return;
        document.getElementById('testimonial-id').value = t.id;
        document.getElementById('testimonial-name').value = t.name;
        document.getElementById('testimonial-region').value = t.region;
        document.getElementById('testimonial-content').value = t.content;
        document.getElementById('testimonial-rating').value = t.rating;
        document.getElementById('testimonial-active').checked = t.active;
        document.getElementById('testimonial-modal-title').textContent = '编辑口碑';
        openModal('testimonial-modal');
    });
}

async function deleteTestimonial(id) {
    if (!confirm('确定删除？')) return;
    const res = await api('DELETE', '/testimonials/' + id);
    if (res && res.success) { showToast('删除成功'); loadTestimonials(); }
}

// ===== 设计师 =====
async function loadDesigners() {
    const region = document.getElementById('designer-region-filter').value;
    const keyword = document.getElementById('designer-search').value;
    let data = await api('GET', '/designers' + (region ? '?region=' + region : ''));
    if (!data) return;
    if (keyword) data = data.filter(d => d.name.includes(keyword));
    const grid = document.getElementById('designers-grid');
    if (data.length === 0) { grid.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>暂无数据</p></div>'; return; }
    grid.innerHTML = data.map(d => '<div class="designer-card"><div class="designer-card-header"></div><div class="designer-card-body"><h4>' + d.name + '</h4><p class="title">' + d.title + '</p><p class="info"><i class="fas fa-clock"></i> ' + d.experience + '年经验</p><p class="info"><i class="fas fa-paint-brush"></i> ' + (d.styles || '') + '</p></div><div class="designer-card-footer"><span class="region-tag">' + REGION_MAP[d.region] + '</span><div class="action-btns"><button class="btn btn-sm btn-secondary" onclick="editDesigner(' + d.id + ')"><i class="fas fa-edit"></i></button><button class="btn btn-sm btn-danger" onclick="deleteDesigner(' + d.id + ')"><i class="fas fa-trash"></i></button></div></div></div>').join('');
}

async function saveDesigner() {
    const id = document.getElementById('designer-id').value;
    const body = {
        name: document.getElementById('designer-name').value,
        title: document.getElementById('designer-title').value,
        region: document.getElementById('designer-region').value,
        experience: parseInt(document.getElementById('designer-experience').value) || 0,
        styles: document.getElementById('designer-styles').value,
        bio: document.getElementById('designer-bio').value,
        active: document.getElementById('designer-active').checked ? 1 : 0
    };
    if (!body.name || !body.title) { showToast('请填写必填项', 'error'); return; }
    const res = id ? await api('PUT', '/designers/' + id, body) : await api('POST', '/designers', body);
    if (res && res.success) { showToast(id ? '更新成功' : '添加成功'); closeModal('designer-modal'); loadDesigners(); }
    else { showToast('操作失败', 'error'); }
}

function editDesigner(id) {
    api('GET', '/designers/' + id).then(d => {
        if (!d) return;
        document.getElementById('designer-id').value = d.id;
        document.getElementById('designer-name').value = d.name;
        document.getElementById('designer-title').value = d.title;
        document.getElementById('designer-region').value = d.region;
        document.getElementById('designer-experience').value = d.experience;
        document.getElementById('designer-styles').value = d.styles || '';
        document.getElementById('designer-bio').value = d.bio || '';
        document.getElementById('designer-active').checked = d.active;
        document.getElementById('designer-modal-title').textContent = '编辑设计师';
        openModal('designer-modal');
    });
}

async function deleteDesigner(id) {
    if (!confirm('确定删除？')) return;
    const res = await api('DELETE', '/designers/' + id);
    if (res && res.success) { showToast('删除成功'); loadDesigners(); }
}

// ===== 案例 =====
async function loadCases() {
    const category = document.getElementById('case-category-filter').value;
    const keyword = document.getElementById('case-search').value;
    let data = await api('GET', '/cases' + (category ? '?category=' + category : ''));
    if (!data) return;
    if (keyword) data = data.filter(c => c.name.includes(keyword));
    const grid = document.getElementById('cases-grid');
    if (data.length === 0) { grid.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>暂无数据</p></div>'; return; }
    grid.innerHTML = data.map(c => '<div class="case-card"><div class="case-image" style="background:linear-gradient(135deg,#5D4037,#8D6E63);display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.3);font-size:48px"><i class="fas fa-image"></i></div><div class="case-info"><h4>' + c.name + '</h4><div class="case-meta"><span><i class="fas fa-ruler-combined"></i> ' + c.area + '㎡</span><span><i class="fas fa-palette"></i> ' + (c.style || '') + '</span></div></div><div class="case-actions"><button class="btn btn-sm btn-secondary" onclick="editCase(' + c.id + ')"><i class="fas fa-edit"></i> 编辑</button><button class="btn btn-sm btn-danger" onclick="deleteCase(' + c.id + ')"><i class="fas fa-trash"></i> 删除</button></div></div>').join('');
}

async function saveCase() {
    const id = document.getElementById('case-id').value;
    const body = {
        name: document.getElementById('case-name').value,
        category: document.getElementById('case-category').value,
        area: parseInt(document.getElementById('case-area').value) || 0,
        style: document.getElementById('case-style').value,
        description: document.getElementById('case-description').value,
        active: document.getElementById('case-active').checked ? 1 : 0
    };
    if (!body.name) { showToast('请填写案例名称', 'error'); return; }
    const res = id ? await api('PUT', '/cases/' + id, body) : await api('POST', '/cases', body);
    if (res && res.success) { showToast(id ? '更新成功' : '添加成功'); closeModal('case-modal'); loadCases(); }
    else { showToast('操作失败', 'error'); }
}

function editCase(id) {
    api('GET', '/cases/' + id).then(c => {
        if (!c) return;
        document.getElementById('case-id').value = c.id;
        document.getElementById('case-name').value = c.name;
        document.getElementById('case-category').value = c.category;
        document.getElementById('case-area').value = c.area;
        document.getElementById('case-style').value = c.style || '';
        document.getElementById('case-description').value = c.description || '';
        document.getElementById('case-active').checked = c.active;
        document.getElementById('case-modal-title').textContent = '编辑案例';
        openModal('case-modal');
    });
}

async function deleteCase(id) {
    if (!confirm('确定删除？')) return;
    const res = await api('DELETE', '/cases/' + id);
    if (res && res.success) { showToast('删除成功'); loadCases(); }
}

// ===== 服务 =====
async function loadServices() {
    const data = await api('GET', '/services');
    if (!data) return;
    const list = document.getElementById('services-list');
    if (data.length === 0) { list.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>暂无数据</p></div>'; return; }
    list.innerHTML = data.map(s => '<div class="service-item"><div class="service-icon"><i class="fas ' + s.icon + '"></i></div><div class="service-content"><h4>' + s.name + '</h4><p>' + (s.description || '') + '</p><div class="service-features">' + (s.features || []).map(f => '<span class="feature-tag">' + f + '</span>').join('') + '</div></div><div class="service-actions"><button class="btn btn-sm btn-secondary" onclick="editService(' + s.id + ')"><i class="fas fa-edit"></i></button><button class="btn btn-sm btn-danger" onclick="deleteService(' + s.id + ')"><i class="fas fa-trash"></i></button></div></div>').join('');
}

async function saveService() {
    const id = document.getElementById('service-id').value;
    const features = document.getElementById('service-features').value.split('\n').filter(f => f.trim());
    const body = {
        name: document.getElementById('service-name').value,
        icon: document.getElementById('service-icon').value,
        description: document.getElementById('service-description').value,
        features: features,
        active: document.getElementById('service-active').checked ? 1 : 0
    };
    if (!body.name) { showToast('请填写服务名称', 'error'); return; }
    const res = id ? await api('PUT', '/services/' + id, body) : await api('POST', '/services', body);
    if (res && res.success) { showToast(id ? '更新成功' : '添加成功'); closeModal('service-modal'); loadServices(); }
    else { showToast('操作失败', 'error'); }
}

function editService(id) {
    api('GET', '/services/' + id).then(s => {
        if (!s) return;
        document.getElementById('service-id').value = s.id;
        document.getElementById('service-name').value = s.name;
        document.getElementById('service-icon').value = s.icon;
        document.getElementById('service-description').value = s.description || '';
        document.getElementById('service-features').value = (s.features || []).join('\n');
        document.getElementById('service-active').checked = s.active;
        document.getElementById('service-modal-title').textContent = '编辑服务';
        openModal('service-modal');
    });
}

async function deleteService(id) {
    if (!confirm('确定删除？')) return;
    const res = await api('DELETE', '/services/' + id);
    if (res && res.success) { showToast('删除成功'); loadServices(); }
}

// ===== 用户管理 =====
async function loadUsers() {
    const data = await api('GET', '/auth');
    if (!data) return;
    const tbody = document.getElementById('users-tbody');
    tbody.innerHTML = data.map(u => '<tr><td>' + u.id + '</td><td>' + u.username + '</td><td>' + (u.display_name || '-') + '</td><td><span class="status-badge ' + (u.role === 'admin' ? 'status-active' : '') + '">' + ROLE_MAP[u.role] + '</span></td><td><span class="status-badge ' + (u.active ? 'status-active' : 'status-inactive') + '">' + (u.active ? '启用' : '禁用') + '</span></td><td>' + (u.created_at || '').substring(0, 10) + '</td><td><div class="action-btns"><button class="btn btn-sm btn-secondary" onclick="editUser(' + u.id + ')"><i class="fas fa-edit"></i></button>' + (u.id !== currentUser.id ? '<button class="btn btn-sm btn-danger" onclick="deleteUser(' + u.id + ')"><i class="fas fa-trash"></i></button>' : '') + '</div></td></tr>').join('');
}

async function saveUser() {
    const id = document.getElementById('user-id').value;
    const body = {
        username: document.getElementById('user-username').value,
        password: document.getElementById('user-password').value,
        displayName: document.getElementById('user-displayname').value,
        role: document.getElementById('user-role').value,
        active: document.getElementById('user-active').checked ? 1 : 0
    };
    if (!body.username) { showToast('请填写用户名', 'error'); return; }
    if (!id && !body.password) { showToast('请填写密码', 'error'); return; }
    const res = id ? await api('PUT', '/auth/' + id, body) : await api('POST', '/auth', body);
    if (res && res.success) { showToast(id ? '更新成功' : '添加成功'); closeModal('user-modal'); loadUsers(); }
    else { showToast(res ? res.error : '操作失败', 'error'); }
}

function editUser(id) {
    api('GET', '/auth').then(users => {
        const u = users.find(item => item.id === id);
        if (!u) return;
        document.getElementById('user-id').value = u.id;
        document.getElementById('user-username').value = u.username;
        document.getElementById('user-password').value = '';
        document.getElementById('user-password-label').textContent = '密码（留空不修改）';
        document.getElementById('user-displayname').value = u.display_name || '';
        document.getElementById('user-role').value = u.role;
        document.getElementById('user-active').checked = u.active;
        document.getElementById('user-modal-title').textContent = '编辑用户';
        openModal('user-modal');
    });
}

async function deleteUser(id) {
    if (!confirm('确定删除该用户？')) return;
    const res = await api('DELETE', '/auth/' + id);
    if (res && res.success) { showToast('删除成功'); loadUsers(); }
    else { showToast(res ? res.error : '删除失败', 'error'); }
}

// ===== 预约管理 =====
async function loadConsultations() {
    const status = document.getElementById('consult-status-filter').value;
    const region = document.getElementById('consult-region-filter').value;
    const keyword = document.getElementById('consult-search').value;

    let url = '/consultations';
    const params = [];
    if (status) params.push('status=' + status);
    if (region) params.push('region=' + region);
    if (params.length) url += '?' + params.join('&');

    const [consultations, employees] = await Promise.all([
        api('GET', url),
        api('GET', '/employees')
    ]);

    if (!consultations) return;
    employeesCache = employees || [];

    let data = consultations;
    if (keyword) {
        data = data.filter(c => c.name.includes(keyword) || c.phone.includes(keyword));
    }

    const tbody = document.getElementById('consultations-tbody');
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;color:#999">暂无预约数据</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(c => {
        const employee = employeesCache.find(e => e.id === c.employee_id);
        const statusClass = 'status-' + c.status;
        const statusName = STATUS_MAP[c.status] || c.status;
        return '<tr>' +
            '<td>' + c.id + '</td>' +
            '<td><strong>' + c.name + '</strong><br><small>' + c.phone + '</small></td>' +
            '<td>' + REGION_MAP[c.region] + '</td>' +
            '<td>' + HOUSE_TYPE_MAP[c.house_type] + '<br><small>' + (c.area || '-') + '㎡</small></td>' +
            '<td><span class="status-badge ' + statusClass + '">' + statusName + '</span></td>' +
            '<td>' + (employee ? employee.name : '<span style="color:#999">未分配</span>') + '</td>' +
            '<td>' + (c.created_at ? c.created_at.substring(0, 10) : '-') + '</td>' +
            '<td><div class="action-btns">' +
                '<button class="btn btn-sm btn-secondary" onclick="viewConsultation(' + c.id + ')"><i class="fas fa-eye"></i></button>' +
                '<button class="btn btn-sm btn-danger" onclick="deleteConsultation(' + c.id + ')"><i class="fas fa-trash"></i></button>' +
            '</div></td>' +
        '</tr>';
    }).join('');
}

async function viewConsultation(id) {
    const c = await api('GET', '/consultations/' + id);
    if (!c) return;

    document.getElementById('consultation-id').value = c.id;
    document.getElementById('consult-name').textContent = c.name;
    document.getElementById('consult-phone').textContent = c.phone;
    document.getElementById('consult-region').textContent = REGION_MAP[c.region] || c.region;
    document.getElementById('consult-address').textContent = c.address || '-';
    document.getElementById('consult-house-type').textContent = HOUSE_TYPE_MAP[c.house_type] || c.house_type;
    document.getElementById('consult-area').textContent = (c.area || '-') + ' ㎡';
    document.getElementById('consult-budget').textContent = c.budget || '-';
    document.getElementById('consult-time').textContent = c.preferred_time || '-';
    document.getElementById('consult-remark').textContent = c.remark || '无备注';

    // 渲染工作流程时间线
    renderWorkflowTimeline(c.status);

    // 填充员工选择下拉框
    const select = document.getElementById('consult-employee-select');
    select.innerHTML = '<option value="">-- 选择跟进员工 --</option>' +
        employeesCache.filter(e => e.active).map(e =>
            '<option value="' + e.id + '"' + (e.id === c.employee_id ? ' selected' : '') + '>' + e.name + ' (' + DEPT_MAP[e.department] + ')</option>'
        ).join('');

    openModal('consultation-modal');
}

function renderWorkflowTimeline(currentStatus) {
    const container = document.getElementById('workflow-timeline');
    const currentIndex = WORKFLOW_STEPS.findIndex(s => s.status === currentStatus);

    container.innerHTML = WORKFLOW_STEPS.map((step, index) => {
        let statusClass = '';
        if (index < currentIndex) statusClass = 'active';
        else if (index === currentIndex) statusClass = 'current';

        return '<div class="workflow-step ' + statusClass + '">' +
            '<div class="step-dot">' + (index < currentIndex ? '<i class="fas fa-check"></i>' : index + 1) + '</div>' +
            '<div class="step-name">' + step.name + '</div>' +
        '</div>';
    }).join('');
}

async function saveConsultationAssignment() {
    const id = document.getElementById('consultation-id').value;
    const employeeId = document.getElementById('consult-employee-select').value;

    if (!employeeId) {
        showToast('请选择跟进员工', 'error');
        return;
    }

    const res = await api('POST', '/consultations/' + id + '/assign', { employee_id: parseInt(employeeId) });
    if (res && res.success) {
        showToast('分配成功');
        closeModal('consultation-modal');
        loadConsultations();
    } else {
        showToast(res ? res.error : '分配失败', 'error');
    }
}

function updateConsultationStatus() {
    const id = document.getElementById('consultation-id').value;
    const currentStatus = document.querySelector('.workflow-step.current');
    const currentStatusValue = currentStatus ? WORKFLOW_STEPS[Array.from(document.querySelectorAll('.workflow-step')).indexOf(currentStatus)].status : 'pending';

    document.getElementById('status-consultation-id').value = id;
    document.getElementById('current-status-display').textContent = STATUS_MAP[currentStatusValue] || currentStatusValue;
    document.getElementById('current-status-display').className = 'status-display status-' + currentStatusValue;
    document.getElementById('new-status-select').value = currentStatusValue;
    document.getElementById('status-remark').value = '';

    openModal('status-modal');
}

async function confirmStatusUpdate() {
    const id = document.getElementById('status-consultation-id').value;
    const newStatus = document.getElementById('new-status-select').value;
    const remark = document.getElementById('status-remark').value;

    const res = await api('POST', '/consultations/' + id + '/status', {
        status: newStatus,
        remark: remark
    });

    if (res && res.success) {
        showToast('状态更新成功');
        closeModal('status-modal');
        closeModal('consultation-modal');
        loadConsultations();
    } else {
        showToast(res ? res.error : '更新失败', 'error');
    }
}

async function deleteConsultation(id) {
    if (!confirm('确定删除此预约？')) return;
    const res = await api('DELETE', '/consultations/' + id);
    if (res && res.success) {
        showToast('删除成功');
        loadConsultations();
    } else {
        showToast(res ? res.error : '删除失败', 'error');
    }
}

// ===== 员工管理 =====
async function loadEmployees() {
    const dept = document.getElementById('employee-dept-filter').value;
    const keyword = document.getElementById('employee-search').value;

    let url = '/employees';
    if (dept) url += '?department=' + dept;

    let data = await api('GET', url);
    if (!data) return;

    if (keyword) {
        data = data.filter(e => e.name.includes(keyword));
    }

    employeesCache = data;

    const tbody = document.getElementById('employees-tbody');
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:#999">暂无员工数据</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(e => '<tr>' +
        '<td>' + e.id + '</td>' +
        '<td><strong>' + e.name + '</strong></td>' +
        '<td>' + e.position + '</td>' +
        '<td>' + DEPT_MAP[e.department] + '</td>' +
        '<td>' + (e.phone || '-') + '</td>' +
        '<td><span class="status-badge ' + (e.active ? 'status-active' : 'status-inactive') + '">' + (e.active ? '在职' : '离职') + '</span></td>' +
        '<td><div class="action-btns">' +
            '<button class="btn btn-sm btn-secondary" onclick="editEmployee(' + e.id + ')"><i class="fas fa-edit"></i></button>' +
            '<button class="btn btn-sm btn-danger" onclick="deleteEmployee(' + e.id + ')"><i class="fas fa-trash"></i></button>' +
        '</div></td>' +
    '</tr>').join('');
}

async function saveEmployee() {
    const id = document.getElementById('employee-id').value;
    const body = {
        name: document.getElementById('employee-name').value,
        position: document.getElementById('employee-position').value,
        department: document.getElementById('employee-department').value,
        phone: document.getElementById('employee-phone').value,
        email: document.getElementById('employee-email').value,
        active: document.getElementById('employee-active').checked ? 1 : 0
    };

    if (!body.name || !body.position) {
        showToast('请填写必填项', 'error');
        return;
    }

    const res = id ? await api('PUT', '/employees/' + id, body) : await api('POST', '/employees', body);
    if (res && res.success) {
        showToast(id ? '更新成功' : '添加成功');
        closeModal('employee-modal');
        loadEmployees();
    } else {
        showToast(res ? res.error : '操作失败', 'error');
    }
}

function editEmployee(id) {
    const e = employeesCache.find(emp => emp.id === id);
    if (!e) return;

    document.getElementById('employee-id').value = e.id;
    document.getElementById('employee-name').value = e.name;
    document.getElementById('employee-position').value = e.position;
    document.getElementById('employee-department').value = e.department;
    document.getElementById('employee-phone').value = e.phone || '';
    document.getElementById('employee-email').value = e.email || '';
    document.getElementById('employee-active').checked = e.active;
    document.getElementById('employee-modal-title').textContent = '编辑员工';

    openModal('employee-modal');
}

async function deleteEmployee(id) {
    if (!confirm('确定删除该员工？')) return;
    const res = await api('DELETE', '/employees/' + id);
    if (res && res.success) {
        showToast('删除成功');
        loadEmployees();
    } else {
        showToast(res ? res.error : '删除失败', 'error');
    }
}

// ===== 设置 =====
async function loadSettings() {
    const data = await api('GET', '/settings');
    if (!data) return;
    document.getElementById('setting-title').value = data.site_title || '';
    document.getElementById('setting-phone').value = data.site_phone || '';
    document.getElementById('setting-region').value = data.default_region || 'gongji';
}

async function saveSettings() {
    const res = await api('PUT', '/settings', {
        site_title: document.getElementById('setting-title').value,
        site_phone: document.getElementById('setting-phone').value,
        default_region: document.getElementById('setting-region').value
    });
    if (res && res.success) showToast('设置保存成功');
    else showToast('保存失败', 'error');
}

// ===== 模态框 =====
function openModal(id) {
    document.getElementById(id).classList.add('active');
    // 如果是新增，重置表单
    if (!document.querySelector('#' + id + ' input[type="hidden"]').value) {
        const form = document.querySelector('#' + id + ' form');
        if (form) form.reset();
        // 恢复checkbox默认
        document.querySelectorAll('#' + id + ' input[type="checkbox"]').forEach(cb => cb.checked = true);
    }
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
    // 重置hidden id和标题
    const hidden = document.querySelector('#' + id + ' input[type="hidden"]');
    if (hidden) hidden.value = '';
    const title = document.querySelector('#' + id + ' .modal-header h3');
    if (title) {
        const defaultTitles = {
            'testimonial-modal': '添加口碑',
            'designer-modal': '添加设计师',
            'case-modal': '添加案例',
            'service-modal': '添加服务',
            'user-modal': '添加用户',
            'employee-modal': '添加员工'
        };
        title.textContent = defaultTitles[id] || '添加';
    }
    if (id === 'user-modal') document.getElementById('user-password-label').textContent = '密码 *';
    if (id === 'employee-modal') {
        document.getElementById('employee-name').value = '';
        document.getElementById('employee-position').value = '';
        document.getElementById('employee-phone').value = '';
        document.getElementById('employee-email').value = '';
        document.getElementById('employee-active').checked = true;
    }
}

document.querySelectorAll('.modal').forEach(m => {
    m.addEventListener('click', e => { if (e.target === m) m.classList.remove('active'); });
});

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
    if (authToken && currentUser) {
        showAdmin();
    }
});
