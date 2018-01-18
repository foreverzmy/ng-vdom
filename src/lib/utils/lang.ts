import { ChildDef } from './types'

export function normalizeProps(child: ChildDef, locals: any = {}): { props: any, children: ChildDef[] } {
  if (typeof child === 'string') {
    return { props: {}, children: [] }
  }

  const { children: rawChildren = [], ...props } = { ...child.props, ...locals }
  const children = Array.isArray(rawChildren) ? rawChildren : [rawChildren]

  return { props, children }
}
