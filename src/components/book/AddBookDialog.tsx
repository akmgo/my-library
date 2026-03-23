// src/components/book/AddBookDialog.tsx
"use client";

import { useState, useRef, useTransition } from "react";
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

const DEFAULT_COVER = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000&auto=format&fit=crop";

export default function AddBookDialog() {
  const [open, setOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false); 
  const [isPending, startTransition] = useTransition();
  
  // 【极致优化 1】：只保留封面的 state，因为只有它需要预览图的重新渲染
  const [coverUrl, setCoverUrl] = useState("");

  // 【极致优化 2】：为书名和作者创建 DOM 探针 (不再在打字时触发重渲染！)
  const titleRef = useRef<HTMLInputElement>(null);
  const authorRef = useRef<HTMLInputElement>(null);

  // 联网提取作者
  const handleAutoFill = async () => {
    // 通过探针直接拿取当前的输入值，不经过 React State
    const currentTitle = titleRef.current?.value.trim();
    
    if (!currentTitle) {
      alert("请先输入书名！");
      return;
    }
    
    setIsSearching(true);
    const res = await searchBookByTitle(currentTitle);
    
    if (res.success && res.book && res.book.author) {
      // 拿到结果后，直接修改原生 DOM 的值，同样不触发弹窗重渲染！
      if (authorRef.current) {
        authorRef.current.value = res.book.author;
      }
    } else {
      alert("开源书库未匹配到该书作者，请手动填写~");
    }
    setIsSearching(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800; 
        const scaleSize = MAX_WIDTH / img.width;
        
        canvas.width = img.width > MAX_WIDTH ? MAX_WIDTH : img.width;
        canvas.height = img.width > MAX_WIDTH ? img.height * scaleSize : img.height;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        const compressedBase64 = canvas.toDataURL("image/webp", 0.7);
        setCoverUrl(compressedBase64); // 仅封面改变时触发一次重渲染
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isPending) return;

    // 【极致优化 3】：拦截表单的瞬间，把所有数据榨取出来
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const author = formData.get("author") as string;
    
    // 保存表单 DOM 的引用，用于一会儿清空输入框
    const formElement = e.currentTarget;

    setOpen(false); 

    startTransition(async () => {
      try {
        const finalCoverUrl = coverUrl || DEFAULT_COVER;
        const result = await addBookToDB({ title, author, coverUrl: finalCoverUrl });
        
        if (result.success) {
          // 成功后：利用原生表单的重置功能清空文字，并清空图片 state
          formElement.reset(); 
          setCoverUrl(""); 
        } else {
          console.error("保存失败：" + result.error);
        }
      } catch (error) {
        console.error("发生错误:", error);
      }
    });
  };

  return (
    <>
      <ShimmerButton 
        onClick={() => setOpen(true)} 
        // 加上点击下陷特效和 GPU 加速
        className="shadow-2xl flex items-center gap-2 px-5 py-2.5 active:scale-95 transition-transform transform-gpu"
      >
        <Plus className="h-4 w-4 text-white" />
        <span className="text-center text-sm leading-none font-medium tracking-tight text-white">
          录入新书
        </span>
      </ShimmerButton>

      <Dialog open={open} onOpenChange={setOpen}>
        {/* 加上 transform-gpu 强制显卡渲染，保证弹出流畅 */}
        <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border border-slate-800 bg-slate-950 rounded-xl shadow-2xl transform-gpu">
          <div className="p-6 relative z-10">
            <DialogHeader className="mb-6 text-left space-y-1.5">
              <DialogTitle className="text-xl font-bold leading-none tracking-tight text-white">
                录入新书
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-400 mt-2">
                输入书名后点击搜索图标，可智能提取作者。
              </DialogDescription>
            </DialogHeader>

            {/* 把原先的 div 改成 form 标签 */}
            <form onSubmit={handleSubmit} className="grid w-full items-center gap-5">
              
              {/* 书名 */}
              <div className="flex flex-col space-y-2">
                <Label htmlFor="title" className="font-semibold text-slate-300">书名</Label>
                <div className="relative">
                  {/* 去掉 value 和 onChange，换成 ref 和 name */}
                  <Input 
                    id="title" 
                    name="title"
                    ref={titleRef}
                    defaultValue=""
                    placeholder="例如: 活着" 
                    required 
                    className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-slate-700 pr-12"
                  />
                  <button
                    type="button"
                    onClick={handleAutoFill}
                    disabled={isSearching}
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
                {/* 同样改成不受控组件 */}
                <Input 
                  id="author" 
                  name="author"
                  ref={authorRef}
                  defaultValue=""
                  placeholder="例如: 余华" 
                  required 
                  className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-slate-700"
                />
              </div>

              {/* 封面上传与预览区域 (只有这部分受 state 控制) */}
              <div className="flex flex-col space-y-2">
                <Label className="font-semibold text-slate-300">本地封面 (可选)</Label>
                
                {coverUrl ? (
                  <div className="relative w-full h-32 rounded-xl border border-slate-800 overflow-hidden group">
                    <img 
                      src={coverUrl} 
                      alt="封面预览" 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                    <button 
                      type="button" 
                      onClick={() => setCoverUrl("")}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-500/80 text-white rounded-full backdrop-blur-md transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative group">
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
                  disabled={isPending}
                  className="bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  确认录入
                </Button>
              </div>
            </form>
          </div>

          <div className="absolute inset-0 pointer-events-none transform-gpu will-change-transform rounded-xl overflow-hidden">
             <BorderBeam duration={8} size={100} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}