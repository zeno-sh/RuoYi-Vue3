<template>
  <div class="container">

    <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="68px">
      <el-form-item label="门店" prop="clientId">
        <dm-shop-select v-model="queryParams.clientId" clearable disabled></dm-shop-select>
      </el-form-item>
    </el-form>

    <el-card class="stat-card">
      <div class="stat-header">
        <span class="header-title">实时销量</span>
        <el-icon class="details-arrow" @click="openDetails">
          <ArrowRight />
        </el-icon>
      </div>

      <div class="stat-row">
        <div class="stat-item">
          <div class="stat-title">销量</div>
          <div class="stat-number">{{ volumeData.todayOrderVolume }}</div>
          <div class="stat-compare">昨 {{ volumeData.yesterdayOrderVolume }}</div>
        </div>

        <el-tooltip class="item" effect="dark" :content="(tooltipContent)" placement="top">
          <div class="stat-item">
            <div class="stat-title">销售额</div>
            <div class="stat-number" style="color: rgb(0, 91, 245)">{{ formatCurrency(volumeData.todayAmount) }}</div>
            <div class="stat-compare">昨 {{ formatCurrency(volumeData.yesterdayAmount) }}</div>
          </div>
        </el-tooltip>

        <div class="stat-item">
          <div class="stat-title">订单量</div>
          <div class="stat-number">{{ volumeData.todayProductVolume }}</div>
          <div class="stat-compare">昨 {{ volumeData.yesterdayProductVolume }}</div>
        </div>

        <div class="stat-item">
          <div class="stat-title">取消订单数</div>
          <div class="stat-number">{{ volumeData.todayCancelOrderVolume }}</div>
          <div class="stat-compare">昨 {{ volumeData.yesterdayCancelOrderVolume }}</div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { listReport, volumn } from "@/api/erp/report";
import DmShopSelect from '@/components/DmShopSelect';

const volumeData = ref({});

const { proxy } = getCurrentInstance();

const data = reactive({
  form: {},
  queryParams: {
    clientId: '1633585',
    beginDate: '',
    endDate: ''
  },
  rules: {
    
  }
});

const { queryParams, form, rules } = toRefs(data);

function getVolume() {
  volumn(queryParams.value).then(response => {
    volumeData.value = response.data;
  });
}

function openDetails() {
  console.log('打开详情页面的逻辑');
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(amount);
}

const tooltipContent = computed(() => {
  // 假设volumeData已经包含了今日和昨日的销售金额
  const todayAmount = volumeData.value.todayAmount;
  const yesterdayAmount = volumeData.value.yesterdayAmount;

  // 使用这些金额来生成tooltip的内容
  return `今：${convertCurrency(todayAmount, 'CNY')} ${convertCurrency(todayAmount, 'USD')} | 昨：${convertCurrency(yesterdayAmount, 'CNY')} ${convertCurrency(yesterdayAmount, 'USD')}`;
});

function convertCurrency(amount, currency) {
  let locale;
  switch (currency) {
    case 'CNY':
      locale = 'zh-CN'; // 对于人民币，使用中国的语言环境
      break;
    case 'USD':
      locale = 'en-US'; // 对于美元，使用美国的语言环境
      break;
    default:
      locale = 'ru-RU'; // 默认使用俄罗斯的语言环境
      break;
  }
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount * getExchangeRate(currency));
}

function getExchangeRate(currency) {
  const rates = {
    'CNY': 0.078,
    'USD': 0.011 
  };
  return rates[currency] || 0;
}

getVolume();
</script>

<style scoped>
.container {
  padding: 30px;
  /* 顶部、左侧和右侧的空间预留 */
}

.stat-card {
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.stat-header {
  display: flex;
  /* justify-content: space-between; */
  align-items: center;
  margin-bottom: 20px;
}

.header-content {
  display: flex;
  align-items: center;
}

.header-title {
  font-size: 16px;
  font-weight: bold;
  margin-right: 8px;
  /* 可以根据实际需要调整这个右边距 */
}

.details-arrow {
  cursor: pointer;
  color: #3399ff;
  /* 或者您喜欢的颜色 */
}

.stat-row {
  display: flex;
  justify-content: space-between;
}

.stat-item {
  text-align: center;
}

.stat-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.stat-compare {
  font-size: 14px;
  color: #999;
}
</style>
