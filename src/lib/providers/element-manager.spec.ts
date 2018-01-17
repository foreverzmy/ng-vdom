import { Component, IterableDiffers, KeyValueDiffers, Renderer2 } from '@angular/core'
import { async, inject, TestBed } from '@angular/core/testing'
import { DOCUMENT } from '@angular/common'
import { ElementManagers, ELEMENT_MANAGER_FACTORY, NativeElementManagerFactory, TextElementManagerFactory } from './element-manager'

describe('ElementManager', () => {
  let host: Element

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: ELEMENT_MANAGER_FACTORY, useClass: NativeElementManagerFactory, multi: true },
        { provide: ELEMENT_MANAGER_FACTORY, useClass: TextElementManagerFactory, multi: true },
        ElementManagers,
      ]
    })
  }))

  beforeEach(inject([DOCUMENT], (doc: Document) => {
    host = doc.createElement('div')
  }))

  it(`should render text content`, inject([ElementManagers], (managers: ElementManagers) => {
    const content = `Hello World!`
    managers.find(content).create(content, host)

    expect(host.innerHTML).toBe('Hello World!')
  }))

  it(`should render empty element`, inject([ElementManagers], (managers: ElementManagers) => {
    const content = { type: 'input', props: {} }
    managers.find(content).create(content, host).update({}, [])

    expect(host.innerHTML).toBe('<input>')
  }))

  it(`should render element with properties`, inject([ElementManagers], (managers: ElementManagers) => {
    const content = { type: 'input', props: {} }
    managers.find(content).create(content, host).update({ className: 'foo', type: 'text' }, [])

    expect(host.innerHTML).toBe('<input class="foo" type="text">')
  }))

  it(`should render element with text child`, inject([ElementManagers], (managers: ElementManagers) => {
    const content = { type: 'p', props: {} }
    managers.find(content).create(content, host).update({}, ['Hello World!'])

    expect(host.innerHTML).toBe('<p>Hello World!</p>')
  }))
})
