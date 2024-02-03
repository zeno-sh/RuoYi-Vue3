<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="操作ID" prop="operationId">
        <el-input v-model="queryParams.operationId" placeholder="请输入操作ID" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="操作类型" prop="operationType">
        <el-select v-model="queryParams.operationType" placeholder="请选择操作类型" clearable>
          <el-option v-for="dict in dm_finance_operation_type" :key="dict.value" :label="dict.label"
            :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="发货单号" prop="postingNumber">
        <el-input v-model="queryParams.postingNumber" placeholder="请输入发货单号 " clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <!-- <el-form-item label="操作日期" prop="operationDate">
        <el-date-picker clearable v-model="queryParams.operationDate" type="date" value-format="YYYY-MM-DD"
          placeholder="请选择操作日期">
        </el-date-picker>
      </el-form-item> -->
      <el-form-item label="账单日期" style="width: 308px">
        <el-date-picker v-model="daterangeCreateTime" value-format="YYYY-MM-DD" type="daterange" range-separator="-"
          start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
      </el-form-item>
      <el-form-item label="收费类型" prop="type">
        <el-select v-model="queryParams.type" placeholder="请选择收费类型" clearable>
          <el-option v-for="dict in dm_finance_transaction_type" :key="dict.value" :label="dict.label"
            :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <!-- <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['erp:transaction:add']">新增</el-button>
      </el-col> -->
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['erp:transaction:edit']">修改</el-button>
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['erp:transaction:remove']">删除</el-button>
      </el-col> -->
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['erp:transaction:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="transactionList" @selection-change="handleSelectionChange" height="600" border>
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="index" width="50" label="序号" fixed />
      <el-table-column label="门店id" align="center" prop="clientId" fixed />
      <el-table-column label="操作ID" align="center" prop="operationId" width="120" />
      <el-table-column label="发货单号" align="center" prop="postingNumber" width="160" />
      <el-table-column label="收费类型" align="center" prop="type" width="128">
        <template #default="scope">
          <dict-tag :options="dm_finance_transaction_type" :value="scope.row.type" />
        </template>
      </el-table-column>

      <el-table-column label="操作类型" align="center" prop="operationType" width="210">
        <template #default="scope">
          <dict-tag :options="dm_finance_operation_type" :value="scope.row.operationType" />
        </template>
      </el-table-column>
      <el-table-column label="操作日期" align="center" prop="operationDate" width="140">
        <template #default="scope">
          <span>{{ parseTime(scope.row.operationDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column label="操作类型名称" align="center" prop="operationTypeName" /> -->
      <el-table-column label="销售应计金额" align="center" prop="accrualsForSale" width="120">
        <template #default="scope">
          <FormattedCurrency :value="scope.row.accrualsForSale" />
        </template>
      </el-table-column>
      <el-table-column label="销售佣金或返还" align="center" prop="saleCommission" width="120">
        <template #default="scope">
          <FormattedCurrency :value="scope.row.saleCommission" />
        </template>
      </el-table-column>
      <el-table-column label="交易总金额" align="center" prop="amount" width="120">
        <template #default="scope">
          <FormattedCurrency :value="scope.row.amount" />
        </template>
      </el-table-column>
      <el-table-column label="配送费用" align="center" prop="deliveryCharge" width="120">
        <template #default="scope">
          <FormattedCurrency :value="scope.row.deliveryCharge" />
        </template>
      </el-table-column>
      <el-table-column label="退货配送费用" align="center" prop="returnDeliveryCharge" width="120">
        <template #default="scope">
          <FormattedCurrency :value="scope.row.returnDeliveryCharge" />
        </template>
      </el-table-column>


      <!-- <el-table-column label="发货信息" align="center" prop="posting" /> -->
      <!-- <el-table-column label="商品信息" align="center" prop="items" /> -->
      <!-- <el-table-column label="服务信息" align="center" prop="services" /> -->
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['erp:transaction:edit']">修改</el-button>
          <!-- <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['erp:transaction:remove']">删除</el-button> -->
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改交易记录对话框 -->
    <el-dialog :title="title" v-model="open" width="50%" append-to-body>
      <el-form ref="transactionRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="操作ID" prop="operationId">
          <el-input v-model="form.operationId" placeholder="请输入操作ID" />
        </el-form-item>
        <el-form-item label="发货单号" prop="postingNumber">
          <el-input v-model="form.postingNumber" placeholder="请输入发货单号" />
        </el-form-item>
        <el-form-item label="操作日期" prop="operationDate">
          <el-date-picker clearable v-model="form.operationDate" type="date" value-format="YYYY-MM-DD"
            placeholder="请选择操作日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="操作类型名称" prop="operationTypeName">
          <el-input v-model="form.operationTypeName" placeholder="请输入操作类型名称" />
        </el-form-item>
        <el-form-item label="配送费用" prop="deliveryCharge">
          <el-input v-model="form.deliveryCharge" placeholder="请输入配送费用" />
        </el-form-item>
        <el-form-item label="退货配送费用" prop="returnDeliveryCharge">
          <el-input v-model="form.returnDeliveryCharge" placeholder="请输入退货配送费用" />
        </el-form-item>
        <el-form-item label="销售应计金额" prop="accrualsForSale">
          <el-input v-model="form.accrualsForSale" placeholder="请输入销售应计金额" />
        </el-form-item>
        <el-form-item label="销售佣金或返还" prop="saleCommission">
          <el-input v-model="form.saleCommission" placeholder="请输入销售佣金或返还" />
        </el-form-item>
        <el-form-item label="交易总金额" prop="amount">
          <el-input v-model="form.amount" placeholder="请输入交易总金额" />
        </el-form-item>
        <el-form-item label="收费类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择收费类型">
            <el-option v-for="dict in dm_finance_transaction_type" :key="dict.value" :label="dict.label"
              :value="dict.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="发货信息" prop="posting">
          <el-input v-model="form.posting" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="商品信息" prop="items">
          <el-input v-model="form.items" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="服务信息" prop="services">
          <el-input v-model="form.services" type="textarea" placeholder="请输入内容" />
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

<script setup name="Transaction">
import FormattedCurrency from '@/components/FormattedCurrency'
import { listTransaction, getTransaction, delTransaction, addTransaction, updateTransaction } from "@/api/erp/transaction";

const { proxy } = getCurrentInstance();
const { dm_finance_operation_type, dm_finance_transaction_type } = proxy.useDict('dm_finance_operation_type', 'dm_finance_transaction_type');

const transactionList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const daterangeCreateTime = ref([]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 20,
    operationId: null,
    postingNumber: null,
    operationType: null,
    operationDate: null,
    operationTypeName: null,
    deliveryCharge: null,
    returnDeliveryCharge: null,
    accrualsForSale: null,
    saleCommission: null,
    amount: null,
    type: null,
    posting: null,
    items: null,
    services: null
  },
  rules: {
    operationId: [
      { required: true, message: "操作ID不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询交易记录列表 */
function getList() {
  loading.value = true;
  queryParams.value.params = {};
  if (null != daterangeCreateTime && '' != daterangeCreateTime) {
    queryParams.value.params["beginCreateTime"] = daterangeCreateTime.value[0];
    queryParams.value.params["endCreateTime"] = daterangeCreateTime.value[1];
  }
  listTransaction(queryParams.value).then(response => {
    transactionList.value = response.rows;
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
    operationId: null,
    postingNumber: null,
    operationType: null,
    operationDate: null,
    operationTypeName: null,
    deliveryCharge: null,
    returnDeliveryCharge: null,
    accrualsForSale: null,
    saleCommission: null,
    amount: null,
    type: null,
    posting: null,
    items: null,
    services: null
  };
  proxy.resetForm("transactionRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  daterangeCreateTime.value = [];
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
  title.value = "添加交易记录";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getTransaction(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改交易记录";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["transactionRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateTransaction(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addTransaction(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除交易记录编号为"' + _ids + '"的数据项？').then(function () {
    return delTransaction(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('erp/transaction/export', {
    ...queryParams.value
  }, `transaction_${new Date().getTime()}.xlsx`)
}

getList();
</script>
