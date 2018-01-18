import { Inject, Injectable, InjectionToken, IterableDiffer, IterableDiffers, KeyValueDiffer, KeyValueDiffers, Renderer2, RendererFactory2 } from '@angular/core'
import { normalizeProps } from '../utils/lang'
import { ChildDef, NativeElementDef } from '../utils/types'

export const ELEMENT_MANAGER_FACTORY = new InjectionToken<ElementManagerFactory[]>('ElementManagerFactory')

export interface ElementManager {
  update(props: any, children: ChildDef[]): void
  destroy(): void
}

export class TextElementManager implements ElementManager {
  private text: Text

  constructor(content: string, private parent: Element, private host: ElementManagers) {
    this.text = this.host.renderer.createText(content)
    this.host.renderer.appendChild(this.parent, this.text)
  }

  update(): void { }

  destroy(): void {
    this.host.renderer.removeChild(this.parent, this.text)
  }
}

export class NativeElementManager implements ElementManager {
  private element: Element
  private childManagers: Map<ChildDef, ElementManager> = new Map()
  private propsDiffer?: KeyValueDiffer<string, any>
  private childrenDiffer?: IterableDiffer<ChildDef>

  constructor(
    private type: string,
    private parent: Element,
    private host: ElementManagers,
  ) {
    this.element = this.host.renderer.createElement(type)
    this.host.renderer.appendChild(parent, this.element)
  }

  update(props: any, children: ChildDef[]): void {
    if (!this.propsDiffer && Object.keys(props).length > 0) {
      this.propsDiffer = this.host.kvDiffers.find(props).create()
    }
    if (!this.childrenDiffer && children.length > 0) {
      this.childrenDiffer = this.host.iterDiffers.find(children).create()
    }

    if (this.propsDiffer) {
      const propChanges = this.propsDiffer.diff(props)
      if (propChanges) {
        propChanges.forEachItem(({ key, currentValue }) => {
          this.host.renderer.setProperty(this.element, key, currentValue)
        })
      }
    }

    if (this.childrenDiffer) {
      const childChanges = this.childrenDiffer.diff(children)
      if (childChanges) {
        childChanges.forEachAddedItem((record) => {
          const child = record.item
          const manager = this.host.find(child).create(child, this.element)
          this.childManagers.set(child, manager)
        })
        childChanges.forEachItem((record) => {
          const child = record.item
          const manager = this.childManagers.get(child)!
          const { props: subProps, children: subChildren } = normalizeProps(child)
          manager.update(subProps, subChildren)
        })
      }
    }
  }

  destroy(): void {
    this.childManagers.forEach(manager => manager.destroy())
    this.childManagers.clear()
    this.host.renderer.removeChild(this.parent, this.element)
  }
}

export abstract class ElementManagerFactory {
  protected host: ElementManagers

  abstract support(element: ChildDef): boolean
  abstract create(element: ChildDef, parent: Element): ElementManager
  register(host: ElementManagers) {
    this.host = host
  }
}

@Injectable()
export class TextElementManagerFactory extends ElementManagerFactory {
  support(childDef: ChildDef): childDef is string {
    return typeof childDef === 'string'
  }

  create(content: string, parent: Element): TextElementManager {
    return new TextElementManager(content, parent, this.host)
  }
}

@Injectable()
export class NativeElementManagerFactory extends ElementManagerFactory {
  support(childDef: ChildDef): childDef is NativeElementDef {
    return typeof childDef === 'object' ? (typeof childDef.type === 'string') : false
  }

  create(elementDef: NativeElementDef, parent: Element): NativeElementManager {
    return new NativeElementManager(elementDef.type, parent, this.host)
  }
}

@Injectable()
export class ElementManagers {
  renderer: Renderer2

  constructor(
    public kvDiffers: KeyValueDiffers,
    public iterDiffers: IterableDiffers,
    @Inject(ELEMENT_MANAGER_FACTORY) private factories: ElementManagerFactory[],
    rootRenderer: RendererFactory2
  ) {
    factories.forEach(x => x.register(this))
    this.renderer = rootRenderer.createRenderer(null, null)
  }

  find(element: ChildDef): ElementManagerFactory {
    const factory = this.factories.find(x => x.support(element))
    if (!factory) {
      throw new Error(`Invalid element '${element}'.`)
    }
    return factory
  }
}
