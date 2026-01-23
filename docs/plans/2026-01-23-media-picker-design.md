# Media Picker: Выбор attachments из библиотеки

## Обзор

Расширение attachment функционала для выбора файлов не только с устройства, но и из библиотеки пользователя (uploads, generations, favorites).

## Изменения

### 1. Attachment Dropdown
Кнопка "+" открывает dropdown меню:
- "С устройства" → file picker
- "Из библиотеки" → MediaPickerModal

### 2. MediaPickerModal
Модалка/bottom sheet для выбора из библиотеки:
- Desktop: Dialog 600px
- Mobile: Drawer (bottom sheet)
- Табы: Uploads | Generations | Favorites
- Multi-select с чекбоксами
- ActionBar: "Выбрать" + "Удалить"
- Infinite scroll пагинация

### 3. Uploads в Library
Новый таб "Uploads" в основной библиотеке.

---

## Компоненты

```
src/components/
├── generation/
│   ├── AttachmentDropdown.tsx
│   └── MediaPickerModal/
│       ├── index.tsx
│       ├── MediaPickerTabs.tsx
│       ├── MediaPickerGrid.tsx
│       ├── MediaPickerItem.tsx
│       └── MediaPickerActionBar.tsx
├── library/
│   └── UploadsTab.tsx
```

---

## Детали реализации

### AttachmentDropdown

```tsx
interface AttachmentDropdownProps {
  onUploadFromDevice: () => void;
  onSelectFromLibrary: () => void;
  acceptedTypes?: 'image' | 'video' | 'all';
}
```

Использует `DropdownMenu` из UI. Две опции с иконками:
- Upload icon + "С устройства"
- Image icon + "Из библиотеки"

Drag & drop остаётся на уровне `ImageGenerationBar`.

---

### MediaPickerModal

```tsx
interface MediaPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  acceptedTypes: 'image' | 'video' | 'all';
  onSelect: (items: MediaItem[]) => void;
  maxSelection?: number;
}

interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  source: 'upload' | 'generation' | 'favorite';
  name?: string;
}
```

Адаптивность через `useMediaQuery`:
- Desktop (≥768px): `Dialog`
- Mobile (<768px): `Drawer`

---

### MediaPickerTabs

Три таба:
- **Uploads:** `GET /uploads?type={acceptedTypes}` с cursor пагинацией
- **Generations:** существующий API, фильтр по типу
- **Favorites:** существующий API favorites, фильтр по типу

Empty states для каждого таба.

---

### MediaPickerGrid

- CSS Grid: 3 колонки desktop, 2 mobile
- Aspect ratio 1:1
- Infinite scroll через `IntersectionObserver`
- Skeleton loading

---

### MediaPickerItem

```tsx
interface MediaPickerItemProps {
  item: MediaItem;
  isSelected: boolean;
  onToggle: (item: MediaItem) => void;
}
```

- Thumbnail с `object-cover`
- Checkbox top-right (всегда видим)
- При selected: `ring-2 ring-primary`
- Для видео: play icon + duration badge

Selection state хранится в `Map<string, MediaItem>` для O(1) операций.

---

### MediaPickerActionBar

Появляется при `selectedItems.size > 0`. Анимация slide-up.

Кнопки:
- "Удалить" (outline) → открывает confirmation dialog
- "Выбрать" (primary) → вызывает `onSelect` и закрывает модалку

**Delete Confirmation:**
- `AlertDialog` с заголовком и описанием
- Кнопки: Cancel / Delete (destructive)
- API: `DELETE /uploads` с массивом ID

---

### UploadsTab (Library)

Новый таб в `LibraryPage`:
```tsx
{ id: 'uploads', label: t('uploads'), icon: Upload }
```

Переиспользует:
- `MediaCard` для элементов
- `SelectionActionBar` для действий
- Infinite scroll логика

Действия: Download, Delete (batch с confirmation).

---

## API

### Существующие эндпоинты
- `GET /uploads?type=image|video&cursor=&limit=` — список uploads
- `DELETE /uploads` — batch delete (body: `{ ids: string[] }`)
- `GET /uploads/:id` — один upload

### Интеграция
- Generations: существующий API
- Favorites: существующий API

---

## UI/UX

### Naming (i18n)
- "С устройства" / "From device"
- "Из библиотеки" / "From library"
- "Загрузки" / "Uploads"
- "Генерации" / "Generations"
- "Избранное" / "Favorites"

### Mobile
- Bottom sheet вместо модалки
- 2 колонки в grid
- Touch-friendly размеры (min 44px tap targets)
- Drag handle сверху sheet

### Animations
- ActionBar: slide-up/down (framer-motion)
- Tabs: fade transition
- Items: subtle scale on select
