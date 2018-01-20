import { Type } from '@angular/core'

export interface TypedChange<T> {
  previousValue: T
  currentValue: T
  firstChange: boolean
  isFirstChange(): boolean
}

export type TypedChanges<C> = {
  [P in keyof C]: TypedChange<C[P]>
}

export interface ElementDef {
  type: string | Type<any>
  props: { children?: NodeDef | NodeDef[], [prop: string]: any }
  key?: string | number
}

export interface NativeElementDef extends ElementDef {
  type: string
}

export interface ComponentElementDef extends ElementDef {
  type: Type<any>
}

export type NodeDef = ElementDef | string

export interface ViewData {
  type: string | Type<any>
  className: string | string[] | { [name: string]: boolean } | null
  style: { [name: string]: string } | null
  props: { [name: string]: any } | null
  children: ViewData[] | null
  key: string | number | null
}

export interface ViewController {
  node: Node
  update(data: ViewData): void
  destroy(): void
}

export interface BridgeContext {
  element: ElementDef
  context: object
}
