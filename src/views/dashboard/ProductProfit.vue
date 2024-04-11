<template>
  <div class="container">
    <el-table v-loading="loading" :data="tableData" border height="450">
      <el-table-column type="index" label="" align="center" width="50" />
      <el-table-column prop="offerId" label="商品" align="left" width="250">
        <template #default="scope">
          <div style="display: flex; align-items: right;">
            <img :src="scope.row.imageUrl" style="width: 32px; height: 32px; margin-right: 10px;">
            <span>{{ scope.row.offerId }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="volumeSales" label="产品销量" align="right" width="110" sortable></el-table-column>
      <el-table-column prop="volumeAd" label="广告销量" align="right" width="110" sortable></el-table-column>
      <el-table-column prop="amountSales" label="销售额" align="right" width="120" sortable>
        <template #default="scope">
          <el-tooltip effect="dark" :content="convertAmount(scope.row.amountSales)" placement="right">
            <span>{{ formatCurrency(scope.row.amountSales.toFixed(2)) }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="costAd" label="广告花费" align="right" width="120" sortable>
        <template #default="scope">
          <el-tooltip effect="dark" :content="convertAmount(scope.row.costAd)" placement="right">
            <span>{{ formatCurrency(scope.row.costAd.toFixed(2)) }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="amountAd" label="广告销售额" align="right" width="120" sortable>
        <template #default="scope">
          <el-tooltip effect="dark" :content="convertAmount(scope.row.amountAd)" placement="right">
            <span>{{ formatCurrency(scope.row.amountAd.toFixed(2)) }}</span>
          </el-tooltip>
        </template>
      </el-table-column>


      <el-table-column prop="volumeReturn" label="退货量" align="right" width="80"></el-table-column>
      <el-table-column prop="amountReturn" label="退货金额" align="right" width="120">
        <template #default="scope">
          <el-tooltip effect="dark" :content="convertAmount(scope.row.amountReturn)" placement="right">
            <span>{{ formatCurrency(scope.row.amountReturn.toFixed(2)) }}</span>
          </el-tooltip>
        </template>
      </el-table-column>

      <el-table-column prop="amountProfit" label="利润" align="right" width="120" sortable>
        <template #default="scope">
          <el-tooltip effect="dark" :content="convertAmount(scope.row.amountProfit)" placement="right">
            <span>{{ formatCurrency(scope.row.amountProfit) }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="profitRate" label="毛利率" align="right" width="90" sortable>
        <template #default="scope">
          {{ convertRate(scope.row.profitRate) }}
        </template>
      </el-table-column>
      <el-table-column prop="roi" label="ROI" align="right" width="90" sortable>
        <template #default="scope">
          {{ convertRate(scope.row.roi) }}
        </template>
      </el-table-column>
      <el-table-column prop="acos" label="ACoS" align="right" width="90" sortable>
        <template #default="scope">
          {{ convertRate(scope.row.acos) }}
        </template>
      </el-table-column>
      <el-table-column prop="acoas" label="ACoAS" align="right" width="100" sortable>
        <template #default="scope">
          {{ convertRate(scope.row.acoas) }}
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="fetchData" />

  </div>
</template>

<script setup>
import { reactive, toRefs } from 'vue';
import { productProfit } from '@/api/erp/report';
import { formatCurrency, convertCurrency } from "@/utils/currencyFormat";

const state = reactive({
  tableData: [],
  total: 0,
  queryParams: {
    pageNum: 1,
    pageSize: 50,
    clientId: '',
    beginDate: '',
    endDate: '',
  },
});

const loading = ref(true);
const total = ref(0);

const { queryParams, tableData } = toRefs(state);

async function fetchData() {
  loading.value = true;
  productProfit(state.queryParams).then(response => {
    state.tableData = response.rows;
    state.total = response.total;
    loading.value = false;
  });
}

// 新增方法更新查询参数并重新加载数据
function updateParams({ clientId, beginDate, endDate }) {
  if (clientId !== undefined) state.queryParams.clientId = clientId;
  if (beginDate !== undefined) state.queryParams.beginDate = beginDate;
  if (endDate !== undefined) state.queryParams.endDate = endDate;
  fetchData(); // 更新参数后重新加载数据
}

function convertAmount(amount) {
  // 使用这些金额来生成tooltip的内容
  return `${convertCurrency(amount, 'CNY')} | ${convertCurrency(amount, 'USD')}`;
};

function convertRate(rate) {
  return `${(rate * 100).toFixed(2) + '%'}`
}


// 公开方法供父组件调用
defineExpose({ updateParams });
</script>

<style scoped>
.container {
  padding: 10px;
  /* 顶部、左侧和右侧的空间预留 */
}

.caret-wrapper {
  flex-direction: column;
  align-items: center;
  height: 14px;
  width: 24px;
  vertical-align: middle;
  cursor: pointer;
  overflow: initial;
  position: relative;
}
</style>


<!-- 父组件调用示例 -->
<!-- <template>
  <div>
    <ProductProfitTable ref="profitTableRef" />
    <el-button @click="updateChildParams">更新参数并加载数据</el-button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import ProductProfitTable from './ProductProfitTable.vue';

const profitTableRef = ref(null);

function updateChildParams() {
  // 假设这些值是从某个地方获取的，比如表单输入
  const newParams = {
    clientId: '新的ClientId',
    beginDate: '2022-01-01',
    endDate: '2022-12-31',
  };
  
  profitTableRef.value.updateParams(newParams);
}
</script> -->
