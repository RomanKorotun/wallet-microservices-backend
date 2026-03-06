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
docker compose -f docker-compose.infra-core.yml -f services/auth-service/docker-compose.dev.yml up --build -d

### 3. Тестовий режим

Для запуску тестового середовища та прогону тестів використовуйте:

unit-test:
bash
docker build --target unit -t auth-service:unit .
docker run --name auth-service-unit auth-service:unit

e2e:
bash
docker compose -f docker-compose.e2e.yml -p auth-service-test up --build -d

e2e: видаляє e2e контейнери та volumes
bash
docker compose -f docker-compose.e2e.yml -p auth-service-test down -v

## Примітки

Використання Dev Containers у VS Code дозволяє працювати з повним функціоналом редактора прямо в контейнері.
Усі npm‑пакети встановлюються лише в контейнері, локально папка node_modules відсутня.
