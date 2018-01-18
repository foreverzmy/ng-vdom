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

  it(`should render element with single element child`, inject([ElementManagers], (managers: ElementManagers) => {
    const content = { type: 'p', props: {} }
    const span = { type: 'span', props: { children: ['Hello World!'] } }
    managers.find(content).create(content, host).update({}, [span])
    expect(host.innerHTML).toBe('<p><span>Hello World!</span></p>')
  }))

  it(`should render element with mixed children`, inject([ElementManagers], (managers: ElementManagers) => {
    const content = { type: 'p', props: {} }
    const span1 = { type: 'span', props: { children: ['Hello'] } }
    const span2 = { type: 'span', props: { children: ['World'] } }
    managers.find(content).create(content, host).update({}, [span1, ' ', span2, '!'])
    expect(host.innerHTML).toBe('<p><span>Hello</span> <span>World</span>!</p>')
  }))

  it(`should support appending children`, inject([ElementManagers], (managers: ElementManagers) => {
    const content = { type: 'p', props: {} }
    const span1 = { type: 'span', props: { children: ['Hello'] } }
    const span2 = { type: 'span', props: { children: ['World'] } }
    const manager = managers.find(content).create(content, host)

    manager.update({}, [span1])
    manager.update({}, [span1, ' ', span2])
    expect(host.innerHTML).toBe('<p><span>Hello</span> <span>World</span></p>')
  }))

  it(`should support removing children`, inject([ElementManagers], (managers: ElementManagers) => {
    const content = { type: 'p', props: {} }
    const span1 = { type: 'span', props: { children: ['Hello'] } }
    const span2 = { type: 'span', props: { children: ['World'] } }
    const manager = managers.find(content).create(content, host)

    manager.update({}, [span1, ' ', span2, '!'])
    manager.update({}, [span1, ' ', span2])
    expect(host.innerHTML).toBe('<p><span>Hello</span> <span>World</span></p>')
  }))
})
