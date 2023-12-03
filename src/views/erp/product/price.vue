<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
            <el-form-item label="租户Id" prop="tenantId">
                <el-input v-model="queryParams.tenantId" placeholder="请输入租户Id" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="skuId" prop="skuId">
                <el-input v-model="queryParams.skuId" placeholder="请输入skuId" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="产品名称" prop="skuName">
                <el-input v-model="queryParams.skuName" placeholder="请输入产品名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="规格说明" prop="specification">
                <el-input v-model="queryParams.specification" placeholder="请输入规格说明" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="合并的标志" prop="modelNumber">
                <el-input v-model="queryParams.modelNumber" placeholder="请输入合并的标志" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="单位" prop="unit">
                <el-input v-model="queryParams.unit" placeholder="请输入单位" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="售卖状态：0=开发中，10=在售，20=清仓，30=停售" prop="saleStatus">
                <el-select v-model="queryParams.saleStatus" placeholder="请选择售卖状态：0=开发中，10=在售，20=清仓，30=停售" clearable>
                    <el-option v-for="dict in dm_product_sale_status" :key="dict.value" :label="dict.label"
                        :value="dict.value" />
                </el-select>
            </el-form-item>
            <el-form-item label="类目ID" prop="categoryId">
                <el-input v-model="queryParams.categoryId" placeholder="请输入类目ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="品牌ID" prop="brandId">
                <el-input v-model="queryParams.brandId" placeholder="请输入品牌ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="标签ID" prop="flagId">
                <el-select v-model="queryParams.flagId" placeholder="请选择标签ID" clearable>
                    <el-option v-for="dict in dm_product_flag" :key="dict.value" :label="dict.label" :value="dict.value" />
                </el-select>
            </el-form-item>
            <el-form-item label="预估成本价" prop="costPrice">
                <el-input v-model="queryParams.costPrice" placeholder="请输入预估成本价" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="类目佣金" prop="categoryCommission">
                <el-input v-model="queryParams.categoryCommission" placeholder="请输入类目佣金" clearable
                    @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="状态" prop="status">
                <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
                    <el-option v-for="dict in record_status" :key="dict.value" :label="dict.label" :value="dict.value" />
                </el-select>
            </el-form-item>
            <el-form-item label="创建时间" prop="createTime">
                <el-date-picker clearable v-model="queryParams.createTime" type="date" value-format="YYYY-MM-DD"
                    placeholder="请选择创建时间">
                </el-date-picker>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
                <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button type="primary" plain icon="Plus" @click="handleAdd"
                    v-hasPermi="['erp:product:add']">新增</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
                    v-hasPermi="['erp:product:edit']">修改</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
                    v-hasPermi="['erp:product:remove']">删除</el-button>
            </el-col>
            <el-col :span="1.5">
                <el-button type="warning" plain icon="Download" @click="handleExport"
                    v-hasPermi="['erp:product:export']">导出</el-button>
            </el-col>
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="productList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column label="主键" align="center" prop="id" />
            <el-table-column label="租户Id" align="center" prop="tenantId" />
            <el-table-column label="skuId" align="center" prop="skuId" />
            <el-table-column label="产品名称" align="center" prop="skuName" />
            <el-table-column label="规格说明" align="center" prop="specification" />
            <el-table-column label="合并的标志" align="center" prop="modelNumber" />
            <el-table-column label="单位" align="center" prop="unit" />
            <el-table-column label="售卖状态：0=开发中，10=在售，20=清仓，30=停售" align="center" prop="saleStatus">
                <template #default="scope">
                    <dict-tag :options="dm_product_sale_status" :value="scope.row.saleStatus" />
                </template>
            </el-table-column>
            <el-table-column label="类目ID" align="center" prop="categoryId" />
            <el-table-column label="品牌ID" align="center" prop="brandId" />
            <el-table-column label="标签ID" align="center" prop="flagId">
                <template #default="scope">
                    <dict-tag :options="dm_product_flag" :value="scope.row.flagId" />
                </template>
            </el-table-column>
            <el-table-column label="图片" align="center" prop="pictureUrl" width="100">
                <template #default="scope">
                    <image-preview :src="scope.row.pictureUrl" :width="50" :height="50" />
                </template>
            </el-table-column>
            <el-table-column label="预估成本价" align="center" prop="costPrice" />
            <el-table-column label="产品描述" align="center" prop="description" />
            <el-table-column label="类目佣金" align="center" prop="categoryCommission" />
            <el-table-column label="状态" align="center" prop="status">
                <template #default="scope">
                    <dict-tag :options="record_status" :value="scope.row.status" />
                </template>
            </el-table-column>
            <el-table-column label="竞品链接" align="center" prop="competitorLink" />
            <el-table-column label="创建时间" align="center" prop="createTime" width="180">
                <template #default="scope">
                    <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
                </template>
            </el-table-column>
            <el-table-column label="修改时间" align="center" prop="updateTime" width="180">
                <template #default="scope">
                    <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template #default="scope">
                    <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
                        v-hasPermi="['erp:product:edit']">修改</el-button>
                    <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
                        v-hasPermi="['erp:product:remove']">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
            @pagination="getList" />

        <!-- 添加或修改产品信息对话框 -->
        <el-dialog :title="title" v-model="open" width="500px" append-to-body>
            <el-form ref="productRef" :model="form" :rules="rules" label-width="80px">
                <el-form-item label="租户Id" prop="tenantId">
                    <el-input v-model="form.tenantId" placeholder="请输入租户Id" />
                </el-form-item>
                <el-form-item label="skuId" prop="skuId">
                    <el-input v-model="form.skuId" placeholder="请输入skuId" />
                </el-form-item>
                <el-form-item label="产品名称" prop="skuName">
                    <el-input v-model="form.skuName" placeholder="请输入产品名称" />
                </el-form-item>
                <el-form-item label="规格说明" prop="specification">
                    <el-input v-model="form.specification" placeholder="请输入规格说明" />
                </el-form-item>
                <el-form-item label="合并的标志" prop="modelNumber">
                    <el-input v-model="form.modelNumber" placeholder="请输入合并的标志" />
                </el-form-item>
                <el-form-item label="单位" prop="unit">
                    <el-input v-model="form.unit" placeholder="请输入单位" />
                </el-form-item>
                <el-form-item label="售卖状态：0=开发中，10=在售，20=清仓，30=停售" prop="saleStatus">
                    <el-radio-group v-model="form.saleStatus">
                        <el-radio v-for="dict in dm_product_sale_status" :key="dict.value"
                            :label="parseInt(dict.value)">{{ dict.label }}</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="类目ID" prop="categoryId">
                    <el-input v-model="form.categoryId" placeholder="请输入类目ID" />
                </el-form-item>
                <el-form-item label="品牌ID" prop="brandId">
                    <el-input v-model="form.brandId" placeholder="请输入品牌ID" />
                </el-form-item>
                <el-form-item label="标签ID" prop="flagId">
                    <el-select v-model="form.flagId" placeholder="请选择标签ID">
                        <el-option v-for="dict in dm_product_flag" :key="dict.value" :label="dict.label"
                            :value="parseInt(dict.value)"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="图片" prop="pictureUrl">
                    <image-upload v-model="form.pictureUrl" />
                </el-form-item>
                <el-form-item label="预估成本价" prop="costPrice">
                    <el-input v-model="form.costPrice" placeholder="请输入预估成本价" />
                </el-form-item>
                <el-form-item label="产品描述" prop="description">
                    <el-input v-model="form.description" type="textarea" placeholder="请输入内容" />
                </el-form-item>
                <el-form-item label="类目佣金" prop="categoryCommission">
                    <el-input v-model="form.categoryCommission" placeholder="请输入类目佣金" />
                </el-form-item>
                <el-form-item label="状态" prop="status">
                    <el-radio-group v-model="form.status">
                        <el-radio v-for="dict in record_status" :key="dict.value"
                            :label="parseInt(dict.value)">{{ dict.label }}</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="竞品链接" prop="competitorLink">
                    <el-input v-model="form.competitorLink" type="textarea" placeholder="请输入内容" />
                </el-form-item>





                
                <el-divider content-position="center">供应商报价信息</el-divider>
                <el-row :gutter="10" class="mb8">
                    <el-col :span="1.5">
                        <el-button type="primary" icon="Plus" @click="handleAddDmSupplierPriceOffer">添加</el-button>
                    </el-col>
                    <el-col :span="1.5">
                        <el-button type="danger" icon="Delete" @click="handleDeleteDmSupplierPriceOffer">删除</el-button>
                    </el-col>
                </el-row>
                <el-table :data="dmSupplierPriceOfferList" :row-class-name="rowDmSupplierPriceOfferIndex"
                    @selection-change="handleDmSupplierPriceOfferSelectionChange" ref="dmSupplierPriceOffer">
                    <el-table-column type="selection" width="50" align="center" />
                    <el-table-column label="序号" align="center" prop="index" width="50" />
                    <el-table-column label="租户" prop="tenantId" width="150">
                        <template #default="scope">
                            <el-input v-model="scope.row.tenantId" placeholder="请输入租户" />
                        </template>
                    </el-table-column>
                    <el-table-column label="供应商代码" prop="supplierCode" width="150">
                        <template #default="scope">
                            <el-input v-model="scope.row.supplierCode" placeholder="请输入供应商代码" />
                        </template>
                    </el-table-column>
                    <el-table-column label="币种" prop="currency" width="150">
                        <template #default="scope">
                            <el-input v-model="scope.row.currency" placeholder="请输入币种" />
                        </template>
                    </el-table-column>
                    <el-table-column label="是否含税" prop="tax" width="150">
                        <template #default="scope">
                            <el-select v-model="scope.row.tax" placeholder="请选择是否含税">
                                <el-option v-for="dict in sys_yes_no" :key="dict.value" :label="dict.label"
                                    :value="dict.value"></el-option>
                            </el-select>
                        </template>
                    </el-table-column>
                    <el-table-column label="税率" prop="taxRate" width="150">
                        <template #default="scope">
                            <el-input v-model="scope.row.taxRate" placeholder="请输入税率" />
                        </template>
                    </el-table-column>
                    <el-table-column label="报价" prop="price" width="150">
                        <template #default="scope">
                            <el-input v-model="scope.row.price" placeholder="请输入报价" />
                        </template>
                    </el-table-column>
                    <el-table-column label="起订数量" prop="orderNumber" width="150">
                        <template #default="scope">
                            <el-input v-model="scope.row.orderNumber" placeholder="请输入起订数量" />
                        </template>
                    </el-table-column>
                    <el-table-column label="交期" prop="deliveryTime" width="150">
                        <template #default="scope">
                            <el-input v-model="scope.row.deliveryTime" placeholder="请输入交期" />
                        </template>
                    </el-table-column>
                    <el-table-column label="首选" prop="firstChoice" width="150">
                        <template #default="scope">
                            <el-select v-model="scope.row.firstChoice" placeholder="请选择首选">
                                <el-option v-for="dict in sys_yes_no" :key="dict.value" :label="dict.label"
                                    :value="dict.value"></el-option>
                            </el-select>
                        </template>
                    </el-table-column>
                    <el-table-column label="报价时间" prop="offerDate" width="240">
                        <template #default="scope">
                            <el-date-picker clearable v-model="scope.row.offerDate" type="date" value-format="YYYY-MM-DD"
                                placeholder="请选择报价时间">
                            </el-date-picker>
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
  
<script setup name="Product">
import { listProduct, getProduct, delProduct, addProduct, updateProduct } from "@/api/erp/product";

const { proxy } = getCurrentInstance();
const { dm_product_sale_status, record_status, sys_yes_no, dm_product_flag } = proxy.useDict('dm_product_sale_status', 'record_status', 'sys_yes_no', 'dm_product_flag');

const productList = ref([]);
const dmSupplierPriceOfferList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const checkedDmSupplierPriceOffer = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
    form: {},
    queryParams: {
        pageNum: 1,
        pageSize: 10,
        tenantId: null,
        skuId: null,
        skuName: null,
        specification: null,
        modelNumber: null,
        unit: null,
        saleStatus: null,
        categoryId: null,
        brandId: null,
        flagId: null,
        pictureUrl: null,
        costPrice: null,
        description: null,
        categoryCommission: null,
        status: null,
        competitorLink: null,
        createTime: null,
    },
    rules: {
        skuId: [
            { required: true, message: "skuId不能为空", trigger: "blur" }
        ],
        skuName: [
            { required: true, message: "产品名称不能为空", trigger: "blur" }
        ],
        modelNumber: [
            { required: true, message: "合并的标志不能为空", trigger: "blur" }
        ],
        categoryId: [
            { required: true, message: "类目ID不能为空", trigger: "blur" }
        ],
        pictureUrl: [
            { required: true, message: "图片不能为空", trigger: "blur" }
        ],
    }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询产品信息列表 */
function getList() {
    loading.value = true;
    listProduct(queryParams.value).then(response => {
        productList.value = response.rows;
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
        tenantId: null,
        skuId: null,
        skuName: null,
        specification: null,
        modelNumber: null,
        unit: null,
        saleStatus: null,
        categoryId: null,
        brandId: null,
        flagId: null,
        pictureUrl: null,
        costPrice: null,
        description: null,
        categoryCommission: null,
        status: null,
        competitorLink: null,
        createBy: null,
        createTime: null,
        updateTime: null
    };
    dmSupplierPriceOfferList.value = [];
    proxy.resetForm("productRef");
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
    title.value = "添加产品信息";
}

/** 修改按钮操作 */
function handleUpdate(row) {
    reset();
    const _id = row.id || ids.value
    getProduct(_id).then(response => {
        form.value = response.data;
        dmSupplierPriceOfferList.value = response.data.dmSupplierPriceOfferList;
        open.value = true;
        title.value = "修改产品信息";
    });
}

/** 提交按钮 */
function submitForm() {
    proxy.$refs["productRef"].validate(valid => {
        if (valid) {
            form.value.dmSupplierPriceOfferList = dmSupplierPriceOfferList.value;
            if (form.value.id != null) {
                updateProduct(form.value).then(response => {
                    proxy.$modal.msgSuccess("修改成功");
                    open.value = false;
                    getList();
                });
            } else {
                addProduct(form.value).then(response => {
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
    proxy.$modal.confirm('是否确认删除产品信息编号为"' + _ids + '"的数据项？').then(function () {
        return delProduct(_ids);
    }).then(() => {
        getList();
        proxy.$modal.msgSuccess("删除成功");
    }).catch(() => { });
}

/** 供应商报价序号 */
function rowDmSupplierPriceOfferIndex({ row, rowIndex }) {
    row.index = rowIndex + 1;
}

/** 供应商报价添加按钮操作 */
function handleAddDmSupplierPriceOffer() {
    let obj = {};
    obj.tenantId = "";
    obj.supplierCode = "";
    obj.currency = "";
    obj.tax = "";
    obj.taxRate = "";
    obj.price = "";
    obj.orderNumber = "";
    obj.link = "";
    obj.deliveryTime = "";
    obj.firstChoice = "";
    obj.remark = "";
    obj.offerDate = "";
    dmSupplierPriceOfferList.value.push(obj);
}

/** 供应商报价删除按钮操作 */
function handleDeleteDmSupplierPriceOffer() {
    if (checkedDmSupplierPriceOffer.value.length == 0) {
        proxy.$modal.msgError("请先选择要删除的供应商报价数据");
    } else {
        const dmSupplierPriceOffers = dmSupplierPriceOfferList.value;
        const checkedDmSupplierPriceOffers = checkedDmSupplierPriceOffer.value;
        dmSupplierPriceOfferList.value = dmSupplierPriceOffers.filter(function (item) {
            return checkedDmSupplierPriceOffers.indexOf(item.index) == -1
        });
    }
}

/** 复选框选中数据 */
function handleDmSupplierPriceOfferSelectionChange(selection) {
    checkedDmSupplierPriceOffer.value = selection.map(item => item.index)
}

/** 导出按钮操作 */
function handleExport() {
    proxy.download('erp/product/export', {
        ...queryParams.value
    }, `product_${new Date().getTime()}.xlsx`)
}

getList();
</script>
  