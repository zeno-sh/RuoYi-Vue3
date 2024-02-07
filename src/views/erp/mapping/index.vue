<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="平台" prop="platform">
        <el-select v-model="queryParams.platform" placeholder="请选择平台" clearable>
          <el-option v-for="dict in dm_platform" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="门店名称" prop="shopName">
        <el-input v-model="queryParams.shopName" placeholder="请输入门店名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="门店Id" prop="clientId">
        <el-input v-model="queryParams.clientId" placeholder="请输入平台门店Id" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['erp:mapping:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['erp:mapping:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['erp:mapping:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['erp:mapping:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="mappingList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="index" width="50" label="序号" />
      <el-table-column label="平台" align="center" prop="platform">
        <template #default="scope">
          <dict-tag :options="dm_platform" :value="scope.row.platform" />
        </template>
      </el-table-column>
      <el-table-column label="门店名称" align="center" prop="shopName" />
      <el-table-column label="平台门店Id" align="center" prop="clientId" />
      <el-table-column label="密钥" align="center" prop="apiKey" />
      <el-table-column label="广告key" align="center" prop="adClientId" />
      <el-table-column label="广告密钥" align="center" prop="adClientSecret" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['erp:mapping:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['erp:mapping:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改授权对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="mappingRef" :model="form" :rules="rules" label-width="98px">
        <el-form-item label="平台" prop="platform">
          <el-select v-model="form.platform" placeholder="请选择平台">
            <el-option v-for="dict in dm_platform" :key="dict.value" :label="dict.label"
              :value="parseInt(dict.value)"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="门店名称" prop="shopName">
          <el-input v-model="form.shopName" placeholder="请输入门店名称" />
        </el-form-item>
        <el-form-item label="平台门店Id" prop="clientId">
          <el-input v-model="form.clientId" placeholder="请输入平台门店Id" />
        </el-form-item>
        <el-form-item label="密钥" prop="apiKey">
          <el-input v-model="form.apiKey" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="广告key" prop="adClientId">
          <el-input v-model="form.adClientId" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="广告密钥" prop="adClientSecret">
          <el-input v-model="form.adClientSecret" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Mapping">
import { listMapping, getMapping, delMapping, addMapping, updateMapping } from "@/api/erp/mapping";

const { proxy } = getCurrentInstance();
const { dm_platform } = proxy.useDict('dm_platform');

const mappingList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    platform: null,
    shopName: null,
    clientId: null,
    apiKey: null,
    adClientId: null,
    adClientSecret: null,
  },
  rules: {
    platform: [
      { required: true, message: "平台不能为空", trigger: "change" }
    ],
    shopName: [
      { required: true, message: "门店名称不能为空", trigger: "blur" }
    ],
    clientId: [
      { required: true, message: "平台门店Id不能为空", trigger: "blur" }
    ],
    apiKey: [
      { required: true, message: "密钥不能为空", trigger: "blur" }
    ],
    createTime: [
      { required: true, message: "不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询授权列表 */
function getList() {
  loading.value = true;
  listMapping(queryParams.value).then(response => {
    mappingList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    platform: null,
    shopName: null,
    clientId: null,
    apiKey: null,
    adClientId: null,
    adClientSecret: null,
    createTime: null
  };
  proxy.resetForm("mappingRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加授权";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getMapping(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改授权";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["mappingRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateMapping(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addMapping(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除授权编号为"' + _ids + '"的数据项？').then(function () {
    return delMapping(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('erp/mapping/export', {
    ...queryParams.value
  }, `mapping_${new Date().getTime()}.xlsx`)
}

getList();
</script>
