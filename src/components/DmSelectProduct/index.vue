<template>
    <el-select :modelValue="skuId" :multiple="false" filterable remote reserve-keyword placeholder="输入关键词"
        remote-show-suffix :remote-method="getProduct" clearable @clear="clearList" @change="handleSkuChange">
        <el-option v-for="item in productList" :key="item.skuId" :label="`${item.skuId}` + ' / ' + `${item.skuName}`"
            :value="item.skuId">
            <span style="float: left">{{ item.skuId }}</span>
            <span style=" float: right; color: var(--el-text-color-secondary); font-size: 13px; margin-left: 10px;">{{
                item.skuName
            }}</span>
        </el-option>
    </el-select>
</template>

<script setup>
import { getProductByKeyword } from "@/api/erp/product";

const skuId = ref(null);
const productList = ref([]);

const data = reactive({
    form: {},
    queryParams: {
        pageNum: 1,
        pageSize: 10,
        id: null,
        skuId: null,
        skuName: null
    }
});

const props = defineProps({
    skuId: {
        type: String,
        required: true
    }
})

const { queryParams } = toRefs(data);
const emit = defineEmits(['sku-selected']);

function getProduct(keyword) {
    if (keyword != null && '' != keyword) {
        getProductByKeyword(keyword).then(response => {
            productList.value = response.rows;
        });
    }
}

function clearList() {
    productList.value = [];
}

const handleSkuChange = () => {
  emit('sku-selected', skuId.value);
};

</script>