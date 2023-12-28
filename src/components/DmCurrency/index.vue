<template>
    <el-select :modelValue="code" placeholder="请选择币种">
        <el-option v-for="dict in dm_currency_code" :key="dict.value" :label="`${dict.label}` + ' / ' + `${dict.remark}`"
            :value="parseInt(dict.value)">
            <span style="float: left">{{ dict.label }}</span>
            <span style=" float: right; color: var(--el-text-color-secondary); font-size: 13px; ">{{ dict.remark
            }}</span>
        </el-option>
    </el-select>
</template>

<script setup>

import { listProduct } from "@/api/erp/product";
import { defineProps } from "vue";

const { proxy } = getCurrentInstance();
const { dm_currency_code } = proxy.useDict('dm_currency_code');

// const skuId = ref('');
const productList = ref([]);

const props = defineProps({
    code: {
        type: Number,
        required: true
    }
})

</script>