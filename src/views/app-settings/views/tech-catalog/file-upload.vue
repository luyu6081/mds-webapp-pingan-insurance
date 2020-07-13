<template>
  <div class="file-upload-view">
    <el-form-item label="上传方式" :label-width="formLabelWidth"  :prop="isEditable ? null: 'uploadType'">
      <el-radio-group v-model="fileForm.uploadType">
        <el-radio :label="mdsUpdateTypeEnum.totalamount">全量</el-radio>
        <el-radio :label="mdsUpdateTypeEnum.increment">增量</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item v-if="mdsType === mdsObjectTypeEnum.database" label="数据库类型" :label-width="formLabelWidth" :prop="isEditable ? null: 'dbType'">
      <el-select v-model="fileForm.dbType" placeholder="请选择数据库类型" @change="handleDbType">
        <!-- <el-option v-for="(item, idx) in ['MongoDB', 'Mysql']" :key="idx" :label="item" :value="item"/> -->
        <el-option v-for="item in dbList" :key="item" :label="item" :value="item"/>
      </el-select>
    </el-form-item>
    <el-form-item label="上传文件" :label-width="formLabelWidth" :prop="isEditable ? null: 'uploadFile'">
      <el-upload  ref="upload"
                  :action="uploadFilePath"
                  accept=".xls, .xlsx, .json"
                  name="file"
                  :data="{
                    serviceId: 'mds',
                    ttl: '10800'
                  }"
                  :limit="1"
                  :file-list="fileList"
                  :auto-upload="true"
                  :on-exceed="handleExceed"
                  :before-upload="beforeUpload"
                  :on-preview="handlePreview"
                  :on-remove="handleRemove"
                  :on-success="handleUploadSuccess"
                  :on-progress="handleProgress"
                  class="upload-wrap">
        <el-button size="small" type="primary" icon="el-icon-upload2">点击上传</el-button>
        <div v-if="[dbTypeEnum.MongoDB, dbTypeEnum.ElasticSearch, dbTypeEnum.HBase].includes(fileForm.dbType)" slot="tip" class="el-upload__tip">支持扩展名：.json，且不超过100MB</div>
        <div v-else slot="tip" class="el-upload__tip">支持扩展名：.xls,.xlsx...，且不超过100MB</div>
      </el-upload>
    </el-form-item>
  </div>
</template>

<script>
  import {
    Button as ElButton,
    FormItem as ElFormItem,
    RadioGroup as ElRadioGroup,
    Radio as ElRadio,
    Upload as ElUpload,
    Select as ElSelect,
    Option as ElOption,
  } from 'element-ui'

  import {MdsUpdateTypeEnum, MdsObjectTypeEnum, DbTypeEnum} from '@/utils/dictionary'
  import Message from '@/utils/message'
  import runtimeArgs from '@/runtime-args'

  /** 上传地址 rest */
  /** 上传地址 rest */
  const UPLOAD_FILE_ADDRESS = runtimeArgs.VUE_APP_UPLOADS_HTTP

  export default {
    name: 'FileUpload',

    components: {
      ElButton,
      ElFormItem,
      ElRadioGroup,
      ElRadio,
      ElUpload,
      ElSelect,
      ElOption,
    },

    props: {
      formLabelWidth: String,
      isEditable: Boolean,
      fileDetailForm: Object,
      dbList: Array,
      mdsType: String,
    },

    model: {
      prop: 'fileDetailForm',
      event: 'change',
    },

    computed: {
      fileForm: {
        get () { return this.fileDetailForm },
        set (val) { this.$emit('change', val) },
      },

      uploadFilePath () {
        return UPLOAD_FILE_ADDRESS
      },

      mdsUpdateTypeEnum: () => MdsUpdateTypeEnum,

      dbTypeEnum: () => DbTypeEnum,

      mdsObjectTypeEnum: () => MdsObjectTypeEnum,
    },

    data () {
      return {
        // 文件列表
        fileList: [],

        // 上传-文件列表
        fileNames: [],

        // 允许上传最大的文件 100M
        allowFileSize: 100 * 1024 * 1024,
      }
    },

    methods: {
      /**
       * 文件列表移除文件时的钩子
       */
      handleRemove (file, fileList) {
        // let fname = this.fileNames.findIndex(f => file.response[0] === f)
        // this.fileNames.splice(fname, 1)
        this.fileNames = []
      },

      handleUploadSuccess (response, file, fileList) {
        console.log('response', response)
        this.fileNames = fileList
        if (response[0] && response[0].ambryId) {
          this.fileForm.uploadFile = response[0].ambryId
        }
      },

      handleProgress (event, file, fileList) {
        this.fileList = fileList
      },

      /**
       * 上传文件超出个数限制时的钩子
       */
      handleExceed (files, fileList) {
        Message.MessageError({messageErrorText: '最多只能选择1个文件!'})
      },

      /**
       * 点击文件列表中已上传的文件时的钩子
       */
      handlePreview (file) {
        console.log('点击文件列表中已上传的文件时的钩子')
      },

      /**
       * 上传文件之前的钩子
       */
      beforeUpload (file) {
        // 文件类型
        const fileSuffixName = file.name.substring(file.name.lastIndexOf('.') + 1)
        let suffixArr = ['xls', 'xlsx']

        // 上传MongoDB的数据源
        if ([this.dbTypeEnum.MongoDB, this.dbTypeEnum.ElasticSearch, this.dbTypeEnum.HBase].includes(this.fileForm.dbType)) {
          suffixArr = ['json']
        }

        if (!suffixArr.includes(fileSuffixName)) {
          Message.MessageError({messageErrorText: `上传的文件的扩展名必须是${suffixArr.join(' ')}`})
          return false
        }

        // 读取文件大小
        const fileSize = file.size
        if (fileSize > this.allowFileSize) {
          Message.MessageError({messageErrorText: '文件大于100M'})
          return false
        }
      },

      /**
       * 切换数据库类型，类型改变时，清除已经上传的文件
       */
      handleDbType (val) {
        this.fileNames = []
        this.$refs.upload.clearFiles()
      },
    },
  }
</script>

<style lang="scss">
  .file-upload-view {

  }
</style>
