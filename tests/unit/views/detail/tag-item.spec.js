import {shallowMount} from '@vue/test-utils'

import TagItem from '@/common-components/tag-list/tag-item.vue'

const SELECTOR_LABEL = '.tag-item-word'
const SELECTOR_COUNTER = '.tag-count-nums'

describe('views/detail', () => {
  describe('<TagItem>', () => {
    test('普通渲染', () => {
      const wrapper = shallowMount(TagItem, {
        propsData: {
          name: 'hello world',
          score: 233,
        },
      })

      expect(wrapper.find(SELECTOR_LABEL).text()).toBe('hello world')
      expect(wrapper.find(SELECTOR_COUNTER).text()).toBe('233')
    })

    test.skip('事件', () => {
      const wrapper = shallowMount(TagItem, {
        propsData: {
          name: 'hello world',
          score: 233,
        },
      })

      wrapper.vm.handleMouseenter()
      wrapper.vm.handleMouseleave()
      wrapper.vm.handleAddCount()
      wrapper.vm.handleSubCount()
      // wrapper.vm.removeTag()

      expect(wrapper.emittedByOrder().map(ev => ev.name)).toEqual([
        'mouseenter',
        'mouseleave',
        'add-count',
        'sub-count',
        // 'remove',
      ])
    })
  })
})
