<template>
    <el-select :modelValue="modelValue" :multiple="false" filterable remote reserve-keyword placeholder="输入关键词"
        remote-show-suffix :remote-method="getProduct" clearable @clear="clearList" @change="handleSkuChange">
        <el-option v-for="item in productList" :key="item.skuId" :label="`${item.skuName} / ${item.skuId}`"
            :value="item.skuId">
            <span style="float: left">{{ item.skuName }}</span>
            <span style="float: right; color: var(--el-text-color-secondary); font-size: 13px; margin-left: 10px;">{{ item.skuId }}</span>
        </el-option>
    </el-select>
  </template>
  
  <script setup>
  import { getProductByKeyword } from "@/api/erp/product";
  import { defineProps, ref, reactive, toRefs, defineEmits, onMounted } from "vue";
  
  const { modelValue } = defineProps({
      modelValue: String
  });
  
  const productList = ref([]);
  const data = reactive({
      queryParams: {
          pageNum: 1,
          pageSize: 10,
          id: null,
          skuId: null,
          skuName: null
      }
  });
  
  const emit = defineEmits(['update:modelValue', 'sku-selected']);
  
  function getProduct(keyword) {
      if (keyword) {
          getProductByKeyword(keyword).then(response => {
              productList.value = response.rows;
          });
      }
  }
  
  function clearList() {
      productList.value = [];
      emit('update:modelValue', null); // 清空选择时更新外部 v-model 绑定的值
  }
  
  function handleSkuChange(newValue) {
      emit('update:modelValue', newValue); // 选择新值时更新外部 v-model 绑定的值
      emit('sku-selected', newValue); // 发射自定义事件，如果需要
  }
  
  onMounted(() => {
      if (modelValue) {
          getProduct(modelValue);
      }
  });
  </script>
  