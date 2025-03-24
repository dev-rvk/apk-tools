import { ToolCard } from "@/components/tool-card"
import { SideNav } from "@/components/side-nav"
import { tools } from "@/data/tools"

export default function Home() {
  return (
    <div className="flex min-h-screen">
      <SideNav tools={tools} />
      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-6">APK Security Analysis Tools</h1>
        <p className="text-muted-foreground mb-8">
          A comprehensive suite of tools for analyzing APK security vulnerabilities and detecting potential risks
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </main>
    </div>
  )
}

