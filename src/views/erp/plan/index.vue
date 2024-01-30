<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="98px">
      <el-form-item label="閫夊搧璁″垝鍚嶇О" prop="planName">
        <el-input v-model="queryParams.planName" placeholder="璇疯緭鍏ラ€夊搧璁″垝鍚嶇О" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="SKU" prop="planSkuId">
        <el-input v-model="queryParams.planSkuId" placeholder="璇疯緭鍏KU" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="鍒涘缓鏃堕棿" style="width: 308px">
        <el-date-picker v-model="daterangeCreateTime" value-format="YYYY-MM-DD" type="daterange" range-separator="-"
          start-placeholder="寮€濮嬫棩鏈�" end-placeholder="缁撴潫鏃ユ湡"></el-date-picker>
      </el-form-item>
      <el-form-item label="鐘舵€�" prop="status">
        <el-select v-model="queryParams.status" placeholder="璇烽€夋嫨鐘舵€�" clearable>
          <el-option v-for="dict in record_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">鎼滅储</el-button>
        <el-button icon="Refresh" @click="resetQuery">閲嶇疆</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <!-- <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['erp:plan:add']">鏂板</el-button>
      </el-col> -->
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['erp:plan:edit']">淇敼</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['erp:plan:remove']">鍒犻櫎</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['erp:plan:export']">瀵煎嚭</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" @click="handleForwarderPrice"
          v-hasPermi="['erp:plan:edit']">涓€閿慨鏀硅揣浠ｅご绋嬫姤浠�</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="planList" @selection-change="handleSelectionChange" border height="700">
      <el-table-column type="selection" align="center" />
      <el-table-column label="閫夊搧璁″垝鍚嶇О" align="center" prop="planName" fixed width="120" />
      <el-table-column label="鍥剧墖" align="center" prop="productInfo.skuPicture" fixed>
        <template #default="scope">
          <image-preview :src="scope.row.productInfo.skuPicture" :width="50" :height="50" />
        </template>
      </el-table-column>
      <el-table-column label="SKU" align="center" prop="planSkuId" fixed width="190">
        <template #default="scope">
          <a @click="gotoProductEdit(scope.row.planSkuId)" class="hover-link">{{ scope.row.planSkuId }}</a>
        </template>
      </el-table-column>
      <el-table-column label="浜у搧鍚嶇О" align="center" prop="productInfo.skuName" width="150" />
      
      <el-table-column label="鍒╂鼎棰勪及" align="center">
        <el-table-column label="鍓嶇鍘熶环" align="center" prop="productPrice.originalPrice" width="100">
          <template #default="scope">
            <span>{{ scope.row.productPrice.originalPrice }} 鍗㈠竷</span>
          </template>
        </el-table-column>
        <el-table-column label="鍓嶇瀹氫环" align="center" prop="productPrice.sellingPrice" width="100">
          <template #default="scope">
            <span>{{ scope.row.productPrice.sellingPrice }} 鍗㈠竷</span>
          </template>
        </el-table-column>
        <el-table-column label="缁撶畻浠�" align="center" prop="settlementPrice" width="100" />
        <el-table-column label="棰勪及鍒╂鼎" align="center" prop="profitPrice" width="100" />
        <el-table-column label="姣涘埄鐜�" align="center" prop="grossProfitRate" width="100" />
        <el-table-column label="ROI" align="center" prop="roiRate" width="100" />
      </el-table-column>
      
      <el-table-column label="鍟嗗搧瑙勬牸" align="center">
        <el-table-column label="绠辫" align="center" width="150"
          prop="productInfo.specification.boxLength,specification.boxLength.boxWidth">
          <template #default="scope">
            <span>{{ scope.row.productInfo.specification.boxLength }}*
              {{ scope.row.productInfo.specification.boxWidth }}*
              {{ scope.row.productInfo.specification.boxHeight }} cm
            </span>
          </template>
        </el-table-column>
        <el-table-column label="PCS" align="center" prop="productInfo.specification.quantityPerBox" width="70" />
        <el-table-column label="绠遍噸" align="center" prop="productInfo.specification.boxWeight">
          <template #default="scope">
            <span v-if="scope.row.productInfo.specification.boxWeight >= 1000">{{
              scope.row.productInfo.specification.boxWeight / 1000 }} kg
            </span>
            <span v-if="scope.row.productInfo.specification.boxWeight < 1000">{{
              scope.row.productInfo.specification.boxWeight }} g
            </span>
          </template>
        </el-table-column>
        <el-table-column label="鍖呰瑙勬牸" align="center" width="150" prop="productInfo.specification.length">
          <template #default="scope">
            <span>{{ scope.row.productInfo.specification.length }}*
              {{ scope.row.productInfo.specification.width }}*
              {{ scope.row.productInfo.specification.height }} cm
            </span>
          </template>
        </el-table-column>
        <el-table-column label="鍗曞搧姣涢噸" align="center" prop="productInfo.specification.grossWeight">
          <template #default="scope">
            <span v-if="scope.row.productInfo.specification.grossWeight < 1000">{{
              scope.row.productInfo.specification.grossWeight }} g
            </span>
            <span v-if="scope.row.productInfo.specification.grossWeight >= 1000">{{
              scope.row.productInfo.specification.grossWeight / 1000 }} kg
            </span>
          </template>
        </el-table-column>
        <el-table-column label="鍗曞搧鍑€閲�" align="center" prop="productInfo.specification.netWeight">
          <template #default="scope">
            <span v-if="scope.row.productInfo.specification.netWeight < 1000">{{
              scope.row.productInfo.specification.netWeight }} g
            </span>
            <span v-if="scope.row.productInfo.specification.netWeight >= 1000">{{
              scope.row.productInfo.specification.netWeight / 1000 }} kg
            </span>
          </template>
        </el-table-column>
        <el-table-column label="浣撶Нm鲁" align="center" prop="productInfo.volume" />
        <el-table-column label="浣撶Н鍗�" align="center" prop="productInfo.volumeRise" />
        <el-table-column label="瀵嗗害" align="center" prop="productInfo.density" />
      </el-table-column>


      <el-table-column label="鎴愭湰鏄庣粏锛堜汉姘戝竵锛�" align="center">
        <el-table-column label="鍥藉唴鎴愭湰" align="center">
          <el-table-column label="閲囪喘浠�" align="center" prop="productCost.purchasePrice" />
          <el-table-column label="璐т唬澶寸▼" align="center" prop="productCost.firstLegPrice" />
        </el-table-column>
        <el-table-column label="娴峰浠撴垚鏈�" align="center">
          <el-table-column label="鍗歌揣璐�" align="center" prop="productCost.fbsUnloadPrice" />
          <el-table-column label="涓婃灦璐�" align="center" prop="productCost.fbsShelfPrice" />
          <el-table-column label="璁㈠崟鎿嶄綔璐�" align="center" prop="productCost.fbsOrderPrice" width="100" />
          <el-table-column label="閫佽揣璐�" align="center" prop="productCost.fbsDeliveryPrice" />
        </el-table-column>
        <el-table-column label="骞冲彴鎴愭湰" align="center">
          <el-table-column label="绫荤洰浣ｉ噾" align="center" prop="productCostConfig.categoryRate" />
          <el-table-column label="ozon杞繍璐�" align="center" prop="productCost.ozonDeliveryPrice" width="100" />
          <el-table-column label="鏈€鍚庝竴鍏噷" align="center" prop="productCost.lastMilePrice" width="100" />
          <el-table-column label="骞垮憡璐圭巼" align="center" prop="productCostConfig.adRate" width="100" />
          <el-table-column label="骞垮憡璐�" align="center" prop="productCost.adPrice" width="100" />
          <el-table-column label="璐ф崯鐜�" align="center" prop="productCostConfig.lossRate" width="100" />
          <el-table-column label="璐ф崯" align="center" prop="productCost.lossPrice" width="100" />

        </el-table-column>
      </el-table-column>

      <el-table-column label="绔炲搧瓒嬪娍" align="center" width="250">
        <template #default="scope">
          <div v-for="trend in scope.row.productPlatformTrends" :key="trend.id">
            <div>skuId:{{ trend.competitorSkuId }} 閿€閲忥細{{ trend.competitorSaleNumber }}</div>
            <div>浠锋牸锛歿{ trend.competitorSalePrice }} 浠介锛歿{ parseInt(trend.competitorSalePrice * trend.competitorSaleNumber)
            }}</div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="鍒涘缓鏃堕棿" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="淇敼鏃堕棿" align="center" prop="updateTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="鐘舵€�" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="record_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="鎿嶄綔" align="center" class-name="small-padding fixed-width" width="180">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['erp:plan:edit']">淇敼</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['erp:plan:remove']">鍒犻櫎</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 娣诲姞鎴栦慨鏀归€夊搧璁″垝瀵硅瘽妗� -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="planRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="閫夊搧璁″垝鍚嶇О" prop="planName">
          <el-input v-model="form.planName" placeholder="璇疯緭鍏ラ€夊搧璁″垝鍚嶇О" />
        </el-form-item>
        <el-form-item label="SKU" prop="planSkuId">
          <el-select v-model="form.planSkuId" :multiple="false" filterable remote reserve-keyword placeholder="璇疯緭鍏KU"
            remote-show-suffix :remote-method="getProduct" disabled>
            <el-option v-for="item in productList" :key="item.skuId" :label="`${item.skuName}` + ' / ' + `${item.skuId}`"
              :value="item.skuId">
              <span style="float: left">{{ item.skuName }}</span>
              <span style=" float: right; color: var(--el-text-color-secondary); font-size: 13px; ">{{ item.skuId
              }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="浠锋牸璁″垝" prop="priceId">
          <el-select v-model="form.priceId" :multiple="false" filterable remote reserve-keyword placeholder="璇疯緭鍏KU"
            remote-show-suffix :remote-method="getPriceList">
            <el-option v-for="item in priceList" :key="parseInt(item.id)"
              :label="`${item.priceStrategyName}` + ' / ' + `${item.sellingPrice} RUB`" :value="parseInt(item.id)">
              <span style="float: left">{{ item.priceStrategyName }}</span>
              <span style=" float: right; color: var(--el-text-color-secondary); font-size: 13px; ">{{ item.sellingPrice
              }} RUB</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="渚涘簲鍟嗘姤浠�" prop="supplierPriceOfferId">
          <!-- <el-input v-model="form.supplierPriceOfferId" placeholder="璇疯緭鍏ヤ緵搴斿晢鎶ヤ环" /> -->
          <el-select v-model="form.supplierPriceOfferId" :multiple="false" filterable remote reserve-keyword
            placeholder="璇疯緭鍏KU" remote-show-suffix>
            <el-option v-for="item in supplierOfferList" :key="parseInt(item.id)"
              :label="`${item.supplierCode}` + ' / ' + `${item.price} RMB`" :value="parseInt(item.id)">
              <span style="float: left">{{ item.supplierCode }}</span>
              <span style=" float: right; color: var(--el-text-color-secondary); font-size: 13px; ">{{ item.price
              }} RMB</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="璐т唬鎶ヤ环" prop="forwarderPrice">
          <el-input v-model="form.forwarderPrice" placeholder="璇疯緭鍏ヨ揣浠ｆ姤浠�" />
        </el-form-item>
        <el-form-item label="棰勪及閲囪喘浠�" prop="forecastPurchasePrice">
          <el-input v-model="form.forecastPurchasePrice" placeholder="杩欓噷鍙互涓存椂鎸囧畾閲囪喘浠�" clearable />
        </el-form-item>
        <el-form-item label="骞垮憡璐圭巼" prop="adRate">
          <el-input v-model="form.adRate" placeholder="璇疯緭鍏ュ箍鍛婅垂鐜�" />
        </el-form-item>
        <el-form-item label="璐ф崯鐜�" prop="lossRate">
          <el-input v-model="form.lossRate" placeholder="璇疯緭鍏ヨ揣鎹熺巼" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">纭� 瀹�</el-button>
          <el-button @click="cancel">鍙� 娑�</el-button>
        </div>
      </template>
    </el-dialog>


    <!-- 鎵归噺淇敼璐т唬澶寸▼浠锋牸 -->
    <el-dialog :title="titleForwarderPrice" v-model="openForwarderPrice" width="600px" append-to-body>
      <el-form ref="forwarderPriceRef" :model="formForwarderPrice" :rules="rules" label-width="120px">
        <el-form-item label="SKU" prop="skuIdListStr">
          <el-input disabled v-model="formForwarderPrice.skuIdListStr" type="textarea" placeholder="璇烽€夋嫨SKU" />
        </el-form-item>
        <el-form-item label="璐т唬澶寸▼鎶ヤ环" prop="forwarderPrice">
          <el-input v-model="formForwarderPrice.forwarderPrice" placeholder="璇疯緭鍏ユ湰娆¤揣浠ｅご绋嬫姤浠凤紙浜烘皯甯侊級" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitFormForwarderPrice">纭� 瀹�</el-button>
          <el-button @click="cancelForwarderPrice">鍙� 娑�</el-button>
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
import { useRouter } from 'vue-router';

// 浣跨敤 useRouter 鑾峰彇璺敱瀹炰緥
const router = useRouter();


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
    //   { required: true, message: "閫夊搧璁″垝鍚嶇О涓嶈兘涓虹┖", trigger: "blur" }
    // ],
    planSkuId: [
      { required: true, message: "SKU涓嶈兘涓虹┖", trigger: "blur" }
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

/** 鏌ヨ渚涘簲鍟嗘姤浠峰垪琛� */
function getSupplierOfferList(planSkuId) {
  priceQueryParams.value.skuId = planSkuId;
  listSupplier(priceQueryParams.value).then(response => {
    supplierOfferList.value = response.rows;
  });
}


/** 鏌ヨ閫夊搧璁″垝鍒楄〃 */
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

// 鍙栨秷鎸夐挳
function cancel() {
  open.value = false;
  reset();
}

// 琛ㄥ崟閲嶇疆
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

/** 鎼滅储鎸夐挳鎿嶄綔 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 閲嶇疆鎸夐挳鎿嶄綔 */
function resetQuery() {
  daterangeCreateTime.value = [];
  proxy.resetForm("queryRef");
  handleQuery();
}

// 澶氶€夋閫変腑鏁版嵁
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;

  //鏂板閫変腑鐨勮褰�
  selectedPlanList.value = selection.map(item => item);
  selectedSkuIdList.value = selection.map(item => item.planSkuId);
}

/** 鏂板鎸夐挳鎿嶄綔 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "娣诲姞閫夊搧璁″垝";
}

/** 淇敼鎸夐挳鎿嶄綔 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getPlan(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "淇敼閫夊搧璁″垝";
  });
  getPriceList(row.planSkuId);
  getSupplierOfferList(row.planSkuId);
}

/** 鎻愪氦鎸夐挳 */
function submitForm() {
  proxy.$refs["planRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updatePlan(form.value).then(response => {
          proxy.$modal.msgSuccess("淇敼鎴愬姛");
          open.value = false;
          getList();
        });
      } else {
        addPlan(form.value).then(response => {
          proxy.$modal.msgSuccess("鏂板鎴愬姛");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 鍒犻櫎鎸夐挳鎿嶄綔 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('鏄惁纭鍒犻櫎閫夊搧璁″垝缂栧彿涓�"' + _ids + '"鐨勬暟鎹」锛�').then(function () {
    return delPlan(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("鍒犻櫎鎴愬姛");
  }).catch(() => { });
}

////////涓€閿慨鏀瑰ご绋嬫姤浠�

// 琛ㄥ崟閲嶇疆
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
  titleForwarderPrice.value = "鎵归噺淇敼璐т唬澶寸▼鎶ヤ环";
  formForwarderPrice.value.dmProductSelectionPlanList = selectedPlanList.value;
  formForwarderPrice.value.skuIdListStr = selectedPlanList.value.map(item => item.planSkuId).join(",");
}

// 鍙栨秷鎸夐挳
function cancelForwarderPrice() {
  openForwarderPrice.value = false;
  resetForwarderPrice();
}

/** 鎻愪氦鎸夐挳 */
function submitFormForwarderPrice() {
  proxy.$refs["forwarderPriceRef"].validate(valid => {

    if (formForwarderPrice.value.length == 0) {
      proxy.$modal.msgError("鎵归噺淇敼璐т唬澶寸▼鎶ヤ环鏃� SKU涓嶈兘涓虹┖");
    } else {
      if (valid) {
        formForwarderPrice.value.dmProductSelectionPlanList = selectedPlanList.value;
        updateForwarderPrice(formForwarderPrice.value).then(response => {
          proxy.$modal.msgSuccess("鎵归噺淇敼璐т唬澶寸▼鎶ヤ环鎴愬姛");
          openForwarderPrice.value = false;
        });
      } else {
        proxy.$modal.msgError("鎵归噺淇敼璐т唬澶寸▼鎶ヤ环澶辫触");
      }
    }
  });
}


/** 瀵煎嚭鎸夐挳鎿嶄綔 */
function handleExport() {
  proxy.download('erp/plan/export', {
    ...queryParams.value
  }, `plan_${new Date().getTime()}.xlsx`)
}

/** 璺宠浆鍟嗗搧缂栬緫椤甸潰 */
function gotoProductEdit(skuId) {
  // router.push({ path: "/product/product", query: { skuId: skuId } });////
  router.push({ name: "Productinfo", state: { skuId: skuId } });
}

getList();
</script>

<style scope>
/* 鍦ㄤ綘鐨勭粍浠舵牱寮忎腑瀹氫箟閾炬帴鐨勯粯璁ゅ拰鎮仠鐘舵€� */
.hover-link {
  color: #0077cc;
  /* 娴呰摑鑹� */
  text-decoration: none;
  /* 鍘绘帀涓嬪垝绾� */
  transition: color 0.3s;
  /* 娣诲姞杩囨浮鏁堟灉 */
}

.hover-link:hover {
  color: #004499;
  /* 娣辫摑鑹� */
  text-decoration: underline;
  /* 鏄剧ず涓嬪垝绾� */
}
</style>
