import { Component } from '@angular/core'
import { async, inject, TestBed } from '@angular/core/testing'
import { DOCUMENT } from '@angular/common'
import { ViewControllers } from '../providers/element-manager'
import { ViewController } from '../utils/types'
import { Outlet } from './outlet.component'

describe('Outlet Component', () => {
  let ctrl: ViewController
  let ctrls: ViewControllers

  beforeEach(() => {
    ctrl = {
      update() { },
      destroy() { },
    } as any
    ctrls = {
      create() { },
    } as any
  })

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        Outlet,
        TestComponent,
      ],
      providers: [
        { provide: ViewControllers, useFactory: () => ctrls }
      ]
    }).compileComponents()
  }))

  beforeEach(inject([DOCUMENT], (doc: Document) => {
    ctrl.node = doc.createElement('span')
  }))

  beforeEach(async(() => {
    spyOn(ctrls, 'create').and.returnValue(ctrl)
    spyOn(ctrl, 'update')
    spyOn(ctrl, 'destroy')
  }))

  it(`should render element on parent`, () => {
    const fixture = TestBed.createComponent(TestComponent)
    const testComp = fixture.componentInstance
    const testCompHost = fixture.debugElement.nativeElement

    fixture.detectChanges()

    expect(ctrls.create).toHaveBeenCalledWith('p')
    expect(ctrl.update).toHaveBeenCalledWith({
      type: 'p',
      className: null,
      style: null,
      props: { a: 1, b: 2 },
      children: null,
      key: null,
    })
  })

  it(`should remove element when destroyed`, () => {
    const fixture = TestBed.createComponent(TestComponent)

    fixture.detectChanges()
    fixture.destroy()

    expect(ctrl.destroy).toHaveBeenCalled()
  })
})

@Component({
  template: `
    <niro-outlet [element]="element" [context]="context"></niro-outlet>
  `
})
class TestComponent {
  element = { type: 'p', props: { a: 1 } }
  context = { b: 2 }
}
