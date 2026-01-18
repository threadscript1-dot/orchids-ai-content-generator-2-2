import { ImageGenerationPage } from '@/components/image-generation-page';

interface PageProps {
    params: Promise<{ modelId: string }>;
}

export default async function CreateImageModelPage({ params }: PageProps) {
    const { modelId } = await params;
    return <ImageGenerationPage initialModelId={modelId} />;
}
