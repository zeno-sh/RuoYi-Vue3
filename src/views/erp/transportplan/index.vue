<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="发货计划" prop="code">
        <el-input v-model="queryParams.code" placeholder="请输入发货计划" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="运输状态" prop="transportStatus">
        <el-select v-model="queryParams.transportStatus" placeholder="请选择运输状态" clearable>
          <el-option v-for="dict in dm_transport_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="海外仓入库单号" prop="overseaLocationCheckinId" label-width="120">
        <el-input v-model="queryParams.overseaLocationCheckinId" placeholder="请输入海外仓入库单号" clearable
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['erp:transportplan:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['erp:transportplan:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['erp:transportplan:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['erp:transportplan:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="transportplanList" border>
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="expand">
        <template #default="props">
          <div class="sub-table-container">
            <h3>发货明细</h3>
            <el-table :data="props.row.dmTransportPlanItemList" border>
              <el-table-column label="sku" prop="skuId" width="150">
                <template #default="scope">
                  <a @click="gotoProductEdit(scope.row.skuId)" class="hover-link">{{ scope.row.skuId }}</a>
                </template>
              </el-table-column>
              <el-table-column label="发运数量" prop="quantity" width="100" />
              <el-table-column label="箱数" prop="numberOfBox" width="100" />
              <el-table-column label="体积" prop="volume" width="100" />
              <el-table-column label="重量" prop="weight" width="100" />
              <el-table-column label="上架状态" prop="shelfStatus" width="100">
                <template #default="scope">
                  <dict-tag :options="sys_yes_no" :value="scope.row.shelfStatus" />
                </template>
              </el-table-column>
            </el-table>
          </div>
        </template>
      </el-table-column>
      <el-table-column type="index" width="50" label="序号" />
      <el-table-column label="发货计划编码" align="center" prop="code" width="200" />
      <el-table-column label="运输状态" align="center" prop="transportStatus" width="110">
        <template #default="scope">
          <dict-tag :options="dm_transport_status" :value="scope.row.transportStatus" />
        </template>
      </el-table-column>
      <el-table-column label="海外仓入库单号" align="center" prop="overseaLocationCheckinId" width="250" />
      <el-table-column label="货代公司" align="center" prop="forwarder" width="120" />

      <el-table-column label="币种" align="center" prop="currency" width="100">
        <template #default="scope">
          <dict-tag :options="dm_currency_code" :value="scope.row.currency" />
        </template>
      </el-table-column>
      <el-table-column label="报价" align="center" prop="offerPrice" width="100" />
      <el-table-column label="结算状态" align="center" prop="settleStatus" width="100">
        <template #default="scope">
          <dict-tag :options="sys_yes_no" :value="scope.row.settleStatus" />
        </template>
      </el-table-column>
      <!-- <el-table-column label="账单" align="center" prop="billPrice" /> -->
      <el-table-column label="发运日期" align="center" prop="despatchDate" width="120">
        <template #default="scope">
          <span>{{ parseTime(scope.row.despatchDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="预计抵达日期" align="center" prop="arrivalDate" width="120">
        <template #default="scope">
          <span>{{ parseTime(scope.row.arrivalDate, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['erp:transportplan:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['erp:transportplan:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改头程计划对话框 -->
    <el-dialog :title="title" v-model="open" width="70%" append-to-body @selection-change="handleSelectionChange"
      :close-on-click-modal="false">
      <el-form ref="transportplanRef" :model="form" :rules="rules" label-width="120px">

        <el-form-item label="发货计划" prop="code">
          <el-input v-model="form.code" placeholder="保存后自动生成" disabled />
        </el-form-item>
        <el-row type="flex">

          <el-col :span="8">
            <el-form-item label="海外仓入库单号" prop="overseaLocationCheckinId">
              <el-input v-model="form.overseaLocationCheckinId" placeholder="请输入海外仓入库单号" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="货代公司" prop="forwarder">
              <el-input v-model="form.forwarder" placeholder="请输入货代公司" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row type="flex">

          <el-col :span="8">
            <el-form-item label="币种" prop="currency">
              <dm-currency :code="form.currency" v-model="form.currency"></dm-currency>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="报价" prop="offerPrice">
              <el-input v-model="form.offerPrice" placeholder="请输入报价" />
            </el-form-item>
          </el-col>
        </el-row>


        <el-row type="flex">
          <el-col :span="8">
            <el-form-item label="账单金额" prop="billPrice">
              <el-input v-model="form.billPrice" placeholder="请输入账单金额" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结算状态" prop="settleStatus">
              <el-radio-group v-model="form.settleStatus">
                <el-radio v-for="dict in sys_yes_no" :key="dict.value" :label="dict.value">{{ dict.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="运输状态" prop="transportStatus">
          <el-select v-model="form.transportStatus" placeholder="请选择运输状态">
            <el-option v-for="dict in dm_transport_status" :key="dict.value" :label="dict.label"
              :value="parseInt(dict.value)"></el-option>
          </el-select>
        </el-form-item>


        <el-row type="flex">
          <el-col :span="8">
            <el-form-item label="发运日期" prop="despatchDate">
              <el-date-picker clearable v-model="form.despatchDate" type="date" value-format="YYYY-MM-DD"
                placeholder="请选择发运日期">
              </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="预计抵达日期" prop="arrivalDate">
              <el-date-picker clearable v-model="form.arrivalDate" type="date" value-format="YYYY-MM-DD"
                placeholder="请选择预计抵达日期">
              </el-date-picker>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" autosize />
        </el-form-item>

        <el-divider content-position="center">头程计划明细信息</el-divider>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" icon="Plus" @click="handleAddDmTransportPlanItem">添加</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" icon="Delete" @click="handleDeleteDmTransportPlanItem">删除</el-button>
          </el-col>
        </el-row>
        <el-table :data="dmTransportPlanItemList" :row-class-name="rowDmTransportPlanItemIndex" show-summary
          @selection-change="handleDmTransportPlanItemSelectionChange" ref="dmTransportPlanItem">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="序号" align="center" prop="index" width="50" />
          <el-table-column label="图片" align="center" prop="pictureUrl" width="100">
            <template #default="scope">
              <image-preview :src="scope.row.pictureUrl" :width="50" :height="50" />
            </template>
          </el-table-column>
          <el-table-column label="产品ID" prop="skuId" width="250">
            <template #default="scope">
              <dm-select-product :skuId="scope.row.skuId" v-model="scope.row.skuId"
                @sku-selected="getPcsData(scope.row)"></dm-select-product>
            </template>
          </el-table-column>
          <el-table-column label="发运数量" prop="quantity" width="120">
            <template #default="scope">
              <el-input-number class="input-number" controls-position="right" :min="1" v-model="scope.row.quantity"
                placeholder="请输入发运数量" @change="calculateBox(scope.row)" />

            </template>
          </el-table-column>
          <el-table-column label="pcs" prop="pcs" width="120">
            <template #default="scope">
              <el-input-number class="input-number" controls-position="right" v-model="scope.row.pcs" placeholder=""
                clearable @change="calculateBox(scope.row)" />
            </template>
          </el-table-column>
          <el-table-column label="箱数" prop="numberOfBox" width="180">
            <template #default="scope">
              <el-row type="flex" justify="start" align="middle">
                <el-col :span="14">
                  <el-input-number class="input-number" controls-position="right" v-model="scope.row.numberOfBox"
                    placeholder="" clearable />
                </el-col>
                <el-col :span="10">
                  <el-tooltip class="box-item" effect="dark" content="实际计算结果不为整数，建议进行调整" placement="bottom"
                    v-if="scope.row.calculateWarning">
                    <el-icon style="color: rgb(236, 122, 39); margin-left: 5px;">
                      <Warning />
                    </el-icon>
                  </el-tooltip>
                  <span v-if="scope.row.calculateWarning">{{ scope.row.calculateBoxNum }}</span>
                </el-col>
              </el-row>
            </template>
          </el-table-column>

          <el-table-column label="体积" prop="volume" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.volume" placeholder="自动计算" />
            </template>
          </el-table-column>
          <el-table-column label="重量" prop="weight" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.weight" placeholder="自动计算" />
            </template>
          </el-table-column>
          <el-table-column label="上架状态" prop="shelfStatus" width="150">
            <template #default="scope">
              <el-select v-model="scope.row.shelfStatus" placeholder="请选择上架状态">
                <el-option v-for="dict in sys_yes_no" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
            </template>
          </el-table-column>
        </el-table>
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

<script setup name="Transportplan">
import { listTransportplan, getTransportplan, delTransportplan, addTransportplan, updateTransportplan } from "@/api/erp/transportplan";
import { listPurchase } from "@/api/erp/purchase";
import DmCurrency from '@/components/DmCurrency'
import DmSelectProduct from '@/components/DmSelectProduct'
import { getProductBySkuId } from "@/api/erp/product";
import { useRouter } from 'vue-router';

// 使用 useRouter 获取路由实例
const router = useRouter();

const { proxy } = getCurrentInstance();
const { dm_transport_status, sys_yes_no, dm_currency_code } = proxy.useDict('dm_transport_status', 'sys_yes_no', 'dm_currency_code');

const transportplanList = ref([]);
const dmTransportPlanItemList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const checkedDmTransportPlanItem = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const purchaseData = ref(null); // 共享状态

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    code: null,
    transportStatus: null,
    overseaLocationCheckinId: null,
    forwarder: null,
    offerPrice: null,
    currency: null,
    settleStatus: null,
    despatchDate: null,
    arrivalDate: null,
  },
  purchaseQueryParams: {
    skuId: null,
  },
  rules: {
  }
});

const { queryParams, form, rules, purchaseQueryParams } = toRefs(data);

/** 查询头程计划列表 */
function getList() {
  loading.value = true;
  listTransportplan(queryParams.value).then(response => {
    transportplanList.value = response.rows;
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
    code: null,
    transportStatus: null,
    overseaLocationCheckinId: null,
    forwarder: null,
    offerPrice: null,
    currency: 10,
    settleStatus: 'N',
    billPrice: null,
    despatchDate: null,
    arrivalDate: null,
    createBy: null,
    createTime: null
  };
  dmTransportPlanItemList.value = [];
  proxy.resetForm("transportplanRef");
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
  title.value = "添加头程计划";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getTransportplan(_id).then(response => {
    form.value = response.data;
    dmTransportPlanItemList.value = response.data.dmTransportPlanItemList;
    open.value = true;
    title.value = "修改头程计划";

    if (dmTransportPlanItemList.value.length > 0) {
      dmTransportPlanItemList.value.forEach(item => {
        getProduct(item);
      });
    }
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["transportplanRef"].validate(valid => {
    if (valid) {
      form.value.dmTransportPlanItemList = dmTransportPlanItemList.value;
      if (form.value.id != null) {
        updateTransportplan(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addTransportplan(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除头程计划编号为"' + _ids + '"的数据项？').then(function () {
    return delTransportplan(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 头程计划明细序号 */
function rowDmTransportPlanItemIndex({ row, rowIndex }) {
  row.index = rowIndex + 1;
}

/** 头程计划明细添加按钮操作 */
function handleAddDmTransportPlanItem() {
  let obj = {};
  obj.skuId = "";
  obj.quantity = "";
  obj.numberOfBox = "";
  obj.volume = "";
  obj.weight = "";
  obj.shelfStatus = "N";
  dmTransportPlanItemList.value.push(obj);
}

/** 头程计划明细删除按钮操作 */
function handleDeleteDmTransportPlanItem() {
  if (checkedDmTransportPlanItem.value.length == 0) {
    proxy.$modal.msgError("请先选择要删除的头程计划明细数据");
  } else {
    const dmTransportPlanItems = dmTransportPlanItemList.value;
    const checkedDmTransportPlanItems = checkedDmTransportPlanItem.value;
    dmTransportPlanItemList.value = dmTransportPlanItems.filter(function (item) {
      return checkedDmTransportPlanItems.indexOf(item.index) == -1
    });
  }
}

/** 复选框选中数据 */
function handleDmTransportPlanItemSelectionChange(selection) {
  checkedDmTransportPlanItem.value = selection.map(item => item.index)
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('erp/transportplan/export', {
    ...queryParams.value
  }, `transportplan_${new Date().getTime()}.xlsx`)
}

function getPcsData(row) {
  if (row.skuId == null || row.skuId == '') {
    return;
  }
  purchaseQueryParams.value.skuId = row.skuId;
  listPurchase(purchaseQueryParams.value).then(response => {
    // 查找 firstChoice='Y' 的元素
    const firstChoiceItem = response.rows.find(row => row.firstChoice === 'Y');

    // 如果找到，则使用该元素；否则，默认使用第一个元素
    purchaseData.value = firstChoiceItem || response.rows[0];

    // 设置 row.pcs 的值
    row.pcs = purchaseData.value.quantityPerBox;
  });
  getProduct(row);
}

function calculateBox(row) {
  row.calculateWarning = false;
  if (row.quantity !== null && row.pcs !== null) {
    const result = row.quantity / row.pcs;
    row.numberOfBox = result.toFixed(0); // 使用 toFixed(0) 将结果四舍五入为整数赋值给 numberOfBox
    row.calculateBoxNum = result.toFixed(1); // 将结果保留一位小数赋值给 calculateBoxNum
    row.calculateWarning = !(Number.isInteger(Number(row.calculateBoxNum)) && row.calculateBoxNum > 0);
    row.volume = ((purchaseData.value.boxWidth * purchaseData.value.boxLength * purchaseData.value.boxHeight) / 1000000 * row.calculateBoxNum).toFixed(3);
    row.weight = (purchaseData.value.boxWeight / 1000 * row.calculateBoxNum).toFixed(2);
  }
}

function getProduct(row) {
  if (row.skuId == null || row.skuId == '') {
    return;
  }
  getProductBySkuId(row.skuId).then(response => {
    row.pictureUrl = response.data.pictureUrl;
  });
}

/** 跳转商品编辑页面 */
function gotoProductEdit(skuId) {
  router.push({ name: "Productinfo", state: { skuId: skuId } });
}

getList();
</script>

<style scoped>
.input-number {
  width: 88px;
}

.sub-table-container {
  padding: 0 40px;
  /* 在这里调整左右内边距 */
}

/* 在你的组件样式中定义链接的默认和悬停状态 */
.hover-link {
  color: #0077cc;
  /* 浅蓝色 */
  text-decoration: none;
  /* 去掉下划线 */
  transition: color 0.3s;
  /* 添加过渡效果 */
}

.hover-link:hover {
  color: #004499;
  /* 深蓝色 */
  text-decoration: underline;
  /* 显示下划线 */
}
</style>
