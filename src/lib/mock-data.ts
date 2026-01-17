export interface Generation {
  id: string;
  type: "image" | "video" | "audio";
  prompt: string;
  url: string;
  thumbnail?: string;
  model: string;
  credits: number;
  createdAt: Date;
  liked: boolean;
  aspectRatio?: string;
  quality?: string;
  duration?: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  credits: number;
  maxCredits: number;
  plan: "free" | "starter" | "pro" | "enterprise";
  referralCode: string;
}

export const mockUser: UserProfile = {
  id: "1",
  name: "Пользователь",
  email: "user@example.com",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
  credits: 750,
  maxCredits: 1000,
  plan: "starter",
  referralCode: "SDEL-ABC123",
};

export const mockGenerations: Generation[] = [
  {
    id: "1",
    type: "image",
    prompt: "Космический корабль в туманности, киберпанк стиль",
    url: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800",
    model: "FLUX Pro",
    credits: 10,
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
    liked: true,
    aspectRatio: "16:9",
    quality: "HD",
  },
  {
    id: "2",
    type: "image",
    prompt: "Японский сад весной, цветущая сакура",
    url: "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800",
    model: "Midjourney v6",
    credits: 10,
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    liked: false,
    aspectRatio: "1:1",
    quality: "HD",
  },
  {
    id: "3",
    type: "video",
    prompt: "Закат над океаном, волны разбиваются о скалы",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
    thumbnail: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400",
    model: "Runway Gen-3",
    credits: 10,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    liked: true,
    duration: 5,
  },
  {
    id: "4",
    type: "audio",
    prompt: "Электронная музыка, энергичный бит",
    url: "/mock-audio.mp3",
    model: "Suno v4",
    credits: 10,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
    liked: false,
    duration: 180,
  },
  {
    id: "5",
    type: "image",
    prompt: "Портрет кота в стиле Ренессанс",
    url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800",
    model: "DALL-E 3",
    credits: 10,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    liked: true,
    aspectRatio: "1:1",
    quality: "4K",
  },
  {
    id: "6",
    type: "image",
    prompt: "Футуристический город ночью",
    url: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800",
    model: "Stable Diffusion XL",
    credits: 10,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    liked: false,
    aspectRatio: "16:9",
    quality: "HD",
  },
];

export const imageModels = [
  { id: "flux-pro", name: "FLUX Pro", description: "Высокое качество, детализация", credits: 10 },
  { id: "midjourney-v6", name: "Midjourney v6", description: "Художественный стиль", credits: 15 },
  { id: "dall-e-3", name: "DALL-E 3", description: "Универсальная модель", credits: 8 },
  { id: "stable-diffusion-xl", name: "Stable Diffusion XL", description: "Быстрая генерация", credits: 5 },
];

export const videoModels = [
  { id: "runway-gen3", name: "Runway Gen-3", description: "Премиум качество", credits: 25 },
  { id: "pika-labs", name: "Pika Labs", description: "Стилизованное видео", credits: 20 },
  { id: "kling", name: "Kling AI", description: "Реалистичное движение", credits: 30 },
];

export const audioModels = [
  { id: "suno-v4", name: "Suno v4", description: "Вокал + инструменты", credits: 10 },
  { id: "suno-v3", name: "Suno v3.5", description: "Стабильное качество", credits: 8 },
  { id: "udio", name: "Udio", description: "Экспериментальные жанры", credits: 12 },
];

export const audioStyles = [
  "synthwave", "vaporwave", "chillwave", "darkwave", "shoegaze", "post-punk",
  "trip-hop", "downtempo", "nu-disco", "witch house", "dream pop", "krautrock",
  "math rock", "noise rock", "sludge metal", "drone", "glitch", "breakcore",
  "jungle", "footwork", "grime", "uk garage", "happy hardcore", "gabber",
  "psytrance", "goa trance", "acid house", "deep house", "dub techno", "minimal",
  "idm", "braindance", "wonky", "future garage", "post-dubstep", "bass music"
];

export const aspectRatios = [
  { id: "1:1", name: "1:1", description: "Квадрат" },
  { id: "16:9", name: "16:9", description: "Широкий" },
  { id: "9:16", name: "9:16", description: "Вертикальный" },
  { id: "4:3", name: "4:3", description: "Стандартный" },
  { id: "3:2", name: "3:2", description: "Фото" },
];

export const qualityOptions = [
  { id: "sd", name: "SD", description: "512px" },
  { id: "hd", name: "HD", description: "1024px" },
  { id: "4k", name: "4K", description: "2048px" },
];

export const plans = [
  {
    id: "free",
    name: "Бесплатный",
    nameEn: "Free",
    price: 0,
    credits: 50,
    features: ["50 кредитов в месяц", "Базовые модели", "SD качество"],
    featuresEn: ["50 credits/month", "Basic models", "SD quality"],
  },
  {
    id: "starter",
    name: "Стартер",
    nameEn: "Starter",
    price: 990,
    credits: 500,
    features: ["500 кредитов в месяц", "Все модели", "HD качество", "Приоритетная очередь"],
    featuresEn: ["500 credits/month", "All models", "HD quality", "Priority queue"],
  },
  {
    id: "pro",
    name: "Профессионал",
    nameEn: "Professional",
    price: 2490,
    credits: 2000,
    features: ["2000 кредитов в месяц", "Все модели", "4K качество", "API доступ", "Приоритетная поддержка"],
    featuresEn: ["2000 credits/month", "All models", "4K quality", "API access", "Priority support"],
  },
  {
    id: "enterprise",
    name: "Бизнес",
    nameEn: "Enterprise",
    price: 9990,
    credits: 10000,
    features: ["10000 кредитов в месяц", "Все модели", "4K+ качество", "Выделенный сервер", "Персональный менеджер"],
    featuresEn: ["10000 credits/month", "All models", "4K+ quality", "Dedicated server", "Account manager"],
  },
];

export const creditPackages = [
  { id: "100", credits: 100, price: 199 },
  { id: "500", credits: 500, price: 799 },
  { id: "1000", credits: 1000, price: 1499 },
  { id: "5000", credits: 5000, price: 5999 },
];
