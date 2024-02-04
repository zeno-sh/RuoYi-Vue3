<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="门店" prop="clientId">
        <el-input
          v-model="queryParams.clientId"
          placeholder="请输入门店"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="订单号" prop="orderId">
        <el-input
          v-model="queryParams.orderId"
          placeholder="请输入订单号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="发货编号" prop="postingNumber">
        <el-input
          v-model="queryParams.postingNumber"
          placeholder="请输入发货编号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="平台Sku" prop="platformSkuId">
        <el-input
          v-model="queryParams.platformSkuId"
          placeholder="请输入平台Sku"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="货号" prop="offerId">
        <el-input
          v-model="queryParams.offerId"
          placeholder="请输入货号"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="退货日期" prop="returnDate">
        <el-date-picker clearable
          v-model="queryParams.returnDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择退货日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="退货数量" prop="quantity">
        <el-input
          v-model="queryParams.quantity"
          placeholder="请输入退货数量"
          clearable
          @keyup.enter="handleQuery"
        />
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
          v-hasPermi="['erp:return:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['erp:return:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['erp:return:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['erp:return:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="returnList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="" align="center" prop="id" />
      <el-table-column label="门店" align="center" prop="clientId" />
      <el-table-column label="订单号" align="center" prop="orderId" />
      <el-table-column label="发货编号" align="center" prop="postingNumber" />
      <el-table-column label="平台Sku" align="center" prop="platformSkuId" />
      <el-table-column label="货号" align="center" prop="offerId" />
      <el-table-column label="退货日期" align="center" prop="returnDate" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.returnDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="退货数量" align="center" prop="quantity" />
      <el-table-column label="退货原因" align="center" prop="returnReason" />
      <el-table-column label="退货状态" align="center" prop="status" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['erp:return:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['erp:return:remove']">删除</el-button>
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

    <!-- 添加或修改退货记录对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="returnRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="门店" prop="clientId">
          <el-input v-model="form.clientId" placeholder="请输入门店" />
        </el-form-item>
        <el-form-item label="订单号" prop="orderId">
          <el-input v-model="form.orderId" placeholder="请输入订单号" />
        </el-form-item>
        <el-form-item label="发货编号" prop="postingNumber">
          <el-input v-model="form.postingNumber" placeholder="请输入发货编号" />
        </el-form-item>
        <el-form-item label="平台Sku" prop="platformSkuId">
          <el-input v-model="form.platformSkuId" placeholder="请输入平台Sku" />
        </el-form-item>
        <el-form-item label="货号" prop="offerId">
          <el-input v-model="form.offerId" placeholder="请输入货号" />
        </el-form-item>
        <el-form-item label="退货日期" prop="returnDate">
          <el-date-picker clearable
            v-model="form.returnDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择退货日期">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="退货数量" prop="quantity">
          <el-input v-model="form.quantity" placeholder="请输入退货数量" />
        </el-form-item>
        <el-form-item label="退货原因" prop="returnReason">
          <el-input v-model="form.returnReason" type="textarea" placeholder="请输入内容" />
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

<script setup name="Return">
import { listReturn, getReturn, delReturn, addReturn, updateReturn } from "@/api/erp/return";

const { proxy } = getCurrentInstance();

const returnList = ref([]);
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
    clientId: null,
    orderId: null,
    postingNumber: null,
    platformSkuId: null,
    offerId: null,
    returnDate: null,
    quantity: null,
    returnReason: null,
    status: null,
  },
  rules: {
    clientId: [
      { required: true, message: "门店不能为空", trigger: "blur" }
    ],
    postingNumber: [
      { required: true, message: "发货编号不能为空", trigger: "blur" }
    ],
    offerId: [
      { required: true, message: "货号不能为空", trigger: "blur" }
    ],
    createTime: [
      { required: true, message: "不能为空", trigger: "blur" }
    ],
    updateTime: [
      { required: true, message: "不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询退货记录列表 */
function getList() {
  loading.value = true;
  listReturn(queryParams.value).then(response => {
    returnList.value = response.rows;
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
    clientId: null,
    orderId: null,
    postingNumber: null,
    platformSkuId: null,
    offerId: null,
    returnDate: null,
    quantity: null,
    returnReason: null,
    status: null,
    createTime: null,
    updateTime: null
  };
  proxy.resetForm("returnRef");
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
  title.value = "添加退货记录";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getReturn(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改退货记录";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["returnRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateReturn(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addReturn(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除退货记录编号为"' + _ids + '"的数据项？').then(function() {
    return delReturn(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('erp/return/export', {
    ...queryParams.value
  }, `return_${new Date().getTime()}.xlsx`)
}

getList();
</script>
