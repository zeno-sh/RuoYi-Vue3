<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="88px">
      <el-form-item label="门店" prop="clientId">
        <!-- <el-input v-model="queryParams.clientId" placeholder="请输入平台门店id" clearable @keyup.enter="handleQuery" /> -->
        <dm-shop-select v-model="queryParams.clientId" clearable @keyup.enter="handleQuery"></dm-shop-select>
      </el-form-item>
      <el-form-item label="平台订单" prop="orderId">
        <el-input v-model="queryParams.orderId" placeholder="请输入平台订单id" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="发货编号" prop="postingNumber">
        <el-input v-model="queryParams.postingNumber" placeholder="请输入发货编号" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="订单状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择订单状态" clearable>
          <el-option v-for="dict in dm_order_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="接单时间" prop="inProcessAt">
        <el-date-picker clearable v-model="queryParams.inProcessAt" type="date" value-format="YYYY-MM-DD"
          placeholder="请选择接单时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="订单子状态" prop="substatus">
        <el-select v-model="queryParams.substatus" placeholder="请选择订单子状态" clearable>
          <el-option v-for="dict in dm_order_substatus" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['erp:order:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['erp:order:edit']">修改</el-button>
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['erp:order:remove']">删除</el-button>
      </el-col> -->
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['erp:order:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="orderList" @selection-change="handleSelectionChange" border style="width: 100%">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="index" label="序号" />
      <el-table-column label="门店" align="center" prop="clientId" />
      <el-table-column label="平台订单id" align="center" prop="orderId" />
      <el-table-column label="发货编号" align="center" prop="postingNumber" />
      <el-table-column label="订单编号" align="center" prop="orderNumber" />
      <el-table-column label="订单状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="dm_order_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="订单子状态" align="center" prop="substatus">
        <template #default="scope">
          <dict-tag :options="dm_order_substatus" :value="scope.row.substatus" />
        </template>
      </el-table-column>
      <el-table-column label="接单时间" align="center" prop="inProcessAt">
        <template #default="scope">
          <span>{{ parseTime(scope.row.inProcessAt, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="发运时间" align="center" prop="shipmentDate">
        <template #default="scope">
          <span>{{ parseTime(scope.row.shipmentDate, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="交货时间" align="center" prop="deliveringDate">
        <template #default="scope">
          <span>{{ parseTime(scope.row.deliveringDate, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="订单销售金额" align="center" prop="accrualsForSale" />
      <!-- <el-table-column label="取消原因" align="center" prop="cancellation" /> -->
      <!-- <el-table-column label="商品快照" align="center" prop="products" /> -->
      <!-- <el-table-column label="仓库信息" align="center" prop="deliveryMethod" /> -->
      <el-table-column label="是否FBS" align="center" prop="fbs" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['erp:order:edit']">修改</el-button>
          <el-button link type="primary" icon="Edit" @click="createChat(scope.row)"
            v-hasPermi="['erp:chat:add']">创建聊天</el-button>
          <!-- <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['erp:order:remove']">删除</el-button> -->
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改订单信息对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="orderRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="平台门店id" prop="clientId">
          <el-input v-model="form.clientId" placeholder="请输入平台门店id" />
        </el-form-item>
        <el-form-item label="平台订单id" prop="orderId">
          <el-input v-model="form.orderId" placeholder="请输入平台订单id" />
        </el-form-item>
        <el-form-item label="发货编号" prop="postingNumber">
          <el-input v-model="form.postingNumber" placeholder="请输入发货编号" />
        </el-form-item>
        <el-form-item label="订单编号" prop="orderNumber">
          <el-input v-model="form.orderNumber" placeholder="请输入订单编号" />
        </el-form-item>
        <el-form-item label="订单状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in dm_order_status" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="接单时间" prop="inProcessAt">
          <el-date-picker clearable v-model="form.inProcessAt" type="date" value-format="YYYY-MM-DD"
            placeholder="请选择接单时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="发运时间" prop="shipmentDate">
          <el-date-picker clearable v-model="form.shipmentDate" type="date" value-format="YYYY-MM-DD"
            placeholder="请选择发运时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="交货时间" prop="deliveringDate">
          <el-date-picker clearable v-model="form.deliveringDate" type="date" value-format="YYYY-MM-DD"
            placeholder="请选择交货时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="订单销售金额" prop="accrualsForSale">
          <el-input v-model="form.accrualsForSale" placeholder="请输入订单销售金额" />
        </el-form-item>
        <el-form-item label="取消原因" prop="cancellation">
          <el-input v-model="form.cancellation" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="商品快照" prop="products">
          <el-input v-model="form.products" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="仓库信息" prop="deliveryMethod">
          <el-input v-model="form.deliveryMethod" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="是否FBS" prop="fbs">
          <el-input v-model="form.fbs" placeholder="请输入是否FBS" />
        </el-form-item>
        <el-form-item label="订单子状态" prop="substatus">
          <el-radio-group v-model="form.substatus">
            <el-radio v-for="dict in dm_order_substatus" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
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

<script setup name="Order">
import { listOrder, getOrder, delOrder, addOrder, updateOrder } from "@/api/erp/order";
import { addChat } from "@/api/erp/chat";
import DmShopSelect from '@/components/DmShopSelect';

const { proxy } = getCurrentInstance();
const { dm_order_status, dm_order_substatus } = proxy.useDict('dm_order_status', 'dm_order_substatus');

const orderList = ref([]);
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
    orderByColumn: 'in_process_at',
    isAsc: 'desc',
    clientId: '1633585',
    orderId: null,
    postingNumber: null,
    orderNumber: null,
    status: null,
    inProcessAt: null,
    shipmentDate: null,
    deliveringDate: null,
    accrualsForSale: null,
    cancellation: null,
    products: null,
    deliveryMethod: null,
    fbs: null,
    substatus: null,
  },
  rules: {
    clientId: [
      { required: true, message: "平台门店id不能为空", trigger: "blur" }
    ],
    orderId: [
      { required: true, message: "平台订单id不能为空", trigger: "blur" }
    ],
    postingNumber: [
      { required: true, message: "发货编号不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询订单信息列表 */
function getList() {
  loading.value = true;
  listOrder(queryParams.value).then(response => {
    orderList.value = response.rows;
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
    orderNumber: null,
    status: null,
    inProcessAt: null,
    shipmentDate: null,
    deliveringDate: null,
    accrualsForSale: null,
    cancellation: null,
    products: null,
    deliveryMethod: null,
    fbs: null,
    substatus: null,
    createTime: null
  };
  proxy.resetForm("orderRef");
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
  title.value = "添加订单信息";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getOrder(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改订单信息";
  });
}

function createChat(row) {
  form.value.clientId = row.clientId;
  form.value.postingNumber = row.postingNumber;
  loading.value = true;
  addChat(form.value).then(response => {
    proxy.$modal.msgSuccess("创建成功");
    open.value = false;
    getList();
  }).catch(error => {
    // 处理错误情况
    loading.value = false;
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["orderRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateOrder(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addOrder(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除订单信息编号为"' + _ids + '"的数据项？').then(function () {
    return delOrder(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('erp/order/export', {
    ...queryParams.value
  }, `order_${new Date().getTime()}.xlsx`)
}

getList();
</script>
