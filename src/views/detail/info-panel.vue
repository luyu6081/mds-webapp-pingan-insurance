<script lang="jsx">
  import Vue from 'vue'

  import {UserCard} from '@ej/ui'

  import runtimeArgs from '@/runtime-args'
  import {formatDate} from '@/utils/date.js'
  import {toImgHref} from '@/utils/common.js'
  import TagList from '@/common-components/tag-list'

  Vue.use(TagList)

  Vue.use(UserCard)

  /** 下载地址 */
  const FILE_DOWNLOAD_ADDRESS = runtimeArgs.VUE_APP_DOWNLOAD_HTTP

  export default {
    functional: true,

    render: (h, {parent, props, data}) => {
      const storage = {
        TABLE: '表',
        FILE: '数据文件',
      }

      const info = data.attrs.dataDetails
      const techLinkmanUser = info && info.techLinkman
      const busiLinkmanUser = info && info.busiLinkman
      let techLinkmanCardData = {}
      let busiLinkmanCardData = {}

      const _avatarUrl = `${FILE_DOWNLOAD_ADDRESS}?ambryId=`

      if (techLinkmanUser) {
        techLinkmanCardData = {
          userId: techLinkmanUser.id,
          name: techLinkmanUser.name,
          position: techLinkmanUser.position,
          userAvatar: toImgHref(techLinkmanUser.avatar),
          jobNumber: techLinkmanUser.jobNumber,
          phone: techLinkmanUser.phone,
          telephone: techLinkmanUser.telephone,
          email: techLinkmanUser.email,
          department: techLinkmanUser.depts,
          userAddress: techLinkmanUser.address,
        }
      }

      if (busiLinkmanUser) {
        busiLinkmanCardData = {
          userId: busiLinkmanUser.id,
          name: busiLinkmanUser.name,
          position: busiLinkmanUser.position,
          userAvatar: toImgHref(busiLinkmanUser.avatar),
          jobNumber: busiLinkmanUser.jobNumber,
          phone: busiLinkmanUser.phone,
          telephone: busiLinkmanUser.telephone,
          email: busiLinkmanUser.email,
          department: busiLinkmanUser.depts,
          userAddress: busiLinkmanUser.address,
        }
      }

      return info ? (
        <aside class={['bg-white', 'detail-view__info-panel'].concat(data.staticClass, data.class)}>
          <section>
            <h2 class="font-bold">数据详情</h2>
            <dl>
              <div class="mb-2">
                <dt>描述</dt>
                <dd style="white-space: normal;">{info.description}</dd>
              </div>
              <div>
                <dt>标签</dt>
                <dd><common-tag-list v-model={info.tags}
                                     on-tag-create={val => parent.handleTagCreate(val)}
                                     on-tag-score-up={val => parent.handleTagScoreUpAndDown(val, true)}
                                     on-tag-score-down={val => parent.handleTagScoreUpAndDown(val, false)}
                                     on-tag-remove={val => parent.handleTagRemove(val)}/></dd>
              </div>
            </dl>
          </section>
          <section>
            <h2 class="font-bold">数据资产详情</h2>
              <dl class="bignumbers">
                <div><dt>资产等级</dt><dd>{info.assetsLevel || '--'}</dd></div>
                <div><dt>数据成本</dt><dd>{info.dataCost || '--'}</dd></div>
                <div><dt>数据价值</dt><dd>{info.dataValue || '--'}</dd></div>
                <div><dt>数据产品</dt><dd>{info.productNum ? info.productNum + '个' : '--'}</dd></div>
                <div><dt>质量评分</dt><dd>{info.qualityScore || '--'}</dd></div>
                <div><dt>标准评分</dt><dd>{info.standardScore || '--'}</dd></div>
                <div><dt>安全等级</dt><dd>{info.d4aSafetyRank || '--'}</dd></div>
                <div><dt>数据周期</dt><dd>{info.dataLife || '--'}</dd></div>
              </dl>
              <dl>
                <div><dt>数据质量规则</dt><dd>{info.dqsSchedules && info.dqsSchedules.length ? info.dqsSchedules.length : 0}个</dd></div>
                <div><dt>数据标准代码</dt><dd>{info.dsStandes && info.dsStandes.length ? info.dsStandes.length : 0}个</dd></div>
              </dl>
            </section>
            <section>
              <h2 class="font-bold">技术信息</h2>
              <dl>
                <div><dt>数据架构层次</dt><dd>{info.dataFrameworkLevelName}</dd></div>
                <div><dt>ETL 相关任务</dt><dd>{info.etlJobs && info.etlJobs.length}个</dd></div>
                <div><dt>所属库名</dt><dd>{info.dataBaseName}</dd></div>
                <div><dt>所属系统</dt><dd>{info.belongApp}</dd></div>
                <div><dt>所属平台</dt><dd>{info.belongSystem}</dd></div>
                <div>
                  <dt>技术负责人</dt>
                  <dd>
                    <ej-user-card data={techLinkmanCardData} has-email={!!techLinkmanCardData.email} on-mail={() => parent.sendMail()}>
                      <template slot="img">
                        <div>
                          {info.techLinkman.avatar ? (
                            <img style="width: 25px; height: 25px" class="rounded-full" src={_avatarUrl + info.techLinkman.avatar}/>
                          ) : <i class="el-icon-user header-img"></i>}
                          <span class="ml-2 text-blue">{info.techLinkman.name}</span>
                        </div>
                      </template>
                    </ej-user-card>
                  </dd>
                </div>
              </dl>
            </section>
            <section>
              <h2 class="font-bold">业务元数据</h2>
              <dl>
                <div><dt>业务主题</dt><dd>{info.businessCategories && info.businessCategories[0] && info.businessCategories[0].name}</dd></div>
                <div><dt>业务负责人</dt>
                    <dd>
                      <ej-user-card data={busiLinkmanCardData} has-email={!!busiLinkmanCardData.email} on-mail={() => parent.sendMail()}>
                        <template slot="img">
                          <div>
                            {info.busiLinkman.avatar ? (
                              <img style="width: 25px; height: 25px" class="rounded-full" src={_avatarUrl + info.busiLinkman.avatar}/>
                            ) : <i class="el-icon-user header-img"></i>}
                            <span class="ml-2 text-blue">{info.busiLinkman.name}</span>
                          </div>
                        </template>
                      </ej-user-card>
                    </dd>
                </div>
              </dl>
            </section>
            <section>
              <h2 class="font-bold">存储信息</h2>
              <dl>
                <div><dt>存储量</dt><dd>{info.storageSize} KB</dd></div>
                <div><dt>存储方式</dt><dd>{storage[info.storageTypeEnum]}</dd></div>
                <div><dt>创建日期</dt><dd>{formatDate(new Date(info.createDate))}</dd></div>
                <div><dt>DDL 最后更新时间</dt><dd>{formatDate(new Date(info.ddlLastUpdateDate))}</dd></div>
                <div><dt>数据最后变更时间</dt><dd>{formatDate(new Date(info.lastChangeDate))}</dd></div>
                <div><dt>数据最后查询时间</dt><dd>{formatDate(new Date(info.lastQueryDate))}</dd></div>
              </dl>
            </section>
          </aside>
        )
        : null
    },
  }
</script>

<style lang="scss">

  .detail-view__info-panel {
    $font-size-big: 16px;
    $font-size-normal: 14px;
    @apply text-base;
    section {
      padding: 8px 14px;
      @apply border-t border-solid border-gray-light;

      &:first-child {
        border: 0;
      }

      .header-img {
        @apply inline-block rounded-full border border-solid border-blue-lighter bg-blue-lighter text-center;

        width: 20px;
        height: 20px;
        line-height: 18px;
      }

      h1,
      h2 {
        margin: 0;
        @apply text-gray-darkest;
      }

      h1 {
        margin-bottom: 10px;
        padding: 3px 0 8px;
        line-height: 1.4;
        @apply border-b border-solid border-blue-lighter;
        @apply text-lg;

        span {
          float: right;
          position: relative;
          top: ( $font-size-big - $font-size-normal) / 2;
          @apply text-base text-gray-darker font-normal;
        }
      }

      h2 {
        margin-bottom: 6px;
        line-height: 1.4;
        @apply text-base;
      }

      > dl {
        margin: 0;

        > div {
          line-height: 1.8;
          display: flex;
          @apply text-gray-darker;
        }

        .comp-tag {
          display: flex;
        }

        .ej-card {
          .card-img {
            @apply mr-2 mb-2;
          }
          .box-postcard {
            height: auto !important;
            width: auto !important;
            min-width: 318px;

            .el-icon-location-information + span {
              @apply inline-block break-normal;
            }
          }
          .box-postcard > div > div:last-child > div {
            @apply mb-2;
          }
          .box-postcard > div {
            @apply mb-2;
          }
          .item-height {
            & > span{
              @apply ml-2;
            }
            .el-icon-document-copy {
              @apply ml-3;
            }
          }
        }

        dt {
          flex: 0 0 auto;

          &::after {
            content: '：';
          }
        }

        dd {
          margin-left: 0;
          flex: 1 1 0;
        }
      }

      .bignumbers {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        margin-bottom: 13px;

        &::before {
          content: '';
          width: 100%;
          order: 2;
        }

        div {
          flex: none;
          display: flex;
          flex-direction: column;
          text-align: center;

          &:nth-child(n + 1) {
            order: 1;
          }

          &:nth-child(n + 5) {
            order: 2;
            margin-top: 3px;
          }

          dt {
            order: 2;
            line-height: 1.4;
            @apply text-sm text-gray-darker;

            &::after {
              content: none;
            }
          }

          dd {
            order: 1;
            line-height: 28px;
            @apply text-2xl text-theme-color;
            margin-top: 3px;
          }
        }
      }
    }
  }
</style>
