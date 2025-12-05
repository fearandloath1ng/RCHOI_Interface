const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.')); 

let users = [
    { username: 'admin', password: 'admin123' },
    { username: 'user', password: 'qwerty123' }
];

const simulateDelay = (req, res, next) => {
    setTimeout(next, Math.random() * 500 + 200); 
};

app.post('/api/register', simulateDelay, (req, res) => {
    const { username, password, confirmPassword } = req.body;

    if (!username || !password || !confirmPassword) {
        return res.status(400).json({ error: 'Все поля обязательны для заполнения.' });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Пароли не совпадают.' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'Пароль должен содержать минимум 6 символов.' });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return res.status(400).json({ error: 'Имя пользователя может содержать только латинские буквы, цифры и подчеркивание.' });
    }

    if (users.find(u => u.username === username)) {
        return res.status(400).json({ error: 'Имя пользователя уже занято.' });
    }

    if (Math.random() < 0.1) {
        return res.status(500).json({ error: 'Внутренняя ошибка сервера. Пожалуйста, попробуйте позже.' });
    }

    users.push({ username, password });
    console.log('Зарегистрирован новый пользователь:', username);
    res.status(201).json({ message: `Пользователь ${username} успешно зарегистрирован!` });
});

app.post('/api/login', simulateDelay, (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Все поля обязательны для заполнения.' });
    }

    const user = users.find(u => u.username === username);

    if (!user) {
        return res.status(400).json({ error: 'Пользователь с таким именем не найден.' });
    }

    if (user.password !== password) {
        return res.status(400).json({ error: 'Неверный пароль.' });
    }

    if (Math.random() < 0.1) {
        return res.status(500).json({ error: 'Ошибка аутентификации. Попробуйте снова.' });
    }

    res.status(200).json({ message: `Добро пожаловать, ${username}!` });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
