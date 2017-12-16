import { ComponentFactoryResolver, Injector, NgModule, TemplateRef } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { BridgeComponent } from './directives/bridge.component'
import { OutletComponent } from './directives/outlet.component'
import { BRIDGE_TEMPLATE } from './providers/bridge-template'
import { ELEMENT_MANAGER_FACTORY, ElementManagers, NativeElementManagerFactory, TextElementManagerFactory } from './providers/element-manager'
import { VdomUtil } from './providers/vdom-util'
import { BridgeContext } from './utils/types'

export function createBridgeTemplate(cfResolver: ComponentFactoryResolver, injector: Injector): TemplateRef<BridgeContext> {
    const hostElement = document.createElement('div')
    const factory = cfResolver.resolveComponentFactory(BridgeComponent)
    const ref = factory.create(injector, undefined, hostElement)
    return ref.instance.template
}

@NgModule({
  imports: [],
  declarations: [
    BridgeComponent,
    OutletComponent,
  ],
  entryComponents: [
    BridgeComponent,
  ],
  providers: [
    { provide: ELEMENT_MANAGER_FACTORY, useClass: NativeElementManagerFactory, multi: true },
    { provide: ELEMENT_MANAGER_FACTORY, useClass: TextElementManagerFactory, multi: true },
    { provide: BRIDGE_TEMPLATE, useFactory: createBridgeTemplate, deps: [ComponentFactoryResolver, Injector] },
    ElementManagers,
    VdomUtil,
  ]
})
export class VdomModule { }

export {
  VdomUtil,
}
