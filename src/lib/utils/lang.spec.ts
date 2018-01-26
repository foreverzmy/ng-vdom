import { generateViewData } from './lang'

describe('Language utils', () => {
  describe('generateViewData', () => {
    it ('should support string type', () => {
      const view = generateViewData('foo')

      expect(view.type).toBe('$text')
      expect(view!.props!.textContent).toBe('foo')
    })

    it ('should support number type', () => {
      const view = generateViewData(42)

      expect(view.type).toBe('$text')
      expect(view.props!.textContent).toBe('42')
    })

    it ('should support boolean type', () => {
      const view = generateViewData(true)

      expect(view.type).toBe('$text')
      expect(view.props!.textContent).toBe('true')
    })

    it ('should support native element', () => {
      const view = generateViewData({
        type: 'p',
        props: {},
      })

      expect(view.type).toBe('p')
    })

    it ('should support null properties', () => {
      const view = generateViewData({
        type: 'p',
        props: null,
      })

      expect(view.type).toBe('p')
    })
  })
})
