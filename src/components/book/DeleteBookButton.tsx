"use client";

import { useState, useTransition } from "react";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteBookFromDB } from "../../app/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";

export default function DeleteBookButton({ bookId, title }: { bookId: string; title: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteBookFromDB(bookId);
      if (result.success) {
        setOpen(false);
        // 删除成功后瞬间跳转回首页
        router.push("/");
      } else {
        alert(result.error);
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          variant="ghost" 
          className="text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors gap-2 px-3"
        >
          <Trash2 className="w-4 h-4" />
          <span className="text-sm">删除此书</span>
        </Button>
      </AlertDialogTrigger>
      
      <AlertDialogContent className="bg-slate-950 border-slate-800 text-slate-200">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 text-red-400 mb-2">
            <AlertTriangle className="w-6 h-6" />
            <AlertDialogTitle className="text-xl">确认删除？</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-slate-400 text-base">
            确定要删除 <span className="text-slate-200 font-bold">《{title}》</span> 吗？
            此操作将永久抹去这本书及其所有珍贵的摘录笔记，且无法撤销。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6">
          <AlertDialogCancel className="bg-transparent border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-slate-200">
            我再想想
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isPending}
            className="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            确定删除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}