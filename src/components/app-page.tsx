"use client";

import { useState, useRef, useCallback } from "react";
import { ArrowLeft, Plus, X, Sparkles, Loader2, Download, Zap } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { downloadFile } from "@/lib/utils";

interface AppPageProps {
  title: string;
  description: string;
  howItWorks: string;
  icon: React.ReactNode;
  image: string;
  needsPrompt?: boolean;
  promptPlaceholder?: string;
}

export function AppPage({ 
  title, 
  description, 
  howItWorks, 
  icon, 
  image, 
  needsPrompt = false,
  promptPlaceholder 
}: AppPageProps) {
  const { t, language } = useLanguage();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const refInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent, isRef = false) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files[0]?.type.startsWith("image/")) {
      const url = URL.createObjectURL(files[0]);
      if (isRef) {
        setReferenceImage(url);
      } else {
        setUploadedImage(url);
      }
      setResult(null);
    }
  }, []);

  const handleFiles = (files: FileList | null, isRef = false) => {
    if (files?.[0]?.type.startsWith("image/")) {
      const url = URL.createObjectURL(files[0]);
      if (isRef) {
        setReferenceImage(url);
      } else {
        setUploadedImage(url);
      }
      setResult(null);
    }
  };

  const handleProcess = async () => {
    if (!uploadedImage) return;
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 2500));
    setResult("https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800");
    setIsProcessing(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pt-12">
      <div className="flex items-center gap-4 mb-12">
<Link href="/app" className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">{title}</h1>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40">{description}</p>
          </div>
        </div>

        <div className="space-y-6 mb-12">
            <div className="rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
              <img src={image} alt={title} className="w-full h-80 object-cover opacity-80" />
            </div>
            <div className="rounded-3xl bg-white/5 border border-white/10 p-8">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/30 mb-4">{language === "ru" ? "Как это работает" : "How it works"}</h3>
              <p className="text-sm font-medium leading-relaxed text-white/60">{howItWorks}</p>
            </div>
          </div>

        <div className="space-y-8">
          <div className="grid md:grid-cols-1 gap-8">
            <div
              className={`rounded-[40px] border-2 border-dashed transition-all flex flex-col items-center justify-center p-8 group relative overflow-hidden ${
                isDragging 
                  ? "border-[#6F00FF] bg-[#6F00FF]/5" 
                  : "border-white/10 hover:border-white/20 bg-white/5"
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => handleDrop(e, false)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#6F00FF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10 w-full">
                <h3 className="text-xs font-black uppercase tracking-widest text-white/20 mb-6 text-center">{language === "ru" ? "Ваше изображение" : "Your Image"}</h3>
                
                {uploadedImage ? (
                  <div className="relative max-w-sm mx-auto">
                    <img src={uploadedImage} alt="Uploaded" className="w-full rounded-2xl border border-white/10 shadow-2xl" />
                    <button
                      onClick={() => { setUploadedImage(null); setResult(null); }}
                      className="absolute top-3 right-3 p-2.5 rounded-xl bg-black/60 hover:bg-black/80 transition-colors backdrop-blur-md border border-white/10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square md:aspect-[21/9] rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all group/upload"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 group-hover/upload:scale-110 transition-transform">
                      <Plus className="w-8 h-8 text-white/20" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20">
                      {language === "ru" ? "Нажмите или перетащите" : "Click or drag to upload"}
                    </p>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files, false)}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-3xl bg-white/5 border border-white/10 p-6">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-6">{language === "ru" ? "Референс (опционально)" : "Reference (optional)"}</h3>
                
                  {referenceImage ? (
                    <div className="relative group/ref">
                      <div className="aspect-square rounded-2xl overflow-hidden border border-white/10 transition-transform duration-500 group-hover/ref:scale-105">
                        <img src={referenceImage} alt="Reference" className="w-full h-full object-cover" />
                      </div>
                      <button
                        onClick={() => setReferenceImage(null)}
                        className="absolute top-3 right-3 p-2.5 rounded-xl bg-black/60 hover:bg-black/80 transition-colors backdrop-blur-md border border-white/10 z-10"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => refInputRef.current?.click()}
                      className="aspect-square border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all group/ref"
                    >
                      <Plus className="w-6 h-6 text-white/10 group-hover/ref:scale-110 transition-transform" />
                    </div>
                  )}

                <input
                  ref={refInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files, true)}
                />
              </div>

              <div className="rounded-3xl bg-white/5 border border-white/10 p-6 flex flex-col">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-6">{language === "ru" ? "Описание" : "Description"}</h3>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={promptPlaceholder || t("prompt.placeholder")}
                  className="flex-1 w-full bg-white/5 rounded-2xl p-4 resize-none outline-none text-white placeholder:text-white/20 text-sm font-medium border border-white/5 focus:border-[#6F00FF]/50 transition-colors"
                  rows={4}
                />
              </div>
            </div>

            {uploadedImage && (
              <button
                onClick={handleProcess}
                disabled={isProcessing}
                className="w-full py-5 rounded-xl bg-[#6F00FF] text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_40px_rgba(111,0,255,0.3)] disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {language === "ru" ? "Обработать" : "Process"}
                <div className="ml-2 flex items-center gap-1.5 text-[#FFD700] font-mono">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span className="text-xs font-bold">10</span>
                </div>
              </button>
            )}
          </div>

          <div className="rounded-[40px] bg-white/5 border border-white/10 p-8">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/20 mb-8 text-center">{language === "ru" ? "Результат" : "Result"}</h3>
            
            {isProcessing ? (
              <div className="aspect-square flex items-center justify-center">
                <div className="text-center">
                  <div className="relative">
                    <Loader2 className="w-16 h-16 animate-spin text-[#6F00FF] mx-auto mb-4" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#6F00FF] animate-pulse">
                    {language === "ru" ? "Обработка..." : "Processing..."}
                  </p>
                </div>
              </div>
              ) : result ? (
                <div className="relative max-w-lg mx-auto">
                  <img src={result} alt="Result" className="w-full rounded-3xl border border-white/10 shadow-2xl" />
                  <button 
                    onClick={() => {
                      downloadFile(result, 'result.png');
                    }}
                    className="absolute bottom-4 right-4 p-4 rounded-2xl bg-[#6F00FF] text-white hover:scale-110 active:scale-95 transition-all shadow-2xl"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              ) : (
              <div className="aspect-video md:aspect-[21/9] border-2 border-dashed border-white/5 rounded-3xl flex items-center justify-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/10">
                  {language === "ru" ? "Результат появится здесь" : "Result will appear here"}
                </p>
              </div>
            )}
          </div>

        </div>
    </div>
  );
}
