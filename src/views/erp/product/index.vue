<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="SKU" prop="skuId">
        <el-input v-model="queryParams.skuId" placeholder="请输入SKU" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="产品名称" prop="skuName">
        <el-input v-model="queryParams.skuName" placeholder="请输入产品名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="售卖状态" prop="saleStatus">
        <el-select v-model="queryParams.saleStatus" placeholder="请选择售卖状态" clearable>
          <el-option v-for="dict in dm_product_sale_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="类目" prop="categoryId">
        <el-input v-model="queryParams.categoryId" placeholder="请输入类目" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="品牌" prop="brandId">
        <el-input v-model="queryParams.brandId" placeholder="请输入品牌" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option v-for="dict in record_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
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
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['erp:product:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['erp:product:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['erp:product:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['erp:product:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="productList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="图片" align="center" prop="pictureUrl" width="100">
        <template #default="scope">
          <image-preview :src="scope.row.pictureUrl" :width="50" :height="50" />
        </template>
      </el-table-column>
      <el-table-column label="SKU" align="center" prop="skuId" />
      <el-table-column label="产品名称" align="center" prop="skuName" />
      <el-table-column label="规格说明" align="center" prop="specification" />
      <el-table-column label="型号(SPU)" width="100" align="center" prop="modelNumber" />
      <el-table-column label="单位" align="center" prop="unit" />
      <el-table-column label="售卖状态" align="center" prop="saleStatus">
        <template #default="scope">
          <dict-tag :options="dm_product_sale_status" :value="scope.row.saleStatus" />
        </template>
      </el-table-column>
      <el-table-column label="类目" align="center" prop="categoryId" />
      <el-table-column label="品牌" align="center" prop="brandId" />
      <el-table-column label="标签" align="center" prop="flagId" />
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="record_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="竞品链接" align="center" prop="competitorLink" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改时间" align="center" prop="updateTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['erp:product:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['erp:product:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改产品信息对话框 -->
    <el-dialog :title="title" v-model="open" width="1200px" append-to-body>
      <el-form ref="productRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="图片" prop="pictureUrl">
          <image-upload v-model="form.pictureUrl" />
        </el-form-item>
        <el-form-item label="产品名称" prop="skuName">
          <el-input v-model="form.skuName" placeholder="请输入产品名称" />
        </el-form-item>
        <el-row type="flex">
          <el-col :span="8">
            <el-form-item label="SKU" prop="skuId">
              <el-input v-model="form.skuId" placeholder="请输入SKU" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="型号(SPU)" prop="modelNumber">
              <el-input v-model="form.modelNumber" placeholder="请输入型号(SPU)" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="单位" prop="unit">
              <el-input v-model="form.unit" placeholder="请输入单位" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row type="flex">
          <el-col :span="8">
            <el-form-item label="类目" prop="categoryId">
              <el-input v-model="form.categoryId" placeholder="请输入类目" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="品牌" prop="brandId">
              <el-input v-model="form.brandId" placeholder="请输入品牌" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="标签" prop="flagId">
              <el-input v-model="form.flagId" placeholder="请输入标签" />
            </el-form-item>
          </el-col>
        </el-row>


        <el-form-item label="规格说明" prop="specification">
          <el-input v-model="form.specification" type="textarea" placeholder="请输入规格说明" />
        </el-form-item>


        <el-form-item label="售卖状态" prop="saleStatus">
          <el-radio-group v-model="form.saleStatus">
            <el-radio v-for="dict in dm_product_sale_status" :key="dict.value" :label="parseInt(dict.value)">{{ dict.label
            }}</el-radio>
          </el-radio-group>
        </el-form-item>


        <el-row type="flex">
          <el-col :span="12">
            <el-form-item label="产品描述" prop="description">
              <el-input v-model="form.description" type="textarea" placeholder="请输入内容" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="竞品链接" prop="competitorLink">
              <el-input v-model="form.competitorLink" type="textarea" placeholder="请输入内容" />
            </el-form-item>
          </el-col>
        </el-row>




        <el-divider content-position="center">海关信息</el-divider>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" icon="Plus" @click="handleAddDmProductCustoms">添加</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" icon="Delete" @click="handleDeleteDmProductCustoms">删除</el-button>
          </el-col>
        </el-row>
        <el-table :data="dmProductCustomsList" :row-class-name="rowDmProductCustomsIndex"
          @selection-change="handleDmProductCustomsSelectionChange" ref="dmProductCustoms">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="序号" align="center" prop="index" width="50" />
          <el-table-column label="报关名称英文" prop="customsEn" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.customsEn" placeholder="请输入报关名称英文" />
            </template>
          </el-table-column>
          <el-table-column label="报关名称中文" prop="customsZh" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.customsZh" placeholder="请输入报关名称中文" />
            </template>
          </el-table-column>
          <el-table-column label="材质" prop="material" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.material" placeholder="请输入材质" />
            </template>
          </el-table-column>
          <el-table-column label="含电池" prop="hasBattery" width="150">
            <template #default="scope">
              <el-select v-model="scope.row.hasBattery" placeholder="请选择含电池">
                <el-option v-for="dict in sys_yes_no" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="含液体" prop="hasLiquid" width="150">
            <template #default="scope">
              <el-select v-model="scope.row.hasLiquid" placeholder="请选择含液体">
                <el-option v-for="dict in sys_yes_no" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="纺织品" prop="hasTextile" width="150">
            <template #default="scope">
              <el-select v-model="scope.row.hasTextile" placeholder="请选择纺织品">
                <el-option v-for="dict in sys_yes_no" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="报关价格" prop="price" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.price" placeholder="请输入报关价格" />
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

<script setup name="Product">
import { listProduct, getProduct, delProduct, addProduct, updateProduct } from "@/api/erp/product";

const { proxy } = getCurrentInstance();
const { dm_product_sale_status, record_status, sys_yes_no } = proxy.useDict('dm_product_sale_status', 'record_status', 'sys_yes_no');

const productList = ref([]);
const dmProductCustomsList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const checkedDmProductCustoms = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const daterangeCreateTime = ref([]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    skuId: null,
    skuName: null,
    saleStatus: null,
    categoryId: null,
    brandId: null,
    status: null,
    competitorLink: null,
    createTime: null,
  },
  rules: {
    skuId: [
      { required: true, message: "SKU不能为空", trigger: "blur" }
    ],
    skuName: [
      { required: true, message: "产品名称不能为空", trigger: "blur" }
    ],
    modelNumber: [
      { required: true, message: "型号(SPU)不能为空", trigger: "blur" }
    ],
    pictureUrl: [
      { required: true, message: "图片不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询产品信息列表 */
function getList() {
  loading.value = true;
  queryParams.value.params = {};
  if (null != daterangeCreateTime && '' != daterangeCreateTime) {
    queryParams.value.params["beginCreateTime"] = daterangeCreateTime.value[0];
    queryParams.value.params["endCreateTime"] = daterangeCreateTime.value[1];
  }
  listProduct(queryParams.value).then(response => {
    productList.value = response.rows;
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
    skuName: null,
    specification: null,
    modelNumber: null,
    unit: null,
    saleStatus: null,
    categoryId: null,
    brandId: null,
    flagId: null,
    pictureUrl: null,
    description: null,
    priceStrategyId: null,
    status: null,
    competitorLink: null,
    createBy: null,
    createTime: null,
    updateTime: null
  };
  dmProductCustomsList.value = [];
  proxy.resetForm("productRef");
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
  title.value = "添加产品信息";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getProduct(_id).then(response => {
    form.value = response.data;
    dmProductCustomsList.value = response.data.dmProductCustomsList;
    open.value = true;
    title.value = "修改产品信息";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["productRef"].validate(valid => {
    if (valid) {
      form.value.dmProductCustomsList = dmProductCustomsList.value;
      if (form.value.id != null) {
        updateProduct(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addProduct(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除产品信息编号为"' + _ids + '"的数据项？').then(function () {
    return delProduct(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 海关信息序号 */
function rowDmProductCustomsIndex({ row, rowIndex }) {
  row.index = rowIndex + 1;
}

/** 海关信息添加按钮操作 */
function handleAddDmProductCustoms() {
  let obj = {};
  obj.customsEn = "";
  obj.customsZh = "";
  obj.material = "";
  obj.hasBattery = "";
  obj.hasLiquid = "";
  obj.hasTextile = "";
  obj.price = "";
  dmProductCustomsList.value.push(obj);
}

/** 海关信息删除按钮操作 */
function handleDeleteDmProductCustoms() {
  if (checkedDmProductCustoms.value.length == 0) {
    proxy.$modal.msgError("请先选择要删除的海关信息数据");
  } else {
    const dmProductCustomss = dmProductCustomsList.value;
    const checkedDmProductCustomss = checkedDmProductCustoms.value;
    dmProductCustomsList.value = dmProductCustomss.filter(function (item) {
      return checkedDmProductCustomss.indexOf(item.index) == -1
    });
  }
}

/** 复选框选中数据 */
function handleDmProductCustomsSelectionChange(selection) {
  checkedDmProductCustoms.value = selection.map(item => item.index)
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('erp/product/export', {
    ...queryParams.value
  }, `product_${new Date().getTime()}.xlsx`)
}

getList();
</script>
