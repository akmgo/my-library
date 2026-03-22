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

// 1. 引入刚才写好的 Server Action
import { addBookToDB } from "../../app/actions";

export default function AddBookDialog() {
  const [open, setOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // 2. 新增一个状态，用来控制提交按钮的 Loading 动画
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    coverUrl: "",
  });

  const handleAutoFetch = () => {
    // ... 原有的模拟抓取逻辑保持不变 ...
    setIsFetching(true);
    setTimeout(() => {
      setFormData({
        title: "武逆",
        author: "只是小虾米",
        coverUrl:
          "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=300&auto=format&fit=crop",
      });
      setIsFetching(false);
    }, 1000);
  };

  // 3. 改造表单提交逻辑
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true); // 开启按钮的 loading 圈圈

    try {
      // 像调用本地函数一样，直接调用服务端的 SQL 执行逻辑！
      const result = await addBookToDB(formData);

      if (result.success) {
        setOpen(false); // 关闭弹窗
        setFormData({ title: "", author: "", coverUrl: "" }); // 清空表单
      } else {
        alert("保存失败：" + result.error);
      }
    } catch (error) {
      alert("发生网络错误，请重试");
    } finally {
      setIsSubmitting(false); // 关闭 loading 圈圈
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
        {/* ... Header 和 表单其他内容保持不变 ... */}

        <form onSubmit={handleSubmit} className="grid gap-6 py-4">
          {/* ... 输入框区域保持不变 ... */}

          <DialogFooter className="mt-4">
            {/* 4. 修改提交按钮，增加防抖和 Loading 状态支持 */}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  保存中...
                </>
              ) : (
                "保存至书架"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
