import { Component, TemplateRef } from '@angular/core'
import { createElement } from 'react'
import { VdomUtil } from './proxy'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app'
  element: TemplateRef<void>

  constructor(private v: VdomUtil) {
    this.element = v.embed(
      createElement('p', { className: 'foo' }, 'Hello V-DOM!')
    )
  }
}
