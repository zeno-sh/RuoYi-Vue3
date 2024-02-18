<template>
  <div class="cards-wrapper">
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

          <el-tooltip class="item" effect="dark"
            :content="tooltipContent(volumeData.todayOrderVolume, volumeData.yesterdayAmount)" placement="top">
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

          <el-tooltip class="item" effect="dark"
            :content="tooltipContent(volumeData.todayAvgPrice, volumeData.yesterdayAvgPrice)" placement="top">
            <div class="stat-item">
              <div class="stat-title">平均售价</div>
              <div class="stat-number">{{ formatCurrency(volumeData.todayAvgPrice) }}</div>
              <div class="stat-compare">昨 {{ formatCurrency(volumeData.yesterdayAvgPrice) }}</div>
            </div>
          </el-tooltip>

          <div class="stat-item">
            <div class="stat-title">取消订单数</div>
            <div class="stat-number">{{ volumeData.todayCancelOrderVolume }}</div>
            <div class="stat-compare">昨 {{ volumeData.yesterdayCancelOrderVolume }}</div>
          </div>
        </div>
      </el-card>

      <!-- 广告 -->
      <el-card class="stat-card">
        <div class="stat-header">
          <span class="header-title">实时广告</span>
          <el-icon class="details-arrow" @click="openDetails">
            <ArrowRight />
          </el-icon>
        </div>

        <div class="stat-row">
          <el-tooltip class="item" effect="dark" :content="tooltipContent(adData.todaySpend, adData.yesterdaySpend)"
            placement="top">
            <div class="stat-item">
              <div class="stat-title">广告花费</div>
              <div class="stat-number">{{ formatCurrency(adData.todaySpend) }}</div>
              <div class="stat-compare">昨 {{ formatCurrency(adData.yesterdaySpend) }}</div>
            </div>
          </el-tooltip>

          <el-tooltip class="item" effect="dark"
            :content="tooltipContent(adData.todayOrderVolume, adData.yesterdayAmount)" placement="top">
            <div class="stat-item">
              <div class="stat-title">广告销售额</div>
              <div class="stat-number">{{ formatCurrency(adData.todayAmount) }}</div>
              <div class="stat-compare">昨 {{ formatCurrency(adData.yesterdayAmount) }}</div>
            </div>
          </el-tooltip>

          <div class="stat-item">
            <div class="stat-title">广告订单量</div>
            <div class="stat-number">{{ adData.todayAdVolume }}</div>
            <div class="stat-compare">昨 {{ adData.yesterdayAdVolume }}</div>
          </div>

          <div class="stat-item">
            <div class="stat-title">ACOS</div>
            <div class="stat-number">{{ (adData.todayAcos * 100).toFixed(2) + '%' }}</div>
            <div class="stat-compare">昨 {{ (adData.yesterdayAcos * 100).toFixed(2) + '%' }}</div>
          </div>

          <div class="stat-item">
            <div class="stat-title">ACoAS</div>
            <div class="stat-number">{{ (adData.todayAcoas * 100).toFixed(2) + '%' }}</div>
            <div class="stat-compare">昨 {{ (adData.yesterdayAcoas * 100).toFixed(2) + '%' }}</div>
          </div>
        </div>
      </el-card>
    </div>
</template>

<script setup>
import { defineProps } from "vue";
import { indexVolume, indexAd } from "@/api/erp/report";


const props = defineProps({
  clientId: {
    type: String,
    required: true
  }
});

const volumeData = ref({});
const adData = ref({});

const { proxy } = getCurrentInstance();

const data = reactive({
  form: {},
  queryParams: {
    clientId: props.clientId,
    beginDate: '',
    endDate: ''
  },
  rules: {

  }
});

const { queryParams } = toRefs(data);

function getVolume() {
  indexVolume(queryParams.value).then(response => {
    volumeData.value = response.data;
  });
}

function getAd() {
  indexAd(queryParams.value).then(response => {
    adData.value = response.data;
  });
}

function openDetails() {
  console.log('打开详情页面的逻辑');
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(amount);
}

function tooltipContent(todayAmount, yesterdayAmount) {
  // 使用这些金额来生成tooltip的内容
  return `今：${convertCurrency(todayAmount, 'CNY')} ${convertCurrency(todayAmount, 'USD')} | 昨：${convertCurrency(yesterdayAmount, 'CNY')} ${convertCurrency(yesterdayAmount, 'USD')}`;
};

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
getAd();
</script>

<style>
.cards-wrapper {
  display: flex;
  justify-content: space-between;
  /* 如果需要在卡片之间保持间距 */
  flex-wrap: wrap;
  /* 允许卡片在不足以并排显示时自动换行 */
}

.stat-card {
  flex: 1;
  /* 使每个卡片都尽可能占满可用空间，你也可以根据需要给它们设置最大和最小宽度 */
  margin: 0 12px;
  /* 根据需要调整，为卡片之间提供空间 */
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
  font-size: 14px;
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
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.stat-number {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.stat-compare {
  font-size: 14px;
  color: #999;
}
</style>
