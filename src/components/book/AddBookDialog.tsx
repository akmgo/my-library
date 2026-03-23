// src/components/book/AddBookDialog.tsx
"use client";

import { useState } from "react";
import { Plus, Loader2, UploadCloud, Search, X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { addBookToDB, searchBookByTitle } from "../../app/actions";

import { ShimmerButton } from "../ui/shimmer-button";
import { BorderBeam } from "../ui/border-beam";

// 默认封面底图（如果没有上传图片，则使用这张）
const DEFAULT_COVER = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000&auto=format&fit=crop";

export default function AddBookDialog() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false); 
  
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    coverUrl: "", // 现在它将用来存储 Base64 字符串
  });

  // 联网提取作者
  const handleAutoFill = async () => {
    if (!formData.title.trim()) {
      alert("请先输入书名！");
      return;
    }
    setIsSearching(true);
    const res = await searchBookByTitle(formData.title);
    if (res.success && res.book && res.book.author) {
      setFormData(prev => ({ ...prev, author: res.book.author }));
    } else {
      alert("开源书库未匹配到该书作者，请手动填写~");
    }
    setIsSearching(false);
  };

  // 【核心魔法】：纯前端图片压缩与 Base64 转换
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // 使用 Canvas 压缩图片，防止 Base64 字符串过大撑爆数据库
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800; // 限制最大宽度
        const scaleSize = MAX_WIDTH / img.width;
        
        // 如果图片本身就很小，就不放大；如果大，就等比缩小
        canvas.width = img.width > MAX_WIDTH ? MAX_WIDTH : img.width;
        canvas.height = img.width > MAX_WIDTH ? img.height * scaleSize : img.height;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        // 转化为 WebP 格式，质量设为 0.7，极限压缩体积
        const compressedBase64 = canvas.toDataURL("image/webp", 0.7);
        
        // 存入表单状态
        setFormData((prev) => ({ ...prev, coverUrl: compressedBase64 }));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 提交时，如果有 Base64 封面就用，没有就用你设计的默认统一封面
      const finalCoverUrl = formData.coverUrl || DEFAULT_COVER;

      const result = await addBookToDB({
        ...formData,
        coverUrl: finalCoverUrl 
      });
      
      if (result.success) {
        setOpen(false); 
        setFormData({ title: "", author: "", coverUrl: "" }); 
      } else {
        alert("保存失败：" + result.error);
      }
    } catch (error) {
      alert("发生错误，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ShimmerButton 
        onClick={() => setOpen(true)} 
        className="shadow-2xl flex items-center gap-2 px-5 py-2.5"
      >
        <Plus className="h-4 w-4 text-white" />
        <span className="text-center text-sm leading-none font-medium tracking-tight text-white">
          录入新书
        </span>
      </ShimmerButton>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border border-slate-800 bg-slate-950 rounded-xl shadow-2xl">
          <div className="p-6 relative z-10">
            <DialogHeader className="mb-6 text-left space-y-1.5">
              <DialogTitle className="text-xl font-bold leading-none tracking-tight text-white">
                录入新书
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-400 mt-2">
                输入书名后点击搜索图标，可智能提取作者。
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit}>
              <div className="grid w-full items-center gap-5">
                
                {/* 书名 */}
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="title" className="font-semibold text-slate-300">书名</Label>
                  <div className="relative">
                    <Input 
                      id="title" 
                      placeholder="例如: 活着" 
                      value={formData.title} 
                      onChange={(e) => setFormData({...formData, title: e.target.value})} 
                      required 
                      className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-slate-700 pr-12"
                    />
                    <button
                      type="button"
                      onClick={handleAutoFill}
                      disabled={isSearching || !formData.title}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors disabled:opacity-50"
                      title="智能提取作者"
                    >
                      {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 作者 */}
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="author" className="font-semibold text-slate-300">作者</Label>
                  <Input 
                    id="author" 
                    placeholder="例如: 余华" 
                    value={formData.author} 
                    onChange={(e) => setFormData({...formData, author: e.target.value})} 
                    required 
                    className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-slate-700"
                  />
                </div>

                {/* 封面上传与预览区域 */}
                <div className="flex flex-col space-y-2">
                  <Label className="font-semibold text-slate-300">本地封面 (可选)</Label>
                  
                  {formData.coverUrl ? (
                    // 有图片时：显示预览图和右上角的删除按钮
                    <div className="relative w-full h-32 rounded-xl border border-slate-800 overflow-hidden group">
                      <img 
                        src={formData.coverUrl} 
                        alt="封面预览" 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      />
                      <button 
                        type="button" 
                        onClick={() => setFormData({...formData, coverUrl: ""})}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500/80 text-white rounded-full backdrop-blur-md transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    // 无图片时：显示虚线上传框
                    <div className="relative group">
                      {/* 【修改点】：绑定了 onChange 事件 */}
                      <Input 
                        id="cover" 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="flex flex-col items-center justify-center w-full h-24 rounded-xl border border-dashed border-slate-700 bg-slate-900/50 group-hover:bg-slate-800/50 group-hover:border-slate-500 transition-all">
                        <UploadCloud className="w-6 h-6 text-slate-500 mb-2 group-hover:text-slate-400 transition-colors" />
                        <span className="text-sm text-slate-500 group-hover:text-slate-400 transition-colors">
                          点击选择或拖拽本地图片
                        </span>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              <div className="flex justify-between mt-8">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpen(false)}
                  className="border-slate-800 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  取消
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  确认录入
                </Button>
              </div>
            </form>
          </div>

          <BorderBeam duration={8} size={100} />
        </DialogContent>
      </Dialog>
    </>
  );
}