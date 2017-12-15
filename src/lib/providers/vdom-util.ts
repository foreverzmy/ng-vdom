import { Inject, Injectable, TemplateRef } from '@angular/core'
import { BRIDGE_TEMPLATE } from './bridge-template'
import { BridgeContext, ElementDef } from '../utils/types'

@Injectable()
export class VdomUtil {
  constructor(@Inject(BRIDGE_TEMPLATE) private template: TemplateRef<BridgeContext>) { }

  embed(elementDef: ElementDef): TemplateRef<any> {
    const wrapped: TemplateRef<BridgeContext> = Object.create(this.template)
    wrapped.createEmbeddedView = (rawContext: any) => {
      const context = { context: rawContext, element: elementDef }
      return this.template.createEmbeddedView(context)
    }
    return wrapped
  }
}
