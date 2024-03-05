<template>
  <el-select :multiple="false" filterable remote reserve-keyword placeholder="输入门店名称" remote-show-suffix
    :remote-method="getShopList" clearable @clear="clearList" @change="handleChange" v-model="selectedClientId">
    <el-option v-for="item in shopList" :key="item.id" :label="`${item.shopName} / ${item.clientId}`"
      :value="item.clientId">
      <span style="float: left">{{ item.shopName }}</span>
      <span style="float: right; color: var(--el-text-color-secondary); font-size: 13px; margin-left: 10px;">
        {{ item.clientId }}
      </span>
    </el-option>
  </el-select>
</template>

<script setup>
import { ref, reactive, toRefs, onMounted, defineProps, defineEmits, computed } from 'vue';
import { listMapping } from "@/api/erp/mapping";

// 通过defineProps接收clientId作为prop
const props = defineProps({
  clientId: {
    type: String,
    required: false
  }
});

// 定义emit事件，这里别名为clientId，所以事件是update:clientId
const emit = defineEmits(['update:clientId']);

const shopList = ref([]);
const selectedClientId = ref(props.clientId); // 使用ref来存储选中的clientId

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 100,
    clientId: props.clientId
  }
});

const { queryParams } = toRefs(data);

function getShopList(keyword) {
  queryParams.value.clientId = keyword;
  listMapping(queryParams.value).then(response => {
    shopList.value = response.rows;
    if (shopList.value.length > 0 && !selectedClientId.value) {
      selectedClientId.value = shopList.value[0].clientId;
      // 同时使用emit通知父组件更新clientId
      emit('update:clientId', selectedClientId.value);
    }
  });
}

function clearList() {
  shopList.value = [];
  selectedClientId.value = ''; // 清空选中的clientId
  emit('update:clientId', ''); // 通知父组件clientId已清除
}

function handleChange(value) {
  // 更新selectedClientId，并触发update:clientId事件
  selectedClientId.value = value;
  emit('update:clientId', value);
}

// 监听props.clientId的变化，以便更新selectedClientId
watch(() => props.clientId, (newVal) => {
  selectedClientId.value = newVal;
});

onMounted(() => {
  getShopList(props.clientId);
});
</script>
