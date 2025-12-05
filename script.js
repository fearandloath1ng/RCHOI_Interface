document.addEventListener('DOMContentLoaded', function () {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const forms = document.querySelectorAll('.form');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const globalMessage = document.getElementById('globalMessage');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            forms.forEach(form => form.classList.remove('active'));
            document.getElementById(`${tab}Form`).classList.add('active');
            clearMessages();
        });
    });

    const regUsername = document.getElementById('regUsername');
    const regPassword = document.getElementById('regPassword');
    const regConfirm = document.getElementById('regConfirmPassword');

    regUsername.addEventListener('input', () => validateField(regUsername, 'username'));
    regPassword.addEventListener('input', () => validateField(regPassword, 'password'));
    regConfirm.addEventListener('input', () => validateField(regConfirm, 'confirm'));

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        clearMessages();

        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value.trim();
        let isValid = true;

        if (!username) {
            showError('loginUsernameError', 'Введите имя пользователя');
            isValid = false;
        }
        if (!password) {
            showError('loginPasswordError', 'Введите пароль');
            isValid = false;
        }

        if (!isValid) return;

        const submitBtn = document.getElementById('loginSubmit');
        setLoading(submitBtn, true);

        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 400) {
                    showError('loginUsernameError', data.error); 
                } else {
                    showGlobalMessage(data.error, 'error'); 
                }
            } else {
                showGlobalMessage(data.message, 'success');
            }
        } catch (err) {
            showGlobalMessage('Не удалось подключиться к серверу.', 'error');
        } finally {
            setLoading(submitBtn, false);
        }
    });

    registerForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        clearMessages();

        const username = regUsername.value.trim();
        const password = regPassword.value.trim();
        const confirmPassword = regConfirm.value.trim();
        let isValid = true;

        if (!validateField(regUsername, 'username')) isValid = false;
        if (!validateField(regPassword, 'password')) isValid = false;
        if (!validateField(regConfirm, 'confirm')) isValid = false;

        if (!isValid) return;

        const submitBtn = document.getElementById('registerSubmit');
        setLoading(submitBtn, true);

        try {
            const response = await fetch('http://localhost:3000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, confirmPassword })
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 400) {
                    if (data.error.includes('Имя пользователя уже занято') || data.error.includes('латинские')) {
                        showError('regUsernameError', data.error);
                    } else if (data.error.includes('Пароль')) {
                        showError('regPasswordError', data.error);
                    } else if (data.error.includes('пароли')) {
                        showError('regConfirmPasswordError', data.error);
                    } else {
                        showError('regUsernameError', data.error);
                    }
                } else {
                    showGlobalMessage(data.error, 'error');
                }
            } else {
                showGlobalMessage(data.message, 'success');
                registerForm.reset();
                document.querySelector('[data-tab="login"]').click();
            }
        } catch (err) {
            showGlobalMessage('Ошибка сети. Проверьте подключение.', 'error');
        } finally {
            setLoading(submitBtn, false);
        }
    });

    function validateField(inputElement, type) {
        const value = inputElement.value.trim();
        const errorId = inputElement.id + 'Error';
        let isValid = true;
        let message = '';

        inputElement.classList.remove('error', 'success');

        if (!value) {
            message = 'Это поле обязательно для заполнения';
            isValid = false;
        } else {
            switch (type) {
                case 'username':
                    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
                        message = 'Только латинские буквы, цифры и _';
                        isValid = false;
                    } else {
                        inputElement.classList.add('success');
                    }
                    break;
                case 'password':
                    if (value.length < 6) {
                        message = 'Минимум 6 символов';
                        isValid = false;
                    } else {
                        inputElement.classList.add('success');
                    }
                    break;
                case 'confirm':
                    const password = regPassword.value.trim();
                    if (value !== password) {
                        message = 'Пароли не совпадают';
                        isValid = false;
                    } else {
                        inputElement.classList.add('success');
                    }
                    break;
            }
        }

        if (!isValid) {
            showError(errorId, message);
            inputElement.classList.add('error');
        } else {
            clearError(errorId);
        }

        return isValid;
    }

    function showError(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
        }
    }

    function clearError(elementId) {
        showError(elementId, '');
    }

    function showGlobalMessage(text, type) {
        globalMessage.textContent = text;
        globalMessage.className = `global-message ${type}`;
        globalMessage.classList.remove('hidden');
        if (type === 'success') {
            setTimeout(() => globalMessage.classList.add('hidden'), 5000);
        }
    }

    function clearMessages() {
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
        document.querySelectorAll('input').forEach(el => el.classList.remove('error', 'success'));
        globalMessage.classList.add('hidden');
    }

    function setLoading(buttonElement, isLoading) {
        const btnText = buttonElement.querySelector('.btn-text');
        const loader = buttonElement.querySelector('.loader');
        if (isLoading) {
            buttonElement.disabled = true;
            btnText.classList.add('hidden');
            loader.classList.remove('hidden');
        } else {
            buttonElement.disabled = false;
            btnText.classList.remove('hidden');
            loader.classList.add('hidden');
        }
    }
});
