import React, { useState, useEffect, useMemo, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import 'katex/dist/katex.min.css'
import RemarkMath from 'remark-math'
import RemarkBreaks from 'remark-breaks'
import RehypeKatex from 'rehype-katex'
import RemarkGfm from 'remark-gfm'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { atelierHeathLight } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import type { ThinkBlockStatus } from '@/app/components/chat/think-block'
import { ThinkBlockHeader, ThinkBlockContent } from '@/app/components/chat/think-block'

interface MarkdownProps {
  content: string
  className?: string
  isStreaming?: boolean
}

// Maximum characters allowed before think/details block
const MAX_CHARS_BEFORE_BLOCK = 10

const extractThinkContent = (
  rawContent: string,
): {
  hasThinkBlock: boolean
  thinkContent: string
  mainContent: string
  thinkClosed: boolean
} => {
  // Support both <think> and <details> tags
  const thinkStartTag = '<think>'
  const thinkEndTag = '</think>'

  // Check for <think> tag
  const thinkStartIndex = rawContent.indexOf(thinkStartTag)
  if (thinkStartIndex !== -1) {
    // Allow limited characters before <think>
    const contentBeforeThink = rawContent.substring(0, thinkStartIndex).trim()
    const isThinkAtEffectiveStart
      = thinkStartIndex === 0
      || contentBeforeThink.length === 0
      || contentBeforeThink.length <= MAX_CHARS_BEFORE_BLOCK

    if (isThinkAtEffectiveStart) {
      const thinkContentStart = thinkStartIndex + thinkStartTag.length
      const endTagIndex = rawContent.indexOf(thinkEndTag, thinkContentStart)

      if (endTagIndex !== -1) {
        const thinkContent = rawContent.substring(thinkContentStart, endTagIndex)
        const mainContent = rawContent.substring(endTagIndex + thinkEndTag.length)
        return {
          hasThinkBlock: true,
          thinkContent,
          mainContent,
          thinkClosed: true,
        }
      }

      // Unclosed <think> tag
      const thinkContent = rawContent.substring(thinkContentStart)
      return {
        hasThinkBlock: true,
        thinkContent,
        mainContent: '',
        thinkClosed: false,
      }
    }
  }

  // Check for <details> tag
  const detailsStartRegex = /<details(?:\s[^>]*)?>/i
  const detailsMatch = rawContent.match(detailsStartRegex)

  if (detailsMatch) {
    const detailsStartIndex = rawContent.indexOf(detailsMatch[0])
    const contentBeforeDetails = rawContent.substring(0, detailsStartIndex).trim()
    const isDetailsAtEffectiveStart
      = detailsStartIndex === 0
      || contentBeforeDetails.length === 0
      || contentBeforeDetails.length <= MAX_CHARS_BEFORE_BLOCK

    if (isDetailsAtEffectiveStart) {
      const detailsStartTag = detailsMatch[0]
      const detailsEndTag = '</details>'
      const detailsContentStart = detailsStartIndex + detailsStartTag.length
      const endTagIndex = rawContent.indexOf(detailsEndTag, detailsContentStart)

      if (endTagIndex !== -1) {
        // Extract content inside <details>, remove <summary> if present
        let detailsContent = rawContent.substring(detailsContentStart, endTagIndex)
        const summaryRegex = /<summary[^>]*>[\s\S]*?<\/summary>/i
        detailsContent = detailsContent.replace(summaryRegex, '').trim()

        const mainContent = rawContent.substring(endTagIndex + detailsEndTag.length)
        return {
          hasThinkBlock: true,
          thinkContent: detailsContent,
          mainContent,
          thinkClosed: true,
        }
      }

      // Unclosed <details> tag
      let detailsContent = rawContent.substring(detailsContentStart)
      const summaryRegex = /<summary[^>]*>[\s\S]*?<\/summary>/i
      detailsContent = detailsContent.replace(summaryRegex, '').trim()

      return {
        hasThinkBlock: true,
        thinkContent: detailsContent,
        mainContent: '',
        thinkClosed: false,
      }
    }
  }

  // No think block found
  return {
    hasThinkBlock: false,
    thinkContent: '',
    mainContent: rawContent,
    thinkClosed: false,
  }
}

export function Markdown({
  content,
  className = '',
  isStreaming = false,
}: MarkdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const prevThinkStatus = useRef<ThinkBlockStatus>()

  const { hasThinkBlock, thinkContent, mainContent, thinkClosed } = useMemo(
    () => extractThinkContent(content),
    [content],
  )

  // Determine think block status
  const thinkStatus: ThinkBlockStatus = useMemo(() => {
    if (!hasThinkBlock) { return 'completed' }
    if (isStreaming && !thinkClosed) { return 'thinking' }
    return 'completed'
  }, [hasThinkBlock, isStreaming, thinkClosed])

  // Auto-expand/collapse logic
  useEffect(() => {
    if (hasThinkBlock) {
      // Auto-expand when thinking starts
      if (thinkStatus === 'thinking' && !isOpen)
        setIsOpen(true)

      // Auto-collapse when thinking is finished
      else if (prevThinkStatus.current === 'thinking' && thinkStatus === 'completed')
        setIsOpen(false)
    }
    // Store current status for next render
    prevThinkStatus.current = thinkStatus
  }, [hasThinkBlock, thinkStatus, isOpen])

  const toggleOpen = () => setIsOpen(!isOpen)

  const renderMarkdown = (markdownContent: string) => (
    <ReactMarkdown
      remarkPlugins={[RemarkMath, RemarkGfm, RemarkBreaks]}
      rehypePlugins={[
        RehypeKatex,
      ]}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')
          return (!inline && match)
            ? (
              <SyntaxHighlighter
                {...props}
                children={String(children).replace(/\n$/, '')}
                style={atelierHeathLight}
                language={match[1]}
                showLineNumbers
                PreTag="div"
              />
            )
            : (
              <code {...props} className={className}>
                {children}
              </code>
            )
        },
      }}
      linkTarget={'_blank'}
    >
      {markdownContent}
    </ReactMarkdown>
  )

  return (
    <div className={`markdown-body ${className}`}>
      {hasThinkBlock && (
        <>
          <ThinkBlockHeader
            status={thinkStatus}
            isOpen={isOpen}
            onToggle={toggleOpen}
          />
          <ThinkBlockContent
            markdownContent={thinkContent}
            isOpen={isOpen}
          />
        </>
      )}

      {mainContent && hasThinkBlock && (
        <div className="main-content">
          {renderMarkdown(mainContent)}
        </div>
      )}

      {!hasThinkBlock && (
        renderMarkdown(content)
      )}
    </div>
  )
}
