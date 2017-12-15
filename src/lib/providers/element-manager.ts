import { Inject, Injectable, InjectionToken, IterableDiffer, IterableDifferFactory, IterableDiffers, KeyValueDiffer, KeyValueDifferFactory, KeyValueDiffers, Renderer2, RendererFactory2 } from '@angular/core'
import { ChildDef, NativeElementDef } from '../utils/types'

export const ELEMENT_MANAGER_FACTORY = new InjectionToken<ElementManagerFactory[]>('ElementManagerFactory')

export interface ElementManager {
  update(props: any): void
  destroy(): void
}

export class TextElementManager implements ElementManager {
  private text: Text

  constructor(content: string, private parent: Element, private renderer: Renderer2) {
    this.text = renderer.createText(content)
    this.renderer.appendChild(this.parent, this.text)
  }

  update(): void { }

  destroy(): void {
    this.renderer.removeChild(this.parent, this.text)
  }
}

export class NativeElementManager implements ElementManager {
  private element: Element
  private childManagers: ElementManager[] = []

  constructor(
    private elementDef: NativeElementDef,
    private parent: Element,
    private renderer: Renderer2,
    private propsDiffer: KeyValueDiffer<string, any>,
    private childrenDiffer: IterableDiffer<any>,
    private managers: ElementManagers,
  ) {
    this.element = renderer.createElement(elementDef.type)
    this.renderer.appendChild(this.parent, this.element)
  }

  update(props: any): void {
    const { children, ...normalProps } = this.elementDef.props
    const propChanges = this.propsDiffer.diff(normalProps)
    propChanges.forEachItem(({ key, currentValue }) => {
      this.renderer.setProperty(this.element, key, currentValue)
    })
    const normalizedChildren = Array.isArray(children) ? children : [children]
    const childChanges = this.childrenDiffer.diff(normalizedChildren)
    childChanges.forEachAddedItem((record) => {
      const child = record.item
      const manager = this.managers.find(child).create(child, this.element)
      this.childManagers.push(manager)
    })
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
  constructor(private rootRenderer: RendererFactory2) { super() }

  support(childDef: ChildDef): childDef is string {
    return typeof childDef === 'string'
  }

  create(content: string, parent: Element): TextElementManager {
    return new TextElementManager(content, parent, this.rootRenderer.createRenderer(null, null))
  }
}

@Injectable()
export class NativeElementManagerFactory extends ElementManagerFactory {
  private renderer: Renderer2
  private kvDifferFactory: KeyValueDifferFactory
  private iterDifferFactory: IterableDifferFactory

  constructor(
    rootRenderer: RendererFactory2,
    kvDiffers: KeyValueDiffers,
    iterDiffers: IterableDiffers,
  ) {
    super()

    this.renderer = rootRenderer.createRenderer(null, null)
    this.kvDifferFactory = kvDiffers.find({})
    this.iterDifferFactory = iterDiffers.find([])
  }

  support(childDef: ChildDef): childDef is NativeElementDef {
    return (childDef && typeof childDef === 'object') && (typeof childDef.type === 'string')
  }

  create(elementDef: NativeElementDef, parent: Element): NativeElementManager {
    const kvDiffer = this.kvDifferFactory.create<string, any>()
    const iterDiffer = this.iterDifferFactory.create()
    return new NativeElementManager(elementDef, parent, this.renderer, kvDiffer, iterDiffer, this.managers)
  }
}

@Injectable()
export class ElementManagers {
  constructor(
    @Inject(ELEMENT_MANAGER_FACTORY) private factories: ElementManagerFactory[],
  ) {
    factories.forEach(x => x.register(this))
  }

  find(element: ChildDef): ElementManagerFactory {
    const factory = this.factories.find(x => x.support(element))
    if (!factory) {
      throw new Error(`Invalid element '${element}'.`)
    }
    return factory
  }
}
