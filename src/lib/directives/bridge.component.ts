import { Component, TemplateRef, ViewChild } from '@angular/core'
import { BridgeContext } from '../utils/types'

@Component({
  selector: 'niro-bridge',
  template: `
    <ng-template let-element="element" let-context="context">
      <niro-outlet [element]="element" [context]="context"></niro-outlet>
    </ng-template>
  `
})
export class BridgeComponent {
  @ViewChild(TemplateRef) template: TemplateRef<BridgeContext>
}
