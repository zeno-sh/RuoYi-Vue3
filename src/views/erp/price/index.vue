<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="SKU" prop="skuId">
        <el-input v-model="queryParams.skuId" placeholder="请输入SKU" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['erp:price:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['erp:price:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['erp:price:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['erp:price:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="priceList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键" align="center" prop="id" />
      <el-table-column label="SKU" align="center" prop="skuId" />
      <el-table-column label="产品售价" align="center" prop="sellingPrice" />
      <el-table-column label="产品原价" align="center" prop="originalPrice" />
      <el-table-column label="价格策略名称" align="center" prop="priceStrategyName" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['erp:price:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['erp:price:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改产品价格策略对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="priceRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="SKU" prop="skuId">
          <el-input v-model="form.skuId" placeholder="请输入SKU" />
        </el-form-item>
        <el-form-item label="产品售价" prop="sellingPrice">
          <el-input v-model="form.sellingPrice" placeholder="请输入产品售价" />
        </el-form-item>
        <el-form-item label="产品原价" prop="originalPrice">
          <el-input v-model="form.originalPrice" placeholder="请输入产品原价" />
        </el-form-item>
        <el-form-item label="价格策略名称" prop="priceStrategyName">
          <el-input v-model="form.priceStrategyName" placeholder="请输入价格策略名称" />
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

<script setup name="Price">
import { listPrice, getPrice, delPrice, addPrice, updatePrice } from "@/api/erp/price";

const { proxy } = getCurrentInstance();

const priceList = ref([]);
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
    skuId: null,
  },
  rules: {
    skuId: [
      { required: true, message: "SKU不能为空", trigger: "blur" }
    ],
    sellingPrice: [
      { required: true, message: "产品售价不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询产品价格策略列表 */
function getList() {
  loading.value = true;
  listPrice(queryParams.value).then(response => {
    priceList.value = response.rows;
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
    skuId: null,
    sellingPrice: null,
    originalPrice: null,
    priceStrategyName: null,
    createBy: null,
    createTime: null,
    updateTime: null
  };
  proxy.resetForm("priceRef");
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
  title.value = "添加产品价格策略";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getPrice(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改产品价格策略";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["priceRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updatePrice(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addPrice(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除产品价格策略编号为"' + _ids + '"的数据项？').then(function () {
    return delPrice(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('erp/price/export', {
    ...queryParams.value
  }, `price_${new Date().getTime()}.xlsx`)
}

getList();
</script>
