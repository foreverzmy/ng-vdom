import { Inject, Injectable, InjectionToken, IterableDiffer, IterableDifferFactory, IterableDiffers, KeyValueDiffer, KeyValueDifferFactory, KeyValueDiffers, Renderer2, RendererFactory2 } from '@angular/core'
import { ChildDef, NativeElementDef } from '../utils/types'

export const ELEMENT_MANAGER_FACTORY = new InjectionToken<ElementManagerFactory[]>('ElementManagerFactory')

export interface ElementManager {
  update(props: any, children: ChildDef[]): void
  destroy(): void
}

export class TextElementManager implements ElementManager {
  private text: Text
  private renderer: Renderer2

  constructor(content: string, private parent: Element, managers: ElementManagers) {
    this.renderer = managers.renderer
    this.text = this.renderer.createText(content)
    this.renderer.appendChild(this.parent, this.text)
  }

  update(): void { }

  destroy(): void {
    this.renderer.removeChild(this.parent, this.text)
  }
}

export class NativeElementManager implements ElementManager {
  private element: Element
  private renderer: Renderer2
  private kvDiffers: KeyValueDiffers
  private iterDiffers: IterableDiffers
  private childManagers: ElementManager[] = []
  private propsDiffer?: KeyValueDiffer<string, any>
  private childrenDiffer?: IterableDiffer<ChildDef>

  constructor(
    private type: string,
    private parent: Element,
    private managers: ElementManagers,
  ) {
    this.renderer = managers.renderer
    this.kvDiffers = managers.kvDiffers
    this.iterDiffers = managers.iterDiffers
    this.element = this.renderer.createElement(type)
    this.renderer.appendChild(parent, this.element)
  }

  update(props: any, children: ChildDef[]): void {
    if (!this.propsDiffer && Object.keys(props).length > 0) {
      this.propsDiffer = this.kvDiffers.find(props).create()
    }
    if (!this.childrenDiffer && children.length > 0) {
      this.childrenDiffer = this.iterDiffers.find(children).create()
    }

    if (this.propsDiffer) {
      const propChanges = this.propsDiffer.diff(props)
      if (propChanges) {
        propChanges.forEachItem(({ key, currentValue }) => {
          this.renderer.setProperty(this.element, key, currentValue)
        })
      }
    }

    if (this.childrenDiffer) {
      const childChanges = this.childrenDiffer.diff(children)
      if (childChanges) {
        childChanges.forEachAddedItem((record) => {
          const child = record.item
          const manager = this.managers.find(child).create(child, this.element)
          this.childManagers.push(manager)
        })
      }
    }
  }

  destroy(): void {
    for (const manager of this.childManagers) {
      manager.destroy()
    }

    this.childManagers = []
    this.renderer.removeChild(this.parent, this.element)
  }
}

export abstract class ElementManagerFactory {
  protected managers: ElementManagers

  abstract support(element: ChildDef): boolean
  abstract create(element: ChildDef, parent: Element): ElementManager
  register(managers: ElementManagers) {
    this.managers = managers
  }
}

@Injectable()
export class TextElementManagerFactory extends ElementManagerFactory {
  support(childDef: ChildDef): childDef is string {
    return typeof childDef === 'string'
  }

  create(content: string, parent: Element): TextElementManager {
    return new TextElementManager(content, parent, this.managers)
  }
}

@Injectable()
export class NativeElementManagerFactory extends ElementManagerFactory {
  support(childDef: ChildDef): childDef is NativeElementDef {
    return typeof childDef === 'object' ? (typeof childDef.type === 'string') : false
  }

  create(elementDef: NativeElementDef, parent: Element): NativeElementManager {
    return new NativeElementManager(elementDef.type, parent, this.managers)
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
