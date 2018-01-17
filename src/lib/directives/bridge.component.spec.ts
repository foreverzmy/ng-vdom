import { Directive, TemplateRef } from '@angular/core'
import { TestBed, async } from '@angular/core/testing'
import { Bridge } from './bridge.component'

describe('Bridge Component', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        Bridge,
        MockOutlet,
      ],
    }).compileComponents()
  }))

  it(`should provide template`, () => {
    const fixture = TestBed.createComponent(Bridge)
    const comp = fixture.debugElement.componentInstance
    expect(comp.template instanceof TemplateRef).toBe(true)
  })
})

@Directive({
  selector: 'niro-outlet',
  inputs: ['context', 'element'],
})
class MockOutlet { }
