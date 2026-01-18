# Model-Driven Generation Architecture

## Overview

This document describes the unified model-driven architecture for image, video, and audio generation in the frontend. The key principle is that **the `/models` API is the single source of truth** for all generation capabilities, constraints, and pricing.

## Core Components

### 1. Models Store (`src/stores/models-store.ts`)

The central store that manages model data. Provides:

- **Types**: `Model`, `AttachmentConfig`, `ModelConstraints`, `ModelPricing`
- **State**: `models`, `imageModels`, `videoModels`, `audioModels`
- **Actions**: `fetchModels()`, `getModelById()`, `getModelsByType()`, `getModelsByCapability()`

### 2. Helper Functions

All helper functions are exported from `models-store.ts` and re-exported from `use-models.ts`:

```typescript
// Check if a model has a specific capability
hasCapability(model, 'text-to-image') // returns boolean

// Get attachment configuration
getAttachmentConfig(model, 'image') // returns AttachmentConfig | undefined

// Check attachment requirements
requiresAttachment(model, 'image') // returns true if mode === 'required'
supportsAttachment(model, 'image') // returns true if 'optional' or 'required'

// Get the field name for attachments in API request
getAttachmentFieldName(model, 'image') // returns 'input_urls' | 'image_urls' etc.

// Validate files against attachment config
validateAttachment(config, files) // returns { valid: boolean, error?: string }

// Calculate price based on selected dimensions
calculatePrice(model, { aspect_ratio: '16:9', duration: '10' }) // returns number
```

### 3. Unified Generation Hook (`src/hooks/useUnifiedGeneration.ts`)

A powerful hook that combines all generation logic:

```typescript
const generation = useUnifiedGeneration({
    type: 'image' | 'video' | 'audio',
    maxFiles: 4,
    language: 'ru' | 'en',
});

// Model selection
generation.models              // Available models for the type
generation.selectedModel       // Currently selected model
generation.selectedModelId     // Model ID
generation.setSelectedModelId  // Setter

// Form state
generation.formState           // { prompt, aspectRatio, resolution, duration, quality, sound }
generation.setPrompt(text)
generation.setAspectRatio(ratio)
// ... other setters

// Constraints from model
generation.availableAspectRatios  // ['1:1', '16:9', ...]
generation.availableResolutions   // ['1K', '2K', ...]
generation.availableDurations     // ['5', '10', ...]

// Attachments
generation.uploadedFiles          // Files ready for upload
generation.attachmentConfig       // Current model's attachment config
generation.requiresUpload         // true if upload is mandatory
generation.supportsUpload         // true if model accepts uploads
generation.maxFiles               // Max files from config

// File operations
generation.openFilePicker()
generation.handleDrop(event)
generation.removeFile(id)
generation.clearFiles()

// Pricing
generation.creditsCost            // Base credits cost
generation.estimatedPrice         // Calculated with dimensions

// Generation
generation.isGenerating           // Loading state
generation.canGenerate            // Validation passed
generation.validationError        // Error message or null
generation.generate()             // Call API and return generation ID
```

### 4. Model Selector Component (`src/components/generation/ModelSelector.tsx`)

Enhanced dropdown showing:
- Model icon (Image/Video/Audio)
- Model name
- Credits cost
- Capability badges (T2I, I2I, T2V, I2V, V2V, etc.)
- Attachment indicator (+IMG)

## API Response Shape

```typescript
// GET /models
{
    models: FrontendModelDTO[],
    image_models: FrontendModelDTO[],
    video_models: FrontendModelDTO[],
    audio_models: FrontendModelDTO[]
}

// FrontendModelDTO
{
    id: string,
    name: string,
    description: string,
    type: 'image' | 'video' | 'audio',
    vendor: string,
    endpoint: string,           // API endpoint to call
    capabilities: string[],     // ['text-to-image', 'image-to-image']
    attachments: AttachmentConfig[],
    pricing: ModelPricing,
    constraints?: ModelConstraints,
    credits_cost: number
}

// AttachmentConfig
{
    type: 'image' | 'video' | 'audio',
    mode: 'none' | 'optional' | 'required',
    fieldName: string,          // Key in request body
    maxCount: number,
    maxSizeBytes?: number,
    acceptedMimeTypes?: string[]
}
```

## Generation Flow

1. **Load models** on app start via `/models` API
2. **User selects model** → constraints update form options
3. **User fills form** → validation checks attachments & constraints
4. **User clicks Generate**:
   - Upload files if present
   - Build params from form + uploaded URLs
   - POST to `model.endpoint` with JSON body
   - Poll for completion
5. **Display result** when status === 'success'

## Migration Guide

### Before (legacy)
```typescript
const { generateImageFlux2, generateVideoKling } = useGenerationStore();
await generateImageFlux2({ prompt, aspect_ratio, resolution });
```

### After (unified)
```typescript
const generation = useUnifiedGeneration({ type: 'image' });
generation.setPrompt(prompt);
await generation.generate();
// Or use store directly:
await generateUnified(modelId, params);
```

## File Structure

```
src/
├── stores/
│   ├── models-store.ts      # Models state + helpers
│   └── generation-store.ts  # Generation actions + polling
├── hooks/
│   ├── use-models.ts        # Models hooks + re-exports
│   └── useUnifiedGeneration.ts  # Unified generation hook
└── components/
    └── generation/
        └── ModelSelector.tsx # Enhanced model dropdown
```
