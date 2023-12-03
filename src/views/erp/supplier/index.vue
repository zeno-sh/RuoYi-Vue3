<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="88px">
      <el-form-item label="SKU" prop="skuId">
        <el-input v-model="queryParams.skuId" placeholder="请输入SKU" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="供应商代码" prop="supplierCode">
        <el-input v-model="queryParams.supplierCode" placeholder="请输入供应商代码" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <!-- <el-form-item label="供应商名称" prop="supplierName">
        <el-input v-model="queryParams.supplierName" placeholder="请输入供应商名称" clearable @keyup.enter="handleQuery" />
      </el-form-item> -->
      <el-form-item label="创建时间" style="width: 308px">
        <el-date-picker v-model="daterangeCreateTime" value-format="YYYY-MM-DD" type="daterange" range-separator="-"
          start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['erp:supplier:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['erp:supplier:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['erp:supplier:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['erp:supplier:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="supplierList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="SKU" align="center" prop="skuId" width="180" />
      <el-table-column label="供应商代码" align="center" prop="supplierCode" />
      <el-table-column label="供应商名称" align="center" prop="supplierName" />
      <el-table-column label="币种" align="center" prop="currency">
        <template #default="scope">
          <dict-tag :options="dm_currency_code" :value="scope.row.currency" />
        </template>
      </el-table-column>
      <el-table-column label="是否含税" align="center" prop="tax">
        <template #default="scope">
          <dict-tag :options="sys_yes_no" :value="scope.row.tax" />
        </template>
      </el-table-column>
      <el-table-column label="税率" align="center" prop="taxRate" />
      <el-table-column label="报价" align="center" prop="price" />
      <el-table-column label="起订数量" align="center" prop="orderNumber" />
      <!-- <el-table-column label="采购链接" align="center" prop="link" /> -->
      <!-- <el-table-column label="备注" align="center" prop="remark" /> -->
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="180">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['erp:supplier:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['erp:supplier:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改供应商报价对话框 -->
    <el-dialog :title="title" v-model="open" width="1200px" append-to-body>
      <el-form ref="supplierRef" :model="form" :rules="rules" label-width="100px">

        <el-row type="flex">
          <el-col :span="12">
            <el-form-item label="产品" prop="skuId">
              <el-select v-model="form.skuId" :multiple="false" filterable remote reserve-keyword placeholder="请输入SKU"
                remote-show-suffix :remote-method="getProduct" clearable>
                <el-option v-for="item in productList" :key="item.skuId"
                  :label="`${item.skuName}` + ' / ' + `${item.skuId}`" :value="item.skuId">
                  <span style="float: left">{{ item.skuName }}</span>
                  <span
                    style=" float: right; color: var(--el-text-color-secondary); font-size: 13px; margin-left: 10px;">{{
                      item.skuId
                    }}</span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="供应商" prop="supplierCode">
              <el-select v-model="form.supplierCode" :multiple="false" filterable remote reserve-keyword
                placeholder="支持模糊搜索" remote-show-suffix :remote-method="getSupplierInfo" clearable>
                <el-option v-for="item in factoryList" :key="item.supplierCode"
                  :label="`${item.supplierName}` + ' / ' + `${item.supplierCode}`" :value="item.supplierCode">
                  <span style="float: left">{{ item.supplierName }}</span>
                  <span
                    style=" float: right; color: var(--el-text-color-secondary); font-size: 13px; margin-left: 10px;">{{
                      item.supplierCode }}</span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row type="flex">
          <el-col :span="12">
            <el-form-item label="币种" prop="currency">
              <el-select v-model="form.currency" placeholder="请选择币种">
                <el-option v-for="dict in dm_currency_code" :key="dict.value"
                  :label="`${dict.label}` + ' / ' + `${dict.remark}`" :value="parseInt(dict.value)">
                  <span style="float: left">{{ dict.label }}</span>
                  <span style=" float: right; color: var(--el-text-color-secondary); font-size: 13px; ">{{ dict.remark
                  }}</span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否含税" prop="tax">
              <el-radio-group v-model="form.tax">
                <el-radio v-for="dict in sys_yes_no" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="税率" prop="taxRate">
              <el-input v-model="form.taxRate" placeholder="请输入税率" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row type="flex">
          <el-col :span="12">
            <el-form-item label="报价" prop="price">
              <el-input v-model="form.price" placeholder="请输入报价" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="起订数量" prop="orderNumber">
              <el-input-number :min="0" v-model="form.orderNumber" placeholder="请输入起订数量" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="采购链接" prop="link">
          <el-input v-model="form.link" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-divider content-position="center">采购信息信息</el-divider>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" icon="Plus" @click="handleAddDmProductPurchase">添加</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" icon="Delete" @click="handleDeleteDmProductPurchase">删除</el-button>
          </el-col>
        </el-row>
        <el-table :data="dmProductPurchaseList" :row-class-name="rowDmProductPurchaseIndex"
          @selection-change="handleDmProductPurchaseSelectionChange" ref="dmProductPurchase">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="序号" align="center" prop="index" width="50" />
          <el-table-column label="SKU" prop="skuId" width="150">
            <template #default="scope">
              <el-input disabled v-model="scope.row.skuId" placeholder="请输入SKU" />
            </template>
          </el-table-column>
          <el-table-column label="箱规名称" prop="cartonSizeName" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.cartonSizeName" placeholder="请输入箱规名称" />
            </template>
          </el-table-column>
          <el-table-column label="外箱规格cm" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.boxLength" placeholder="长" />
              <el-input v-model="scope.row.boxWidth" placeholder="宽" />
              <el-input v-model="scope.row.boxHeight" placeholder="高" />
            </template>
          </el-table-column>
          <el-table-column label="单箱数量pcs" prop="quantityPerBox" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.quantityPerBox" placeholder="单箱数量pcs" />
            </template>
          </el-table-column>
          <el-table-column label="包装规格cm" width="120px">
            <template #default="scope">
              <div display="inline-block">
                <el-input v-model="scope.row.length" placeholder="长" />
                <el-input v-model="scope.row.width" placeholder="宽" />
                <el-input v-model="scope.row.height" placeholder="高" />
              </div>

            </template>
          </el-table-column>
          <el-table-column label="单箱重量g" prop="boxWeight" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.boxWeight" placeholder="单箱重量g" />
            </template>
          </el-table-column>
          <el-table-column label="单品净重g" prop="netWeight" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.netWeight" placeholder="单品净重g" />
            </template>
          </el-table-column>
          <el-table-column label="单品毛重g" prop="grossWeight" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.grossWeight" placeholder="单品毛重g" />
            </template>
          </el-table-column>
          <el-table-column label="产品材质" prop="material" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.material" placeholder="请输入产品材质" />
            </template>
          </el-table-column>
        </el-table>
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

<script setup name="Supplier">
import { listSupplier, getSupplier, delSupplier, addSupplier, updateSupplier } from "@/api/erp/supplier";
import { listProduct } from "@/api/erp/product";
import { listFactory } from "@/api/erp/factory";


const { proxy } = getCurrentInstance();
const { sys_yes_no, dm_currency_code } = proxy.useDict('sys_yes_no', 'dm_currency_code');

const supplierList = ref([]);
const dmProductPurchaseList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const checkedDmProductPurchase = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const daterangeCreateTime = ref([]);
const productList = ref([]);
const factoryList = ref([]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    tenantId: null,
    skuId: null,
    supplierCode: null,
    supplierName: null,
    currency: null,
    tax: null,
    taxRate: 0.0,
    price: null,
    orderNumber: 0,
    link: null,
    createTime: null,
  },
  rules: {
    skuId: [
      { required: true, message: "SKU不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

function getProduct(skuId) {
  if (skuId != null && '' != skuId) {
    queryParams.value.skuId = skuId;
    listProduct(queryParams.value).then(response => {
      productList.value = response.rows;
    });
  }
}

function getSupplierInfo(name) {
  if (name != null && '' != name) {
    queryParams.value.supplierName = name;
    listFactory(queryParams.value).then(response => {
      factoryList.value = response.rows;
    });
  }
}

function getSupplierInfoByCode(code) {
  if (code != null && '' != code) {
    queryParams.value.supplierCode = code;
    listFactory(queryParams.value).then(response => {
      factoryList.value = response.rows;
    });
  }
}

/** 查询供应商报价列表 */
function getList() {
  loading.value = true;
  listSupplier(queryParams.value).then(response => {
    supplierList.value = response.rows;
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
    tenantId: null,
    skuId: null,
    supplierCode: null,
    supplierName: null,
    currency: null,
    tax: "N",
    taxRate: null,
    price: null,
    orderNumber: null,
    link: null,
    remark: null,
    createBy: null,
    createTime: null,
    updateTime: null
  };
  dmProductPurchaseList.value = [];
  proxy.resetForm("supplierRef");
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
  title.value = "添加供应商报价";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getSupplier(_id).then(response => {
    form.value = response.data;
    dmProductPurchaseList.value = response.data.dmProductPurchaseList;
    open.value = true;
    title.value = "修改供应商报价";
    getSupplierInfoByCode(form.value.supplierCode);
    getProduct(form.value.skuId);
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["supplierRef"].validate(valid => {
    if (valid) {
      form.value.dmProductPurchaseList = dmProductPurchaseList.value;
      if (form.value.id != null) {
        updateSupplier(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addSupplier(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除供应商报价编号为"' + _ids + '"的数据项？').then(function () {
    return delSupplier(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 采购信息序号 */
function rowDmProductPurchaseIndex({ row, rowIndex }) {
  row.index = rowIndex + 1;
}

/** 采购信息添加按钮操作 */
function handleAddDmProductPurchase() {
  let obj = {};
  obj.skuId = form.value.skuId;
  obj.cartonSizeName = "";
  obj.length = "";
  obj.width = "";
  obj.height = "";
  obj.netWeight = "";
  obj.material = "";
  obj.boxLength = "";
  obj.boxWidth = "";
  obj.boxHeight = "";
  obj.quantityPerBox = "";
  obj.boxWeight = "";
  obj.grossWeight = "";
  obj.fakerLength = "";
  obj.fakerWidth = "";
  obj.fakerHeight = "";
  obj.fakerNetWeight = "";
  dmProductPurchaseList.value.push(obj);
}

/** 采购信息删除按钮操作 */
function handleDeleteDmProductPurchase() {
  if (checkedDmProductPurchase.value.length == 0) {
    proxy.$modal.msgError("请先选择要删除的采购信息数据");
  } else {
    const dmProductPurchases = dmProductPurchaseList.value;
    const checkedDmProductPurchases = checkedDmProductPurchase.value;
    dmProductPurchaseList.value = dmProductPurchases.filter(function (item) {
      return checkedDmProductPurchases.indexOf(item.index) == -1
    });
  }
}

/** 复选框选中数据 */
function handleDmProductPurchaseSelectionChange(selection) {
  checkedDmProductPurchase.value = selection.map(item => item.index)
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('erp/supplier/export', {
    ...queryParams.value
  }, `supplier_${new Date().getTime()}.xlsx`)
}

getList();
</script>
