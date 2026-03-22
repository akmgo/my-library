// src/components/book/AddBookDialog.tsx
"use client";

import { useState } from "react";
// 【新增】：引入了一个 UploadCloud 图标用于美化上传区域
import { Plus, Loader2, UploadCloud } from "lucide-react";
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
import { addBookToDB } from "../../app/actions";

import { ShimmerButton } from "../ui/shimmer-button";
import { BorderBeam } from "../ui/border-beam";

export default function AddBookDialog() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    author: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submitData = {
        ...formData,
        coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000&auto=format&fit=crop"
      };
      
      const result = await addBookToDB(submitData);
      if (result.success) {
        setOpen(false); 
        setFormData({ title: "", author: "" }); 
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
            <DialogHeader className="mb-6 text-center sm:text-left space-y-1.5">
              <DialogTitle className="text-xl font-bold leading-none tracking-tight text-white">
                录入新书
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-400 mt-2">
                填写书籍基础信息（当前为视觉预览版）。
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit}>
              <div className="grid w-full items-center gap-5">
                
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="title" className="font-semibold text-slate-300">书名</Label>
                  <Input 
                    id="title" 
                    placeholder="例如: 百年孤独" 
                    value={formData.title} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})} 
                    required 
                    className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-slate-700"
                  />
                </div>

                <div className="flex flex-col space-y-2">
                  <Label htmlFor="author" className="font-semibold text-slate-300">作者</Label>
                  <Input 
                    id="author" 
                    placeholder="例如: 马尔克斯" 
                    value={formData.author} 
                    onChange={(e) => setFormData({...formData, author: e.target.value})} 
                    required 
                    className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-slate-700"
                  />
                </div>

                {/* 【重点改造】：高颜值的本地封面选取区 */}
                <div className="flex flex-col space-y-2">
                  <Label className="font-semibold text-slate-300">本地封面</Label>
                  <div className="relative group">
                    {/* 真正的 input 被透明化并铺满这一层 */}
                    <Input 
                      id="cover" 
                      type="file" 
                      accept="image/*" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    {/* 这是用户能看到的虚线美化层 */}
                    <div className="flex flex-col items-center justify-center w-full h-24 rounded-lg border border-dashed border-slate-700 bg-slate-900/50 group-hover:bg-slate-800/50 group-hover:border-slate-500 transition-all">
                      <UploadCloud className="w-6 h-6 text-slate-500 mb-2 group-hover:text-slate-400 transition-colors" />
                      <span className="text-sm text-slate-500 group-hover:text-slate-400 transition-colors">
                        点击选择或拖拽图片至此
                      </span>
                    </div>
                  </div>
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
                {/* 【重点改造】：“确认录入”按钮降低了明度，改用深色镂空/暗石板蓝风格 */}
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