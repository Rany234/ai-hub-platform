import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-6">
      <div className="w-full max-w-md border rounded-lg p-6 text-center">
        <h1 className="text-2xl font-semibold">页面未找到（404）</h1>
        <p className="mt-3 text-sm text-muted-foreground">抱歉，你访问的页面不存在或已被移除。</p>
        <Link className="inline-block mt-6 rounded-md bg-black text-white px-4 py-2" href="/">
          返回首页
        </Link>
      </div>
    </div>
  );
}
