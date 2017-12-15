import { Type, ViewContainerRef, ViewRef } from '@angular/core'

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
  props: { children?: ChildDef | ChildDef[], [prop: string]: any }
  key: string | number
}

export interface NativeElementDef extends ElementDef {
  type: string
}

export interface ComponentElementDef extends ElementDef {
  type: Type<any>
}

export type ChildDef = ElementDef | string

export interface BridgeContext {
  element: ElementDef
  context: object
}
