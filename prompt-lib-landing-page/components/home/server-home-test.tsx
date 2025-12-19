import { getPrompts } from '@/app/actions/prompts'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function ServerHomeTest() {
  console.log('ServerHomeTest: Loading data on server...')

  try {
    const result = await getPrompts({
      page: 1,
      limit: 12,
      isPublic: true
    })

    console.log('ServerHomeTest: Result:', {
      error: result.error,
      promptsCount: result.prompts.length,
      total: result.total
    })

    if (result.error) {
      return (
        <div className="min-h-screen bg-background p-8">
          <h1 className="text-2xl font-bold mb-4">Server Home Test</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> {result.error}
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-background p-8">
        <h1 className="text-2xl font-bold mb-4">Server Home Test</h1>

        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          <strong>Success!</strong> Found {result.prompts.length} prompts (total: {result.total})
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {result.prompts.map((prompt) => (
            <Card key={prompt.id} className="overflow-hidden">
              <CardHeader className="p-4">
                <h3 className="font-semibold text-lg">{prompt.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{prompt.description}</p>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex flex-wrap gap-1.5">
                  {prompt.tags?.map((tag) => (
                    <Badge key={tag.id} variant="secondary" className="text-xs">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 text-xs text-muted-foreground">
                Views: {prompt.view_count} | Copies: {prompt.copy_count}
              </CardFooter>
            </Card>
          ))}
        </div>

        {result.prompts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No prompts found</p>
          </div>
        )}
      </div>
    )
  } catch (error) {
    console.error('ServerHomeTest: Caught error:', error)
    return (
      <div className="min-h-screen bg-background p-8">
        <h1 className="text-2xl font-bold mb-4">Server Home Test</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Caught Error:</strong> {error.message}
        </div>
      </div>
    )
  }
}