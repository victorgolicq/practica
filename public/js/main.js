document.addEventListener('DOMContentLoaded', () => {
    const authContainer = document.getElementById('auth-container');
    const taskDashboardWrapper = document.getElementById('task-dashboard-wrapper');
    const loginForm = document.getElementById('login-form');
    const loginUsernameInput = document.getElementById('login-username');
    const loginPasswordInput = document.getElementById('login-password');
    const showRegisterModalBtn = document.getElementById('show-register-modal-btn');
    const welcomeUsername = document.getElementById('welcome-username');
    const logoutButton = document.getElementById('logout-button');
    const addTaskBtn = document.getElementById('add-task-btn');
    const refreshTasksBtn = document.getElementById('refresh-tasks-btn');
    const tasksContainer = document.getElementById('tasks-container');
    const noTasksMessage = document.getElementById('no-tasks-message');
    const notificationContainer = document.getElementById('notification-container');


    const profilePanel = document.getElementById('profile-panel-container');
    const profileUsernameSpan = document.getElementById('profile-username');
    const profileTotalTasksSpan = document.getElementById('profile-total-tasks');
    const profileAvatarImg = document.getElementById('profile-avatar-img');
    const profileAvatarIcon = document.getElementById('profile-avatar-icon');
    const changeAvatarBtn = document.getElementById('change-avatar-btn');
    const avatarUploadInput = document.getElementById('avatar-upload-input');


    const categoryPanel = document.getElementById('category-panel-container');
    const categoryList = document.getElementById('category-list');
    const addCategoryBtn = document.getElementById('add-category-btn');


    const taskModal = document.getElementById('task-modal');
    const modalTitle = document.getElementById('modal-title');
    const taskForm = document.getElementById('task-form');
    const taskIdInput = document.getElementById('task-id');
    const modalTaskCategory = document.getElementById('modal-task-category'); 
    const modalTaskTitle = document.getElementById('modal-task-title');
    const modalTaskDescription = document.getElementById('modal-task-description');
    const modalTaskDeadline = document.getElementById('modal-task-deadline');
    const modalTaskPriority = document.getElementById('modal-task-priority');
    const modalTaskStatus = document.getElementById('modal-task-status');
    const modalStatusGroup = document.getElementById('modal-status-group');
    const modalSubmitBtn = document.getElementById('modal-submit-btn');

    const registerModal = document.getElementById('register-modal');
    const registerForm = document.getElementById('register-form');
    const registerUsernameInput = document.getElementById('register-username');
    const registerPasswordInput = document.getElementById('register-password');
    const registerConfirmPasswordInput = document.getElementById('register-confirm-password');

    const categoryModal = document.getElementById('category-modal');
    const categoryModalTitle = document.getElementById('category-modal-title');
    const categoryForm = document.getElementById('category-form');
    const categoryIdInput = document.getElementById('category-id');
    const categoryNameInput = document.getElementById('category-name');
    const categorySubmitBtn = document.getElementById('category-submit-btn');
    const categoryDeleteBtn = document.getElementById('category-delete-btn');


    const filterStatusSelect = document.getElementById('filter-status');
    const sortBySelect = document.getElementById('sort-by');

    const prevWeekBtn = document.getElementById('prev-week-btn');
    const nextWeekBtn = document.getElementById('next-week-btn');
    const currentWeekRangeSpan = document.getElementById('current-week-range');
    const calendarGrid = document.getElementById('calendar-grid');

    let currentWeekStart = new Date(); 
    let allTasks = []; 
    let userCategories = []; 
    let currentSelectedCategory = 'all'; 

    const API_BASE_URL = '';
   
    if (document.getElementById('particles-js')) {
        particlesJS('particles-js', {
            "particles": { "number": { "value": 80, "density": { "enable": true, "value_area": 800 } }, "color": { "value": ["#b3e0ff", "#f8c0f5", "#a45a52"] }, "shape": { "type": "circle", "stroke": { "width": 0, "color": "#000000" }, "polygon": { "nb_sides": 5 } }, "opacity": { "value": 0.5, "random": false, "anim": { "enable": false, "speed": 1, "opacity_min": 0.1, "sync": false } }, "size": { "value": 3, "random": true, "anim": { "enable": false, "speed": 40, "size_min": 0.1, "sync": false } }, "line_linked": { "enable": true, "distance": 150, "color": "#b3e0ff", "opacity": 0.4, "width": 1 }, "move": { "enable": true, "speed": 3, "direction": "none", "random": false, "straight": false, "out_mode": "out", "bounce": false, "attract": { "enable": false, "rotateX": 600, "rotateY": 1200 } } }, "interactivity": { "detect_on": "canvas", "events": { "onhover": { "enable": true, "mode": "grab" }, "onclick": { "enable": true, "mode": "push" }, "resize": true }, "modes": { "grab": { "distance": 140, "line_linked": { "opacity": 1 } }, "bubble": { "distance": 400, "size": 40, "duration": 2, "opacity": 8, "speed": 3 }, "repulse": { "distance": 200, "duration": 0.4 }, "push": { "particles_nb": 4 }, "remove": { "particles_nb": 2 } } }, "retina_detect": true });
    }



    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.classList.add('notification', type);
        notification.innerHTML = `<span class="notification-message">${message}</span><button class="notification-close"><i class="fas fa-times"></i></button>`;
        notificationContainer.appendChild(notification);
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.add('fading-out');
                notification.addEventListener('animationend', () => notification.remove(), { once: true });
            }
        }, 4500);
        notification.querySelector('.notification-close').addEventListener('click', () => notification.remove());
    }

    function showModal(modalElement) {
        modalElement.classList.remove('hidden');
        setTimeout(() => modalElement.classList.add('active'), 10);
    }

    function hideModal(modalElement) {
        modalElement.classList.remove('active');
        modalElement.addEventListener('transitionend', function handler() {
            modalElement.classList.add('hidden');
            modalElement.removeEventListener('transitionend', handler);
        }, { once: true });
    }

    function toggleView(showAuth, username = '') {
        if (showAuth) {
            authContainer.classList.remove('hidden');
            taskDashboardWrapper.classList.add('hidden'); 
            if (profilePanel) profilePanel.classList.add('hidden');
            if (categoryPanel) categoryPanel.classList.add('hidden');
        } else {
            authContainer.classList.add('hidden');
            taskDashboardWrapper.classList.remove('hidden'); 
            if (profilePanel) profilePanel.classList.remove('hidden');
            if (categoryPanel) categoryPanel.classList.remove('hidden');

            welcomeUsername.textContent = username;
            fetchCategories();
            fetchTasks();
            fetchUserProfile();
            renderCalendar(currentWeekStart);
        }
    }

    function showTaskEditModal(task = null) {
        taskForm.reset();
        modalStatusGroup.classList.remove('hidden');
        populateCategorySelect(modalTaskCategory, userCategories);

        if (task) {
            modalTitle.textContent = 'Edit Task';
            modalSubmitBtn.textContent = 'Update Task';
            taskIdInput.value = task.id;
            modalTaskTitle.value = task.title;
            modalTaskDescription.value = task.description || '';
            modalTaskDeadline.value = task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '';
            modalTaskPriority.value = task.priority;
            modalTaskStatus.value = task.status;
            modalTaskCategory.value = task.category_id || '';
        } else {
            modalTitle.textContent = 'Add New Task';
            modalSubmitBtn.textContent = 'Add Task';
            taskIdInput.value = '';
            modalTaskStatus.value = 'To Do';
            modalStatusGroup.classList.add('hidden');
            modalTaskCategory.value = currentSelectedCategory === 'all' || currentSelectedCategory === 'null' ? '' : currentSelectedCategory;
        }
        [modalTaskTitle, modalTaskDescription, modalTaskDeadline].forEach(input => {
            if (input.value) {
                input.dispatchEvent(new Event('input'));
            }
        });
        showModal(taskModal);
    }

    function showCategoryModal(category = null) {
        categoryForm.reset();
        categoryDeleteBtn.classList.add('hidden');
        if (category) {
            categoryModalTitle.textContent = 'Edit Category';
            categorySubmitBtn.textContent = 'Update Category';
            categoryIdInput.value = category.id;
            categoryNameInput.value = category.name;
            categoryDeleteBtn.classList.remove('hidden');
        } else {
            categoryModalTitle.textContent = 'Add New Category';
            categorySubmitBtn.textContent = 'Add Category';
            categoryIdInput.value = '';
        }
        if (categoryNameInput.value) {
            categoryNameInput.dispatchEvent(new Event('input'));
        }
        showModal(categoryModal);
    }
    async function fetchUserProfile() {
        const response = await performAuthorizedRequest(`${API_BASE_URL}/user/profile`);
        if (response) {
            const profile = await response.json();
            renderUserProfile(profile);
        }
    }

    async function uploadAvatar(file) {
        const formData = new FormData();
        formData.append('avatar', file);

        showNotification('Uploading avatar...', 'info');

        const response = await performAuthorizedRequest(`${API_BASE_URL}/user/avatar`, {
            method: 'POST',
            body: formData
        });

        if (response) {
            const data = await response.json();
            showNotification(data.message, 'success');
            if (data.avatarUrl) {
                profileAvatarImg.src = data.avatarUrl + `?t=${new Date().getTime()}`;
                profileAvatarImg.classList.remove('hidden');
                profileAvatarIcon.classList.add('hidden');
            }
        }
    }

    async function handleAuthResponse(response) {
        const data = await response.json();
        if (response.ok) {
            let notificationMessage = data.message || 'Operation successful!';
            if (data.accessToken) {
                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('username', data.username);
                toggleView(false, data.username);
                loginForm.reset();
                hideModal(registerModal);
                notificationMessage = 'Logged in successfully!';
            } else {
                if (data.message) {
                    notificationMessage = data.message;
                    if (response.url.endsWith('/register')) {
                        notificationMessage += ' You can now log in.';
                    }
                }
                hideModal(registerModal);
                loginForm.reset();
                loginUsernameInput.value = registerUsernameInput.value;
            }
            showNotification(notificationMessage, 'success');
        } else {
            showNotification(data.message || 'An error occurred. Please try again.', 'error');
        }
    }

    async function performAuthorizedRequest(url, options = {}) {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            showNotification('Your session has expired. Please log in again.', 'error');
            toggleView(true);
            return null;
        }
        const headers = { 'Authorization': `Bearer ${token}`, ...options.headers };
        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }
        try {
            const response = await fetch(url, { ...options, headers });
            if (response.status === 401 || response.status === 403) {
                showNotification('Session expired or unauthorized. Please log in again.', 'error');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('username');
                toggleView(true);
                return null;
            }
            if (!response.ok && !(options.body instanceof FormData)) {
                const errorData = await response.json();
                showNotification(`Error: ${errorData.message || response.statusText}`, 'error');
                return null;
            }
            return response;
        } catch (error) {
            console.error('Network or server error:', error);
            showNotification('A network error occurred. Please try again.', 'error');
            return null;
        }
    }

    async function fetchCategories() {
        const response = await performAuthorizedRequest(`${API_BASE_URL}/categories`);
        if (response) {
            userCategories = await response.json();
            renderCategories(userCategories);
            populateCategorySelect(modalTaskCategory, userCategories);
            return true;
        }
        return false;
    }

    async function saveCategory(categoryData) {
        const isEditing = categoryData.id;
        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing ? `${API_BASE_URL}/categories/${categoryData.id}` : `${API_BASE_URL}/categories`;
        const response = await performAuthorizedRequest(url, { method: method, body: JSON.stringify(categoryData) });
        if (response) {
            showNotification(`Category ${isEditing ? 'updated' : 'added'} successfully!`, 'success');
            hideModal(categoryModal);
            fetchCategories();
        }
    }

    async function deleteCategory(categoryId) {
        if (!confirm('Are you sure you want to delete this category? All associated tasks will become "Uncategorized".')) return;
        const response = await performAuthorizedRequest(`${API_BASE_URL}/categories/${categoryId}`, { method: 'DELETE' });
        if (response) {
            showNotification('Category deleted successfully!', 'success');
            hideModal(categoryModal);
            if (currentSelectedCategory == categoryId) {
                currentSelectedCategory = 'all';
            }
            fetchCategories();
            fetchTasks();
        }
    }

    async function fetchTasks() {
        const response = await performAuthorizedRequest(`${API_BASE_URL}/tasks?categoryId=${currentSelectedCategory}`);
        if (response) {
            allTasks = await response.json();
            renderTasks(allTasks);
            renderCalendar(currentWeekStart);
            fetchUserProfile();
            return true;
        }
        return false;
    }

    async function saveTask(taskData) {
        const isEditing = taskData.id;
        const method = isEditing ? 'PUT' : 'POST';
        const url = isEditing ? `${API_BASE_URL}/tasks/${taskData.id}` : `${API_BASE_URL}/tasks`;
        const response = await performAuthorizedRequest(url, { method: method, body: JSON.stringify(taskData) });
        if (response) {
            showNotification(`Task ${isEditing ? 'updated' : 'added'} successfully!`, 'success');
            hideModal(taskModal);
            fetchTasks();
            fetchUserProfile();
        }
    }

    async function deleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) return;
        const response = await performAuthorizedRequest(`${API_BASE_URL}/tasks/${taskId}`, { method: 'DELETE' });
        if (response) {
            showNotification('Task deleted successfully!', 'success');
            fetchTasks();
            fetchUserProfile();
        }
    }

    async function updateTaskStatus(taskId, newStatus) {
        const response = await performAuthorizedRequest(`${API_BASE_URL}/tasks/${taskId}/status`, { method: 'PATCH', body: JSON.stringify({ status: newStatus }) });
        if (response) {
            showNotification('Task status updated!', 'success');
            fetchTasks();
        }
    }
    function renderUserProfile(profile) {
        if (profileUsernameSpan) profileUsernameSpan.textContent = profile.username;
        if (profileTotalTasksSpan) profileTotalTasksSpan.textContent = profile.totalTasks;
        if (profile.avatar_url) {
            profileAvatarImg.src = profile.avatar_url + `?t=${new Date().getTime()}`;
            profileAvatarImg.classList.remove('hidden');
            profileAvatarIcon.classList.add('hidden');
        } else {
            profileAvatarImg.classList.add('hidden');
            profileAvatarIcon.classList.remove('hidden');
        }
    }

    function renderCategories(categories) {
        const defaultButtons = categoryList.querySelectorAll('.category-item[data-category-id="all"], .category-item[data-category-id="null"]');
        categoryList.innerHTML = '';
        defaultButtons.forEach(btn => categoryList.appendChild(btn));

        categories.forEach(cat => {
            const categoryButton = document.createElement('button');
            categoryButton.classList.add('category-item');
            categoryButton.dataset.categoryId = cat.id;
            categoryButton.innerHTML = `<i class="fas fa-tag"></i> ${cat.name} <span class="category-edit-icon"><i class="fas fa-edit"></i></span>`;
            if (currentSelectedCategory == cat.id) {
                categoryButton.classList.add('active');
            }
            categoryButton.addEventListener('click', () => {
                selectCategory(cat.id);
            });
            categoryButton.querySelector('.category-edit-icon').addEventListener('click', (e) => {
                e.stopPropagation();
                showCategoryModal(cat);
            });
            categoryList.appendChild(categoryButton);
        });

        const activeBtn = categoryList.querySelector(`.category-item[data-category-id="${currentSelectedCategory}"]`);
        if (activeBtn) {
            categoryList.querySelectorAll('.category-item').forEach(btn => btn.classList.remove('active'));
            activeBtn.classList.add('active');
        }
    }

    function selectCategory(categoryId) {
        currentSelectedCategory = categoryId;
        categoryList.querySelectorAll('.category-item').forEach(btn => btn.classList.remove('active'));
        const selectedBtn = categoryList.querySelector(`.category-item[data-category-id="${categoryId}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('active');
        }
        showNotification(`Displaying tasks for "${selectedBtn.textContent.split(' ')[2] || 'All Tasks'}"`, 'info');
        fetchTasks();
    }

    function populateCategorySelect(selectElement, categories) {
        selectElement.innerHTML = '<option value="">No Category</option>';
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            selectElement.appendChild(option);
        });
    }

    function renderTasks(tasks) {
        tasksContainer.innerHTML = '';
        const filterStatus = filterStatusSelect.value;
        let filteredTasks = tasks.filter(task => filterStatus === 'All' || task.status === filterStatus);
        if (filteredTasks.length === 0) {
            noTasksMessage.classList.remove('hidden');
            return;
        }
        noTasksMessage.classList.add('hidden');

        const sortBy = sortBySelect.value;
        let sortedTasks = [...filteredTasks];

        const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };

        if (sortBy === 'priority-desc') {
            sortedTasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
        } else if (sortBy === 'priority-asc') {
            sortedTasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        } else if (sortBy === 'deadline-asc') {
            sortedTasks.sort((a, b) => {
                const dateA = a.deadline ? new Date(a.deadline) : new Date('9999-12-31');
                const dateB = b.deadline ? new Date(b.deadline) : new Date('9999-12-31');
                return dateA - dateB;
            });
        } else if (sortBy === 'deadline-desc') {
            sortedTasks.sort((a, b) => {
                const dateA = a.deadline ? new Date(a.deadline) : new Date('0000-01-01');
                const dateB = b.deadline ? new Date(b.deadline) : new Date('0000-01-01');
                return dateB - dateA;
            });
        }

        sortedTasks.forEach((task, index) => {
            const taskCard = document.createElement('div');
            taskCard.classList.add('task-card', `priority-${task.priority.replace(/\s/g, '')}`, `status-${task.status.replace(/\s/g, '')}`);
            taskCard.dataset.id = task.id;
            taskCard.style.animationDelay = `${index * 0.05}s`;

            const deadlineText = task.deadline ? new Date(task.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'No deadline';
            const categoryName = task.category_name || 'Uncategorized';

            taskCard.innerHTML = `
                <h4>${task.title}</h4>
                <p><strong>Category:</strong> ${categoryName}</p>
                <p><strong>Description:</strong> ${task.description || 'N/A'}</p>
                <p><strong>Deadline:</strong> ${deadlineText}</p>
                <p><strong>Priority:</strong> ${task.priority}</p>
                <p><strong>Status:</strong> ${task.status}</p>
                <div class="actions">
                    <button class="btn secondary edit-btn"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn danger delete-btn"><i class="fas fa-trash-alt"></i> Delete</button>
                    ${task.status !== 'Done' ?
                        `<button class="btn success complete-btn"><i class="fas fa-check-circle"></i> Mark as Done</button>` :
                        `<button class="btn secondary undone-btn"><i class="fas fa-undo"></i> Mark as To Do</button>`
                    }
                </div>
            `;
            tasksContainer.appendChild(taskCard);

            taskCard.querySelector('.edit-btn').addEventListener('click', () => showTaskEditModal(task));
            taskCard.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));
            if (task.status !== 'Done') {
                taskCard.querySelector('.complete-btn').addEventListener('click', () => updateTaskStatus(task.id, 'Done'));
            } else {
                taskCard.querySelector('.undone-btn').addEventListener('click', () => updateTaskStatus(task.id, 'To Do'));
            }
        });
    }

    function renderCalendar(startDate) {
        currentWeekRangeSpan.style.opacity = '0';
        currentWeekRangeSpan.style.transform = 'translateY(-10px)';

        setTimeout(() => {
            calendarGrid.innerHTML = '';
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const startOfWeek = new Date(startDate);
            startOfWeek.setDate(startDate.getDate() - startDate.getDay());
            startOfWeek.setHours(0, 0, 0, 0);

            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);

            currentWeekRangeSpan.textContent = `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
            currentWeekRangeSpan.style.opacity = '1';
            currentWeekRangeSpan.style.transform = 'translateY(0)';

            for (let i = 0; i < 7; i++) {
                const dayDate = new Date(startOfWeek);
                dayDate.setDate(startOfWeek.getDate() + i);
                dayDate.setHours(0, 0, 0, 0);

                const isToday = dayDate.getTime() === today.getTime();

                const dayCell = document.createElement('div');
                dayCell.classList.add('calendar-day');
                if (isToday) {
                    dayCell.classList.add('today');
                }
                dayCell.style.animationDelay = `${i * 0.08}s`;
                dayCell.style.opacity = '0';
                dayCell.style.transform = 'translateY(20px)';

                dayCell.innerHTML = `
                    <div class="calendar-day-header">
                        ${days[dayDate.getDay()]}<br>
                        ${dayDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                    </div>
                    <div class="calendar-day-tasks"></div>
                `;
                calendarGrid.appendChild(dayCell);

                setTimeout(() => {
                    dayCell.style.opacity = '1';
                    dayCell.style.transform = 'translateY(0)';
                }, 50);


                const dayTasksContainer = dayCell.querySelector('.calendar-day-tasks');

                const tasksForThisDay = allTasks.filter(task =>
                    task.deadline && new Date(task.deadline).setHours(0, 0, 0, 0) === dayDate.getTime()
                ).sort((a, b) => ({ 'High': 3, 'Medium': 2, 'Low': 1 })[b.priority] - ({ 'High': 3, 'Medium': 2, 'Low': 1 })[a.priority]);

                if (tasksForThisDay.length > 0) {
                    tasksForThisDay.forEach(task => {
                        const taskItem = document.createElement('div');
                        taskItem.classList.add('calendar-day-task-item', `priority-${task.priority.replace(/\s/g, '')}`);
                        if (task.status === 'Done') {
                            taskItem.classList.add('status-Done');
                        }
                        taskItem.textContent = task.title;
                        taskItem.title = `${task.title} - ${task.description || 'No description'} (Priority: ${task.priority}, Status: ${task.status})`;
                        taskItem.addEventListener('click', (e) => {
                            e.stopPropagation();
                            showTaskEditModal(task);
                        });
                        dayTasksContainer.appendChild(taskItem);
                    });
                } else {
                    const noTasks = document.createElement('p');
                    noTasks.classList.add('no-tasks-for-day');
                    noTasks.textContent = 'No tasks for this day.';
                    dayTasksContainer.appendChild(noTasks);
                }
            }
        }, 300);
    }
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = loginUsernameInput.value.trim();
        const password = loginPasswordInput.value.trim();
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        handleAuthResponse(response);
    });

    showRegisterModalBtn.addEventListener('click', () => {
        registerForm.reset();
        showModal(registerModal);
        [registerUsernameInput, registerPasswordInput, registerConfirmPasswordInput].forEach(input => {
            if (input.value) input.dispatchEvent(new Event('input'));
        });
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = registerUsernameInput.value.trim();
        const password = registerPasswordInput.value.trim();
        const confirmPassword = registerConfirmPasswordInput.value.trim();

        if (!username || !password || !confirmPassword) {
            showNotification('All fields are required for registration.', 'error');
            return;
        }
        if (password !== confirmPassword) {
            showNotification('Passwords do not match.', 'error');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        handleAuthResponse(response);
    });

    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('username');
        showNotification('Logged out successfully!', 'success');
        toggleView(true);
    });

    addTaskBtn.addEventListener('click', () => showTaskEditModal());
    refreshTasksBtn.addEventListener('click', () => {
        showNotification('Refreshing tasks...', 'info');
        fetchTasks();
    });

    prevWeekBtn.addEventListener('click', () => {
        currentWeekStart.setDate(currentWeekStart.getDate() - 7);
        renderCalendar(currentWeekStart);
    });
    nextWeekBtn.addEventListener('click', () => {
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        renderCalendar(currentWeekStart);
    });

    document.querySelectorAll('.close-button').forEach(button => {
        button.addEventListener('click', (event) => {
            const modalId = event.target.dataset.modalTarget;
            const modalElement = document.getElementById(modalId);
            if (modalElement) {
                hideModal(modalElement);
            }
        });
    });

    window.addEventListener('click', (event) => {
        if (event.target === taskModal) hideModal(taskModal);
        if (event.target === registerModal) hideModal(registerModal);
        if (event.target === categoryModal) hideModal(categoryModal);
    });


    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const taskData = {
            id: taskIdInput.value || undefined,
            title: modalTaskTitle.value.trim(),
            description: modalTaskDescription.value.trim(),
            deadline: modalTaskDeadline.value,
            priority: modalTaskPriority.value,
            status: modalTaskStatus.value,
            category_id: modalTaskCategory.value === '' ? null : parseInt(modalTaskCategory.value, 10)
        };

        if (!taskData.title) {
            showNotification('Task title cannot be empty.', 'error');
            return;
        }

        await saveTask(taskData);
    });

    addCategoryBtn.addEventListener('click', () => showCategoryModal());
    categoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const categoryData = {
            id: categoryIdInput.value || undefined,
            name: categoryNameInput.value.trim()
        };
        if (!categoryData.name) {
            showNotification('Category name cannot be empty.', 'error');
            return;
        }
        await saveCategory(categoryData);
    });
    categoryDeleteBtn.addEventListener('click', async () => {
        const categoryIdToDelete = categoryIdInput.value;
        if (categoryIdToDelete) {
            await deleteCategory(categoryIdToDelete);
        }
    });

    categoryList.addEventListener('click', (e) => {
        const targetButton = e.target.closest('.category-item');
        if (targetButton && !e.target.closest('.category-edit-icon')) {
            const categoryId = targetButton.dataset.categoryId;
            if (categoryId) {
                selectCategory(categoryId);
            }
        }
    });

    filterStatusSelect.addEventListener('change', () => renderTasks(allTasks));
    sortBySelect.addEventListener('change', () => renderTasks(allTasks));

    document.querySelectorAll('.input-group.floating-label input, .input-group.floating-label textarea').forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });
        input.addEventListener('blur', () => {
            if (input.value === '') {
                input.parentElement.classList.remove('focused');
            }
        });
        if (input.value !== '') {
            input.parentElement.classList.add('focused');
        }
    });

    changeAvatarBtn.addEventListener('click', () => {
        avatarUploadInput.click();
    });

    avatarUploadInput.addEventListener('change', () => {
        const file = avatarUploadInput.files[0];
        if (file) {
            uploadAvatar(file);
        }
    });

    currentWeekStart.setHours(0, 0, 0, 0);
    currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());

    const storedToken = localStorage.getItem('accessToken');
    const storedUsername = localStorage.getItem('username');

    if (storedToken && storedUsername) {
        toggleView(false, storedUsername);
    } else {
        toggleView(true);
    }
});