import { Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, Renderer2, RendererFactory2 } from '@angular/core'
import { ElementManager, ElementManagers } from '../providers/element-manager'
import { ElementDef } from '../utils/types'

@Component({
  selector: 'niro-outlet',
  template: ``
})
export class OutletComponent implements OnChanges, OnDestroy {
  @Input() element: ElementDef
  @Input() context: object

  renderer: Renderer2

  private manager: ElementManager | null = null

  private get hostElement(): Element {
    return this.hostElementRef.nativeElement
  }

  constructor(
    rootRenderer: RendererFactory2,
    private hostElementRef: ElementRef,
    private managers: ElementManagers,
  ) {
    this.renderer = rootRenderer.createRenderer(null, null)
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
    const parent = this.renderer.parentNode(this.hostElement)
    this.manager = factory.create(this.element, parent)
  }

  private clearView(): void {
    if (this.manager) {
      this.manager.destroy()
    }
  }

  private applyChanges(): void {
    this.manager.update({ ...this.element.props, ...this.context })
  }
}
