import { ElementRef, Inject, Injectable, InjectionToken, IterableChanges, IterableDiffer, IterableDiffers, KeyValueChanges, KeyValueDiffer, KeyValueDiffers, Renderer2, RendererFactory2, Type } from '@angular/core'
import { NgClass, NgStyle } from '@angular/common'
import { generateKeys, getEventName, isEvent } from '../utils/lang'
import { ViewController, ViewData } from '../utils/types'

export const VIEW_CONTROLLER_FACTORY = new InjectionToken<ViewControllerFactory[]>('ViewControllerFactory')

type Children = { [key: string]: ViewController } & { [index: number]: Node, length: number }

export class TextViewController implements ViewController {
  node: Text

  constructor(host: ViewControllers) {
    this.node = host.renderer.createText('')
  }

  update(view: ViewData): void {
    this.node.textContent = view.props!.textContent
  }

  destroy(): void { }
}

export class NativeViewController implements ViewController {
  node: Element

  private children: Children = { length: 0 } as Children
  private listeners: { [eventName: string]: () => void } = {}
  private propsDiffer?: KeyValueDiffer<string, any>
  private childrenDiffer?: IterableDiffer<string>
  private ngClass?: NgClass
  private ngStyle?: NgStyle

  constructor(private host: ViewControllers, private type: string) {
    this.node = host.renderer.createElement(type)
  }

  update(view: ViewData): void {
    if (!this.propsDiffer && view.props) {
      this.propsDiffer = this.host.kvDiffers.find(view.props).create()
    }
    if (!this.ngClass && view.className) {
      this.ngClass = new NgClass(
        this.host.iterDiffers,
        this.host.kvDiffers,
        new ElementRef(this.node),
        this.host.renderer,
      )
    }
    if (!this.ngStyle && view.style) {
      this.ngStyle = new NgStyle(
        this.host.kvDiffers,
        new ElementRef(this.node),
        this.host.renderer,
      )
    }
    if (!this.childrenDiffer && view.children) {
      this.childrenDiffer = this.host.iterDiffers.find(view.children).create()
    }
    if (this.propsDiffer) {
      const changes = this.propsDiffer.diff(view.props || {})
      if (changes) {
        this.updateProps(changes)
      }
    }
    if (this.ngClass) {
      this.ngClass.ngClass = view.className || ''
      this.ngClass.ngDoCheck()
    }
    if (this.ngStyle) {
      this.ngStyle.ngStyle = view.style || {}
      this.ngStyle.ngDoCheck()
    }
    if (this.childrenDiffer) {
      const { keys, map } = generateKeys(view.children || [])
      const changes = this.childrenDiffer.diff(keys)
      if (changes) {
        this.updateChildrenDynamic(changes, map)
      } else {
        this.updateChildrenStatic(map)
      }
    }
  }

  destroy(): void {
    for (let i = 0; i < this.children.length; i++) {
      this.host.renderer.removeChild(this.node, this.children[i])
    }
    this.children = { length: 0 } as Children
  }

  private updateProps(changes: KeyValueChanges<string, any>): void {
    changes.forEachRemovedItem(({ key }) => {
      if (isEvent(key)) {
        const eventName = getEventName(key)
        this.listeners[eventName]()
        delete this.listeners[eventName]
      } else {
        this.host.renderer.setProperty(this.node, key, '')
      }
    })
    changes.forEachAddedItem(({ key, currentValue }) => {
      if (isEvent(key)) {
        const eventName = getEventName(key)
        this.listeners[eventName] = this.host.renderer.listen(this.node, eventName, currentValue)
      } else {
        this.host.renderer.setProperty(this.node, key, currentValue)
      }
    })
    changes.forEachChangedItem(({ key, currentValue }) => {
      if (isEvent(key)) {
        const eventName = getEventName(key)
        this.listeners[eventName]()
        this.listeners[eventName] = this.host.renderer.listen(this.node, eventName, currentValue)
      } else {
        this.host.renderer.setProperty(this.node, key, currentValue)
      }
    })
  }

  private updateChildrenDynamic(changes: IterableChanges<string>, map: { [key: string]: [ViewData, number] }): void {
    const entries = Object.entries(map)
    const current = { length: entries.length } as Children
    const moved: { [index: number]: true } = {}
    const queue: number[] = []

    changes.forEachRemovedItem((record) => {
      this.host.renderer.removeChild(this.node, this.children[record.previousIndex!])
      this.children[record.item].destroy()
    })

    changes.forEachMovedItem((record) => {
      moved[record.currentIndex!] = true
      this.host.renderer.removeChild(this.node, this.children[record.previousIndex!])
    })

    for (const [key, [view, index]] of entries) {
      const exists = key in this.children
      const ctrl = current[key] = exists ? this.children[key] : this.host.create(view.type)
      current[index] = ctrl.node
      if (!exists || moved[index]) {
        queue.push(index)
      }
      ctrl.update(view)
    }

    for (let i = queue.length - 1; i >= 0; i--) {
      const node = current[queue[i]]
      if (queue[i] === current.length - 1) {
        this.host.renderer.appendChild(this.node, node)
      } else {
        const next = current[queue[i] + 1]
        this.host.renderer.insertBefore(this.node, node, next)
      }
    }

    this.children = current
  }

  private updateChildrenStatic(map: { [key: string]: [ViewData, number] }): void {
    const entries = Object.entries(map)
    for (const [key, [view]] of entries) {
      this.children[key].update(view)
    }
  }
}

export abstract class ViewControllerFactory {
  protected host: ViewControllers

  abstract support(type: string | Type<any>): boolean
  abstract create(type: string | Type<any>): ViewController
  register(host: ViewControllers) {
    this.host = host
  }
}

@Injectable()
export class TextViewControllerFactory extends ViewControllerFactory {
  support(type: string | Type<any>): type is '$text' {
    return type === '$text'
  }

  create(type: '$text'): TextViewController {
    return new TextViewController(this.host)
  }
}

@Injectable()
export class NativeViewControllerFactory extends ViewControllerFactory {
  support(type: string | Type<any>): boolean {
    return typeof type === 'string' && !type.startsWith('$')
  }

  create(type: string): NativeViewController {
    return new NativeViewController(this.host, type)
  }
}

@Injectable()
export class ViewControllers {
  renderer: Renderer2

  constructor(
    public kvDiffers: KeyValueDiffers,
    public iterDiffers: IterableDiffers,
    @Inject(VIEW_CONTROLLER_FACTORY) private factories: ViewControllerFactory[],
    rootRenderer: RendererFactory2
  ) {
    factories.forEach(x => x.register(this))
    this.renderer = rootRenderer.createRenderer(null, null)
  }

  create(type: string | Type<any>): ViewController {
    const factory = this.factories.find(x => x.support(type))
    if (!factory) {
      throw new Error(`Node type '${type}' not supported.`)
    }
    return factory.create(type)
  }
}
