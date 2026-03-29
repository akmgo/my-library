// src/components/home/LibrarySkeleton.tsx
export default function LibrarySkeleton() {
  return (
    <div className="w-full flex flex-col gap-12">
      <section className="w-full grid grid-cols-1 xl:grid-cols-2 gap-10">
        <div className="h-[360px] md:h-[400px] rounded-[2.5rem] bg-slate-200/50 dark:bg-slate-800/40 animate-pulse border border-white/50 dark:border-slate-700/30" />
        <div className="h-[360px] md:h-[400px] rounded-[2.5rem] bg-slate-200/50 dark:bg-slate-800/40 animate-pulse border border-white/50 dark:border-slate-700/30" />
      </section>
      <section className="w-full grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="h-[500px] rounded-[2.5rem] bg-slate-200/30 dark:bg-slate-800/20 animate-pulse border border-white/50 dark:border-slate-700/30" />
        <div className="h-[500px] rounded-[2.5rem] bg-slate-200/30 dark:bg-slate-800/20 animate-pulse border border-white/50 dark:border-slate-700/30" />
      </section>
    </div>
  );
}