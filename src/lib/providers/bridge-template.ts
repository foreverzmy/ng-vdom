import { InjectionToken, TemplateRef } from '@angular/core'
import { BridgeContext } from '../utils/types'

export const BRIDGE_TEMPLATE = new InjectionToken<TemplateRef<BridgeContext>>('BridgeTemplate')
