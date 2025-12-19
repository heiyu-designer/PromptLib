// Enhanced search utilities for better user experience

export interface SearchOptions {
  query?: string
  tags?: string[]
  sortBy?: 'relevance' | 'created_at' | 'view_count' | 'copy_count' | 'title'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export interface SearchResult {
  prompts: any[]
  total: number
  hasMore: boolean
  suggestions?: string[]
}

// Calculate relevance score for a prompt
export function calculateRelevance(prompt: any, query: string): number {
  if (!query) return 0

  const lowerQuery = query.toLowerCase()
  const lowerTitle = prompt.title.toLowerCase()
  const lowerContent = prompt.content.toLowerCase()
  const lowerDescription = prompt.description?.toLowerCase() || ''

  let score = 0

  // Exact title match gets highest score
  if (lowerTitle === lowerQuery) score += 100

  // Title starts with query gets high score
  if (lowerTitle.startsWith(lowerQuery)) score += 50

  // Title contains query gets medium score
  if (lowerTitle.includes(lowerQuery)) score += 30

  // Content contains query gets lower score
  if (lowerContent.includes(lowerQuery)) score += 10

  // Description contains query gets small score
  if (lowerDescription.includes(lowerQuery)) score += 5

  // Tag matches get bonus
  const tagMatches = prompt.tags?.filter((tag: any) =>
    tag.name.toLowerCase().includes(lowerQuery)
  ).length || 0
  score += tagMatches * 15

  // Length penalty (shorter content gets slight bonus)
  const contentLength = prompt.content.length
  if (contentLength < 1000) score += 5
  else if (contentLength > 5000) score -= 5

  return score
}

// Generate search suggestions based on query
export function generateSearchSuggestions(query: string, prompts: any[], tags: any[]): string[] {
  if (!query || query.length < 2) return []

  const lowerQuery = query.toLowerCase()
  const suggestions = new Set<string>()

  // Extract words from query
  const queryWords = lowerQuery.split(/\s+/).filter(word => word.length > 1)

  // Find prompts with similar titles
  prompts.forEach(prompt => {
    const title = prompt.title.toLowerCase()

    // Check if prompt title contains any of our query words
    queryWords.forEach(word => {
      if (title.includes(word) && !title.includes(lowerQuery)) {
        suggestions.add(prompt.title)
      }
    })

    // Check for partial matches
    if (title.includes(lowerQuery.slice(0, -1)) && title !== lowerQuery) {
      suggestions.add(prompt.title)
    }
  })

  // Find tag suggestions
  tags.forEach(tag => {
    if (tag.name.toLowerCase().includes(lowerQuery) &&
        tag.name.toLowerCase() !== lowerQuery) {
      suggestions.add(tag.name)
    }
  })

  // Convert to array and return top 5
  return Array.from(suggestions).slice(0, 5)
}

// Advanced search with multiple criteria
export function advancedSearch(prompts: any[], options: SearchOptions): SearchResult {
  let filteredPrompts = [...prompts]

  // Apply text search
  if (options.query) {
    filteredPrompts = filteredPrompts.filter(prompt => {
      const relevanceScore = calculateRelevance(prompt, options.query!)
      return relevanceScore > 0
    })
  }

  // Apply tag filters
  if (options.tags && options.tags.length > 0) {
    filteredPrompts = filteredPrompts.filter(prompt => {
      const promptTagNames = prompt.tags?.map((tag: any) => tag.name) || []
      return options.tags!.some(tag => promptTagNames.includes(tag))
    })
  }

  // Calculate relevance scores for all prompts
  if (options.query) {
    filteredPrompts = filteredPrompts.map(prompt => ({
      ...prompt,
      relevanceScore: calculateRelevance(prompt, options.query!)
    }))
  }

  // Sort results
  const sortBy = options.sortBy || 'created_at'
  const sortOrder = options.sortOrder || 'desc'

  filteredPrompts.sort((a, b) => {
    let aValue: number
    let bValue: number

    switch (sortBy) {
      case 'relevance':
        aValue = a.relevanceScore || 0
        bValue = b.relevanceScore || 0
        break
      case 'title':
        aValue = a.title.localeCompare(b.title)
        bValue = 0 // for comparison
        return sortOrder === 'asc' ? aValue : -aValue
      case 'view_count':
        aValue = a.view_count || 0
        bValue = b.view_count || 0
        break
      case 'copy_count':
        aValue = a.copy_count || 0
        bValue = b.copy_count || 0
        break
      case 'created_at':
      default:
        aValue = new Date(a.created_at).getTime()
        bValue = new Date(b.created_at).getTime()
        break
    }

    if (sortBy === 'title') {
      return sortOrder === 'asc' ? aValue : -aValue
    }

    return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
  })

  // Apply pagination
  const total = filteredPrompts.length
  const limit = options.limit || 20
  const offset = options.offset || 0
  const paginatedPrompts = filteredPrompts.slice(offset, offset + limit)

  // Generate suggestions
  const suggestions = options.query
    ? generateSearchSuggestions(options.query, prompts.slice(0, 100), [])
    : []

  return {
    prompts: paginatedPrompts,
    total,
    hasMore: offset + limit < total,
    suggestions
  }
}

// Search highlighting utility
export function highlightSearchTerms(text: string, query: string): string {
  if (!query) return text

  const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

// Escape regex special characters
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Extract search result metadata
export function getSearchMetadata(prompts: any[]) {
  const totalPrompts = prompts.length
  const totalViews = prompts.reduce((sum, prompt) => sum + (prompt.view_count || 0), 0)
  const totalCopies = prompts.reduce((sum, prompt) => sum + (prompt.copy_count || 0), 0)

  // Top tags
  const tagCounts: Record<string, number> = {}
  prompts.forEach(prompt => {
    prompt.tags?.forEach((tag: any) => {
      tagCounts[tag.name] = (tagCounts[tag.name] || 0) + 1
    })
  })

  const topTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }))

  return {
    totalPrompts,
    totalViews,
    totalCopies,
    topTags
  }
}

// Popular searches (could be stored in database later)
export function getPopularSearches(): string[] {
  return [
    'ChatGPT',
    '代码审查',
    '写作助手',
    '自动化',
    'API文档',
    'Midjourney',
    'Coze工作流',
    '博客生成',
    '技术教程',
    '项目规划'
  ]
}