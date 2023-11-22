<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="88px">
      <el-form-item label="SKU" prop="skuId">
        <el-input v-model="queryParams.skuId" placeholder="请输入SKU" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="供应商代码" prop="supplierCode">
        <el-input v-model="queryParams.supplierCode" placeholder="请输入供应商代码" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="供应商名称" prop="supplierName">
        <el-input v-model="queryParams.supplierName" placeholder="请输入供应商名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
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
      <el-table-column label="产品ID" align="center" prop="productId" />
      <el-table-column label="供应商代码" align="center" prop="supplierCode" />
      <el-table-column label="供应商名称" align="center" prop="supplierName" />
      <el-table-column label="币种" align="center" prop="currency">
        <template #default="scope">
          <dict-tag :options="dm_currency_code" :value="scope.row.currency" />
        </template>
      </el-table-column>
      <el-table-column label="是否含税" align="center" prop="tax">
        <template #default="scope">
          <dict-tag :options="dm_boolean" :value="scope.row.tax" />
        </template>
      </el-table-column>
      <el-table-column label="税率" align="center" prop="taxRate" />
      <el-table-column label="报价" align="center" prop="price" />
      <el-table-column label="起订数量" align="center" prop="orderNumber" />
      <el-table-column label="采购链接" align="center" prop="link" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
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
      <el-form ref="supplierRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="产品" prop="productId">
          <el-select v-model="form.productId" :multiple="false" filterable remote reserve-keyword placeholder="请输入SKU"
          remote-show-suffix :remote-method="getProduct">
          <el-option v-for="item in productList" :key="item.id" :label="item.skuName" :value="item.id" />
        </el-select>
        </el-form-item>
        
        <el-form-item label="供应商名称" prop="supplierName">
          <el-input v-model="form.supplierName" placeholder="请输入供应商名称" />
        </el-form-item>
        <el-form-item label="币种" prop="currency">
          <el-select v-model="form.currency" placeholder="请选择币种">
            <el-option v-for="dict in dm_currency_code" :key="dict.value" :label="dict.label"
              :value="parseInt(dict.value)">
              <span style="float: left">{{ dict.label }}</span>
              <span style="
          float: right;
          color: var(--el-text-color-secondary);
          font-size: 13px;
        ">{{ dict.remark }}</span> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="是否含税" prop="tax">
          <el-radio-group v-model="form.tax">
            <el-radio v-for="dict in dm_boolean" :key="dict.value" :label="parseInt(dict.value)">{{ dict.label
            }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="税率" prop="taxRate">
          <el-input v-model="form.taxRate" placeholder="请输入税率" />
        </el-form-item>
        <el-form-item label="报价" prop="price">
          <el-input v-model="form.price" placeholder="请输入报价" />
        </el-form-item>
        <el-form-item label="起订数量" prop="orderNumber">
          <el-input v-model="form.orderNumber" placeholder="请输入起订数量" />
        </el-form-item>
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
          <el-table-column label="箱规名称" prop="cartonSizeName" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.cartonSizeName" placeholder="请输入箱规名称" />
            </template>
          </el-table-column>
          <el-table-column label="单品长" prop="length" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.length" placeholder="请输入单品长" />
            </template>
          </el-table-column>
          <el-table-column label="单品宽" prop="width" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.width" placeholder="请输入单品宽" />
            </template>
          </el-table-column>
          <el-table-column label="单品高" prop="height" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.height" placeholder="请输入单品高" />
            </template>
          </el-table-column>
          <el-table-column label="单品净重量" prop="netWeight" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.netWeight" placeholder="请输入单品净重量" />
            </template>
          </el-table-column>
          <el-table-column label="产品材质" prop="material" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.material" placeholder="请输入产品材质" />
            </template>
          </el-table-column>
          <el-table-column label="箱规长" prop="boxLength" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.boxLength" placeholder="请输入箱规长" />
            </template>
          </el-table-column>
          <el-table-column label="箱规宽" prop="boxWidth" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.boxWidth" placeholder="请输入箱规宽" />
            </template>
          </el-table-column>
          <el-table-column label="箱规高" prop="boxHeight" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.boxHeight" placeholder="请输入箱规高" />
            </template>
          </el-table-column>
          <el-table-column label="每箱子的产品数" prop="quantityPerBox" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.quantityPerBox" placeholder="请输入每箱子的产品数" />
            </template>
          </el-table-column>
          <el-table-column label="单品包装长" prop="packageLength" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.packageLength" placeholder="请输入单品包装长" />
            </template>
          </el-table-column>
          <el-table-column label="单品包装宽" prop="packageWidth" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.packageWidth" placeholder="请输入单品包装宽" />
            </template>
          </el-table-column>
          <el-table-column label="单品包装高" prop="packageHeight" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.packageHeight" placeholder="请输入单品包装高" />
            </template>
          </el-table-column>
          <el-table-column label="箱重" prop="boxWeight" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.boxWeight" placeholder="请输入箱重" />
            </template>
          </el-table-column>
          <el-table-column label="单品毛重量" prop="grossWeight" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.grossWeight" placeholder="请输入单品毛重量" />
            </template>
          </el-table-column>
          <el-table-column label="虚拟单品长" prop="fakerLength" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.fakerLength" placeholder="请输入虚拟单品长" />
            </template>
          </el-table-column>
          <el-table-column label="虚拟单品宽" prop="fakerWidth" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.fakerWidth" placeholder="请输入虚拟单品宽" />
            </template>
          </el-table-column>
          <el-table-column label="虚拟单品高" prop="fakerHeight" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.fakerHeight" placeholder="请输入虚拟单品高" />
            </template>
          </el-table-column>
          <el-table-column label="虚拟单品净重量" prop="fakerNetWeight" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.fakerNetWeight" placeholder="请输入虚拟单品净重量" />
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

const { proxy } = getCurrentInstance();
const { dm_currency_code, dm_boolean } = proxy.useDict('dm_currency_code', 'dm_boolean');

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

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    productId: null,
    skuId: null,
    supplierCode: null,
    supplierName: null,
    createTime: null,
  },
  rules: {
    tenantId: [
      { required: true, message: "租户不能为空", trigger: "blur" }
    ],
    supplierCode: [
      { required: true, message: "供应商代码不能为空", trigger: "blur" }
    ],
    createTime: [
      { required: true, message: "$comment不能为空", trigger: "blur" }
    ],
    updateTime: [
      { required: true, message: "$comment不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

function getProductId() {
  listProduct(queryParams.value).then(response => {
    productList.value = response.rows;
    queryParams.productId = productList.value[0].id;
  });
}

function getProduct(skuId) {
  if (skuId != null && '' != skuId) {
    queryParams.value.skuId = skuId;
    listProduct(queryParams.value).then(response => {
      productList.value = response.rows;
      queryParams.productId = productList.value[0].id;
    });
  }

}

/** 查询供应商报价列表 */
function getList() {
  loading.value = true;
  queryParams.value.params = {};
  if (null != daterangeCreateTime && '' != daterangeCreateTime) {
    queryParams.value.params["beginCreateTime"] = daterangeCreateTime.value[0];
    queryParams.value.params["endCreateTime"] = daterangeCreateTime.value[1];
  }
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
    productId: null,
    supplierCode: null,
    supplierName: null,
    currency: null,
    tax: null,
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
  getProductId();
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
  obj.productId = "";
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
  obj.packageLength = "";
  obj.packageWidth = "";
  obj.packageHeight = "";
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
