import { Type } from '@angular/core'
import { NodeDef, ViewData } from './types'

export function isEvent(prop: string): boolean {
  return prop.startsWith('on')
}

export function getEventName(prop: string): string {
  return prop.replace('on', '').toLowerCase()
}

export function generateViewData(node: NodeDef, locals: any = {}): ViewData {
  if (typeof node === 'string') {
    return {
      type: '$text',
      className: null,
      style: null,
      props: { textContent: node },
      children: null,
      key: null,
    }
  }

  const { children: subNodeDef = [], className = null, style = null, key = null, ...props } = { ...node.props, ...locals }
  const subNodes: NodeDef[] = Array.isArray(subNodeDef) ? subNodeDef : [subNodeDef]
  const subViews = subNodes.length > 0 ? subNodes.map(generateViewData) : null

  return {
    type: node.type,
    className,
    style,
    props,
    key,
    children: subViews,
  }
}

const names: Map<string, number> = new Map()
const types: WeakMap<Type<any>, string> = new WeakMap()

function getTypeName(type: string | Type<any>): string {
  if (typeof type === 'string') { return type }
  if (types.has(type)) { return types.get(type)! }

  if (!names.has(type.name)) {
    names.set(type.name, 0)
  }

  const id = names.get(type.name)!
  names.set(type.name, id + 1)

  const typeName = `$type$${type.name}$${id}`
  if (!types.has(type)) {
    types.set(type, typeName)
  }

  return typeName
}

export function generateKeys(views: ViewData[]): { keys: string[], map: { [key: string]: [ViewData, number] } } {
  const counts: Map<string, number> = new Map()
  const keys: string[] = []
  const map: { [key: string]: [ViewData, number] } = {}
  for (let i = 0; i < views.length; i++) {
    const view = views[i]
    const typeName = getTypeName(view.type)

    if (!counts.has(typeName)) {
      counts.set(typeName, 0)
    }

    const id = counts.get(typeName)!
    counts.set(typeName, id + 1)

    const key = `${typeName}_${id}`
    keys.push(key)
    map[key] = [view, i]
  }
  return { keys, map }
}
