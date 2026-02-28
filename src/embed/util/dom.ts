export function el<K extends keyof HTMLElementTagNameMap>(tag: K, attrs?: Record<string, string>) {
  const node = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  }
  return node;
}

export function qs(base: string, path: string) {
  return `${base.replace(/\/$/, '')}${path}`;
}
