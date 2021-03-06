import { async, inject, TestBed } from '@angular/core/testing'
import { CommonModule, DOCUMENT } from '@angular/common'
import { ViewController, ViewData } from '../utils/types'
import { VIEW_CONTROLLER_FACTORY, NativeViewControllerFactory, TextViewControllerFactory, ViewControllers } from './view-controller'

describe('ViewController', () => {
  let host: Element
  let ctrl: ViewController

  function toHtml(controller: ViewController): string {
    host.appendChild(controller.node)
    return host.innerHTML
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: VIEW_CONTROLLER_FACTORY, useClass: TextViewControllerFactory, multi: true },
        { provide: VIEW_CONTROLLER_FACTORY, useClass: NativeViewControllerFactory, multi: true },
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

  it(`should support static properties`, inject([ViewControllers], (ctrls: ViewControllers) => {
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

  it(`should support static className`, inject([ViewControllers], (ctrls: ViewControllers) => {
    ctrl = ctrls.create('input')

    ctrl.update(makeElement('input', { className: 'foo' }))

    expect(toHtml(ctrl)).toBe('<input class="foo">')
  }))

  it(`should support appending className`, inject([ViewControllers], (ctrls: ViewControllers) => {
    ctrl = ctrls.create('input')

    ctrl.update(makeElement('input', { className: ['foo'] }))
    ctrl.update(makeElement('input', { className: ['foo', 'bar'] }))

    expect(toHtml(ctrl)).toBe('<input class="foo bar">')
  }))

  it(`should support removing className`, inject([ViewControllers], (ctrls: ViewControllers) => {
    ctrl = ctrls.create('input')

    ctrl.update(makeElement('input', { className: ['foo', 'bar'] }))
    ctrl.update(makeElement('input', { className: ['bar'] }))

    expect(toHtml(ctrl)).toBe('<input class="bar">')
  }))

  it(`should support static style`, inject([ViewControllers], (ctrls: ViewControllers) => {
    ctrl = ctrls.create('input')

    ctrl.update(makeElement('input', { style: { height: '100px' } }))

    expect(toHtml(ctrl)).toBe('<input style="height: 100px;">')
  }))

  it(`should support appending style`, inject([ViewControllers], (ctrls: ViewControllers) => {
    ctrl = ctrls.create('input')

    ctrl.update(makeElement('input', { style: { height: '100px' } }))
    ctrl.update(makeElement('input', { style: { height: '100px', width: '100px' } }))

    expect(toHtml(ctrl)).toBe('<input style="height: 100px; width: 100px;">')
  }))

  it(`should support removing style`, inject([ViewControllers], (ctrls: ViewControllers) => {
    ctrl = ctrls.create('input')

    ctrl.update(makeElement('input', { style: { height: '100px', width: '100px' } }))
    ctrl.update(makeElement('input', { style: { width: '100px' } }))

    expect(toHtml(ctrl)).toBe('<input style="width: 100px;">')
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

  it(`should support appending children`, inject([ViewControllers], (ctrls: ViewControllers) => {
    ctrl = ctrls.create('p')

    ctrl.update(makeElement('p', {}, [makeElement('span', {}, [makeText('Hello')])]))
    ctrl.update(makeElement('p', {}, [
      makeElement('span', {}, [makeText('Hello')]),
      makeText(' '),
      makeElement('span', {}, [makeText('World')]),
    ]))

    expect(toHtml(ctrl)).toBe('<p><span>Hello</span> <span>World</span></p>')
  }))

  it(`should support removing children`, inject([ViewControllers], (ctrls: ViewControllers) => {
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

  it(`should support swap children`, inject([ViewControllers], (ctrls: ViewControllers) => {
    ctrl = ctrls.create('p')

    ctrl.update(makeElement('p', {}, [
      makeElement('span', {}, [makeText('Hello')]),
      makeText(' '),
      makeElement('span', {}, [makeText('World')]),
      makeText('!'),
    ]))
    ctrl.update(makeElement('p', {}, [
      makeText('!'),
      makeText(' '),
      makeElement('span', {}, [makeText('World')]),
      makeElement('span', {}, [makeText('Hello')]),
    ]))

    expect(toHtml(ctrl)).toBe('<p>! <span>World</span><span>Hello</span></p>')
  }))

  it(`should support insert children`, inject([ViewControllers], (ctrls: ViewControllers) => {
    ctrl = ctrls.create('p')

    ctrl.update(makeElement('p', {}, [
      makeElement('span', {}, [makeText('Hello')]),
      makeText(' '),
      makeElement('span', {}, [makeText('World')]),
      makeText('!'),
    ]))
    ctrl.update(makeElement('p', {}, [
      makeElement('span', {}, [makeText('World')]),
      makeText(' '),
      makeElement('i'),
      makeElement('span', {}, [makeText('Hello')]),
      makeText('!'),
    ]))

    expect(toHtml(ctrl)).toBe('<p><span>World</span> <i></i><span>Hello</span>!</p>')
  }))

  it(`should add event listener`, inject([ViewControllers], (ctrls: ViewControllers) => {
    ctrl = ctrls.create('button')
    let flag = false

    ctrl.update(makeElement('button', { onClick: () => flag = true }))
    ctrl.node.dispatchEvent(new CustomEvent('click'))

    expect(flag).toBe(true)
  }))

  it(`should remove event listener`, inject([ViewControllers], (ctrls: ViewControllers) => {
    ctrl = ctrls.create('button')
    let flag = false

    ctrl.update(makeElement('button', { onClick: () => flag = true }))
    ctrl.update(makeElement('button', {}))
    ctrl.node.dispatchEvent(new CustomEvent('click'))

    expect(flag).toBe(false)
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
