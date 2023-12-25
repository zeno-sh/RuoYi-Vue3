<template>
    <el-select :modelValue="skuId" :multiple="false" filterable remote reserve-keyword placeholder="输入skuId" remote-show-suffix
        :remote-method="getProduct" clearable>
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
import { listProduct } from "@/api/erp/product";
import { defineProps } from "vue";

// const skuId = ref('');
const productList = ref([]);

const data = reactive({
    form: {},
    queryParams: {
        pageNum: 1,
        pageSize: 10,
        skuId: null,
    }
});

const props = defineProps({
        skuId: {
            type: String,
            required: true
        }
    })

const { queryParams } = toRefs(data);

function getProduct(skuId) {
    if (skuId != null && '' != skuId) {
        queryParams.value.skuId = skuId;
        listProduct(queryParams.value).then(response => {
            productList.value = response.rows;
        });
    }
}

</script>