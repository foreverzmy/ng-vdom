import { Component, ElementRef, Input, OnChanges, OnDestroy, Renderer2, RendererFactory2, SimpleChanges } from '@angular/core'
import { ViewControllers } from '../providers/element-manager'
import { generateViewData } from '../utils/lang'
import { ElementDef, ViewController } from '../utils/types'

@Component({
  selector: 'niro-outlet',
  template: ``
})
export class Outlet implements OnChanges, OnDestroy {
  @Input() element: ElementDef
  @Input() context: object

  private renderer: Renderer2
  private ctrl: ViewController | null = null
  private parent: Element

  constructor(
    rootRenderer: RendererFactory2,
    private hostElementRef: ElementRef,
    private ctrls: ViewControllers,
  ) {
    this.renderer = rootRenderer.createRenderer(null, null)
    this.parent = this.renderer.parentNode(hostElementRef.nativeElement)
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
    this.ctrl = this.ctrls.create(this.element.type)
    this.renderer.insertBefore(this.parent, this.ctrl.node, this.hostElementRef.nativeElement)
  }

  private clearView(): void {
    if (this.ctrl) {
      this.ctrl.destroy()
    }
  }

  private applyChanges(): void {
    const view = generateViewData(this.element, this.context)
    this.ctrl!.update(view)
  }
}
