import React, { useState, useEffect } from 'react'
import { marked } from 'marked'
import hljs from 'highlight.js'

/**
 * MarkdownPreview Component
 * Renders markdown with syntax highlighting and table of contents
 * Task 23.6: Create markdown preview with syntax highlighting and TOC
 */
export function MarkdownPreview({ content, filePath }) {
  const [html, setHtml] = useState('')
  const [toc, setToc] = useState([])
  const [activeHeading, setActiveHeading] = useState(null)

  useEffect(() => {
    if (content) {
      renderMarkdown(content)
    }
  }, [content])

  function renderMarkdown(markdown) {
    // Configure marked with syntax highlighting
    marked.setOptions({
      breaks: true,
      gfm: true,
      pedantic: false,
      renderer: new marked.Renderer(),
    })

    // Custom code renderer with syntax highlighting
    const renderer = new marked.Renderer()
    renderer.code = (code, language) => {
      const validLanguage = hljs.getLanguage(language) ? language : 'plaintext'
      const highlighted = hljs.highlight(code, { language: validLanguage }).value
      return `<pre><code class="hljs language-${validLanguage}">${highlighted}</code></pre>`
    }

    // Extract headings for TOC
    const headings = []
    renderer.heading = (text, level, raw) => {
      const id = raw.toLowerCase().replace(/[^\w]+/g, '-')
      headings.push({ level, text, id })
      return `<h${level} id="${id}">${text}</h${level}>`
    }

    marked.setOptions({ renderer })
    const htmlContent = marked(markdown)
    setHtml(htmlContent)
    setToc(headings)
  }

  function scrollToHeading(id) {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setActiveHeading(id)
    }
  }

  return (
    <div style={{ display: 'flex', gap: '1.5rem', height: '100%' }}>
      {/* Table of Contents */}
      {toc.length > 0 && (
        <div
          style={{
            flex: '0 0 250px',
            borderRight: '1px solid var(--border)',
            paddingRight: '1rem',
            maxHeight: '100%',
            overflowY: 'auto',
          }}
        >
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
            📑 TABLE OF CONTENTS
          </h4>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {toc.map((heading) => (
              <button
                key={heading.id}
                onClick={() => scrollToHeading(heading.id)}
                style={{
                  textAlign: 'left',
                  padding: `${0.5 + (heading.level - 1) * 0.25}rem 0.5rem`,
                  paddingLeft: `${0.5 + (heading.level - 1) * 0.75}rem`,
                  background: activeHeading === heading.id ? 'var(--blue)22' : 'transparent',
                  border: 'none',
                  borderLeft: activeHeading === heading.id ? '2px solid var(--blue)' : '2px solid transparent',
                  color: activeHeading === heading.id ? 'var(--blue)' : 'var(--text)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  borderRadius: 3,
                }}
              >
                {heading.text}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Markdown Content */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          fontSize: '0.95rem',
          lineHeight: 1.7,
          color: 'var(--text)',
        }}
      >
        {filePath && (
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
            📄 {filePath}
          </div>
        )}

        <div
          className="markdown-content"
          dangerouslySetInnerHTML={{ __html: html }}
          style={{
            '& h1': { fontSize: '1.8rem', fontWeight: 700, marginTop: '1.5rem', marginBottom: '0.75rem' },
            '& h2': { fontSize: '1.5rem', fontWeight: 700, marginTop: '1.25rem', marginBottom: '0.6rem' },
            '& h3': { fontSize: '1.2rem', fontWeight: 600, marginTop: '1rem', marginBottom: '0.5rem' },
            '& h4': { fontSize: '1rem', fontWeight: 600, marginTop: '0.75rem', marginBottom: '0.4rem' },
            '& p': { marginBottom: '0.75rem' },
            '& ul, & ol': { marginLeft: '1.5rem', marginBottom: '0.75rem' },
            '& li': { marginBottom: '0.25rem' },
            '& code': { background: 'var(--gray-50)', padding: '0.2rem 0.4rem', borderRadius: 3, fontFamily: 'monospace', fontSize: '0.9em' },
            '& pre': { background: 'var(--gray-50)', padding: '1rem', borderRadius: 6, overflow: 'auto', marginBottom: '0.75rem' },
            '& pre code': { background: 'transparent', padding: 0 },
            '& blockquote': { borderLeft: '3px solid var(--blue)', paddingLeft: '1rem', marginLeft: 0, marginBottom: '0.75rem', color: 'var(--text-muted)' },
            '& table': { borderCollapse: 'collapse', width: '100%', marginBottom: '0.75rem' },
            '& th, & td': { border: '1px solid var(--border)', padding: '0.5rem', textAlign: 'left' },
            '& th': { background: 'var(--gray-50)', fontWeight: 600 },
            '& a': { color: 'var(--blue)', textDecoration: 'none' },
            '& a:hover': { textDecoration: 'underline' },
          }}
        />
      </div>
    </div>
  )
}

export default MarkdownPreview
