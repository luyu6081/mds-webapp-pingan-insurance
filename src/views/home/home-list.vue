<script lang="jsx">
  import Vue from 'vue'
  import ComTooltip from '@/common-components/tooltip'

  Vue.use(ComTooltip)

  export default {
    name: 'HomeList',

    functional: true,

    render: (h, {props: $props}) => {
      const {title, titleBg, data = []} = $props

      return (
        <div class="home-list">
          <header class="hItemImg" style={{backgroundImage: `url(${titleBg})`}}>
            <span class="imgTitle">{title}</span>
          </header>
          <dl>
            {
              data.map(item => (
                <div class="hItemContent-line overflow-hidden">
                  <dt class="hItemContent-tab-yw truncate">
                    <router-link to={{
                      name: 'detail',
                      params: {dataId: item.id},
                    }}>
                      <ComTooltip text={item.name}>
                        <span>{item.name}</span>
                      </ComTooltip>
                    </router-link>
                  </dt>
                  <dd class="hItemContent-tab-zw truncate">
                    <ComTooltip text={item.chineseName}>
                      <span>{item.chineseName}</span>
                    </ComTooltip>
                  </dd>
                </div>
              ))
            }
          </dl>
        </div>
      )
    },
  }
</script>

<style lang="scss">
  @import './variables.scss';

  .home-list {
    flex: 1;
    flex-basis: 0;

    dl {
      width: $list-width;
      margin: 0 auto;
      padding: 0 $list-padding;
    }

    .hItemImg {
      width: $list-width;
      height: 120px;
      margin: 0 auto;
      background-repeat: no-repeat;
      background-size: cover;
      position: relative;
    }

    .imgTitle {
      line-height: 24px;
      position: absolute;
      left: $list-padding;
      bottom: 1px;
      @apply text-xl text-white;
    }

    .hItemContent-line {
      @apply border-b border-solid border-gray-lighter;

      padding: 10px 0;
      line-height: 1.5;
      height: 63px;

      &:last-child {
        border: 0;
      }
    }

    .hItemContent-tab-yw {
      a {
        @apply text-theme-color;
      }
    }

    .hItemContent-tab-zw {
      @apply text-gray-darker;
      margin: 0;
    }
  }
</style>
