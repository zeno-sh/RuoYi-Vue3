<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="计划编码" prop="code">
        <el-input v-model="queryParams.code" placeholder="请输入计划编码" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['erp:purchaseplan:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['erp:purchaseplan:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['erp:purchaseplan:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" @click="handleExport"
          v-hasPermi="['erp:purchaseplan:export']">导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="purchaseplanList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="index" width="50" label="序号" />
      <el-table-column label="计划编码" align="center" prop="code" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['erp:purchaseplan:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['erp:purchaseplan:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" />

    <!-- 添加或修改采购计划对话框 -->
    <el-dialog :title="title" v-model="open" width="1200px" append-to-body :close-on-click-modal="false">
      <el-form ref="purchaseplanRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="计划编码" prop="code">
          <el-input v-model="form.code" placeholder="保存后自动生成" disabled />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-divider content-position="center">采购计划详情信息</el-divider>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" icon="Plus" @click="handleAddDmPurchasePlanItem">添加</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" icon="Delete" @click="handleDeleteDmPurchasePlanItem">删除</el-button>
          </el-col>
        </el-row>
        <el-table :data="dmPurchasePlanItemList" :row-class-name="rowDmPurchasePlanItemIndex"
          @selection-change="handleDmPurchasePlanItemSelectionChange" ref="dmPurchasePlanItem" show-summary>
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="序号" align="center" prop="index" width="50" />
          <el-table-column label="图片" align="center" prop="pictureUrl" width="100">
            <template #default="scope">
              <image-preview :src="scope.row.pictureUrl" :width="50" :height="50" />
            </template>
          </el-table-column>
          <el-table-column label="skuId" prop="skuId" width="250">
            <template #default="scope">
              <dm-select-product :skuId="scope.row.skuId" v-model="scope.row.skuId"
                @sku-selected="getPcsData(scope.row)"></dm-select-product>
            </template>
          </el-table-column>
          <el-table-column label="采购数量" prop="quantity" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.quantity" placeholder="请输入采购数量" clearable @change="calculateBox(scope.row)" />
            </template>
          </el-table-column>
          <el-table-column label="pcs" prop="pcs" width="120">
            <template #default="scope">
              <el-input v-model="scope.row.pcs" placeholder="" clearable @change="calculateBox(scope.row)" />
            </template>
          </el-table-column>
          <el-table-column label="箱数" prop="numberOfBox" width="180">
            <template #default="scope">
              <el-row type="flex" justify="start" align="middle">
                <el-col :span="14">
                  <el-input v-model="scope.row.numberOfBox" placeholder="" clearable />
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
          <!-- <el-table-column label="体积" prop="volume" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.volume" placeholder="自动计算" />
            </template>
          </el-table-column>
          <el-table-column label="重量" prop="weight" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.weight" placeholder="自动计算" />
            </template>
          </el-table-column> -->
          <el-table-column label="采购订单" prop="purchaseOrder" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.purchaseOrder" placeholder="请输入采购订单" />
            </template>
          </el-table-column>
          <el-table-column label="期望到货时间" prop="expectedArrivalDate" width="240">
            <template #default="scope">
              <el-date-picker clearable v-model="scope.row.expectedArrivalDate" type="date" value-format="YYYY-MM-DD"
                placeholder="请选择期望到货时间">
              </el-date-picker>
            </template>
          </el-table-column>
          <el-table-column label="采购状态" prop="status" width="150">
            <template #default="scope">
              <el-select v-model="scope.row.status" placeholder="请选择采购状态">
                <el-option v-for="dict in dm_purchase_plan_status" :key="dict.value" :label="dict.label"
                  :value="parseInt(dict.value)"></el-option>
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

<script setup name="Purchaseplan">
import { listPurchaseplan, getPurchaseplan, delPurchaseplan, addPurchaseplan, updatePurchaseplan } from "@/api/erp/purchaseplan";
import DmSelectProduct from '@/components/DmSelectProduct'
import { listPurchase } from "@/api/erp/purchase";
import { getProductBySkuId } from "@/api/erp/product";

const { proxy } = getCurrentInstance();
const { dm_purchase_plan_status } = proxy.useDict('dm_purchase_plan_status');

const purchaseplanList = ref([]);
const dmPurchasePlanItemList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const checkedDmPurchasePlanItem = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const purchaseData = ref(null);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    code: null,
  },
  rules: {
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询采购计划列表 */
function getList() {
  loading.value = true;
  listPurchaseplan(queryParams.value).then(response => {
    purchaseplanList.value = response.rows;
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
    createBy: null,
    createTime: null
  };
  dmPurchasePlanItemList.value = [];
  proxy.resetForm("purchaseplanRef");
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
  title.value = "添加采购计划";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getPurchaseplan(_id).then(response => {
    form.value = response.data;
    dmPurchasePlanItemList.value = response.data.dmPurchasePlanItemList;
    open.value = true;
    title.value = "修改采购计划";

    if (dmPurchasePlanItemList.value.length > 0) {
      dmPurchasePlanItemList.value.forEach(item => {
        getProduct(item);
      });
    }
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["purchaseplanRef"].validate(valid => {
    if (valid) {
      form.value.dmPurchasePlanItemList = dmPurchasePlanItemList.value;
      if (form.value.id != null) {
        updatePurchaseplan(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addPurchaseplan(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除采购计划编号为"' + _ids + '"的数据项？').then(function () {
    return delPurchaseplan(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 采购计划详情序号 */
function rowDmPurchasePlanItemIndex({ row, rowIndex }) {
  row.index = rowIndex + 1;
}

/** 采购计划详情添加按钮操作 */
function handleAddDmPurchasePlanItem() {
  let obj = {};
  obj.supplierId = "";
  obj.skuId = "";
  obj.quantity = "";
  obj.numberOfBox = "";
  obj.volume = "";
  obj.weight = "";
  obj.purchaseOrder = "";
  obj.expectedArrivalDate = "";
  obj.remark = "";
  obj.status = "";
  dmPurchasePlanItemList.value.push(obj);
}

/** 采购计划详情删除按钮操作 */
function handleDeleteDmPurchasePlanItem() {
  if (checkedDmPurchasePlanItem.value.length == 0) {
    proxy.$modal.msgError("请先选择要删除的采购计划详情数据");
  } else {
    const dmPurchasePlanItems = dmPurchasePlanItemList.value;
    const checkedDmPurchasePlanItems = checkedDmPurchasePlanItem.value;
    dmPurchasePlanItemList.value = dmPurchasePlanItems.filter(function (item) {
      return checkedDmPurchasePlanItems.indexOf(item.index) == -1
    });
  }
}

/** 复选框选中数据 */
function handleDmPurchasePlanItemSelectionChange(selection) {
  checkedDmPurchasePlanItem.value = selection.map(item => item.index)
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('erp/purchaseplan/export', {
    ...queryParams.value
  }, `purchaseplan_${new Date().getTime()}.xlsx`)
}

function getProduct(row) {
  if (row.skuId == null || row.skuId == '') {
    return;
  }
  getProductBySkuId(row.skuId).then(response => {
    row.pictureUrl = response.data.pictureUrl;
  });
}

function getPcsData(row) {
  if (row.skuId == null || row.skuId == '') {
    return;
  }
  queryParams.value.skuId = row.skuId;
  listPurchase(queryParams.value).then(response => {
    purchaseData.value = response.rows[0];
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

getList();
</script>
