'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'

export default function SimpleHomeTest() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log('Starting to load prompts...')

        // Test if we can import the function
        const { getPrompts } = await import('@/app/actions/prompts')
        console.log('getPrompts function imported:', typeof getPrompts)

        // Call the function
        const result = await getPrompts({
          page: 1,
          limit: 12,
          isPublic: true
        })

        console.log('getPrompts result:', result)

        if (result.error) {
          console.error('Server Action error:', result.error)
          setError(result.error)
        } else {
          setData(result)
        }
      } catch (err) {
        console.error('Client-side error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-2xl font-bold mb-4">Simple Home Test</h1>

      {loading && (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {data && (
        <div className="space-y-4">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <strong>Success!</strong> Found {data.prompts.length} prompts
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.prompts.map((prompt) => (
              <div key={prompt.id} className="border rounded-lg p-4">
                <h3 className="font-semibold">{prompt.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{prompt.description}</p>
                <div className="mt-2">
                  {prompt.tags?.map((tag) => (
                    <span key={tag.id} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1">
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}