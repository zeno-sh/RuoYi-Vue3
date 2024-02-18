<template>
  <div>
    <el-table :data="reportDataInfo.rows" border>
      <!-- <el-table-column prop="platformSkuId" label="Platform SKU ID"></el-table-column> -->
      <el-table-column label="图片" align="center" prop="imageUrl" width="100">
        <template #default="scope">
          <image-preview :src="scope.row.imageUrl" :width="50" :height="50" />
        </template>
      </el-table-column>
      <el-table-column prop="offerId" label="货号" width="190"></el-table-column>
      <el-table-column prop="totalVolume" label="小计" width="100"></el-table-column>
      <el-table-column v-for="column in reportDataInfo.columns" :key="column" :label="column" width="120">
        <template #default="scope">
          {{ scope.row.dateVolume[column] }}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { volumeList } from "@/api/erp/report";
import { ref, onMounted } from 'vue';
import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, formatISO } from 'date-fns';


const props = defineProps({
  clientId: String,
  beginDate: String,
  endDate: String,
  timeUnit: String,
});

const reportDataInfo = ref({
  columns: [],
  rows: [],
});


// 根据timeUnit格式化日期范围
function formatColumnLabel(column, timeUnit) {
  const [startDate, endDate] = column.split("~").map(date => parseISO(date));
  switch (timeUnit) {
    case 'month':
      return format(startDate, 'yyyy-MM');
    case 'week':
      const weekStart = startOfWeek(startDate);
      const weekEnd = endOfWeek(endDate);
      return `${format(weekStart, 'MM-dd')}~${format(weekEnd, 'MM-dd')}`;
    case 'day':
      return format(startDate, 'MM-dd');
    default:
      return column;
  }
}

// 格式化dateVolume的键
function formatDateVolumeKeys(rows, timeUnit) {
  return rows.map(row => {
    const formattedDateVolume = Object.keys(row.dateVolume).reduce((acc, key) => {
      const formattedKey = formatColumnLabel(key, timeUnit);
      acc[formattedKey] = row.dateVolume[key];
      return acc;
    }, {});
    return { ...row, dateVolume: formattedDateVolume };
  });
}

function fetchSalesData() {
  const query = { clientId: '1633585', beginDate: '2024-02-01', endDate: '2024-02-11', timeUnit: 'week' };
  volumeList(query).then((response) => {
    const { rows, columns, code } = response;
    // 格式化columns
    const formattedColumns = columns.map(column => formatColumnLabel(column, query.timeUnit));
    // 格式化dateVolume的键
    const formattedRows = formatDateVolumeKeys(rows, query.timeUnit);

    reportDataInfo.value = {
      columns: formattedColumns,
      rows: formattedRows,
    };
  });
}

onMounted(() => {
  fetchSalesData();
});
</script>

<style scoped></style>
