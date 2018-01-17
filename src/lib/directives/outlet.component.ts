import { Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, Renderer2, RendererFactory2 } from '@angular/core'
import { ElementManager, ElementManagers } from '../providers/element-manager'
import { ElementDef } from '../utils/types'

@Component({
  selector: 'niro-outlet',
  template: ``
})
export class Outlet implements OnChanges, OnDestroy {
  @Input() element: ElementDef
  @Input() context: object

  private manager: ElementManager | null = null
  private parent: Element

  constructor(
    rootRenderer: RendererFactory2,
    hostElementRef: ElementRef,
    private managers: ElementManagers,
  ) {
    const renderer = rootRenderer.createRenderer(null, null)
    this.parent = renderer.parentNode(hostElementRef.nativeElement)
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.element.firstChange ||
        changes.element.previousValue.type !== changes.element.currentValue.type) {
      this.initView()
    }
    this.applyChanges()
  }

  ngOnDestroy(): void {
    this.clearView()
  }

  private initView(): void {
    this.clearView()

    const factory = this.managers.find(this.element)
    this.manager = factory.create(this.element, this.parent)
  }

  private clearView(): void {
    if (this.manager) {
      this.manager.destroy()
    }
  }

  private applyChanges(): void {
    const { children: rawChildren = [], ...props } = { ...this.element.props, ...this.context }
    const children = Array.isArray(rawChildren) ? rawChildren : [rawChildren]
    this.manager!.update(props, children)
  }
}
