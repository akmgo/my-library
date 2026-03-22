// src/components/book/AddBookDialog.tsx
"use client";

import { useState } from "react";
import { Plus, Search, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { addBookToDB } from "../../app/actions";

export default function AddBookDialog() {
  const [open, setOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    coverUrl: "",
  });

  const handleAutoFetch = () => {
    setIsFetching(true);
    setTimeout(() => {
      setFormData({
        title: "武逆",
        author: "只是小虾米",
        coverUrl: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=300&auto=format&fit=crop",
      });
      setIsFetching(false);
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await addBookToDB(formData);
      if (result.success) {
        setOpen(false);
        setFormData({ title: "", author: "", coverUrl: "" });
      } else {
        alert("保存失败：" + result.error);
      }
    } catch (error) {
      alert("发生网络错误，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          录入新书
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>添加新书</DialogTitle>
          <DialogDescription>
            输入 ISBN 码或书名进行智能抓取，或手动完善书籍信息。
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          <div className="flex items-end gap-2">
            <div className="grid gap-2 flex-1">
              <Label htmlFor="isbn" className="text-muted-foreground">快捷抓取</Label>
              <Input id="isbn" placeholder="例如: 9787111544937 或 书名" className="focus-visible:ring-1" />
            </div>
            <Button type="button" variant="secondary" onClick={handleAutoFetch} disabled={isFetching}>
              {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-muted" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">或手动输入</span>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="title">书名</Label>
            <Input id="title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="author">作者</Label>
            <Input id="author" value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="coverUrl">封面图片链接 (URL)</Label>
            <Input id="coverUrl" type="url" value={formData.coverUrl} onChange={(e) => setFormData({...formData, coverUrl: e.target.value})} />
          </div>

          <DialogFooter className="mt-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />保存中...</>
              ) : "保存至书架"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}