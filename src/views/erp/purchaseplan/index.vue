<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="计划编号" prop="code">
        <el-input v-model="queryParams.code" placeholder="请输入计划编号" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="skuId" prop="skuId">
        <el-input v-model="queryParams.skuId" placeholder="请输入skuId" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['erp:purchaseplan:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['erp:purchaseplan:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['erp:purchaseplan:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['erp:purchaseplan:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="purchaseplanList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="index" width="50" label="序号" />
      <el-table-column label="计划编号" align="center" prop="code" />
      <el-table-column label="skuId" align="center" prop="skuId" />
      <el-table-column label="采购数量" align="center" prop="purchaseQuantity" />
      <el-table-column label="箱数" align="center" prop="numberOfCases" />
      <el-table-column label="体积" align="center" prop="volume" />
      <el-table-column label="重量" align="center" prop="weight" />
      <el-table-column label="采购订单" align="center" prop="purchaseOrder" />
      <el-table-column label="期望到货时间" align="center" prop="expectedArrivalDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.expectedArrivalDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['erp:purchaseplan:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['erp:purchaseplan:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改采购计划对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="purchaseplanRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="计划编号" prop="code">
          <el-input v-model="form.code" disabled placeholder="保存后自动生成" />
        </el-form-item>
        <el-form-item label="skuId" prop="skuId">
          <el-input v-model="form.skuId" placeholder="请输入skuId" />
        </el-form-item>
        <el-form-item label="采购数量" prop="purchaseQuantity">
          <el-input v-model="form.purchaseQuantity" placeholder="请输入采购数量" />
        </el-form-item>
        <el-form-item label="箱数" prop="numberOfCases">
          <el-input v-model="form.numberOfCases" placeholder="请输入箱数" />
        </el-form-item>
        <el-form-item label="体积" prop="volume">
          <el-input v-model="form.volume" placeholder="请输入体积" />
        </el-form-item>
        <el-form-item label="重量" prop="weight">
          <el-input v-model="form.weight" placeholder="请输入重量" />
        </el-form-item>
        <el-form-item label="采购订单" prop="purchaseOrder">
          <el-input v-model="form.purchaseOrder" placeholder="请输入采购订单" />
        </el-form-item>
        <el-form-item label="期望到货时间" prop="expectedArrivalDate">
          <el-date-picker clearable v-model="form.expectedArrivalDate" type="date" value-format="YYYY-MM-DD"
            placeholder="请选择期望到货时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
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

<script setup name="Purchaseplan">
import { listPurchaseplan, getPurchaseplan, delPurchaseplan, addPurchaseplan, updatePurchaseplan } from "@/api/erp/purchaseplan";

const { proxy } = getCurrentInstance();

const purchaseplanList = ref([]);
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
    code: null,
    skuId: null,
    purchaseQuantity: null,
    numberOfCases: null,
    volume: null,
    weight: null,
    purchaseOrder: null,
    expectedArrivalDate: null,
  },
  rules: {
    skuId: [
      { required: true, message: "skuId不能为空", trigger: "blur" }
    ],
    purchaseQuantity: [
      { required: true, message: "采购数量不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询采购计划列表 */
function getList() {
  loading.value = true;
  listPurchaseplan(queryParams.value).then(response => {
    purchaseplanList.value = response.rows;
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
    code: null,
    skuId: null,
    purchaseQuantity: null,
    numberOfCases: null,
    volume: null,
    weight: null,
    purchaseOrder: null,
    expectedArrivalDate: null,
    remark: null,
    createTime: null
  };
  proxy.resetForm("purchaseplanRef");
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
  title.value = "添加采购计划";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getPurchaseplan(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改采购计划";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["purchaseplanRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updatePurchaseplan(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addPurchaseplan(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除采购计划编号为"' + _ids + '"的数据项？').then(function () {
    return delPurchaseplan(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('erp/purchaseplan/export', {
    ...queryParams.value
  }, `purchaseplan_${new Date().getTime()}.xlsx`)
}

getList();
</script>
