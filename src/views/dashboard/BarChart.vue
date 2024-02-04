<template>
  <div :class="className" :style="{height, width}" ref="chartContainer" />
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, nextTick } from 'vue';
import * as echarts from 'echarts';
import 'echarts/theme/macarons'; // echarts theme
import { useResize }from './mixins/resize';

const animationDuration = 6000;
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

onMounted(async () => {
  await nextTick();
  initChart();
  useResize(chart); // 在图表初始化后使用resize功能
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
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        top: 10,
        left: '2%',
        right: '2%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [{
        type: 'category',
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        axisTick: {
          alignWithLabel: true
        }
      }],
      yAxis: [{
        type: 'value',
        axisTick: {
          show: false
        }
      }],
      series: [{
        name: 'pageA',
        type: 'bar',
        stack: 'vistors',
        barWidth: '60%',
        data: [79, 52, 200, 334, 390, 330, 220],
        animationDuration
      }, {
        name: 'pageB',
        type: 'bar',
        stack: 'vistors',
        barWidth: '60%',
        data: [80, 52, 200, 334, 390, 330, 220],
        animationDuration
      }, {
        name: 'pageC',
        type: 'bar',
        stack: 'vistors',
        barWidth: '60%',
        data: [30, 52, 200, 334, 390, 330, 220],
        animationDuration
      }]
    });
  }
}
</script>
