"use client";

import { useState, useRef, useCallback, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Plus, 
  X, 
  Wand2, 
  Loader2, 
  Download, 
  Zap,
  Maximize,
  Layout,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { toast } from "sonner";

function ExpandToolContent() {
  const { language } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const EXAMPLE_IMAGE = "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/010102a2-9a78-497c-a40c-16883620b037/expand-1768346852352.png?width=8000&height=8000&resize=contain";
  
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const imageUrl = searchParams.get("image");
    if (imageUrl) {
      setUploadedImage(decodeURIComponent(imageUrl));
    }
  }, [searchParams]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files[0]?.type.startsWith("image/")) {
      const url = URL.createObjectURL(files[0]);
      setUploadedImage(url);
      setResult(null);
    }
  }, []);

  const handleFiles = (files: FileList | null) => {
    if (files?.[0]?.type.startsWith("image/")) {
      const url = URL.createObjectURL(files[0]);
      setUploadedImage(url);
      setResult(null);
    }
  };

  const handleProcess = async () => {
    if (!uploadedImage) return;
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 3000));
    setResult(uploadedImage); 
    setIsProcessing(false);
    toast.success(language === "ru" ? "Изображение успешно расширено!" : "Image successfully expanded!");
  };

  if (!uploadedImage) {
      return (
        <div className="max-w-2xl mx-auto px-4 pt-12">
          <div className="flex items-center gap-4 mb-12">
<Link href="/app" className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
                <div>
                  <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
                  {language === "ru" ? "Дорисовать" : "Expand"}
                </h1>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40">
                  {language === "ru" ? "Расширение границ изображения с помощью ИИ" : "Expand image boundaries with AI"}
                </p>
              </div>
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`aspect-square md:aspect-[4/3] rounded-[40px] border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer group relative overflow-hidden ${
              isDragging 
                ? "border-amber-500 bg-amber-500/5 shadow-[0_0_50px_rgba(245,158,11,0.1)]" 
                : "border-white/10 hover:border-white/20 bg-white/5"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
              <div className="relative z-10 flex flex-col items-center text-center px-6">
                <div className="w-64 h-64 rounded-3xl overflow-hidden mb-8 group-hover:scale-105 transition-transform duration-500 border border-white/10 shadow-2xl relative">
                  <img src={EXAMPLE_IMAGE} alt="Example" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-2">
                {language === "ru" ? "Выберите изображение" : "Select an image"}
              </h3>
              <p className="text-sm text-white/40 font-medium">
                {language === "ru" ? "Перетащите файл сюда или нажмите для загрузки" : "Drag and drop your file here or click to upload"}
              </p>
              <div className="mt-8 flex items-center gap-4 text-[10px] font-black uppercase tracking-widest opacity-30">
              <span>JPG</span>
              <span className="w-1 h-1 rounded-full bg-white" />
              <span>PNG</span>
              <span className="w-1 h-1 rounded-full bg-white" />
              <span>WEBP</span>
              <span className="w-1 h-1 rounded-full bg-white" />
              <span>MAX 20MB</span>
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] -m-6 flex flex-col md:flex-row bg-[#0A0A0B]">
      {/* Main Area (3/4) */}
      <div className="flex-1 relative overflow-hidden bg-black/40 flex items-center justify-center p-4 md:p-12">
        <button
          onClick={() => { setUploadedImage(null); setResult(null); }}
          className="absolute top-6 left-6 z-20 p-2.5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 text-white/50 hover:text-white transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="relative max-w-full max-h-full rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/5">
          <img 
            src={result || uploadedImage} 
            alt="Expand" 
            className="w-full h-full object-contain"
          />
          {isProcessing && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center">
                <div className="relative">
                  <Loader2 className="w-16 h-16 animate-spin text-amber-500 mx-auto mb-4" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Maximize className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-xs font-black uppercase tracking-widest text-amber-500 animate-pulse">
                  {language === "ru" ? "Дорисовываем..." : "Expanding..."}
                </p>
              </div>
            </div>
          )}
          {result && !isProcessing && (
            <div className="absolute bottom-6 right-6 flex gap-3">
              <button 
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = result;
                  link.download = 'expanded-image.png';
                  link.click();
                }}
                className="flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-amber-500 text-white font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Download className="w-4 h-4" />
                {language === "ru" ? "Скачать результат" : "Download Result"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar (1/4) */}
      <div className="w-full md:w-[380px] border-l border-white/10 flex flex-col bg-[#0A0A0B] p-8">
          <div className="flex-1 space-y-8">
            <div>
              <div className="flex items-center gap-3 text-white/30 mb-4">
                <Layout className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">{language === "ru" ? "Формат" : "Aspect Ratio"}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5">
                {["1:1", "16:9", "9:16", "4:3", "3:4", "21:9"].map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`h-11 rounded-xl text-xs font-black transition-all ${
                      aspectRatio === ratio 
                        ? "bg-white text-black shadow-lg" 
                        : "text-white/40 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

          <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30">{language === "ru" ? "Характеристики" : "Properties"}</h4>
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-white/40">{language === "ru" ? "Метод" : "Method"}</span>
                <span>Generative Fill</span>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-white/40">{language === "ru" ? "Качество" : "Quality"}</span>
                <span>Ultra HD</span>
              </div>
            </div>
          </div>
        </div>

          <div className="pt-8">
            <button
              onClick={handleProcess}
              disabled={isProcessing}
              className="w-full py-5 rounded-xl bg-amber-500 text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_40px_rgba(245,158,11,0.3)] disabled:opacity-50"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  {language === "ru" ? "Дорисовать" : "Expand"}
                  <div className="ml-2 flex items-center gap-1.5 text-[#FFD700] font-mono">
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span className="text-xs font-bold">20</span>
                  </div>
                </>
              )}
            </button>
          </div>
      </div>
    </div>
  );
}

export default function ExpandPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    }>
      <ExpandToolContent />
    </Suspense>
  );
}
