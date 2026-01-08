document.addEventListener('DOMContentLoaded', () => {
    // العناصر الأساسية
    const sidebar = document.getElementById('sidebar');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const projectsList = document.getElementById('projectsList');
    const tasksContainer = document.getElementById('tasksContainer');
    const currentProjectName = document.getElementById('currentProjectName');
    const projectLogo = document.getElementById('projectLogo');
    const addProjectBtn = document.getElementById('addProjectBtn');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const projectModal = document.getElementById('projectModal');
    const taskModal = document.getElementById('taskModal');
    const taskProjectName = document.getElementById('taskProjectName');
    const taskSearch = document.getElementById('taskSearch');

    // Sidebar Profile
    const sidebarAvatar = document.getElementById('sidebarAvatar');
    const sidebarName = document.getElementById('sidebarName');

    let projects = JSON.parse(localStorage.getItem('taskboard_projects')) || [];
    let currentProjectId = localStorage.getItem('currentProjectId') || null;

    // تحميل بيانات المستخدم من localStorage
    const userProfile = JSON.parse(localStorage.getItem('user_profile')) || {};
    if (userProfile.avatar) sidebarAvatar.src = userProfile.avatar;
    if (userProfile.name) sidebarName.textContent = userProfile.name;

    // فتح/إغلاق القائمة الجانبية في الموبايل
    mobileMenuBtn.onclick = () => sidebar.classList.toggle('open');

    // إغلاق المودال بالضغط على X أو Cancel أو خارج المودال
    document.querySelectorAll('.close, .cancel-btn').forEach(btn => {
        btn.onclick = () => btn.closest('.modal').style.display = 'none';
    });
    window.onclick = e => {
        if (e.target.classList.contains('modal')) e.target.style.display = 'none';
    };

    // عرض المشاريع في الـ Sidebar
    function renderProjects() {
        projectsList.innerHTML = '';
        projects.forEach(p => {
            const li = document.createElement('li');
            li.className = `project-item ${p.id === currentProjectId ? 'active' : ''}`;
            li.innerHTML = `
                <div class="project-info">
                    ${p.logo ? `<img src="${p.logo}" class="sidebar-logo">` : '<i class="fas fa-folder"></i>'}
                    <span>${p.name}</span>
                </div>
                <div class="project-actions">
                    <button onclick="editProject('${p.id}')"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteProject('${p.id}', event)"><i class="fas fa-trash"></i></button>
                </div>
            `;
            li.onclick = e => {
                if (!e.target.closest('.project-actions')) switchProject(p.id);
            };
            projectsList.appendChild(li);
        });
    }

    // تبديل المشروع
    function switchProject(id) {
        // إغلاق كل التاسكات المفتوحة
        document.querySelectorAll('.section').forEach(s => s.classList.add('collapsed'));

        currentProjectId = id;
        localStorage.setItem('currentProjectId', id);
        const project = projects.find(p => p.id === id);

        currentProjectName.textContent = project ? project.name : 'Select a project';
        projectLogo.src = project?.logo || '';
        projectLogo.style.display = project?.logo ? 'block' : 'none';
        document.documentElement.style.setProperty('--project-color', project?.color || '#007acc');

        renderTasks();
        renderProjects();
        addTaskBtn.style.display = project ? 'block' : 'none';
        taskSearch.value = '';
        if (window.innerWidth <= 992) sidebar.classList.remove('open');
    }

    // البحث في التاسكات
    function filterTasks() {
        const query = taskSearch.value.toLowerCase().trim();
        document.querySelectorAll('.section').forEach(section => {
            const text = section.textContent.toLowerCase();
            section.classList.toggle('hidden', query && !text.includes(query));
        });
    }

    // عرض التاسكات
    function renderTasks() {
        tasksContainer.innerHTML = '';
        if (!currentProjectId) {
            tasksContainer.innerHTML = '<p style="text-align:center;color:#777;padding:80px;font-size:1.3rem;">Select a project to view tasks</p>';
            return;
        }

        const project = projects.find(p => p.id === currentProjectId);
        if (!project || !project.tasks || project.tasks.length === 0) {
            tasksContainer.innerHTML = '<p style="text-align:center;color:#777;padding:80px;font-size:1.3rem;">No tasks yet. Click "+ Add Task" to create one!</p>';
            return;
        }

        project.tasks.forEach((task, index) => {
            const section = document.createElement('div');
            section.className = 'section collapsed';

            const commitsHTML = task.commits && task.commits.length > 0
                ? task.commits.map(c => `
                    <div class="commit-item">
                        <a href="${c.url}" target="_blank"><i class="fab fa-github"></i> ${c.text || 'View Commit'}</a>
                    </div>`).join('')
                : '<em style="color:#777;">No commits added</em>';

            const imagesHTML = task.images && task.images.length > 0
                ? `<div class="task-images-gallery">
                    ${task.images.map(img => `<img src="${img}" onclick="window.open(this.src, '_blank')">`).join('')}
                   </div>`
                : '';

            section.innerHTML = `
                <h2>
                    <span class="task-title-text">Task: ${task.title}</span>
                    <div class="task-controls">
                        <i class="fas fa-edit" onclick="editTask(${index})" title="Edit"></i>
                        <i class="fas fa-trash" onclick="deleteTask(${index}, event)" title="Delete"></i>
                        <i class="fas fa-chevron-down arrow-icon"></i>
                    </div>
                </h2>
                <div class="content">
                    <h3 class="task-title">Git Commits:</h3>
                    ${commitsHTML}

                    <h3 class="task-title">ERP:</h3>
                    <div class="erp-link"><a href="${task.erp}" target="_blank">${task.erp}</a></div>

                    <h3 class="task-title">Description:</h3>
                    <ul>${task.description?.map(d => `<li>${d}</li>`).join('') || '<li>No description</li>'}</ul>

                    ${imagesHTML}
                </div>
            `;

            // فتح/إغلاق التاسك عند الضغط على أي مكان في الـ h2 (العنوان أو السهم)
            section.querySelector('h2').addEventListener('click', e => {
                // تجاهل الضغط على زر التعديل أو الحذف
                if (e.target.closest('.fa-edit') || e.target.closest('.fa-trash')) return;

                // إغلاق كل التاسكات الأخرى
                document.querySelectorAll('.section').forEach(s => {
                    if (s !== section) s.classList.add('collapsed');
                });

                // تبديل حالة التاسك الحالية
                section.classList.toggle('collapsed');
            });

            tasksContainer.appendChild(section);
        });
    }

    // تعديل مشروع
    window.editProject = (id) => {
        const p = projects.find(proj => proj.id === id);
        document.getElementById('projectModalTitle').textContent = 'Edit Project';
        document.getElementById('projectName').value = p.name;
        document.getElementById('projectColor').value = p.color;
        document.getElementById('editProjectId').value = id;
        document.getElementById('projectSubmitBtn').textContent = 'Save Changes';
        document.getElementById('logoPreview').innerHTML = p.logo ? `<img src="${p.logo}">` : '';
        projectModal.style.display = 'block';
    };

    // حذف مشروع
    window.deleteProject = (id, e) => {
        e.stopPropagation();
        if (confirm('Delete this project and all its tasks?')) {
            projects = projects.filter(p => p.id !== id);
            if (currentProjectId === id) {
                currentProjectId = null;
                localStorage.removeItem('currentProjectId');
            }
            localStorage.setItem('taskboard_projects', JSON.stringify(projects));
            switchProject(currentProjectId);
        }
    };

    // تعديل تاسك
    window.editTask = (index) => {
        const project = projects.find(p => p.id === currentProjectId);
        const task = project.tasks[index];

        document.getElementById('editTaskIndex').value = index;
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('gitCommits').value = task.commits?.map(c => `${c.text} | ${c.url}`).join('\n') || '';
        document.getElementById('erpLink').value = task.erp;
        document.getElementById('taskDescription').value = task.description?.join('\n') || '';

        // عرض الصور الحالية
        const preview = document.getElementById('imagesPreview');
        preview.innerHTML = '';
        if (task.images) {
            task.images.forEach(src => {
                const img = document.createElement('img');
                img.src = src;
                preview.appendChild(img);
            });
        }

        taskModal.style.display = 'block';
        taskProjectName.textContent = project.name;
    };

    // حذف تاسك
    window.deleteTask = (index, e) => {
        e.stopPropagation();
        if (confirm('Delete this task permanently?')) {
            const project = projects.find(p => p.id === currentProjectId);
            project.tasks.splice(index, 1);
            localStorage.setItem('taskboard_projects', JSON.stringify(projects));
            renderTasks();
        }
    };

    // حفظ المشروع (جديد أو تعديل)
    document.getElementById('projectForm').onsubmit = e => {
        e.preventDefault();
        const id = document.getElementById('editProjectId').value;
        const name = document.getElementById('projectName').value.trim();
        const color = document.getElementById('projectColor').value;
        const file = document.getElementById('projectLogoInput').files[0];

        const save = (logoData = '') => {
            if (id) {
                const p = projects.find(p => p.id === id);
                p.name = name;
                p.color = color;
                if (logoData) p.logo = logoData;
            } else {
                projects.push({
                    id: Date.now().toString(),
                    name,
                    color,
                    logo: logoData || '',
                    tasks: []
                });
            }
            localStorage.setItem('taskboard_projects', JSON.stringify(projects));
            projectModal.style.display = 'none';
            e.target.reset();
            document.getElementById('logoPreview').innerHTML = '';
            renderProjects();
            if (!id) switchProject(projects[projects.length - 1].id);
        };

        if (file) {
            const reader = new FileReader();
            reader.onload = ev => save(ev.target.result);
            reader.readAsDataURL(file);
        } else {
            save(projects.find(p => p.id === id)?.logo || '');
        }
    };

    // حفظ التاسك (مع صور متعددة)
    document.getElementById('taskForm').onsubmit = e => {
        e.preventDefault();
        const project = projects.find(p => p.id === currentProjectId);
        const index = document.getElementById('editTaskIndex').value;
        const files = document.getElementById('taskImages').files;

        const readImages = (callback) => {
            if (files.length === 0) return callback([]);

            const images = [];
            let loaded = 0;

            [...files].forEach(file => {
                const reader = new FileReader();
                reader.onload = ev => {
                    images.push(ev.target.result);
                    loaded++;
                    if (loaded === files.length) callback(images);
                };
                reader.readAsDataURL(file);
            });
        };

        readImages(newImages => {
            const task = {
                title: document.getElementById('taskTitle').value.trim(),
                commits: document.getElementById('gitCommits').value.split('\n')
                    .filter(l => l.trim())
                    .map(l => {
                        const [text, url] = l.split('|').map(s => s.trim());
                        return { text: text || url || 'View Commit', url: url || '#' };
                    }),
                erp: document.getElementById('erpLink').value,
                description: document.getElementById('taskDescription').value.split('\n').filter(l => l.trim()),
                images: index == -1 ? newImages : (newImages.length > 0 ? newImages : project.tasks[index]?.images || [])
            };

            if (index == -1) {
                project.tasks.unshift(task);
            } else {
                project.tasks[index] = task;
            }

            localStorage.setItem('taskboard_projects', JSON.stringify(projects));
            renderTasks();
            taskModal.style.display = 'none';
            e.target.reset();
            document.getElementById('imagesPreview').innerHTML = '';
            document.getElementById('editTaskIndex').value = '-1';
        });
    };

    // معاينة الصور في المودال
    document.getElementById('taskImages').onchange = e => {
        const preview = document.getElementById('imagesPreview');
        preview.innerHTML = '';
        [...e.target.files].forEach(file => {
            const reader = new FileReader();
            reader.onload = ev => {
                const img = document.createElement('img');
                img.src = ev.target.result;
                preview.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
    };

    // معاينة لوجو المشروع
    document.getElementById('projectLogoInput').onchange = e => {
        const file = e.target.files[0];
        const preview = document.getElementById('logoPreview');
        preview.innerHTML = '';
        if (file) {
            const reader = new FileReader();
            reader.onload = ev => {
                const img = document.createElement('img');
                img.src = ev.target.result;
                preview.appendChild(img);
            };
            reader.readAsDataURL(file);
        }
    };

    // أزرار إضافة مشروع وتاسك
    addProjectBtn.onclick = () => {
        document.getElementById('projectModalTitle').textContent = 'Add New Project';
        document.getElementById('projectSubmitBtn').textContent = 'Create Project';
        document.getElementById('projectForm').reset();
        document.getElementById('logoPreview').innerHTML = '';
        document.getElementById('editProjectId').value = '';
        projectModal.style.display = 'block';
    };

    addTaskBtn.onclick = () => {
        if (!currentProjectId) return alert('Please select a project first!');
        const p = projects.find(p => p.id === currentProjectId);
        taskProjectName.textContent = p.name;
        document.getElementById('taskForm').reset();
        document.getElementById('editTaskIndex').value = '-1';
        document.getElementById('imagesPreview').innerHTML = '';
        taskModal.style.display = 'block';
    };

    // البحث الفوري
    taskSearch.addEventListener('input', filterTasks);

    // تشغيل التطبيق
    renderProjects();
    if (currentProjectId) switchProject(currentProjectId);
    addTaskBtn.style.display = currentProjectId ? 'block' : 'none';
});