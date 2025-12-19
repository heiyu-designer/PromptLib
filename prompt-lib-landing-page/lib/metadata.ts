import { Metadata } from 'next'
import { getSettings } from '@/app/actions/copy'

// Base metadata
export const baseMetadata: Metadata = {
  title: {
    default: 'PromptLib - 发现高质量 AI 提示词',
    template: '%s | PromptLib'
  },
  description: '精选编程、写作和自动化提示词库，助力您提升 AI 交互效率',
  keywords: ['AI提示词', 'ChatGPT', 'Claude', 'Midjourney', 'Coze', '编程助手', '写作工具', '自动化'],
  authors: [{ name: 'PromptLib Team' }],
  creator: 'PromptLib',
  publisher: 'PromptLib',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com',
    title: 'PromptLib - 发现高质量 AI 提示词',
    description: '精选编程、写作和自动化提示词库，助力您提升 AI 交互效率',
    siteName: 'PromptLib',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PromptLib - 发现高质量 AI 提示词',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PromptLib - 发现高质量 AI 提示词',
    description: '精选编程、写作和自动化提示词库，助力您提升 AI 交互效率',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    yahoo: process.env.YAHOO_SITE_VERIFICATION,
  },
}

// Generate page metadata
export async function generatePageMetadata(options: {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  noIndex?: boolean
}): Promise<Metadata> {
  const settings = await getSettings()
  const siteName = settings.settings?.site_name || 'PromptLib'

  const metadata: Metadata = {
    ...baseMetadata,
    title: options.title || `${siteName} - 发现高质量 AI 提示词`,
    description: options.description || baseMetadata.description,
    keywords: options.keywords || baseMetadata.keywords,
    ...(options.noIndex && { robots: { index: false, follow: false } }),
  }

  if (options.image) {
    metadata.openGraph = {
      ...metadata.openGraph,
      images: [
        {
          url: options.image,
          width: 1200,
          height: 630,
          alt: options.title || siteName,
        },
      ],
    }
    metadata.twitter = {
      ...metadata.twitter,
      images: [options.image],
    }
  }

  return metadata
}

// Generate prompt page metadata
export async function generatePromptMetadata(prompt: any): Promise<Metadata> {
  const title = prompt.title
  const description = prompt.description || `${prompt.title} - 高质量 AI 提示词`
  const keywords = [
    ...prompt.tags?.map((tag: any) => tag.name) || [],
    'AI提示词',
    'ChatGPT',
    'Claude',
    prompt.title
  ].filter(Boolean)

  const image = prompt.cover_image_url || '/og-image.png'

  return generatePageMetadata({
    title,
    description,
    keywords,
    image,
  })
}

// Generate tag page metadata
export async function generateTagMetadata(tag: any, promptCount?: number): Promise<Metadata> {
  const title = `${tag.name} 提示词`
  const description = `探索 ${tag.name} 相关的高质量 AI 提示词${promptCount ? `（共 ${promptCount} 个）` : ''}`
  const keywords = [tag.name, 'AI提示词', 'ChatGPT', 'Claude', tag.name]

  return generatePageMetadata({
    title,
    description,
    keywords,
  })
}

// Generate search results metadata
export function generateSearchMetadata(query: string): Metadata {
  const title = query ? `搜索 "${query}" 的提示词` : '搜索提示词'
  const description = query
    ? `搜索 "${query}" 相关的高质量 AI 提示词，找到最适合您需求的提示词`
    : '搜索高质量 AI 提示词，支持按标签、关键词筛选'

  return generatePageMetadata({
    title,
    description,
    keywords: query ? [query, '搜索', 'AI提示词'] : ['搜索', 'AI提示词'],
    noIndex: !query, // Don't index empty search pages
  })
}

// Generate structured data (JSON-LD)
export function generateStructuredData(type: 'WebSite' | 'Article' | 'Person', data: any) {
  const baseStructuredData = {
    '@context': 'https://schema.org',
    '@type': type,
  }

  switch (type) {
    case 'WebSite':
      return {
        ...baseStructuredData,
        name: data.siteName || 'PromptLib',
        description: data.description || '发现高质量 AI 提示词',
        url: data.url || process.env.NEXT_PUBLIC_SITE_URL,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${process.env.NEXT_PUBLIC_SITE_URL}/?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      }

    case 'Article':
      return {
        ...baseStructuredData,
        headline: data.title,
        description: data.description,
        image: data.image,
        author: {
          '@type': 'Person',
          name: data.authorName || 'PromptLib Team',
        },
        publisher: {
          '@type': 'Organization',
          name: data.siteName || 'PromptLib',
          logo: {
            '@type': 'ImageObject',
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/icon.png`,
          },
        },
        datePublished: data.datePublished,
        dateModified: data.dateModified,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': data.url,
        },
      }

    case 'Person':
      return {
        ...baseStructuredData,
        name: data.name,
        description: data.description,
        url: data.url,
        image: data.image,
        sameAs: data.sameAs || [],
      }

    default:
      return baseStructuredData
  }
}

// Generate breadcrumbs structured data
export function generateBreadcrumbs(breadcrumbs: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  }
}