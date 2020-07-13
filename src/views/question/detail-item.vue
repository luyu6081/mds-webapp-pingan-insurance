<template>
  <div class="info">
    <header class="info__header">
      <common-popcard :item="item" :img-url="item.img" :title="`${item.name} (${item.position})`">
        <div slot="img" class="info-img">
          <div v-if="item.img" class="img" :style="{backgroundImage: `url(${item.img})`}"></div>
          <img v-else src="@/assets/icon-account.svg" alt class="img img-def"/>
        </div>
        <div slot="action">
          <img class="email" src="@/assets/icon-email.svg">
        </div>
      </common-popcard>
      <span class="text">{{item.title}}</span>
      <span class="info_date">{{item.date}}</span>
    </header>

    <div class="info_desc flex">
      <ej-text-renderer :value="item.desc"/>
    </div>
  </div>
</template>

<script>
  import Vue from 'vue'

  import {TextRenderer as EjTextRenderer} from '@ej/ui'

  import CommonPopcard from '@/common-components/popcard'

  Vue.use(CommonPopcard)

  export default {
    name: 'DetailItem',

    components: {
      EjTextRenderer,
    },

    props: {
      item: {
        type: Object,
      },
    },

    data () {
      return {
        defaultUserImg: '@/assets/icon-account.svg',
      }
    },
  }
</script>

<style lang="scss">

  .info {
    $padding-left: 29px;
    $avatar-size: 24px;

    &__header {
      display: flex;
      align-items: center;
      margin-bottom: 5px;

      .info-img {
        width: $avatar-size;
        height: $avatar-size;
        border-radius: 50%;
        overflow: hidden;
        flex: none;
        margin-right: $padding-left - $avatar-size;

        .img {
          width: 100%;
          height: 100%;
          background-size: cover;
        }

        .email {
          width: 20px;
          height: 16px;
        }

      }

      .text {
        font-weight: bold;
        flex: none;
        @apply text-lg;
      }

      .info_date {
        flex: none;
        margin-left: auto;
        @apply text-sm text-gray-dark;
      }
    }

    .info_desc {
      line-height: 20px;
      padding-left: $padding-left;
      @apply text-base text-gray-dark;
    }

    .app-text-renderer p {
      margin-top: 0;
    }
  }
</style>
