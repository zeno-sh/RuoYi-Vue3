<template>
  <div class="app-container">
    <el-card class="date-picker-card">
      <template #header>
        <div class="card-header">
          <span class="header-title">排行榜 TOP 10</span>
          <div class="date-shortcuts">
            <el-radio-group v-model="selectedShortcut" @change="selectShortcut" class="date-shortcuts">
              <el-radio-button label="today">今日</el-radio-button>
              <el-radio-button label="last7Days">前7天</el-radio-button>
              <el-radio-button label="last30Days">前30天</el-radio-button>
              <el-radio-button label="custom">自定义</el-radio-button>
            </el-radio-group>
            <el-date-picker v-if="isCustom" v-model="customDateRange" type="daterange" start-placeholder="开始日期"
              end-placeholder="结束日期" format="YYYY-MM-DD" value-format="YYYY-MM-DD" range-separator="至"
              @change="handleCustomDateChange" class="date-range-picker" />
          </div>
        </div>
      </template>
      <div class="cart-table">
        <product-profit ref="profitTableRef"></product-profit>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, defineProps } from 'vue';
import dayjs from 'dayjs';
import ProductProfit from '@/views/dashboard/ProductProfit'

const props = defineProps({
  clientId: {
    type: String,
    required: true
  }
});

const profitTableRef = ref(null);
const selectedShortcut = ref('last7Days');
const customDateRange = ref([]);
const isCustom = computed(() => selectedShortcut.value === 'custom');

function selectShortcut(shortcut) {
  let start, end;

  switch (shortcut) {
    case 'today':
      start = end = dayjs().format('YYYY-MM-DD');
      break;
    case 'last7Days':
      start = dayjs().subtract(7, 'day').format('YYYY-MM-DD');
      end = dayjs().format('YYYY-MM-DD');
      break;
    case 'last30Days':
      start = dayjs().subtract(30, 'day').format('YYYY-MM-DD');
      end = dayjs().format('YYYY-MM-DD');
      break;
  }

  // 当用户选择的不是自定义日期时，更新日期范围
  if (shortcut !== 'custom') {
    customDateRange.value = [start, end];
  }
  // console.log('Shortcut selected:', customDateRange.value);
  updateChildParams();
}

// 使用 function 定义 handleCustomDateChange 函数
function handleCustomDateChange(value) {
  // 处理自定义日期范围选择
  customDateRange.value = value;
  // console.log('Custom date range selected:', customDateRange.value);
  updateChildParams();
}

onMounted(function () {
  selectShortcut('last7Days');
});

function updateChildParams() {
  // 假设这些值是从某个地方获取的，比如表单输入
  const newParams = {
    clientId: props.clientId,
    beginDate: customDateRange.value[0],
    endDate: customDateRange.value[1],
  };

  profitTableRef.value.updateParams(newParams);
}
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-table {
  margin-top: 20px;
}

.date-shortcuts {
  display: flex;
  align-items: center;
  /* Adjust this to control the width of your date shortcuts and picker */
  width: auto;
  margin-right: 10px;
}

.el-button-group {
  margin-right: 20px;
  /* Adjust spacing as needed */
}

.date-range-picker {
  /* Set maximum width for the date range picker */
  max-width: 100%;
  /* Adjust this to control the width */
}

.header-title {
  font-weight: 800;
  font-size: 14px;
  line-height: 22px;
  color: #000000f2;
  cursor: pointer;
}
</style>
