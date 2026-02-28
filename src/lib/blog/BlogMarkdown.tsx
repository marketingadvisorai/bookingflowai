'use client';

import DOMPurify from 'isomorphic-dompurify';

/**
 * Simple markdown-to-HTML renderer with XSS sanitization.
 * Supports: h2, h3, p, ul/ol, li, blockquote, strong, em, code, hr, links
 */
function markdownToHtml(md: string): string {
  const lines = md.split('\n');
  let html = '';
  let inUl = false;
  let inOl = false;
  let inBlockquote = false;
  let buffer = '';

  function closeLists() {
    if (inUl) { html += '</ul>'; inUl = false; }
    if (inOl) { html += '</ol>'; inOl = false; }
  }

  function closeBlockquote() {
    if (inBlockquote) { html += '</blockquote>'; inBlockquote = false; }
  }

  function inlineFormat(text: string): string {
    // Links
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    // Bold
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // Italic
    text = text.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
    // Inline code
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    return text;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Empty line
    if (trimmed === '') {
      closeLists();
      closeBlockquote();
      continue;
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      closeLists(); closeBlockquote();
      html += `<h3>${inlineFormat(trimmed.slice(4))}</h3>`;
      continue;
    }
    if (trimmed.startsWith('## ')) {
      closeLists(); closeBlockquote();
      html += `<h2>${inlineFormat(trimmed.slice(3))}</h2>`;
      continue;
    }

    // HR
    if (trimmed === '---' || trimmed === '***') {
      closeLists(); closeBlockquote();
      html += '<hr />';
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      closeLists();
      if (!inBlockquote) { html += '<blockquote>'; inBlockquote = true; }
      html += `<p>${inlineFormat(trimmed.slice(2))}</p>`;
      continue;
    }

    // Unordered list
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      closeBlockquote();
      if (inOl) { html += '</ol>'; inOl = false; }
      if (!inUl) { html += '<ul>'; inUl = true; }
      html += `<li>${inlineFormat(trimmed.slice(2))}</li>`;
      continue;
    }

    // Ordered list
    const olMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (olMatch) {
      closeBlockquote();
      if (inUl) { html += '</ul>'; inUl = false; }
      if (!inOl) { html += '<ol>'; inOl = true; }
      html += `<li>${inlineFormat(olMatch[2])}</li>`;
      continue;
    }

    // Paragraph
    closeLists(); closeBlockquote();
    html += `<p>${inlineFormat(trimmed)}</p>`;
  }

  closeLists();
  closeBlockquote();
  return html;
}

interface BlogMarkdownProps {
  content: string;
}

export function BlogMarkdown({ content }: BlogMarkdownProps) {
  const rawHtml = markdownToHtml(content);
  const html = DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: ['h2', 'h3', 'p', 'ul', 'ol', 'li', 'blockquote', 'strong', 'em', 'code', 'hr', 'a', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });

  return (
    <div
      className="blog-prose"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
