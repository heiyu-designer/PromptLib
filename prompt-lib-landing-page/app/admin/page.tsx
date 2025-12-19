export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">仪表盘</h1>
        <p className="mt-1 text-sm text-muted-foreground">欢迎来到 PromptLib 管理后台。</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="text-2xl font-bold">124</div>
          <p className="text-sm text-muted-foreground">提示词总数</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="text-2xl font-bold">12</div>
          <p className="text-sm text-muted-foreground">标签总数</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="text-2xl font-bold">1,248</div>
          <p className="text-sm text-muted-foreground">用户总数</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="text-2xl font-bold">4.2k</div>
          <p className="text-sm text-muted-foreground">本周浏览量</p>
        </div>
      </div>
    </div>
  )
}
