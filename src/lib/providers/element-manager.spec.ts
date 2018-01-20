import { async, inject, TestBed } from '@angular/core/testing'
import { DOCUMENT } from '@angular/common'
import { ViewController, ViewData } from '../utils/types'
import { ELEMENT_MANAGER_FACTORY, NativeViewControllerFactory, TextViewControllerFactory, ViewControllers } from './element-manager'

describe('ElementManager', () => {
  let host: Element
  let ctrl: ViewController

  function toHtml(controller: ViewController): string {
    host.appendChild(controller.node)
    return host.innerHTML
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: ELEMENT_MANAGER_FACTORY, useClass: TextViewControllerFactory, multi: true },
        { provide: ELEMENT_MANAGER_FACTORY, useClass: NativeViewControllerFactory, multi: true },
        ViewControllers,
      ]
    })
  }))

  beforeEach(inject([DOCUMENT], (doc: Document) => {
    host = doc.createElement('div')
  }))

  afterEach(() => {
    ctrl.destroy()
  })

  it(`should render text content`, inject([ViewControllers], (ctrls: ViewControllers) => {
    ctrl = ctrls.create('$text')

    ctrl.update(makeText(`Hello World!`))

    expect(toHtml(ctrl)).toBe('Hello World!')
  }))

  it(`should render empty element`, inject([ViewControllers], (ctrls: ViewControllers) => {
    ctrl = ctrls.create('input')

    ctrl.update(makeElement('input'))

    expect(toHtml(ctrl)).toBe('<input>')
  }))

  it(`should render element with properties`, inject([ViewControllers], (ctrls: ViewControllers) => {
    ctrl = ctrls.create('input')

    ctrl.update(makeElement('input', { tabIndex: 1, type: 'text' }))

    expect(toHtml(ctrl)).toBe(`<input tabindex="1" type="text">`)
  }))

  it(`should support appending properties`, inject([ViewControllers], (ctrls: ViewControllers) => {
    ctrl = ctrls.create('input')

    ctrl.update(makeElement('input', { tabIndex: 1 }))
    ctrl.update(makeElement('input', { tabIndex: 1, type: 'text' }))

    expect(toHtml(ctrl)).toBe('<input tabindex="1" type="text">')
  }))

  it(`should support removing properties`, inject([ViewControllers], (ctrls: ViewControllers) => {
    ctrl = ctrls.create('input')

    ctrl.update(makeElement('input', { tabIndex: 1, type: 'text' }))
    ctrl.update(makeElement('input', { tabIndex: 1 }))

    expect(toHtml(ctrl)).toBe('<input tabindex="1" type="">')
  }))

  it(`should render element with text child`, inject([ViewControllers], (ctrls: ViewControllers) => {
    ctrl = ctrls.create('p')

    ctrl.update(makeElement('p', {}, [makeText('Hello World!')]))

    expect(toHtml(ctrl)).toBe('<p>Hello World!</p>')
  }))

  it(`should render element with single element child`, inject([ViewControllers], (ctrls: ViewControllers) => {
    const content = { type: 'p', props: {} }
    const span = { type: 'span', props: { children: ['Hello World!'] } }
    ctrl = ctrls.create('p')

    ctrl.update(makeElement('p', {}, [makeElement('span', {}, [makeText('Hello World!')])]))

    expect(toHtml(ctrl)).toBe('<p><span>Hello World!</span></p>')
  }))

  it(`should render element with mixed children`, inject([ViewControllers], (ctrls: ViewControllers) => {
    ctrl = ctrls.create('p')

    ctrl.update(makeElement('p', {}, [
      makeElement('span', {}, [makeText('Hello')]),
      makeText(' '),
      makeElement('span', {}, [makeText('World')]),
      makeText('!'),
    ]))

    expect(toHtml(ctrl)).toBe('<p><span>Hello</span> <span>World</span>!</p>')
  }))

  xit(`should support appending children`, inject([ViewControllers], (ctrls: ViewControllers) => {
    ctrl = ctrls.create('p')

    ctrl.update(makeElement('p', {}, [makeElement('span', {}, [makeText('Hello')])]))
    ctrl.update(makeElement('p', {}, [
      makeElement('span', {}, [makeText('Hello')]),
      makeText(' '),
      makeElement('span', {}, [makeText('World')]),
    ]))

    expect(toHtml(ctrl)).toBe('<p><span>Hello</span> <span>World</span></p>')
  }))

  xit(`should support removing children`, inject([ViewControllers], (ctrls: ViewControllers) => {
    ctrl = ctrls.create('p')

    ctrl.update(makeElement('p', {}, [
      makeElement('span', {}, [makeText('Hello')]),
      makeText(' '),
      makeElement('span', {}, [makeText('World')]),
      makeText('!'),
    ]))
    ctrl.update(makeElement('p', {}, [
      makeElement('span', {}, [makeText('World')]),
      makeText('!'),
    ]))

    expect(toHtml(ctrl)).toBe('<p><span>World</span>!</p>')
  }))
})

function makeText(content: string): ViewData {
  return {
    type: '$text',
    className: null,
    style: null,
    props: { textContent: content },
    children: null,
    key: null,
  }
}

function makeElement(type: string, properties?: { [name: string]: any }, children?: ViewData[]): ViewData {
  const { className, style, ...props } = properties || {} as any
  return {
    type,
    className,
    style,
    props,
    children: children || null,
    key: null,
  }
}
