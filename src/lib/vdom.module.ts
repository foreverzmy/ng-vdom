import { ComponentFactoryResolver, Injector, NgModule, TemplateRef } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { Bridge } from './directives/bridge.component'
import { Outlet } from './directives/outlet.component'
import { BRIDGE_TEMPLATE } from './providers/bridge-template'
import { VIEW_CONTROLLER_FACTORY, ViewControllers, NativeViewControllerFactory, TextViewControllerFactory } from './providers/view-controller'
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
    { provide: VIEW_CONTROLLER_FACTORY, useClass: NativeViewControllerFactory, multi: true },
    { provide: VIEW_CONTROLLER_FACTORY, useClass: TextViewControllerFactory, multi: true },
    { provide: BRIDGE_TEMPLATE, useFactory: createBridgeTemplate, deps: [ComponentFactoryResolver, Injector] },
    ViewControllers,
    VdomUtil,
  ]
})
export class VdomModule { }

export {
  VdomUtil,
}
