<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="体积范围" prop="volumeStart">
        <el-input
          v-model="queryParams.volumeStart"
          placeholder="请输入体积范围"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="体积范围" prop="volumeEnd">
        <el-input
          v-model="queryParams.volumeEnd"
          placeholder="请输入体积范围"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="价格" prop="priceRub">
        <el-input
          v-model="queryParams.priceRub"
          placeholder="请输入价格"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="价格策略" prop="priceStrategy">
        <el-input
          v-model="queryParams.priceStrategy"
          placeholder="请输入价格策略"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option
            v-for="dict in dm_boolean"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['erp:ozonfee:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['erp:ozonfee:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['erp:ozonfee:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['erp:ozonfee:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="ozonfeeList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键" align="center" prop="id" />
      <el-table-column label="体积范围" align="center" prop="volumeStart" />
      <el-table-column label="体积范围" align="center" prop="volumeEnd" />
      <el-table-column label="价格" align="center" prop="priceRub" />
      <el-table-column label="价格策略" align="center" prop="priceStrategy" />
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="dm_boolean" :value="scope.row.status"/>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['erp:ozonfee:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['erp:ozonfee:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改ozon物流费用对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="ozonfeeRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="体积范围" prop="volumeStart">
          <el-input v-model="form.volumeStart" placeholder="请输入体积范围" />
        </el-form-item>
        <el-form-item label="体积范围" prop="volumeEnd">
          <el-input v-model="form.volumeEnd" placeholder="请输入体积范围" />
        </el-form-item>
        <el-form-item label="价格" prop="priceRub">
          <el-input v-model="form.priceRub" placeholder="请输入价格" />
        </el-form-item>
        <el-form-item label="价格策略" prop="priceStrategy">
          <el-input v-model="form.priceStrategy" placeholder="请输入价格策略" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option
              v-for="dict in dm_boolean"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
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

<script setup name="Ozonfee">
import { listOzonfee, getOzonfee, delOzonfee, addOzonfee, updateOzonfee } from "@/api/erp/ozonfee";

const { proxy } = getCurrentInstance();
const { dm_boolean } = proxy.useDict('dm_boolean');

const ozonfeeList = ref([]);
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
    volumeStart: null,
    volumeEnd: null,
    priceRub: null,
    priceStrategy: null,
    status: null
  },
  rules: {
    volumeStart: [
      { required: true, message: "体积范围不能为空", trigger: "blur" }
    ],
    volumeEnd: [
      { required: true, message: "体积范围不能为空", trigger: "blur" }
    ],
    priceRub: [
      { required: true, message: "价格不能为空", trigger: "blur" }
    ],
    priceStrategy: [
      { required: true, message: "价格策略不能为空", trigger: "blur" }
    ],
    createTime: [
      { required: true, message: "创建时间不能为空", trigger: "blur" }
    ],
    updateTime: [
      { required: true, message: "修改时间不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "状态不能为空", trigger: "change" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询ozon物流费用列表 */
function getList() {
  loading.value = true;
  listOzonfee(queryParams.value).then(response => {
    ozonfeeList.value = response.rows;
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
    volumeStart: null,
    volumeEnd: null,
    priceRub: null,
    priceStrategy: null,
    createBy: null,
    createTime: null,
    updateTime: null,
    status: null
  };
  proxy.resetForm("ozonfeeRef");
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
  title.value = "添加ozon物流费用";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getOzonfee(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改ozon物流费用";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["ozonfeeRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateOzonfee(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addOzonfee(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除ozon物流费用编号为"' + _ids + '"的数据项？').then(function() {
    return delOzonfee(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('erp/ozonfee/export', {
    ...queryParams.value
  }, `ozonfee_${new Date().getTime()}.xlsx`)
}

getList();
</script>
