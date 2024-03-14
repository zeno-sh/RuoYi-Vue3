<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="门店" prop="clientId">
        <!-- <el-input v-model="queryParams.clientId" placeholder="请输入门店" clearable @keyup.enter="handleQuery" /> -->
        <dm-shop-select v-model="queryParams.clientId" clearable></dm-shop-select>
      </el-form-item>
      <el-form-item label="账单日期" style="width: 308px">
        <el-date-picker v-model="daterangeCreateTime" value-format="YYYY-MM-DD" type="daterange" range-separator="-"
          start-placeholder="开始日期" end-placeholder="结束日期" :shortcuts="shortcuts"></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['erp:transaction:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="reportList" height="600" border>
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="index" width="50" label="序号" fixed />
      <!-- <el-table-column label="门店id" align="center" prop="clientId" fixed /> -->
      <el-table-column label="利润" align="center">
        <el-table-column label="毛利润" align="center" prop="grossProfit" width="120">
          <template #default="scope">
            <FormattedCurrency :value="scope.row.grossProfit" />
          </template>
        </el-table-column>
        <el-table-column label="毛利率" align="center" prop="grossMargin" width="120">
          <template #default="scope">
            {{ (scope.row.grossMargin * 100).toFixed(2) + '%' }}
          </template>
        </el-table-column>
        <el-table-column label="ROI" align="center" prop="roi" width="120">
          <template #default="scope">
            {{ (scope.row.roi * 100).toFixed(2) + '%' }}
          </template>
        </el-table-column>
        <el-table-column label="ACoS" align="center" prop="acos" width="120">
          <template #default="scope">
            {{ (scope.row.acos * 100).toFixed(2) + '%' }}
          </template>
        </el-table-column>
        <el-table-column label="ACoAS" align="center" prop="acoas" width="120">
          <template #default="scope">
            {{ (scope.row.acoas * 100).toFixed(2) + '%' }}
          </template>
        </el-table-column>
        <el-table-column label="经营收入" align="center" prop="incomeOperating" width="120">
          <template #default="scope">
            <FormattedCurrency :value="scope.row.incomeOperating" />
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column label="平台收入" align="center">
        <el-table-column label="订单量" align="center" prop="volumeOrder" />
        <el-table-column label="销售量" align="center" prop="volumeProduct" />
        <el-table-column label="退货量" align="center" prop="volumeReturns" />
        <el-table-column label="退货率" align="center" prop="returnRate">
          <template #default="scope">
            {{ (scope.row.returnRate * 100).toFixed(2) + '%' }}
          </template>
        </el-table-column>
        <el-table-column label="广告销量" align="center" prop="volumeAd" />
        <el-table-column label="销售额" align="center" prop="amountSales" width="120">
          <template #default="scope">
            <FormattedCurrency :value="scope.row.amountSales" />
          </template>
        </el-table-column>
        <el-table-column label="广告销售额" align="center" prop="amountAd" width="120">
          <template #default="scope">
            <FormattedCurrency :value="scope.row.amountAd" />
          </template>
        </el-table-column>
      </el-table-column>
      <el-table-column label="平台支出" align="center">
        <el-table-column label="广告花费" align="center" prop="costAd" width="120">
          <template #default="scope">
            <FormattedCurrency :value="scope.row.costAd" />
          </template>
        </el-table-column>
        <el-table-column label="平台服务费" align="center" prop="costPlatformService" width="120">
          <template #default="scope">
            <FormattedCurrency :value="scope.row.costPlatformService" />
          </template>
        </el-table-column>
        <el-table-column label="平台佣金" align="center" prop="costCommissions" width="120">
          <template #default="scope">
            <FormattedCurrency :value="scope.row.costCommissions" />
          </template>
        </el-table-column>
        <el-table-column label="平台送货费" align="center" prop="costDelivery" width="120">
          <template #default="scope">
            <FormattedCurrency :value="scope.row.costDelivery" />
          </template>
        </el-table-column>
        <el-table-column label="海外仓操作费" align="center" prop="costFbsWarehouse" width="120">
          <template #default="scope">
            <FormattedCurrency :value="scope.row.costFbsWarehouse" />
          </template>
        </el-table-column>
        <el-table-column label="海外仓仓储费" align="center" prop="costStorage" width="120">
          <template #default="scope">
            <FormattedCurrency :value="scope.row.costStorage" />
          </template>
        </el-table-column>
        <el-table-column label="平台退货费" align="center" prop="costReturnDelivery" width="120">
          <template #default="scope">
            <FormattedCurrency :value="scope.row.costReturnDelivery" />
          </template>
        </el-table-column>
      </el-table-column>

      <el-table-column label="商品成本" align="center">
        <el-table-column label="采购成本" align="center" prop="costPurchase" width="120">
          <template #default="scope">
            <FormattedCurrency :value="scope.row.costPurchase" />
          </template>
        </el-table-column>
        <el-table-column label="头程成本" align="center" prop="costFirstLeg" width="120">
          <template #default="scope">
            <FormattedCurrency :value="scope.row.costFirstLeg" />
          </template>
        </el-table-column>
      </el-table-column>

      <el-table-column label="经营成本" align="center">
        <el-table-column label="店铺租金" align="center" prop="costRent" width="120">
          <template #default="scope">
            <FormattedCurrency :value="scope.row.costRent" />
          </template>
        </el-table-column>
        <el-table-column label="营业税" align="center" prop="costBusinessTax" width="120">
          <template #default="scope">
            <FormattedCurrency :value="scope.row.costBusinessTax" />
          </template>
        </el-table-column>
        <el-table-column label="银行税" align="center" prop="costBankTax" width="120">
          <template #default="scope">
            <FormattedCurrency :value="scope.row.costBankTax" />
          </template>
        </el-table-column>
      </el-table-column>

      <!-- <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['erp:transaction:edit']">修改</el-button>
        </template>
      </el-table-column> -->
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

  </div>
</template>
  
<script setup name="Report">
import FormattedCurrency from '@/components/FormattedCurrency'
import { listReport } from "@/api/erp/report";
import DmShopSelect from '@/components/DmShopSelect';

const { proxy } = getCurrentInstance();

const reportList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const total = ref(0);
const daterangeCreateTime = ref([]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 20,
    clientId: null,
    beginDate: '',
    endDate: ''
  },
  rules: {
    operationId: [
      { required: true, message: "操作ID不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

const shortcuts = [
  {
    text: '7天内',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 7);
      return [start, end];
    },
  },
  {
    text: '15天内',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 15);
      return [start, end];
    },
  },
  {
    text: '30天内',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);
      return [start, end];
    },
  },
  {
    text: '上周',
    value: () => {
      const end = new Date();
      const start = new Date();
      const day = end.getDay() || 7;
      start.setDate(start.getDate() - day + 1 - 7);
      end.setDate(end.getDate() - day);
      return [start, end];
    },
  },
  {
    text: '上月',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(1);
      start.setMonth(start.getMonth() - 1);
      end.setDate(1);
      end.setDate(end.getDate() - 1);
      return [start, end];
    },
  },
  {
    text: '本周',
    value: () => {
      const end = new Date();
      const start = new Date();
      const day = start.getDay() || 7;
      start.setDate(start.getDate() - day + 1);
      return [start, end];
    },
  },
  {
    text: '本月',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(1);
      return [start, end];
    },
  },
];


/** 查询交易记录列表 */
function getList() {
  loading.value = true;
  if (null != daterangeCreateTime && '' != daterangeCreateTime) {
    queryParams.value.beginDate = daterangeCreateTime.value[0];
    queryParams.value.endDate = daterangeCreateTime.value[1];
  }
  listReport(queryParams.value).then(response => {
    reportList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
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

/** 导出按钮操作 */
function handleExport() {
  // proxy.download('erp/transaction/export', {
  //   ...queryParams.value
  // }, `transaction_${new Date().getTime()}.xlsx`)
}

getList();
</script>
  