<template>
  <el-dialog :visible.sync="isVisible"
             custom-class="edit-tech-floder-view"
             @close="handleClose">
    <template #title>
      <h3 class="text-center font-semibold text-gray-darkest text-2xl">{{dialogTitle}}</h3>
    </template>

    <div class="floder-wrap">
      <el-form ref="floderDetailForm" :rules="rules" :model="floderDetailForm">
        <el-form-item label="上级分类" :label-width="formLabelWidth">
          <el-cascader v-model="floderDetailForm.parentId"
                       :options="prevLevelOptions"
                       clearable
                       :props="{value: 'id', label: 'name'}"
                       placeholder="请选择上级类目"
                       @change="handleSelectPrevLevel"></el-cascader>
        </el-form-item>
        <el-form-item label="分类名称" :label-width="formLabelWidth" prop="name">
          <el-input v-model="floderDetailForm.name" autocomplete="off" @keyup.native="handleTechNameBlur"></el-input>
        </el-form-item>
        <el-form-item label="本级位置" :label-width="formLabelWidth">
          <el-button :disabled="floderDetailForm.ids.length === 0" type="text" class="text-right" @click="handleDraggableSort">使用原始排序</el-button>
          <div class="border border-solid border-gray-light p-1 rounded-sm">
            <draggable v-if="floderDetailForm.ids.length > 0" v-model="floderDetailForm.ids" ghost-class="ghost" @change="handleDraggableChange">
              <transition-group type="transition" name="tech-list">
                <div v-for="item in floderDetailForm.ids" :key="item.id" class="draggable-item">
                  {{item.name}}
                  <ej-icon icon="list" class="text-gray"/>
                </div>
              </transition-group>
            </draggable>
            <div v-else style="min-height: 50px;" class="text-center text-gray-dark">
              暂无位置数据
            </div>
          </div>
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <div class="editor-btns">
        <el-button type="primary" size="small" @click="handleSubmit('floderDetailForm')" :loading="submitLoading">提交</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
  import {
    Button as ElButton,
    Dialog as ElDialog,
    Form as ElForm,
    FormItem as ElFormItem,
    Input as ElInput,
    Cascader as ElCascader,
  } from 'element-ui'
  import Draggable from 'vuedraggable'
  import _ from 'lodash'

  import MUTATION_TECH_MANAGE_ADD_LEVEL_1_LEVEL_2 from '@/graphql/tech_manage_add_level1_level2.gql'
  import MUTATION_TECH_MANAGE_UPDATE_LEVEL_1_LEVEL_2 from '@/graphql/tech_manage_update_level1_level2.gql'
  import Message from '@/utils/message'
  import {CategoryTechLevel} from '@/utils/dictionary'

  export default {
    name: 'EditTechFile',

    components: {
      ElButton,
      ElForm,
      ElFormItem,
      ElDialog,
      ElInput,
      ElCascader,
      Draggable,
    },

    props: {
      editFloderDialogVisible: {
        type: Boolean,
        default: false,
      },
      isEditable: {
        type: Boolean,
        default: false,
      },
      originalData: {
        type: Array,
        default: () => [],
      },
      visible: {
        type: Boolean,
        default: false,
      },
      floderDetail: Object,
    },

    model: {
      prop: 'floderDetail',
      event: 'change',
    },

    data () {
      const errorTip = {
        MAG_TECH_NAME_REQUIRE: '请输入分类名称',
      }

      return {
        formLabelWidth: '100px',
        rules: {
          name: [{required: true, message: errorTip.MAG_TECH_NAME_REQUIRE, trigger: 'blur'}],
        },
        submitLoading: false,
      }
    },

    computed: {
      floderDetailForm: {
        get () {
          return this.floderDetail
        },

        set (val) {
          this.$emit('change', val)
        },
      },

      isVisible: {
        get () {
          return this.visible
        },
        set (val) {
          this.$emit('change', val)
        },
      },

      techData () {
        return _.cloneDeep(this.originalData).filter(od => od)
      },

      // 对话框标题
      dialogTitle () {
        return this.isEditable ? '编辑分类' : '新增分类'
      },

      // 上级类目数据
      prevLevelOptions () {
        const isIn = [CategoryTechLevel.database, CategoryTechLevel.application, CategoryTechLevel.none]
        // 过滤掉 `DATABASE`数据，第三层数据不参与选则
        const techList = this.techData.filter(od => {
          if (!isIn.includes(od.level)) {
            return od
          }
        })

        return techList || []
      },
    },

    methods: {
      handleClose () {
        this.$emit('close-dialog', false)
        this.resetForm()
      },

      /**
       * 选中`上级分类`时触发
       */
      handleSelectPrevLevel (catalogList) {
        this.commonSort()
      },

      /**
       * `分类名称`失去焦点时触发，将`分类名称`添加到`本级位置`列表中
       */
      handleTechNameBlur (val) {
        if (!this.isEditable) {
          this.floderDetailForm.ids = this.floderDetailForm.ids.filter(eo => eo.id !== -1)

          if (this.floderDetailForm.name) {
            this.floderDetailForm.ids.unshift({
              id: -1,
              name: this.floderDetailForm.name,
            })
          }
          this.commonSort()
        } else {
          this.floderDetailForm.ids = this.floderDetailForm.ids.filter(eo => eo.id !== this.floderDetailForm.id)
          if (this.floderDetailForm.name) {
            this.floderDetailForm.ids.unshift({
              id: this.floderDetailForm.id,
              name: this.floderDetailForm.name,
            })
          }
        }
      },

      /**
       * 点击`恢复原来的排序`触发
       */
      handleDraggableSort () {
        this.commonSort()
      },

      /**
       * 排序
       */
      commonSort () {
        let _parentId = this.floderDetailForm.parentId || '0'
        const prevCatalogId = Array.isArray(_parentId) && _parentId.length > 0 ? _parentId[_parentId.length - 1] : _parentId

        const databaseData = this.techData.filter(od => od.parentId === prevCatalogId)
        let _ids = null
        if (!this.isEditable) {
          _ids = this.floderDetailForm.ids.find(eo => eo.id === -1)
        } else {
          // _ids = this.floderDetailForm.ids.find(eo => eo.id === this.floderDetailForm.id)
        }
        this.floderDetailForm.ids = _ids ? [_ids, ...databaseData] : databaseData
      },

      /**
       * 拖拽时触发
       */
      handleDraggableChange (val) {
        console.log('draggable', val, this.floderDetailForm.ids)
      },

      /**
       * 点击`提交`按钮时触发
       */
      handleSubmit (formName) {
        this.submitLoading = true
        this.$refs[formName].validate(async (valid) => {
          if (valid) {
            let _parentId = this.floderDetailForm.parentId
            _parentId = Array.isArray(_parentId) && _parentId.length > 0 ? _parentId[0] : _parentId || 0
            let params = {...this.floderDetailForm,
                          ids: this.floderDetailForm.ids.map(i => i.id),
                          parentId: _parentId,
            }

            let respResult = true
            if (this.isEditable) {
              const {data: {updateTechCategoryLevel}} = await this.$apollo.mutate({
                mutation: MUTATION_TECH_MANAGE_UPDATE_LEVEL_1_LEVEL_2,
                variables: {
                  input: {...params},
                },
              })

              respResult = updateTechCategoryLevel
            } else {
              const {data: {addTechCategoryLevel}} = await this.$apollo.mutate({
                mutation: MUTATION_TECH_MANAGE_ADD_LEVEL_1_LEVEL_2,
                variables: {
                  input: {...params},
                },
              })

              respResult = addTechCategoryLevel
            }

            this.$emit('submit-close', this.isEditable ? this.floderDetailForm.id : this.floderDetailForm.parentId)
            this.resetForm()
            this.submitLoading = false
            if (respResult) {
              Message.MessageSuccess({messageSuccessText: '操作成功'})
            } else {
              Message.MessageError({messageErrorText: '操作失败'})
            }
          } else {
            return false
          }
        })
      },

      resetForm () {
        this.$emit('reset-form')
      },
    },
  }
</script>

<style lang="scss">
  .edit-tech-floder-view {
    width: 900px;
    .editor-btns {
      .el-button--primary {
        @apply text-white bg-blue border-blue;
      }
    }
    .floder-wrap {
      width: 500px;
      margin: 30px auto 0;

      .el-cascader {
        width: 100%;
      }
    }
    .el-form-item__label {
      @apply text-gray-darkest text-base font-semibold;
    }

    .el-input__inner {
      height: 30px;
      line-height: 30px;
    }
    .tech-list-move {
      transition: transform 0.5s;
    }

    .draggable-item {
      @apply cursor-move rounded-sm pl-3 pr-5;

      height: 30px;
      line-height: 30px;

      &:hover {
        @apply bg-blue-lighter;
      }

      .ej-icon {
        @apply float-right;

        margin-top: 6px;
        width: 18px;
        height: 18px;
      }
    }

    .el-dialog__body {
      padding: 10px 20px 30px;
    }
  }
</style>
