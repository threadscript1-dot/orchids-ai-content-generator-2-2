# Frontend Integration Guide

Полное руководство по интеграции фронтенда с AI Content Generation Backend API.

## Содержание

1. [Базовая настройка](#базовая-настройка)
2. [Авторизация](#авторизация)
3. [JWT токены](#jwt-токены)
4. [Получение моделей](#получение-моделей)
5. [Генерация контента](#генерация-контента)
6. [Demo режим (обход авторизации)](#demo-режим-обход-авторизации)
7. [Работа с OpenAPI типами](#работа-с-openapi-типами)

---

## Базовая настройка

### Установка клиента

```bash
npm install openapi-fetch
# или
bun add openapi-fetch
```

### Создание API клиента

```typescript
// src/api/client.ts
import createClient from 'openapi-fetch';
import type { paths } from './types/api'; // Сгенерированные типы из backend/dist/types/api.d.ts

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = createClient<paths>({
    baseUrl: API_BASE_URL,
});

// Добавление Bearer токена ко всем запросам
export function setAuthToken(token: string | null) {
    if (token) {
        api.use({
            onRequest({ request }) {
                request.headers.set('Authorization', `Bearer ${token}`);
                return request;
            },
        });
    }
}
```

---

## Авторизация

Backend поддерживает 5 провайдеров аутентификации:

### 1. Telegram Mini App

**Когда использовать:** Приложение запущено внутри Telegram как Web App

```typescript
// В Telegram Mini App окружении
const initData = window.Telegram.WebApp.initData;

const { data, error } = await api.POST('/auth/telegram/miniapp', {
    body: {
        init_data: initData,
    },
});

if (data) {
    const { token, user } = data;
    // Сохранить токен
    localStorage.setItem('auth_token', token);
    setAuthToken(token);
}
```

### 2. Telegram OAuth (Login Widget)

**Когда использовать:** Обычный веб-сайт с Telegram Login кнопкой

**Вариант A: Callback метод**

```html
<script
    async
    src="https://telegram.org/js/telegram-widget.js?22"
    data-telegram-login="YOUR_BOT_USERNAME"
    data-size="large"
    data-onauth="onTelegramAuth(user)"
    data-request-access="write"
></script>
```

```typescript
function onTelegramAuth(user) {
    const { data } = await api.POST('/auth/telegram/oauth', {
        body: {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            photo_url: user.photo_url,
            auth_date: user.auth_date,
            hash: user.hash,
        },
    });

    if (data) {
        localStorage.setItem('auth_token', data.token);
        setAuthToken(data.token);
    }
}
```

**Вариант B: Redirect метод**

```html
<script
    async
    src="https://telegram.org/js/telegram-widget.js?22"
    data-telegram-login="YOUR_BOT_USERNAME"
    data-size="large"
    data-auth-url="https://your-backend.com/auth/telegram/callback"
    data-request-access="write"
></script>
```

Backend автоматически редиректит на `{FRONTEND_URL}/auth/success?token=...`

### 3. Google OAuth

**Шаг 1:** Получить URL авторизации

```typescript
const { data } = await api.GET('/auth/google/url', {
    params: {
        query: {
            redirect_uri: `${window.location.origin}/auth/google/callback`,
            state: 'optional-state-string',
        },
    },
});

if (data) {
    // Редирект на Google
    window.location.href = data.url;
}
```

**Шаг 2:** Обработать callback

```typescript
// В /auth/google/callback роуте
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');

const { data } = await api.POST('/auth/google/callback', {
    body: {
        code: code!,
        redirect_uri: `${window.location.origin}/auth/google/callback`,
    },
});

if (data) {
    localStorage.setItem('auth_token', data.token);
    setAuthToken(data.token);
    // Redirect на главную
}
```

**Альтернатива: Google Sign-In Button (ID Token)**

```typescript
// После получения credential от Google Sign-In
const { data } = await api.POST('/auth/google/token', {
    body: {
        token: credential, // ID Token от Google
    },
});
```

### 4. Yandex OAuth

Аналогично Google OAuth:

```typescript
// 1. Получить URL
const { data } = await api.GET('/auth/yandex/url', {
    params: {
        query: {
            redirect_uri: `${window.location.origin}/auth/yandex/callback`,
        },
    },
});

// 2. Обменять code на token
const { data } = await api.POST('/auth/yandex/callback', {
    body: {
        code: code!,
        redirect_uri: `${window.location.origin}/auth/yandex/callback`,
    },
});
```

**Альтернатива: Yandex Access Token**

```typescript
const { data } = await api.POST('/auth/yandex/token', {
    body: {
        token: yandexAccessToken,
    },
});
```

### 5. VK ID OAuth

VK использует OAuth 2.1 с PKCE (более безопасный):

```typescript
// 1. Генерация PKCE параметров
function generateCodeVerifier() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

async function generateCodeChallenge(verifier: string) {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(hash)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

// 2. Сохранить code_verifier
const codeVerifier = generateCodeVerifier();
const codeChallenge = await generateCodeChallenge(codeVerifier);
sessionStorage.setItem('vk_code_verifier', codeVerifier);

// 3. Получить URL
const { data } = await api.GET('/auth/vk/url', {
    params: {
        query: {
            redirect_uri: `${window.location.origin}/auth/vk/callback`,
            code_challenge: codeChallenge,
            code_challenge_method: 's256',
        },
    },
});

// 4. В callback обменять code
const codeVerifier = sessionStorage.getItem('vk_code_verifier');
const deviceId = urlParams.get('device_id'); // VK возвращает device_id

const { data } = await api.POST('/auth/vk/callback', {
    body: {
        code: code!,
        code_verifier: codeVerifier!,
        device_id: deviceId!,
        redirect_uri: `${window.location.origin}/auth/vk/callback`,
    },
});
```

### Проверка доступных провайдеров

```typescript
const { data } = await api.GET('/auth/providers');

// Пример ответа:
// {
//   providers: [
//     { id: 'telegram_miniapp', name: 'Telegram Mini App', enabled: true },
//     { id: 'telegram', name: 'Telegram', enabled: true },
//     { id: 'google', name: 'Google', enabled: true },
//     { id: 'yandex', name: 'Yandex', enabled: false },
//     { id: 'vk', name: 'VK ID', enabled: false }
//   ]
// }
```

---

## JWT токены

### Структура токена

-   **Алгоритм:** HS256
-   **Lifetime:** 7 дней
-   **Payload:** `{ sub: userId, iat: timestamp, exp: timestamp }`

### Использование токена

```typescript
// Все защищенные эндпоинты требуют Bearer токен
const { data } = await api.GET('/user/me', {
    headers: {
        Authorization: `Bearer ${token}`,
    },
});
```

При использовании middleware (см. выше), токен добавляется автоматически.

### Проверка токена

```typescript
const { data, error } = await api.GET('/auth/me', {
    headers: {
        Authorization: `Bearer ${token}`,
    },
});

if (error?.status === 401) {
    // Токен невалиден или истек
    // Удалить и редиректнуть на логин
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
}
```

### Refresh токена

```typescript
const { data } = await api.POST('/auth/refresh', {
    headers: {
        Authorization: `Bearer ${oldToken}`,
    },
});

if (data) {
    localStorage.setItem('auth_token', data.token);
    setAuthToken(data.token);
}
```

---

## Получение моделей

### Список всех доступных моделей

```typescript
// Публичный endpoint, не требует авторизации
const { data } = await api.GET('/models');

if (data) {
    const { models, image_models, video_models, audio_models } = data;

    // Каждая модель содержит:
    // - id: string (например, 'flux2-pro-t2i')
    // - name: string (например, 'Flux-2 Pro Text-to-Image')
    // - type: 'image' | 'video' | 'audio'
    // - vendor: string (например, 'Flux')
    // - capability: string (например, 'text-to-image')
    // - capabilities: string[] (например, ['text-to-image', 'image-editing'])
    // - credits_cost: number (базовая стоимость)
    // - pricing: { base: number, dimensions?: [...], currency: 'credits' }
    // - constraints?: { aspectRatios, durations, resolutions, ... }
}
```

### Пример использования constraints

```typescript
const flux2Model = image_models.find((m) => m.id === 'flux2-pro-t2i');

if (flux2Model?.constraints) {
    const { aspectRatios, resolutions } = flux2Model.constraints;

    // UI для выбора aspect ratio
    // ['1:1', '4:3', '3:4', '16:9', '9:16', '3:2', '2:3', 'auto']

    // UI для выбора resolution
    // ['1K', '2K']
}
```

---

## Генерация контента

### Общий флоу

1. **Отправить запрос на генерацию** → получить `generation_id`
2. **Периодически проверять статус** через `/v2/generations/:id`
3. **Когда status = 'success'** → получить `result_assets` с URL'ами

### Примеры генерации

#### Image: Flux-2 Pro Text-to-Image

```typescript
const { data } = await api.POST('/v2/image/flux-2/text-to-image', {
    body: {
        prompt: 'A futuristic cityscape at sunset',
        aspect_ratio: '16:9',
        resolution: '2K',
    },
    headers: {
        Authorization: `Bearer ${token}`,
    },
});

if (data) {
    const { id, status, cost_credits } = data;
    // status = 'processing'
    // cost_credits = 8 (списано сразу)

    // Начать polling статуса
    pollGenerationStatus(id);
}
```

#### Image: Flux-2 Pro Image-to-Image

```typescript
// 1. Загрузить изображение (получить URL)
const formData = new FormData();
formData.append('file', imageFile);

const uploadResponse = await fetch(`${API_BASE_URL}/upload/image`, {
    method: 'POST',
    headers: {
        Authorization: `Bearer ${token}`,
    },
    body: formData,
});
const { url: imageUrl } = await uploadResponse.json();

// 2. Генерация
const { data } = await api.POST('/v2/image/flux-2/image-to-image', {
    body: {
        prompt: 'Transform into cyberpunk style',
        input_urls: [imageUrl],
        aspect_ratio: '16:9',
        resolution: '2K',
    },
});
```

#### Video: Kling 2.6 Text-to-Video

```typescript
const { data } = await api.POST('/v2/video/kling/text-to-video', {
    body: {
        prompt: 'A cat jumping in slow motion',
        aspect_ratio: '16:9',
        duration: '10', // '5' или '10' секунд
        sound: true,
    },
});
```

#### Video: Kling 2.6 Image-to-Video

```typescript
const { data } = await api.POST('/v2/video/kling/image-to-video', {
    body: {
        prompt: 'Make the scene come alive',
        image_urls: [imageUrl],
        duration: '5',
        sound: false,
    },
});
```

#### Audio: Suno Music Generation

```typescript
const { data } = await api.POST('/v2/audio/suno/generate-music', {
    body: {
        prompt: 'Epic orchestral soundtrack',
        model: 'V5', // 'V4', 'V4_5', 'V4_5PLUS', 'V4_5ALL', 'V5'
        custom_mode: false,
        instrumental: false,
        // Если custom_mode = true:
        style: 'cinematic orchestral',
        title: 'Epic Journey',
        vocal_gender: 'm',
        style_weight: 0.8,
    },
});
```

### Polling статуса генерации

```typescript
async function pollGenerationStatus(generationId: string) {
    const maxAttempts = 120; // 10 минут (120 * 5 секунд)
    let attempts = 0;

    const poll = async () => {
        const { data } = await api.GET('/v2/generations/{id}', {
            params: {
                path: { id: generationId },
            },
        });

        if (!data) return;

        const { status, result_assets, error } = data;

        if (status === 'success') {
            // Генерация завершена
            console.log('Assets:', result_assets);
            // result_assets = [{ url: 'https://...', mime: 'image/png', size: 12345 }]
            return result_assets;
        }

        if (status === 'failed') {
            // Генерация провалилась (кредиты возвращены автоматически)
            console.error('Generation failed:', error);
            return null;
        }

        // status = 'queued' или 'processing'
        attempts++;
        if (attempts < maxAttempts) {
            setTimeout(poll, 5000); // Проверить снова через 5 секунд
        }
    };

    poll();
}
```

### Lightweight статус (только status поле)

```typescript
// Быстрая проверка только статуса (без полных данных)
const { data } = await api.GET('/v2/generations/{id}/status', {
    params: {
        path: { id: generationId },
    },
});

// Ответ: { id, status: 'queued' | 'processing' | 'success' | 'failed' }
```

---

## Demo режим (обход авторизации)

### Backend настройка

```bash
# .env
DEBUG_AUTH_BYPASS_ENABLED=true
```

**Важно:** Backend должен иметь демо пользователя в БД (см. `scripts/create_dev_user.sql`):

-   User ID: `d0000000-0000-0000-0000-000000000000`
-   Email: `debug_dev_user@example.com`
-   Баланс: 1,000,000 кредитов

### Frontend настройка

```bash
# .env.local
VITE_DEBUG_AUTH_BYPASS=true
```

### Использование в коде

```typescript
// src/store/auth.ts или AuthContext
const isDebugBypass = import.meta.env.VITE_DEBUG_AUTH_BYPASS === 'true';

// При инициализации
const token = localStorage.getItem('auth_token');

if (isDebugBypass && !token) {
    // Использовать фейковый токен (backend игнорирует его проверку)
    const dummyToken = 'debug-bypass-token';
    setAuthToken(dummyToken);

    // Опционально: получить данные демо пользователя
    const { data } = await api.GET('/user/me');
    // data.id = 'd0000000-0000-0000-0000-000000000000'
    // data.credits.balance = 1000000
}
```

### Логика в Auth Context

```typescript
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    useEffect(() => {
        const isDebug = import.meta.env.VITE_DEBUG_AUTH_BYPASS === 'true';
        const savedToken = localStorage.getItem('auth_token');

        if (isDebug && !savedToken) {
            // Демо режим
            const dummyToken = 'debug-bypass-token';
            setToken(dummyToken);
            setAuthToken(dummyToken);

            // Загрузить демо пользователя
            api.GET('/user/me').then(({ data }) => {
                if (data) setUser(data);
            });
        } else if (savedToken) {
            // Обычный режим
            setToken(savedToken);
            setAuthToken(savedToken);

            api.GET('/user/me').then(({ data }) => {
                if (data) {
                    setUser(data);
                } else {
                    // Токен невалиден
                    logout();
                }
            });
        }
    }, []);

    // ...
}
```

---

## Работа с OpenAPI типами

### Генерация типов на backend

```bash
cd backend
bun run generate-types
```

Создает `dist/types/api.d.ts` с полными TypeScript типами.

### Копирование на frontend

```bash
cp backend/dist/types/api.d.ts frontend/src/types/api.d.ts
```

### Полная типизация запросов

```typescript
import type { paths } from './types/api';

// Типы запросов и ответов автоматически выводятся
const { data } = await api.POST('/v2/image/flux-2/text-to-image', {
    body: {
        prompt: 'Test', // string, 1-5000 chars
        aspect_ratio: '16:9', // только разрешенные значения
        resolution: '2K', // только '1K' | '2K'
    },
});

// data имеет тип:
// {
//   id: string;
//   status: 'processing';
//   cost_credits: number;
// }
```

### Типы для UI компонентов

```typescript
import type { components } from './types/api';

type Model = components['schemas']['ModelDTO'];
type Generation = components['schemas']['GenerationResponse'];

interface ModelSelectorProps {
    models: Model[];
    onSelect: (model: Model) => void;
}
```

---

## Дополнительные эндпоинты

### Баланс кредитов

```typescript
const { data } = await api.GET('/credits/balance');
// { balance: 150, updated_at: '2024-01-15T12:00:00Z' }
```

### История генераций

```typescript
const { data } = await api.GET('/user/history', {
    params: {
        query: {
            limit: '20',
            offset: '0',
        },
    },
});

// {
//   data: [
//     {
//       id: '...',
//       type: 'image',
//       model: 'flux2-pro-t2i',
//       status: 'success',
//       prompt: 'A sunset',
//       cost_credits: 8,
//       result_assets: [...],
//       created_at: '...'
//     }
//   ],
//   pagination: {
//     limit: 20,
//     offset: 0,
//     has_more: true
//   }
// }
```

### История транзакций кредитов

```typescript
const { data } = await api.GET('/credits/history', {
    params: {
        query: {
            limit: '50',
            offset: '0',
        },
    },
});

// {
//   data: [
//     {
//       id: '...',
//       delta: -8, // списание
//       reason: 'generation',
//       generation_id: '...',
//       created_at: '...'
//     },
//     {
//       id: '...',
//       delta: 50, // начисление
//       reason: 'welcome_bonus',
//       created_at: '...'
//     }
//   ]
// }
```

### Загрузка файлов

```typescript
// Изображения (max 20MB)
const formData = new FormData();
formData.append('file', imageFile);

const response = await fetch(`${API_BASE_URL}/upload/image`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
});

const { url, storage_path, mime_type, size } = await response.json();

// Видео (max 500MB)
const formData = new FormData();
formData.append('file', videoFile);

const response = await fetch(`${API_BASE_URL}/upload/video`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
});
```

---

## Обработка ошибок

### Стандартный формат ошибок

```typescript
// 401 Unauthorized
{
  error: 'Unauthorized',
  message: 'Invalid or expired token'
}

// 400 Bad Request
{
  error: 'Validation Error',
  message: 'Invalid aspect_ratio'
}

// 500 Internal Server Error
{
  error: 'Internal Server Error',
  message: 'An unexpected error occurred'
}
```

### Обработка в коде

```typescript
const { data, error, response } = await api.POST('/v2/image/flux-2/text-to-image', {
    body: {
        /* ... */
    },
});

if (error) {
    if (response.status === 401) {
        // Редирект на логин
        window.location.href = '/login';
    } else if (response.status === 400) {
        // Показать ошибку валидации
        toast.error(error.message);
    } else {
        // Общая ошибка
        toast.error('Произошла ошибка. Попробуйте позже.');
    }
    return;
}

// Успешный ответ
console.log(data);
```

---

## Best Practices

### 1. Централизованное управление токеном

```typescript
// src/api/auth.ts
export class AuthManager {
    private token: string | null = null;

    init() {
        this.token = localStorage.getItem('auth_token');
        if (this.token) {
            setAuthToken(this.token);
        }
    }

    setToken(token: string) {
        this.token = token;
        localStorage.setItem('auth_token', token);
        setAuthToken(token);
    }

    clearToken() {
        this.token = null;
        localStorage.removeItem('auth_token');
        setAuthToken(null);
    }

    getToken() {
        return this.token;
    }
}

export const authManager = new AuthManager();
```

### 2. Автоматическое обновление токена

```typescript
// Обновлять токен каждые 6 дней (lifetime = 7 дней)
setInterval(async () => {
    const token = authManager.getToken();
    if (token) {
        const { data } = await api.POST('/auth/refresh');
        if (data) {
            authManager.setToken(data.token);
        }
    }
}, 6 * 24 * 60 * 60 * 1000); // 6 дней
```

### 3. Оптимистичный UI

```typescript
// Перед отправкой запроса
const optimisticGeneration = {
    id: 'temp-' + Date.now(),
    status: 'processing',
    prompt: userPrompt,
    created_at: new Date().toISOString(),
};

setGenerations((prev) => [optimisticGeneration, ...prev]);

// Отправить запрос
const { data } = await api.POST('/v2/image/flux-2/text-to-image', { body });

if (data) {
    // Заменить временный на реальный
    setGenerations((prev) => prev.map((g) => (g.id === optimisticGeneration.id ? data : g)));
}
```

### 4. Переиспользуемый polling hook

```typescript
// src/hooks/useGenerationPolling.ts
export function useGenerationPolling(generationId: string) {
    const [generation, setGeneration] = useState(null);
    const [isPolling, setIsPolling] = useState(true);

    useEffect(() => {
        if (!generationId || !isPolling) return;

        const interval = setInterval(async () => {
            const { data } = await api.GET('/v2/generations/{id}', {
                params: { path: { id: generationId } },
            });

            if (data) {
                setGeneration(data);

                if (data.status === 'success' || data.status === 'failed') {
                    setIsPolling(false);
                }
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [generationId, isPolling]);

    return { generation, isPolling };
}

// Использование:
function GenerationCard({ id }) {
    const { generation, isPolling } = useGenerationPolling(id);

    if (isPolling) return <Spinner />;
    if (generation?.status === 'success') return <ResultView assets={generation.result_assets} />;
    return <ErrorView />;
}
```

---

## Заключение

Этот документ покрывает все основные аспекты интеграции с backend API. Для тестирования рекомендуется начать с **Demo режима**, затем постепенно добавлять реальную авторизацию по мере готовности UI.

**Ключевые моменты:**

-   Все типы уже сгенерированы через OpenAPI
-   JWT токены действуют 7 дней
-   Кредиты списываются сразу, возвращаются при ошибке
-   Polling каждые 5 секунд для проверки статуса
-   Demo режим использует фиксированного пользователя с 1M кредитов
