<template>
  <div class="app-container">

    <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="58px">
      <el-form-item label="门店" prop="clientId">
        <dm-shop-select v-model="queryParams.clientId" clearable disabled></dm-shop-select>
      </el-form-item>
    </el-form>

    <!-- 销量面板 -->
    <panel-store :clientId="queryParams.clientId"></panel-store>

    <!-- Top产品 -->
    <order-volume :clientId="queryParams.clientId"></order-volume>
  </div>
</template>

<script setup>
import DmShopSelect from '@/components/DmShopSelect';
import OrderVolume from '@/views/dashboard/OrderVolume';
import PanelStore from '@/views/dashboard/PanelStore';

const { proxy } = getCurrentInstance();

const data = reactive({
  form: {},
  queryParams: {
    clientId: '1633585',
    beginDate: '',
    endDate: ''
  },
  rules: {

  }
});

const { queryParams, form, rules } = toRefs(data);

</script>

<style>
.container {
  padding: 10px;
  /* 顶部、左侧和右侧的空间预留 */
}

</style>
