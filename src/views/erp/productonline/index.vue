<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="门店" prop="clientId">
        <!-- <el-input v-model="queryParams.clientId" placeholder="请输入门店" clearable @keyup.enter="handleQuery" /> -->
        <dm-shop-select v-model="queryParams.clientId" clearable @keyup.enter="handleQuery"></dm-shop-select>
      </el-form-item>
      <el-form-item label="本地Sku" prop="skuId">
        <el-input v-model="queryParams.skuId" placeholder="请输入本地Sku" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="平台货号" prop="offerId">
        <el-input v-model="queryParams.offerId" placeholder="请输入平台货号" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="平台Sku" prop="productId">
        <el-input v-model="queryParams.productId" placeholder="请输入平台Sku" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <!-- <el-form-item label="是否大宗商品" prop="isKgt">
        <el-input v-model="queryParams.isKgt" placeholder="请输入是否大宗商品" clearable @keyup.enter="handleQuery" />
      </el-form-item> -->
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['erp:productonline:edit']">绑定本地商品</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['erp:productonline:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="productonlineList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="index" label="序号" />
      <el-table-column label="门店" align="center" prop="clientId" />
      <el-table-column label="主图" align="center" prop="image" width="100">
        <template #default="scope">
          <image-preview :src="scope.row.image" :width="50" :height="50" />
        </template>
      </el-table-column>
      <el-table-column label="本地Sku" align="center" prop="skuId" />

      <el-table-column label="平台货号" align="center" prop="offerId" />
      <el-table-column label="平台Sku" align="center" prop="productId" />

      <el-table-column label="是否大宗商品" align="center" prop="isKgt" />
      <el-table-column label="补贴价" align="center" prop="marketingPrice" />
      <el-table-column label="价格" align="center" prop="price" />
      <el-table-column label="创建时间" align="center" prop="createAt" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createAt, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="150">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['erp:productonline:edit']">绑定本地商品</el-button>
          <!-- <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['erp:productonline:remove']">删除</el-button> -->
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改在线商品对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="productonlineRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="门店" prop="clientId">
          <el-input v-model="form.clientId" placeholder="请输入门店" disabled/>
        </el-form-item>
        <el-form-item label="本地Sku" prop="skuId">
          <!-- <el-input v-model="form.skuId" placeholder="请输入本地Sku" /> -->
          <dm-select-product :skuId="form.skuId" v-model="form.skuId"></dm-select-product>
        </el-form-item>
        <el-form-item label="平台货号" prop="offerId">
          <el-input v-model="form.offerId" placeholder="请输入平台货号" disabled/>
        </el-form-item>
        <el-form-item label="平台Sku" prop="productId">
          <el-input v-model="form.productId" placeholder="请输入平台Sku" disabled/>
        </el-form-item>
        <el-form-item label="主图" prop="image">
          <image-upload v-model="form.image" />
        </el-form-item>
        <!-- <el-form-item label="是否大宗商品" prop="isKgt">
          <el-input v-model="form.isKgt" placeholder="请输入是否大宗商品" />
        </el-form-item> -->
        <el-form-item label="补贴价" prop="marketingPrice">
          <el-input v-model="form.marketingPrice" placeholder="请输入补贴价" disabled/>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input v-model="form.price" placeholder="请输入价格" disabled/>
        </el-form-item>
        <el-form-item label="创建时间" prop="createAt">
          <el-date-picker clearable v-model="form.createAt" disabled type="date" value-format="YYYY-MM-DD" placeholder="请选择创建时间">
          </el-date-picker>
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

<script setup name="Productonline">
import { listProductonline, getProductonline, delProductonline, addProductonline, updateProductonline } from "@/api/erp/productonline";
import DmShopSelect from '@/components/DmShopSelect';
import DmSelectProduct from '@/components/DmSelectProduct'

const { proxy } = getCurrentInstance();

const productonlineList = ref([]);
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
    skuId: null,
    offerId: null,
    productId: null,
    image: null,
    isKgt: null,
    marketingPrice: null,
    price: null,
    createAt: null
  },
  rules: {
    clientId: [
      { required: true, message: "门店不能为空", trigger: "blur" }
    ],
    skuId: [
      { required: true, message: "本地Sku不能为空", trigger: "blur" }
    ],
    offerId: [
      { required: true, message: "平台货号不能为空", trigger: "blur" }
    ],
    productId: [
      { required: true, message: "平台Sku不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询在线商品列表 */
function getList() {
  loading.value = true;
  listProductonline(queryParams.value).then(response => {
    productonlineList.value = response.rows;
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
    skuId: null,
    offerId: null,
    productId: null,
    image: null,
    isKgt: null,
    marketingPrice: null,
    price: null,
    createAt: null
  };
  proxy.resetForm("productonlineRef");
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
  title.value = "添加在线商品";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getProductonline(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "绑定本地商品";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["productonlineRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateProductonline(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addProductonline(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除在线商品编号为"' + _ids + '"的数据项？').then(function () {
    return delProductonline(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('erp/productonline/export', {
    ...queryParams.value
  }, `productonline_${new Date().getTime()}.xlsx`)
}

getList();
</script>
