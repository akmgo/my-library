// src/components/book/AddBookDialog.tsx
"use client";

import { useState, useRef } from "react";
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
// 【修改】：去掉了 uploadCoverToR2，确保引入了 getPresignedUrl
import {
  addBookToDB,
  searchBookByTitle,
  getPresignedUrl,
} from "../../app/actions";

import { ShimmerButton } from "../ui/shimmer-button";

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000&auto=format&fit=crop";

export default function AddBookDialog() {
  const [open, setOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  // 【核心修改 1】：用最稳妥的 useState 替代容易吞报错的 useTransition
  const [isUploading, setIsUploading] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const titleRef = useRef<HTMLInputElement>(null);
  const authorRef = useRef<HTMLInputElement>(null);

  const handleAutoFill = async () => {
    const currentTitle = titleRef.current?.value.trim();

    if (!currentTitle) {
      alert("请先输入书名！");
      return;
    }

    setIsSearching(true);
    const res = await searchBookByTitle(currentTitle);

    if (res.success && res.book && res.book.author) {
      if (authorRef.current) {
        authorRef.current.value = res.book.author;
      }
    } else {
      alert("开源书库未匹配到该书作者，请手动填写~");
    }
    setIsSearching(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    setPreviewUrl("");
  };

  // 【核心修改 2】：重构为企业级凭证直传逻辑
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isUploading) return;

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const author = formData.get("author") as string;
    const formElement = e.currentTarget;

    setIsUploading(true);

    try {
      let finalCoverUrl = DEFAULT_COVER;

      if (selectedFile) {
        // 第一步：向服务器要 R2 临时直传通行证
        const presignRes = await getPresignedUrl(
          selectedFile.name,
          selectedFile.type
        );

        if (!presignRes.success || !presignRes.uploadUrl) {
          alert("❌ 获取 R2 上传凭证失败: " + presignRes.error);
          setIsUploading(false);
          return;
        }

        // 第二步：前端浏览器直接把几兆的大图塞给 R2！(彻底解放 Next.js 内存)
        const uploadResponse = await fetch(presignRes.uploadUrl, {
          method: "PUT",
          body: selectedFile,
          headers: {
            "Content-Type": selectedFile.type,
          },
        });

        if (!uploadResponse.ok) {
          throw new Error(
            `R2 拒绝了文件上传，状态码: ${uploadResponse.status}`
          );
        }

        // 拿到最终的干净图床链接
        finalCoverUrl = presignRes.finalUrl;
      }

      // 第三步：图片搞定，只把轻量级的文本信息存进 D1 数据库
      const result = await addBookToDB({
        title,
        author,
        coverUrl: finalCoverUrl,
      });

      if (result.success) {
        formElement.reset();
        handleClearImage();
        setOpen(false);

        // 强制刷新页面，暴力打破缓存，新书绝对上墙！
        window.location.reload();
      } else {
        alert("❌ 数据库保存失败：" + result.error);
      }
    } catch (error: any) {
      alert("💥 发生致命异常: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium rounded-full bg-white/10 border border-white/10 transition duration-300 hover:bg-red-500/15 hover:border-red-500/30 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:-translate-y-0.5 active:scale-95 text-slate-300 hover:text-red-400 group"
      >
        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
        录入新书
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border border-slate-800 bg-slate-950 rounded-xl shadow-[0_0_40px_-10px_rgba(99,102,241,0.4)] transform-gpu">
          <div className="p-6 relative z-10">
            <DialogHeader className="mb-6 text-left space-y-1.5">
              <DialogTitle className="text-xl font-bold leading-none tracking-tight text-white">
                录入新书
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-400 mt-2">
                输入书名后点击搜索图标，可智能提取作者。
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={handleSubmit}
              className="grid w-full items-center gap-5"
            >
              <div className="flex flex-col space-y-2">
                <Label htmlFor="title" className="font-semibold text-slate-300">
                  书名
                </Label>
                <div className="relative">
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
                    {isSearching ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <Label
                  htmlFor="author"
                  className="font-semibold text-slate-300"
                >
                  作者
                </Label>
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

              <div className="flex flex-col space-y-2">
                <Label className="font-semibold text-slate-300">
                  本地封面 (可选)
                </Label>

                {previewUrl ? (
                  <div className="relative w-full h-32 rounded-xl border border-slate-800 overflow-hidden group">
                    <img
                      src={previewUrl}
                      alt="封面预览"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <button
                      type="button"
                      onClick={handleClearImage}
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
                      onChange={handleImageSelect}
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
                  disabled={isUploading}
                  className="bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  {isUploading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {isUploading ? "正在录入..." : "确认录入"}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
