// src/components/book/AddBookDialog.tsx
"use client"; // 声明这是一个客户端组件，允许使用 useState 等 Hook

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

export default function AddBookDialog() {
  const [open, setOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  
  // 表单状态
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    coverUrl: "",
  });

  // 模拟调用豆瓣或 Google Books API 抓取数据
  const handleAutoFetch = () => {
    setIsFetching(true);
    // 模拟网络延迟
    setTimeout(() => {
      setFormData({
        title: "武逆", // 自动填充抓取到的书名
        author: "只是小虾米",
        coverUrl: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=300&auto=format&fit=crop",
      });
      setIsFetching(false);
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 这里未来会接真实的 API 或 Cloudflare D1 数据库写入逻辑
    console.log("Submitting new book:", formData);
    setOpen(false); // 提交后关闭弹窗
    // 重置表单
    setFormData({ title: "", author: "", coverUrl: "" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* 触发弹窗的按钮 */}
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          录入新书
        </Button>
      </DialogTrigger>

      {/* 弹窗主体 */}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>添加新书</DialogTitle>
          <DialogDescription>
            输入 ISBN 码或书名进行智能抓取，或手动完善书籍信息。
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          
          {/* 智能抓取区 */}
          <div className="flex items-end gap-2">
            <div className="grid gap-2 flex-1">
              <Label htmlFor="isbn" className="text-muted-foreground">ISBN / 书名快捷抓取</Label>
              <Input 
                id="isbn" 
                placeholder="例如: 9787111544937 或 武逆" 
                className="focus-visible:ring-1"
              />
            </div>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={handleAutoFetch}
              disabled={isFetching}
            >
              {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-muted" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                或手动输入
              </span>
            </div>
          </div>

          {/* 手动表单区 */}
          <div className="grid gap-2">
            <Label htmlFor="title">书名</Label>
            <Input 
              id="title" 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="author">作者</Label>
            <Input 
              id="author" 
              value={formData.author}
              onChange={(e) => setFormData({...formData, author: e.target.value})}
              required 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="coverUrl">封面图片链接 (URL)</Label>
            <Input 
              id="coverUrl" 
              type="url"
              value={formData.coverUrl}
              onChange={(e) => setFormData({...formData, coverUrl: e.target.value})}
              placeholder="https://..." 
            />
          </div>

          <DialogFooter className="mt-4">
            <Button type="submit" className="w-full">保存至书架</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}