// src/app/loading.tsx
import { Loader2 } from "lucide-react";
import PageTransition from "../components/PageTransition";

export default function GlobalLoading() {
  return (
    <PageTransition>
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 pt-20">
        <Loader2 className="w-12 h-12 text-slate-500 animate-spin mb-4" />
        <p className="text-slate-400 font-medium tracking-widest animate-pulse">
          正在重组数字书房...
        </p>
      </div>
    </PageTransition>
  );
}