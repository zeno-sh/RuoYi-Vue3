<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="98px">
      <el-form-item label="货代公司名称" prop="forwarderName">
        <el-input v-model="queryParams.forwarderName" placeholder="请输入货代公司名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="计费类型" prop="billType">
        <el-select v-model="queryParams.billType" placeholder="请选择计费类型" clearable>
          <el-option v-for="dict in dm_express_bill_type" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="运输类型" prop="type">
        <el-select v-model="queryParams.type" placeholder="请选择运输类型" clearable>
          <el-option v-for="dict in dm_express_type" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="联系人" prop="contactPerson">
        <el-input v-model="queryParams.contactPerson" placeholder="请输入联系人" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['erp:express:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['erp:express:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['erp:express:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['erp:express:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="expressList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="index" width="50" label="序号" />
      <el-table-column label="货代公司名称" align="center" prop="forwarderName" width="120"/>
      <el-table-column label="币种" align="center" prop="currency">
        <template #default="scope">
          <dict-tag :options="dm_currency_code" :value="scope.row.currency" />
        </template>
      </el-table-column>
      <el-table-column label="计费类型" align="center" prop="billType">
        <template #default="scope">
          <dict-tag :options="dm_express_bill_type" :value="scope.row.billType" />
        </template>
      </el-table-column>
      <el-table-column label="运输类型" align="center" prop="type" width="90">
        <template #default="scope">
          <dict-tag :options="dm_express_type" :value="scope.row.type" />
        </template>
      </el-table-column>
      <el-table-column label="金额" align="center" prop="price" />
      <el-table-column label="联系人" align="center" prop="contactPerson" />
      <el-table-column label="电话" align="center" prop="phone" />
      <el-table-column label="仓库地址" align="center" prop="warehouseAddress" width="300" />
      <el-table-column label="备注" align="center" prop="remark" width="500" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="180">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['erp:express:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['erp:express:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改货代公司报价对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="expressRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="货代公司名称" prop="forwarderName">
          <el-input v-model="form.forwarderName" placeholder="请输入货代公司名称" />
        </el-form-item>
        <el-form-item label="币种" prop="currency">
          <el-select v-model="form.currency" placeholder="请选择币种">
            <el-option v-for="dict in dm_currency_code" :key="dict.value" :label="dict.label"
              :value="parseInt(dict.value)"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="计费类型" prop="billType">
          <el-select v-model="form.billType" placeholder="请选择计费类型">
            <el-option v-for="dict in dm_express_bill_type" :key="dict.value" :label="dict.label"
              :value="parseInt(dict.value)"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="运输类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择运输类型">
            <el-option v-for="dict in dm_express_type" :key="dict.value" :label="dict.label"
              :value="parseInt(dict.value)"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="金额" prop="price">
          <el-input v-model="form.price" placeholder="请输入金额" />
        </el-form-item>
        <el-form-item label="联系人" prop="contactPerson">
          <el-input v-model="form.contactPerson" placeholder="请输入联系人" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入电话" />
        </el-form-item>
        <el-form-item label="仓库地址" prop="warehouseAddress">
          <el-input v-model="form.warehouseAddress" type="textarea" placeholder="请输入内容" />
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

<script setup name="Express">
import { listExpress, getExpress, delExpress, addExpress, updateExpress } from "@/api/erp/express";

const { proxy } = getCurrentInstance();
const { dm_express_type, dm_express_bill_type, dm_currency_code } = proxy.useDict('dm_express_type', 'dm_express_bill_type', 'dm_currency_code');

const expressList = ref([]);
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
    forwarderName: null,
    billType: null,
    type: null,
    contactPerson: null,
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询货代公司报价列表 */
function getList() {
  loading.value = true;
  listExpress(queryParams.value).then(response => {
    expressList.value = response.rows;
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
    forwarderName: null,
    currency: null,
    billType: null,
    type: null,
    price: null,
    contactPerson: null,
    phone: null,
    warehouseAddress: null,
    remark: null
  };
  proxy.resetForm("expressRef");
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
  title.value = "添加货代公司报价";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getExpress(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改货代公司报价";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["expressRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateExpress(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addExpress(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除货代公司报价编号为"' + _ids + '"的数据项？').then(function () {
    return delExpress(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('erp/express/export', {
    ...queryParams.value
  }, `express_${new Date().getTime()}.xlsx`)
}

getList();
</script>
