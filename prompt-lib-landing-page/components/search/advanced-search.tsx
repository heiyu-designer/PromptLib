'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, TrendingUp, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { getPopularSearches } from '@/lib/search'

interface AdvancedSearchProps {
  value: string
  onChange: (value: string) => void
  onSearch: (query: string) => void
  placeholder?: string
  suggestions?: string[]
  showPopular?: boolean
  showHistory?: boolean
}

export default function AdvancedSearch({
  value,
  onChange,
  onSearch,
  placeholder = '搜索提示词...',
  suggestions = [],
  showPopular = true,
  showHistory = true
}: AdvancedSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [showRecentHistory, setShowRecentHistory] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const popularSearches = getPopularSearches()

  // Load search history from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const history = localStorage.getItem('prompt_search_history')
        if (history) {
          setSearchHistory(JSON.parse(history))
        }
      } catch (error) {
        console.error('Failed to load search history:', error)
      }
    }
  }, [])

  // Save search history to localStorage
  const saveToHistory = (query: string) => {
    if (!query.trim() || query.length < 2) return

    const newHistory = [query, ...searchHistory.filter(item => item !== query)].slice(0, 10)
    setSearchHistory(newHistory)

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('prompt_search_history', JSON.stringify(newHistory))
      } catch (error) {
        console.error('Failed to save search history:', error)
      }
    }
  }

  // Filter suggestions based on input
  useEffect(() => {
    if (inputValue.length >= 2) {
      const filtered = suggestions
        .concat(popularSearches)
        .concat(searchHistory)
        .filter((item, index, array) => array.indexOf(item) === index) // Remove duplicates
        .filter(item =>
          item.toLowerCase().includes(inputValue.toLowerCase())
        )
        .slice(0, 8)
      setFilteredSuggestions(filtered)
    } else {
      setFilteredSuggestions([])
    }
  }, [inputValue, suggestions, searchHistory])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange(newValue)
    setIsOpen(true)
  }

  const handleSearch = (query?: string) => {
    const searchQuery = query || inputValue
    if (!searchQuery.trim()) return

    onSearch(searchQuery)
    saveToHistory(searchQuery)
    setIsOpen(false)
    setShowRecentHistory(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
    onChange(suggestion)
    handleSearch(suggestion)
  }

  const handleClear = () => {
    setInputValue('')
    onChange('')
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const clearHistory = () => {
    setSearchHistory([])
    if (typeof window !== 'undefined') {
      localStorage.removeItem('prompt_search_history')
    }
  }

  const displayItems = [
    ...(inputValue.length >= 2 ? [
      {
        heading: '搜索建议',
        items: filteredSuggestions,
        icon: Search
      }
    ] : []),
    ...(showHistory && searchHistory.length > 0 && !showRecentHistory ? [
      {
        heading: '最近搜索',
        items: searchHistory.slice(0, 5),
        icon: Clock
      }
    ] : []),
    ...(showPopular ? [
      {
        heading: '热门搜索',
        items: popularSearches.slice(0, 5),
        icon: TrendingUp
      }
    ] : [])
  ].filter(group => group.items.length > 0)

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          onBlur={() => {
            // Delay closing to allow click on suggestions
            setTimeout(() => setIsOpen(false), 200)
          }}
          placeholder={placeholder}
          className="h-14 rounded-full pl-12 pr-20 text-base shadow-lg ring-1 ring-border"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {inputValue && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-8 w-8 rounded-full p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            onClick={() => handleSearch()}
            size="sm"
            className="h-10 rounded-full"
          >
            搜索
          </Button>
        </div>
      </div>

      {isOpen && displayItems.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-background border border-border rounded-lg shadow-lg overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            {displayItems.map((group, groupIndex) => (
              <div key={groupIndex}>
                {groupIndex > 0 && <div className="border-t border-border" />}
                <div className="px-4 py-2 bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <group.icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{group.heading}</span>
                    </div>
                    {group.heading === '最近搜索' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearHistory}
                        className="h-6 px-2 text-xs"
                      >
                        清除
                      </Button>
                    )}
                  </div>
                </div>
                <div className="py-1">
                  {group.items.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(item)}
                      className="w-full px-4 py-2 text-left hover:bg-muted transition-colors flex items-center gap-2"
                    >
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{item}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick access recent history button */}
      {showHistory && searchHistory.length > 0 && !isOpen && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowRecentHistory(!showRecentHistory)}
          className="absolute -bottom-8 left-0 h-6 px-2 text-xs text-muted-foreground"
        >
          <Clock className="h-3 w-3 mr-1" />
          最近搜索
        </Button>
      )}

      {/* Recent history display */}
      {showRecentHistory && searchHistory.length > 0 && (
        <div className="absolute -bottom-12 left-0 flex gap-2 flex-wrap">
          {searchHistory.slice(0, 5).map((item, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
              onClick={() => handleSuggestionClick(item)}
            >
              {item}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}