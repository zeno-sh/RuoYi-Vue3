<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="98px">
      <el-form-item label="选品计划名称" prop="planName">
        <el-input v-model="queryParams.planName" placeholder="请输入选品计划名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="SKU" prop="planSkuId">
        <el-input v-model="queryParams.planSkuId" placeholder="请输入SKU" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="创建时间" style="width: 308px">
        <el-date-picker v-model="daterangeCreateTime" value-format="YYYY-MM-DD" type="daterange" range-separator="-"
          start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option v-for="dict in record_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <!-- <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['erp:plan:add']">新增</el-button>
      </el-col> -->
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['erp:plan:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['erp:plan:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['erp:plan:export']">导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" @click="handleForwarderPrice"
          v-hasPermi="['erp:plan:edit']">一键修改货代头程报价</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="planList" @selection-change="handleSelectionChange" border height="700">
      <el-table-column type="selection" align="center" />
      <el-table-column label="选品计划名称" align="center" prop="planName" fixed width="120" />
      <el-table-column label="图片" align="center" prop="productInfo.skuPicture" fixed>
        <template #default="scope">
          <image-preview :src="scope.row.productInfo.skuPicture" :width="50" :height="50" />
        </template>
      </el-table-column>
      <el-table-column label="SKU" align="center" prop="planSkuId" fixed width="190">
        <template #default="scope">
          <a @click="gotoProductEdit(scope.row.planSkuId)" class="hover-link">{{ scope.row.planSkuId }}</a>
        </template>
      </el-table-column>
      <el-table-column label="产品名称" align="center" prop="productInfo.skuName" width="120" />
      <el-table-column label="商品规格" align="center">
        <el-table-column label="箱规" align="center" width="150"
          prop="productInfo.specification.boxLength,specification.boxLength.boxWidth">
          <template #default="scope">
            <span>{{ scope.row.productInfo.specification.boxLength }}*
              {{ scope.row.productInfo.specification.boxWidth }}*
              {{ scope.row.productInfo.specification.boxHeight }} cm
            </span>
          </template>
        </el-table-column>
        <el-table-column label="PCS" align="center" prop="productInfo.specification.quantityPerBox" width="70" />
        <el-table-column label="箱重" align="center" prop="productInfo.specification.boxWeight">
          <template #default="scope">
            <span>{{ scope.row.productInfo.specification.boxWeight / 1000 }} kg
            </span>
          </template>
        </el-table-column>
        <el-table-column label="包装规格" align="center" width="150" prop="productInfo.specification.length">
          <template #default="scope">
            <span>{{ scope.row.productInfo.specification.length }}*
              {{ scope.row.productInfo.specification.width }}*
              {{ scope.row.productInfo.specification.height }} cm
            </span>
          </template>
        </el-table-column>
        <el-table-column label="单品毛重" align="center" prop="productInfo.specification.grossWeight">
          <template #default="scope">
            <span>{{ scope.row.productInfo.specification.grossWeight }}g
            </span>
          </template>
        </el-table-column>
        <el-table-column label="单品净重" align="center" prop="productInfo.specification.netWeight">
          <template #default="scope">
            <span>{{ scope.row.productInfo.specification.netWeight }}g
            </span>
          </template>
        </el-table-column>
        <el-table-column label="体积m³" align="center" prop="productInfo.volume" />
        <el-table-column label="体积升" align="center" prop="productInfo.volumeRise" />
      </el-table-column>


      <el-table-column label="成本明细（人民币）" align="center">
        <el-table-column label="国内成本" align="center">
          <el-table-column label="采购价" align="center" prop="productCost.purchasePrice" />
          <el-table-column label="货代头程" align="center" prop="productCost.firstLegPrice" />
        </el-table-column>
        <el-table-column label="海外仓成本" align="center">
          <el-table-column label="卸货费" align="center" prop="productCost.fbsUnloadPrice" />
          <el-table-column label="上架费" align="center" prop="productCost.fbsShelfPrice" />
          <el-table-column label="订单操作费" align="center" prop="productCost.fbsOrderPrice" width="100" />
          <el-table-column label="送货费" align="center" prop="productCost.fbsDeliveryPrice" />
        </el-table-column>
        <el-table-column label="平台成本" align="center">
          <el-table-column label="类目佣金" align="center" prop="productCostConfig.categoryRate" />
          <el-table-column label="ozon转运费" align="center" prop="productCost.ozonDeliveryPrice" width="100" />
          <el-table-column label="最后一公里" align="center" prop="productCost.lastMilePrice" width="100" />
          <el-table-column label="广告费率" align="center" prop="productCostConfig.adRate" width="100" />
          <el-table-column label="广告费" align="center" prop="productCost.adPrice" width="100" />
          <el-table-column label="货损率" align="center" prop="productCostConfig.lossRate" width="100" />
          <el-table-column label="货损" align="center" prop="productCost.lossPrice" width="100" />

        </el-table-column>
      </el-table-column>


      <el-table-column label="利润预估" align="center">
        <el-table-column label="前端原价" align="center" prop="productPrice.originalPrice" width="100">
          <template #default="scope">
            <span>{{ scope.row.productPrice.originalPrice }} 卢布</span>
          </template>
        </el-table-column>
        <el-table-column label="前端定价" align="center" prop="productPrice.sellingPrice" width="100">
          <template #default="scope">
            <span>{{ scope.row.productPrice.sellingPrice }} 卢布</span>
          </template>
        </el-table-column>
        <el-table-column label="结算价" align="center" prop="settlementPrice" width="100" />
        <el-table-column label="预估利润" align="center" prop="profitPrice" width="100" />
        <el-table-column label="毛利率" align="center" prop="grossProfitRate" width="100" />
        <el-table-column label="ROI" align="center" prop="roiRate" width="100" />
      </el-table-column>

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
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="record_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="180">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['erp:plan:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['erp:plan:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改选品计划对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="planRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="选品计划名称" prop="planName">
          <el-input v-model="form.planName" placeholder="请输入选品计划名称" />
        </el-form-item>
        <el-form-item label="SKU" prop="planSkuId">
          <el-select v-model="form.planSkuId" :multiple="false" filterable remote reserve-keyword placeholder="请输入SKU"
            remote-show-suffix :remote-method="getProduct" disabled>
            <el-option v-for="item in productList" :key="item.skuId" :label="`${item.skuName}` + ' / ' + `${item.skuId}`"
              :value="item.skuId">
              <span style="float: left">{{ item.skuName }}</span>
              <span style=" float: right; color: var(--el-text-color-secondary); font-size: 13px; ">{{ item.skuId
              }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="价格计划" prop="priceId">
          <el-select v-model="form.priceId" :multiple="false" filterable remote reserve-keyword placeholder="请输入SKU"
            remote-show-suffix :remote-method="getPriceList">
            <el-option v-for="item in priceList" :key="parseInt(item.id)"
              :label="`${item.priceStrategyName}` + ' / ' + `${item.sellingPrice} RUB`" :value="parseInt(item.id)">
              <span style="float: left">{{ item.priceStrategyName }}</span>
              <span style=" float: right; color: var(--el-text-color-secondary); font-size: 13px; ">{{ item.sellingPrice
              }} RUB</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="供应商报价" prop="supplierPriceOfferId">
          <!-- <el-input v-model="form.supplierPriceOfferId" placeholder="请输入供应商报价" /> -->
          <el-select v-model="form.supplierPriceOfferId" :multiple="false" filterable remote reserve-keyword
            placeholder="请输入SKU" remote-show-suffix>
            <el-option v-for="item in supplierOfferList" :key="parseInt(item.id)"
              :label="`${item.supplierCode}` + ' / ' + `${item.price} RMB`" :value="parseInt(item.id)">
              <span style="float: left">{{ item.supplierCode }}</span>
              <span style=" float: right; color: var(--el-text-color-secondary); font-size: 13px; ">{{ item.price
              }} RMB</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="货代报价" prop="forwarderPrice">
          <el-input v-model="form.forwarderPrice" placeholder="请输入货代报价" />
        </el-form-item>
        <el-form-item label="预估采购价" prop="forecastPurchasePrice">
          <el-input v-model="form.forecastPurchasePrice" placeholder="这里可以临时指定采购价" clearable />
        </el-form-item>
        <el-form-item label="广告费率" prop="adRate">
          <el-input v-model="form.adRate" placeholder="请输入广告费率" />
        </el-form-item>
        <el-form-item label="货损率" prop="lossRate">
          <el-input v-model="form.lossRate" placeholder="请输入货损率" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>


    <!-- 批量修改货代头程价格 -->
    <el-dialog :title="titleForwarderPrice" v-model="openForwarderPrice" width="600px" append-to-body>
      <el-form ref="forwarderPriceRef" :model="formForwarderPrice" :rules="rules" label-width="120px">
        <el-form-item label="SKU" prop="skuIdListStr">
          <el-input disabled v-model="formForwarderPrice.skuIdListStr" type="textarea" placeholder="请选择SKU" />
        </el-form-item>
        <el-form-item label="货代头程报价" prop="forwarderPrice">
          <el-input v-model="formForwarderPrice.forwarderPrice" placeholder="请输入本次货代头程报价（人民币）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitFormForwarderPrice">确 定</el-button>
          <el-button @click="cancelForwarderPrice">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Plan">
import { listPlan, getPlan, delPlan, addPlan, updatePlan, updateForwarderPrice } from "@/api/erp/plan";
import { listProduct } from "@/api/erp/product";
import { listPrice, getPrice } from "@/api/erp/price";
import { listSupplier, getSupplier } from "@/api/erp/supplier";
import router from '@/router'

const { proxy } = getCurrentInstance();
const { record_status } = proxy.useDict('record_status');

const planList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const daterangeCreateTime = ref([]);
const productList = ref([]);
const priceList = ref([]);
const titleForwarderPrice = ref("");
const openForwarderPrice = ref(false);
const selectedPlanList = ref([]);
const selectedSkuIdList = ref([]);
const supplierOfferList = ref([]);

const data = reactive({
  form: {},
  formForwarderPrice: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    planName: null,
    planSkuId: null,
    priceId: null,
    supplierPriceOfferId: null,
    forwarderPrice: null,
    createTime: null,
    status: null
  },
  priceQueryParams: {
    skuId: null
  },
  rules: {
    // planName: [
    //   { required: true, message: "选品计划名称不能为空", trigger: "blur" }
    // ],
    planSkuId: [
      { required: true, message: "SKU不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules, formForwarderPrice, priceQueryParams } = toRefs(data);

function getProduct(planSkuId) {
  if (planSkuId != null && '' != planSkuId) {
    queryParams.value.skuId = planSkuId;
    listProduct(queryParams.value).then(response => {
      productList.value = response.rows;
    });
    getPriceList(planSkuId);
    getSupplierOfferList(planSkuId);
  }
}

function getPriceInfo(priceId) {
  if (priceId != null && '' != priceId) {
    console.log(222);
    getPrice(priceId).then(response => {
      priceList.value.push(response.data);
    });
  }
}

function getPriceList(planSkuId) {
  if (planSkuId != null && '' != planSkuId) {
    queryParams.value.skuId = planSkuId;
    listPrice(queryParams.value).then(response => {
      priceList.value = response.rows;
    });
  }
}

/** 查询供应商报价列表 */
function getSupplierOfferList(planSkuId) {
  priceQueryParams.value.skuId = planSkuId;
  listSupplier(priceQueryParams.value).then(response => {
    supplierOfferList.value = response.rows;
  });
}


/** 查询选品计划列表 */
function getList() {
  loading.value = true;
  queryParams.value.params = {};
  if (null != daterangeCreateTime && '' != daterangeCreateTime) {
    queryParams.value.params["beginCreateTime"] = daterangeCreateTime.value[0];
    queryParams.value.params["endCreateTime"] = daterangeCreateTime.value[1];
  }
  listPlan(queryParams.value).then(response => {
    planList.value = response.rows;
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
    planCode: null,
    planName: null,
    planSkuId: null,
    priceId: null,
    supplierPriceOfferId: null,
    forwarderPrice: null,
    forecastPurchasePrice: null,
    createTime: null,
    updateTime: null,
    status: null,
    adRate: null,
    lossRate: null
  };
  proxy.resetForm("planRef");
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

  //新增选中的记录
  selectedPlanList.value = selection.map(item => item);
  selectedSkuIdList.value = selection.map(item => item.planSkuId);
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加选品计划";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getPlan(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改选品计划";
  });
  getPriceList(row.planSkuId);
  getSupplierOfferList(row.planSkuId);
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["planRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updatePlan(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addPlan(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除选品计划编号为"' + _ids + '"的数据项？').then(function () {
    return delPlan(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

////////一键修改头程报价

// 表单重置
function resetForwarderPrice() {
  formForwarderPrice.value = {
    dmProductSelectionPlanList: [],
    forwarderPrice: 0
  };
  proxy.resetForm("forwarderPriceRef");
}

function handleForwarderPrice() {
  resetForwarderPrice();
  openForwarderPrice.value = true;
  titleForwarderPrice.value = "批量修改货代头程报价";
  formForwarderPrice.value.dmProductSelectionPlanList = selectedPlanList.value;
  formForwarderPrice.value.skuIdListStr = selectedPlanList.value.map(item => item.planSkuId).join(",");
}

// 取消按钮
function cancelForwarderPrice() {
  openForwarderPrice.value = false;
  resetForwarderPrice();
}

/** 提交按钮 */
function submitFormForwarderPrice() {
  proxy.$refs["forwarderPriceRef"].validate(valid => {

    if (formForwarderPrice.value.length == 0) {
      proxy.$modal.msgError("批量修改货代头程报价时 SKU不能为空");
    } else {
      if (valid) {
        formForwarderPrice.value.dmProductSelectionPlanList = selectedPlanList.value;
        updateForwarderPrice(formForwarderPrice.value).then(response => {
          proxy.$modal.msgSuccess("批量修改货代头程报价成功");
          openForwarderPrice.value = false;
        });
      } else {
        proxy.$modal.msgError("批量修改货代头程报价失败");
      }
    }
  });
}


/** 导出按钮操作 */
function handleExport() {
  proxy.download('erp/plan/export', {
    ...queryParams.value
  }, `plan_${new Date().getTime()}.xlsx`)
}

/** 跳转商品编辑页面 */
function gotoProductEdit(skuId) {
  console.log(`skuId:${skuId}`)
  router.push({ path: "/product/product", query: {skuId: skuId} });
}

getList();
</script>

<style scope>
/* 在你的组件样式中定义链接的默认和悬停状态 */
.hover-link {
  color: #0077cc; /* 浅蓝色 */
  text-decoration: none; /* 去掉下划线 */
  transition: color 0.3s; /* 添加过渡效果 */
}

.hover-link:hover {
  color: #004499; /* 深蓝色 */
  text-decoration: underline; /* 显示下划线 */
}
</style>
