<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="活动ID" prop="campaignId">
        <el-input v-model="queryParams.campaignId" placeholder="请输入活动ID" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="日期" prop="date">
        <el-date-picker clearable v-model="queryParams.date" type="date" value-format="YYYY-MM-DD" placeholder="请选择日期">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['erp:campaigns:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['erp:campaigns:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="campaignsList" @selection-change="handleSelectionChange" border>
      <el-table-column type="index" align="center" />
      <el-table-column label="日期" align="center" prop="date" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.date, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="活动ID" align="center" prop="campaignId" />
      <el-table-column label="ACoS" align="center">
        <template #default="scope">
         {{ scope.row.ordersMoney > 0 ? ((scope.row.moneySpent / scope.row.ordersMoney) * 100).toFixed(2) + '%' : '0.00%' }}
        </template>
      </el-table-column>
      <el-table-column label="标题" align="center" prop="title" />
      <el-table-column label="展示量" align="center" prop="views" />
      <el-table-column label="点击数" align="center" prop="clicks" />
      <el-table-column label="广告花费" align="center" prop="moneySpent" />
      <el-table-column label="平均报价" align="center" prop="avgBid" />
      <el-table-column label="订单数量" align="center" prop="orders" />
      <el-table-column label="订单金额" align="center" prop="ordersMoney" />

      <!-- <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['erp:campaigns:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['erp:campaigns:remove']">删除</el-button>
        </template>
      </el-table-column> -->
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改广告活动对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="campaignsRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="活动ID" prop="campaignId">
          <el-input v-model="form.campaignId" placeholder="请输入活动ID" />
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="展示量" prop="views">
          <el-input v-model="form.views" placeholder="请输入展示量" />
        </el-form-item>
        <el-form-item label="点击数" prop="clicks">
          <el-input v-model="form.clicks" placeholder="请输入点击数" />
        </el-form-item>
        <el-form-item label="广告花费" prop="moneySpent">
          <el-input v-model="form.moneySpent" placeholder="请输入广告花费" />
        </el-form-item>
        <el-form-item label="平均报价" prop="avgBid">
          <el-input v-model="form.avgBid" placeholder="请输入平均报价" />
        </el-form-item>
        <el-form-item label="订单数量" prop="orders">
          <el-input v-model="form.orders" placeholder="请输入订单数量" />
        </el-form-item>
        <el-form-item label="订单金额" prop="ordersMoney">
          <el-input v-model="form.ordersMoney" placeholder="请输入订单金额" />
        </el-form-item>
        <el-form-item label="日期" prop="date">
          <el-date-picker clearable v-model="form.date" type="date" value-format="YYYY-MM-DD" placeholder="请选择日期">
          </el-date-picker>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Campaigns">
import { listCampaigns, getCampaigns, delCampaigns, addCampaigns, updateCampaigns } from "@/api/erp/campaigns";

const { proxy } = getCurrentInstance();

const campaignsList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orderByColumn: 'date',
    isAsc: 'desc',
    campaignId: null,
    title: null,
    views: null,
    clicks: null,
    moneySpent: null,
    avgBid: null,
    orders: null,
    ordersMoney: null,
    date: null
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询广告活动列表 */
function getList() {
  loading.value = true;
  listCampaigns(queryParams.value).then(response => {
    campaignsList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    campaignId: null,
    title: null,
    views: null,
    clicks: null,
    moneySpent: null,
    avgBid: null,
    orders: null,
    ordersMoney: null,
    date: null
  };
  proxy.resetForm("campaignsRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加广告活动";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getCampaigns(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改广告活动";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["campaignsRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateCampaigns(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addCampaigns(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除广告活动编号为"' + _ids + '"的数据项？').then(function () {
    return delCampaigns(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('erp/campaigns/export', {
    ...queryParams.value
  }, `campaigns_${new Date().getTime()}.xlsx`)
}

getList();
</script>
