# Auth Service

Сервіс автентифікації користувачів.

## Режими запуску

### 1. Розробка з відкриттям редактора в контейнері
Цей режим дозволяє працювати безпосередньо у Dev Container у Visual Studio Code.  
Редактор відкривається всередині Docker‑контейнера, всі залежності встановлюються лише там.
Кроки:
1. Відкрити папку `auth-service` у VS Code.
2. Виконати команду **CTRL+SHIFT+P** → `Reopen in Container`.

### 2. Запуск в режимі розробки без відкриття редактора
Якщо потрібно просто запустити сервіс у dev‑режимі (без відкриття VS Code у контейнері):
bash
docker compose -f docker-compose.infra-core.yml -f services/auth-service/docker-compose.auth-dev.yml up --build -d

### 3. Тестовий режим
Для запуску тестового середовища та прогону тестів використовуйте:
bash
docker compose -f docker-compose.infra-core.yml -f services/auth-service/docker-compose.auth-test.yml up --build -d


## Примітки
Усі команди docker compose необхідно виконувати з кореня монорепозиторію, щоб правильно підхоплювались шляхи до файлів.
Використання Dev Containers у VS Code дозволяє працювати з повним функціоналом редактора прямо в контейнері.
Усі npm‑пакети встановлюються лише в контейнері, локально папка node_modules відсутня.
