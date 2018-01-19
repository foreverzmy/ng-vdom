import { async, inject, TestBed } from '@angular/core/testing'
import { DOCUMENT } from '@angular/common'
import { ElementManager, ElementManagers, ELEMENT_MANAGER_FACTORY, NativeElementManagerFactory, TextElementManagerFactory } from './element-manager'

describe('ElementManager', () => {
  let host: Element
  let manager: ElementManager

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

  afterEach(() => {
    manager.destroy()
  })

  it(`should render text content`, inject([ElementManagers], (managers: ElementManagers) => {
    const content = `Hello World!`
    manager = managers.find(content).create(content, host)

    expect(host.innerHTML).toBe('Hello World!')
  }))

  it(`should render empty element`, inject([ElementManagers], (managers: ElementManagers) => {
    const content = { type: 'input', props: {} }
    manager = managers.find(content).create(content, host)

    manager.update({}, [])

    expect(host.innerHTML).toBe('<input>')
  }))

  it(`should render element with properties`, inject([ElementManagers], (managers: ElementManagers) => {
    const content = { type: 'input', props: {} }
    manager = managers.find(content).create(content, host)

    manager.update({ className: 'foo', type: 'text' }, [])

    expect(host.innerHTML).toBe('<input class="foo" type="text">')
  }))

  it(`should support appending properties`, inject([ElementManagers], (managers: ElementManagers) => {
    const content = { type: 'input', props: {} }
    manager = managers.find(content).create(content, host)

    manager.update({ className: 'foo' }, [])
    manager.update({ className: 'foo', type: 'text' }, [])

    expect(host.innerHTML).toBe('<input class="foo" type="text">')
  }))

  it(`should support removing properties`, inject([ElementManagers], (managers: ElementManagers) => {
    const content = { type: 'input', props: {} }
    manager = managers.find(content).create(content, host)

    manager.update({ className: 'foo', type: 'text' }, [])
    manager.update({ className: 'foo' }, [])

    expect(host.innerHTML).toBe('<input class="foo" type="">')
  }))

  it(`should render element with text child`, inject([ElementManagers], (managers: ElementManagers) => {
    const content = { type: 'p', props: {} }
    manager = managers.find(content).create(content, host)

    manager.update({}, ['Hello World!'])

    expect(host.innerHTML).toBe('<p>Hello World!</p>')
  }))

  it(`should render element with single element child`, inject([ElementManagers], (managers: ElementManagers) => {
    const content = { type: 'p', props: {} }
    const span = { type: 'span', props: { children: ['Hello World!'] } }
    manager = managers.find(content).create(content, host)

    manager.update({}, [span])

    expect(host.innerHTML).toBe('<p><span>Hello World!</span></p>')
  }))

  it(`should render element with mixed children`, inject([ElementManagers], (managers: ElementManagers) => {
    const content = { type: 'p', props: {} }
    const span1 = { type: 'span', props: { children: ['Hello'] } }
    const span2 = { type: 'span', props: { children: ['World'] } }
    manager = managers.find(content).create(content, host)

    manager.update({}, [span1, ' ', span2, '!'])

    expect(host.innerHTML).toBe('<p><span>Hello</span> <span>World</span>!</p>')
  }))

  it(`should support appending children`, inject([ElementManagers], (managers: ElementManagers) => {
    const content = { type: 'p', props: {} }
    const createSpan1 = () => ({ type: 'span', props: { children: ['Hello'] } })
    const createSpan2 = () => ({ type: 'span', props: { children: ['World'] } })
    manager = managers.find(content).create(content, host)

    manager.update({}, [createSpan1()])
    manager.update({}, [createSpan1(), ' ', createSpan2()])

    expect(host.innerHTML).toBe('<p><span>Hello</span> <span>World</span></p>')
  }))

  xit(`should support removing children`, inject([ElementManagers], (managers: ElementManagers) => {
    const content = { type: 'p', props: {} }
    const createSpan1 = () => ({ type: 'span', props: { children: ['Hello'] } })
    const createSpan2 = () => ({ type: 'span', props: { children: ['World'] } })
    manager = managers.find(content).create(content, host)

    manager.update({}, [createSpan1(), ' ', createSpan2(), '!'])
    manager.update({}, [createSpan1(), ' ', createSpan2()])
    expect(host.innerHTML).toBe('<p><span>Hello</span> <span>World</span></p>')
  }))
})
