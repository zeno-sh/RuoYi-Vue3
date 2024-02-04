<template>
  <div :class="className" :style="{ height, width }" ref="chartContainer" />
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, nextTick, watch, toRefs } from 'vue';
import * as echarts from 'echarts';
// import 'echarts/theme/macarons'; // echarts theme
import { useResize } from './mixins/resize';

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
    default: '350px'
  },
  autoResize: {
    type: Boolean,
    default: true
  },
  chartData: {
    type: Object,
    required: true
  }
});

const { chartData } = toRefs(props);
const chartContainer = ref(null);
const chart = ref(null);

if (props.autoResize) {
  useResize(chart); // 如果props.autoResize为true，则使用resize逻辑
}

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

watch(chartData, (newValue) => {
  setOptions(newValue);
}, { deep: true });

function initChart() {
  if (chartContainer.value) {
    chart.value = echarts.init(chartContainer.value, 'macarons');
    setOptions(props.chartData);
  }
}

function setOptions({ expectedData, actualData } = {}) {
  if (!chart.value) return;

  chart.value.setOption({
    xAxis: {
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      boundaryGap: false,
      axisTick: {
        show: false
      }
    },
    grid: {
      left: 10,
      right: 10,
      bottom: 20,
      top: 30,
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      },
      padding: [5, 10]
    },
    yAxis: {
      axisTick: {
        show: false
      }
    },
    legend: {
      data: ['expected', 'actual']
    },
    series: [{
      name: 'expected',
      lineStyle: {
        color: '#FF005A',
        width: 2
      },
      smooth: true,
      type: 'line',
      data: expectedData,
      animationDuration: 2800,
      animationEasing: 'cubicInOut'
    },
    {
      name: 'actual',
      smooth: true,
      type: 'line',
          lineStyle: {
            color: '#3888fa',
            width: 2
          },areaStyle: {
            color: '#f3f8ff'
          },
      // itemStyle: {
      //   normal: {
      //     color: '#3888fa',

      //   }
      // },
      data: actualData,
      animationDuration: 2800,
      animationEasing: 'quadraticOut'
    }]
  });
}
</script>
