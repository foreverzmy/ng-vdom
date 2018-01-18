import { Component } from '@angular/core'
import { async, TestBed } from '@angular/core/testing'
import { ElementManager, ElementManagerFactory, ElementManagers } from '../providers/element-manager'
import { Outlet } from './outlet.component'

describe('Outlet Component', () => {
  let manager: ElementManager
  let managerFactory: ElementManagerFactory
  let managers: ElementManagers

  beforeEach(() => {
    manager = {
      update() { },
      destroy() { },
    } as any
    managerFactory = {
      create() { },
    } as any
    managers = {
      find() { },
    } as any
  })

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        Outlet,
        TestComponent,
      ],
      providers: [
        { provide: ElementManagers, useFactory: () => managers }
      ]
    }).compileComponents()
  }))

  beforeEach(async(() => {
    spyOn(managers, 'find').and.returnValue(managerFactory)
    spyOn(managerFactory, 'create').and.returnValue(manager)
    spyOn(manager, 'update')
    spyOn(manager, 'destroy')
  }))

  it(`should render element on parent`, () => {
    const fixture = TestBed.createComponent(TestComponent)
    const testComp = fixture.componentInstance
    const testCompHost = fixture.debugElement.nativeElement

    fixture.detectChanges()

    expect(managers.find).toHaveBeenCalled()
    expect(managerFactory.create).toHaveBeenCalledWith(testComp.element, testCompHost)
    expect(manager.update).toHaveBeenCalledWith({ a: 1, b: 2 }, [])
  })

  it(`should remove element when destroyed`, () => {
    const fixture = TestBed.createComponent(TestComponent)

    fixture.detectChanges()
    fixture.destroy()

    expect(manager.destroy).toHaveBeenCalled()
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
