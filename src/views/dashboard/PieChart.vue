<template>
  <div :class="className" :style="{height, width}" ref="chartContainer" />
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, nextTick } from 'vue';
import * as echarts from 'echarts';
import 'echarts/theme/macarons'; // echarts theme
import { useResize } from './mixins/resize'; // 使用改造后的resize逻辑

const props = defineProps({
  className: {
    type: String,
    default: 'chart'
  },
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: '300px'
  }
});

const chartContainer = ref(null);
const chart = ref(null);

useResize(chart); // 使用resize逻辑

onMounted(async () => {
  await nextTick();
  initChart();
});

onBeforeUnmount(() => {
  if (chart.value) {
    chart.value.dispose();
    chart.value = null;
  }
});

function initChart() {
  if (chartContainer.value) {
    chart.value = echarts.init(chartContainer.value, 'macarons');
    chart.value.setOption({
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)'
      },
      legend: {
        left: 'center',
        bottom: '10',
        data: ['Industries', 'Technology', 'Forex', 'Gold', 'Forecasts']
      },
      series: [
        {
          name: 'WEEKLY WRITE ARTICLES',
          type: 'pie',
          roseType: 'radius',
          radius: [15, 95],
          center: ['50%', '38%'],
          data: [
            { value: 320, name: 'Industries' },
            { value: 240, name: 'Technology' },
            { value: 149, name: 'Forex' },
            { value: 100, name: 'Gold' },
            { value: 59, name: 'Forecasts' }
          ],
          animationEasing: 'cubicInOut',
          animationDuration: 2600
        }
      ]
    });
  }
}
</script>
