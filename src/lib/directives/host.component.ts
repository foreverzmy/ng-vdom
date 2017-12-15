import { Component, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core'
import { ElementManager, ElementManagers } from '../providers/element-manager'
import { ElementDef } from '../utils/types'

@Component({
  selector: 'niro-host',
  template: ``
})
export class HostComponent implements OnChanges {
  @Input() element: ElementDef
  @Input() context: object

  private rootElementManager: ElementManager | null = null

  private get hostElement(): Element {
    return this.hostElementRef.nativeElement
  }

  constructor(
    private hostElementRef: ElementRef,
    private managers: ElementManagers,
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.element.firstChange ||
        changes.element.previousValue.type !== changes.element.currentValue.type) {
      this.initView()
    }
    this.applyChanges()
  }

  private initView(): void {
    this.clearView()

    const factory = this.managers.find(this.element)
    this.rootElementManager = factory.create(this.element, this.hostElement)
  }

  private clearView(): void {
    if (this.rootElementManager) {
      this.rootElementManager.destroy()
    }
  }

  private applyChanges(): void {
    this.rootElementManager.update({ ...this.element.props, ...this.context })
  }
}
