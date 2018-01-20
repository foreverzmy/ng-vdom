import { ComponentFactoryResolver, Injector, NgModule, TemplateRef } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { Bridge } from './directives/bridge.component'
import { Outlet } from './directives/outlet.component'
import { BRIDGE_TEMPLATE } from './providers/bridge-template'
import { ELEMENT_MANAGER_FACTORY, ViewControllers, NativeViewControllerFactory, TextViewControllerFactory } from './providers/element-manager'
import { VdomUtil } from './providers/vdom-util'
import { BridgeContext } from './utils/types'

export function createBridgeTemplate(cfResolver: ComponentFactoryResolver, injector: Injector): TemplateRef<BridgeContext> {
    const hostElement = document.createElement('div')
    const factory = cfResolver.resolveComponentFactory(Bridge)
    const ref = factory.create(injector, undefined, hostElement)
    return ref.instance.template
}

@NgModule({
  imports: [],
  declarations: [
    Bridge,
    Outlet,
  ],
  entryComponents: [
    Bridge,
  ],
  providers: [
    { provide: ELEMENT_MANAGER_FACTORY, useClass: NativeViewControllerFactory, multi: true },
    { provide: ELEMENT_MANAGER_FACTORY, useClass: TextViewControllerFactory, multi: true },
    { provide: BRIDGE_TEMPLATE, useFactory: createBridgeTemplate, deps: [ComponentFactoryResolver, Injector] },
    ViewControllers,
    VdomUtil,
  ]
})
export class VdomModule { }

export {
  VdomUtil,
}
