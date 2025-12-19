'use client'

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SimpleSearchProps {
  value: string
  onChange: (value: string) => void
  onSearch: (query: string) => void
  placeholder?: string
}

export default function SimpleSearch({
  value,
  onChange,
  onSearch,
  placeholder = '搜索提示词...'
}: SimpleSearchProps) {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setLocalValue(newValue)
    onChange(newValue)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onSearch(localValue)
    }
  }

  const handleSearch = () => {
    onSearch(localValue)
  }

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          value={localValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-14 rounded-full pl-12 pr-20 text-base shadow-lg ring-1 ring-border"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <Button onClick={handleSearch} size="sm" className="h-10 rounded-full">
            搜索
          </Button>
        </div>
      </div>
    </div>
  )
}