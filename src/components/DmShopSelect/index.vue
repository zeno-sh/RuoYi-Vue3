<template>
  <el-select :modelValue="shopName" :multiple="false" filterable remote reserve-keyword placeholder="输入门店名称"
    remote-show-suffix :remote-method="getShopList" clearable @clear="clearList" @change="handleSkuChange">
    <el-option v-for="item in shopList" :key="item.id" :label="`${item.shopName}` + ' / ' + `${item.clientId}`"
      :value="item.clientId">
      <span style="float: left">{{ item.shopName }}</span>
      <span style=" float: right; color: var(--el-text-color-secondary); font-size: 13px; margin-left: 10px;">{{
        item.clientId
      }}</span>
    </el-option>
  </el-select>
</template>

<script setup>
import { listMapping } from "@/api/erp/mapping";

import { defineProps } from "vue";

const shopName = ref(null);
const shopList = ref([]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 100,
    shopName: null
  }
});

const props = defineProps({
  shopName: {
    type: String,
    required: false
  }
})

const { queryParams } = toRefs(data);
const emit = defineEmits(['shop-selected']);

function getShopList(keyword) {
  // if (keyword != null && '' != keyword) {

  // }
  queryParams.value.shopName = keyword;
  listMapping(queryParams.value).then(response => {
    shopList.value = response.rows;
  });
}

function clearList() {
  shopList.value = [];
}

const handleSkuChange = () => {
  emit('shop-selected', shopName.value);
};

onMounted(() => {
  getShopList(props.shopName);
});
</script>