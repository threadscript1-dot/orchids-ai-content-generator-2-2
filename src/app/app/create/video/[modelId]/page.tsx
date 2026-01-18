import { VideoGenerationPage } from '@/components/video-generation-page';

interface PageProps {
    params: Promise<{ modelId: string }>;
}

export default async function CreateVideoModelPage({ params }: PageProps) {
    const { modelId } = await params;
    return <VideoGenerationPage initialModelId={modelId} />;
}
