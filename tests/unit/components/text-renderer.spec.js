import {shallowMount} from '@vue/test-utils'

import TextRenderer from '@/common-components/text-renderer'

const ROOT_CLASSNAME = 'common-text-renderer'

describe('TextRenderer', () => {
  test('渲染单行普通文本', () => {
    const wrapper = shallowMount(TextRenderer, {
      propsData: {
        value: `It's a good day today.`,
      },
    })

    expect(wrapper.html()).toBe(`<article class="common-text-renderer"><p>It's a good day today.</p></article>`)
  })

  test('渲染多行普通文本', () => {
    const wrapper = shallowMount(TextRenderer, {
      propsData: {
        value: `
          It's a good day today.
          But tomorrow is going to rain.
          
          Change is nature. 
        `.trim(),
      },
    })

    expect(wrapper.is('article') && wrapper.classes(ROOT_CLASSNAME)).toBe(true)
    expect(wrapper.element.childNodes.length).toBe(3)
    expect(wrapper.findAll('p').length).toBe(3)
  })

  test('渲染带用户引用的内容', () => {
    const wrapper = shallowMount(TextRenderer, {
      propsData: {
        value: `I'm not sure if @tom 's email address is tom@example.com.`,
      },
    })

    const userMetions = wrapper.findAll('span.mention-user')
    expect(userMetions.length).toBe(1)
    expect(userMetions.at(0).text()).toBe('@tom')
  })

  test('渲染位于文本串开头的用户引用', () => {
    const wrapper = shallowMount(TextRenderer, {
      propsData: {
        value: `@jack , is @tom 's email address tom@example.com?`,
      },
    })

    const userMentions = wrapper.findAll('span.mention-user')
    expect(userMentions.length).toBe(2)
    expect(userMentions.wrappers.map(w => w.text())).toEqual(['@jack', '@tom'])
  })

  test('处理空文本串', () => {
    expect(shallowMount(TextRenderer).element.childNodes.length).toBe(0)
    expect(shallowMount(TextRenderer, {propsData: {value: ''}}).element.childNodes.length).toBe(0)
    expect(shallowMount(TextRenderer, {propsData: {value: null}}).element.childNodes.length).toBe(0)
    expect(shallowMount(TextRenderer, {propsData: {value: ' \n \n '}}).element.childNodes.length).toBe(0)
  })
})
