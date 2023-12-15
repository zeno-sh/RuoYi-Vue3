<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="SKU" prop="skuId">
        <el-input v-model="queryParams.skuId" placeholder="请输入SKU" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="产品名称" prop="skuName">
        <el-input v-model="queryParams.skuName" placeholder="请输入产品名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="售卖状态" prop="saleStatus">
        <el-select v-model="queryParams.saleStatus" placeholder="请选择售卖状态" clearable>
          <el-option v-for="dict in dm_product_sale_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="类目" prop="categoryId">
        <el-input v-model="queryParams.categoryId" placeholder="请输入类目" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="品牌" prop="brandId">
        <el-input v-model="queryParams.brandId" placeholder="请输入品牌" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="标签" prop="flagId">
        <el-select v-model="queryParams.flagId" placeholder="请选择标签" clearable>
          <el-option v-for="dict in dm_product_flag" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
          <el-option v-for="dict in record_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" style="width: 308px">
        <el-date-picker v-model="daterangeCreateTime" value-format="YYYY-MM-DD" type="daterange" range-separator="-"
          start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['erp:product:add']">新增</el-button>
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
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handlePlan" v-hasPermi="['erp:plan:add']">生成选品计划</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="productList" @selection-change="handleSelectionChange" height="600">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="index" width="50" label="序号" fixed/>
      <el-table-column label="图片" align="center" prop="pictureUrl" width="100" fixed>
        <template #default="scope">
          <image-preview :src="scope.row.pictureUrl" :width="50" :height="50" />
        </template>
      </el-table-column>
      <el-table-column label="型号(SPU)" width="100" align="center" prop="modelNumber" fixed=""/>
      <el-table-column label="SKU" width="180" align="center" prop="skuId" />
      <el-table-column label="产品名称" width="180" align="center" prop="skuName" />
      <el-table-column label="单位" align="center" prop="unit">
        <template #default="scope">
          <dict-tag :options="dm_unit_type" :value="scope.row.unit" />
        </template>
      </el-table-column>
      <el-table-column label="预估成本价" align="center" prop="costPrice" width="90">
        <template #default="scope">
          ￥{{ scope.row.costPrice }}
        </template>
      </el-table-column>
      <el-table-column label="售卖状态" align="center" prop="saleStatus">
        <template #default="scope">
          <dict-tag :options="dm_product_sale_status" :value="scope.row.saleStatus" />
        </template>
      </el-table-column>
      <el-table-column label="品牌" align="center" prop="brandId" />
      <el-table-column label="类目" align="center" prop="categoryId" />
      <el-table-column label="类目佣金" align="center" prop="categoryCommission">
        <template #default="scope">
          {{ scope.row.categoryCommission }}%
        </template>
      </el-table-column>
      <el-table-column label="标签" align="center" prop="flagId">
        <template #default="scope">
          <dict-tag :options="dm_product_flag" :value="scope.row.flagId" />
        </template>
      </el-table-column>
      <el-table-column label="竞品趋势" align="center" width="250">
        <template #default="scope">
          <div v-for="trend in scope.row.dmProductPlatformTrendList" :key="trend.id">
            <div>skuId:{{ trend.competitorSkuId }} 销量：{{ trend.competitorSaleNumber }}</div>
            <div>价格：{{ trend.competitorSalePrice }} 份额：{{ parseInt(trend.competitorSalePrice * trend.competitorSaleNumber)
            }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="record_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="修改时间" align="center" prop="updateTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width">
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
    <el-dialog :title="title" v-model="open" width="1200px" append-to-body>
      <el-form ref="productRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="图片" prop="pictureUrl">
          <image-upload v-model="form.pictureUrl" />
        </el-form-item>
        <el-form-item label="产品名称" prop="skuName">
          <el-input v-model="form.skuName" placeholder="请输入产品名称" />
        </el-form-item>
        <el-row type="flex">
          <el-col :span="8">
            <el-form-item label="SKU" prop="skuId">
              <el-input v-model="form.skuId" placeholder="请输入SKU" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="型号(SPU)" prop="modelNumber">
              <el-input v-model="form.modelNumber" placeholder="请输入型号(SPU)" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <!-- <el-form-item label="单位" prop="unit">
              <el-input v-model="form.unit" placeholder="请输入单位" />
            </el-form-item> -->
            <el-form-item label="单位" prop="unit">
              <el-select v-model="form.unit" placeholder="请选择单位">
                <el-option v-for="dict in dm_unit_type" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row type="flex">
          <el-col :span="8">
            <el-form-item label="预估成本价" prop="costPrice">
              <el-input v-model="form.costPrice" placeholder="请输入预估成本价" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="类目" prop="categoryId">
              <el-input v-model="form.categoryId" placeholder="请输入类目" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="品牌" prop="brandId">
              <el-input v-model="form.brandId" placeholder="请输入品牌" />
            </el-form-item>
          </el-col>

        </el-row>
        <el-row type="fles">
          <el-col :span="8">
            <el-form-item label="标签" prop="flagId">
              <el-select v-model="form.flagId" placeholder="请选择标签">
                <el-option v-for="dict in dm_product_flag" :key="dict.value" :label="dict.label"
                  :value="parseInt(dict.value)"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-row :span="8">
            <el-form-item label="类目佣金" prop="categoryCommission">
              <!-- <el-input v-model="form.categoryCommission" placeholder="请输入类目佣金" /> -->
              <el-select v-model="form.categoryCommission" :multiple="false" filterable remote reserve-keyword
                placeholder="请输入SKU" remote-show-suffix :remote-method="getCategorCommission" clearable>
                <el-option v-for="item in categoryCommissionList" :key="item.id"
                  :label="`${item.platformName}` + ' / ' + `${item.rate}` + '%'" :value="item.rate">
                  <span style="float: left">{{ item.platformName }}</span>
                  <span
                    style=" float: right; color: var(--el-text-color-secondary); font-size: 13px; margin-left: 10px;">{{
                      item.rate
                    }}{{ '%' }}</span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-row>
        </el-row>

        <el-form-item label="售卖状态" prop="saleStatus">
          <el-radio-group v-model="form.saleStatus">
            <el-radio v-for="dict in dm_product_sale_status" :key="dict.value" :label="parseInt(dict.value)">{{ dict.label
            }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-row type="flex">
          <el-col :span="12">
            <el-form-item label="规格说明" prop="specification">
              <el-input v-model="form.specification" type="textarea"
                placeholder="请输入规格说明，采购需求。例如：价格区间、中性包装、箱规尺寸、欧规电源、俄语说明书等等" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="产品描述" prop="description">
              <el-input v-model="form.description" type="textarea" placeholder="请输入内容" />
            </el-form-item>
          </el-col>
        </el-row>


        <el-divider content-position="center">产品销量趋势信息</el-divider>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" icon="Plus" @click="handleAddDmProductPlatformTrend">添加</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" icon="Delete" @click="handleDeleteDmProductPlatformTrend">删除</el-button>
          </el-col>
        </el-row>

        <el-table :data="dmProductPlatformTrendList" :row-class-name="rowDmProductPlatformTrendIndex"
          @selection-change="handleDmProductPlatformTrendSelectionChange" ref="dmProductPlatformTrend">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="序号" align="center" prop="index" width="50" />
          <el-table-column label="平台" prop="platformId" width="150">
            <template #default="scope">
              <el-select v-model="scope.row.platformId" placeholder="请选择平台">
                <el-option v-for="dict in dm_platform" :key="dict.value" :label="dict.label"
                  :value="parseInt(dict.value)"></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="竞品链接" prop="competitorLink" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.competitorLink" placeholder="请输入竞品竞品链接" />
            </template>
          </el-table-column>
          <el-table-column label="竞品产品Id" prop="competitorSkuId" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.competitorSkuId" placeholder="请输入竞品产品Id" />
            </template>
          </el-table-column>
          <el-table-column label="竞品销量" prop="competitorSaleNumber" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.competitorSaleNumber" placeholder="请输入竞品销量" />
            </template>
          </el-table-column>

          <el-table-column label="竞品价格" prop="competitorSalePrice" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.competitorSalePrice" placeholder="请输入竞品价格" />
            </template>
          </el-table-column>
        </el-table>

        <el-divider content-position="center">产品价格策略信息</el-divider>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" icon="Plus" @click="handleAddDmProductPrice">添加</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" icon="Delete" @click="handleDeleteDmProductPrice">删除</el-button>
          </el-col>
        </el-row>
        <el-table :data="dmProductPriceList" :row-class-name="rowDmProductPriceIndex"
          @selection-change="handleDmProductPriceSelectionChange" ref="dmProductPrice">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="序号" align="center" prop="index" width="50" />
          <el-table-column label="首选" prop="firstChoice" width="150">
            <template #default="scope">
              <el-radio-group v-model="scope.row.firstChoice">
                <el-radio v-for="dict in sys_yes_no" :key="dict.value" :label="dict.value"
                  @change="() => updateFirstChoice(scope.row, dmProductPriceList)">{{ dict.label }}</el-radio>
              </el-radio-group>
            </template>
          </el-table-column>
          <el-table-column label="价格策略名称" prop="priceStrategyName" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.priceStrategyName" placeholder="请输入价格策略名称" />
            </template>
          </el-table-column>
          <el-table-column label="产品售价" prop="sellingPrice" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.sellingPrice" placeholder="请输入产品售价" />
            </template>
          </el-table-column>
          <el-table-column label="产品原价" prop="originalPrice" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.originalPrice" placeholder="请输入产品原价" />
            </template>
          </el-table-column>
        </el-table>

        <el-divider content-position="center">海关信息</el-divider>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" :disabled="noAdd" icon="Plus" @click="handleAddDmProductCustoms">添加</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" icon="Delete" @click="handleDeleteDmProductCustoms">删除</el-button>
          </el-col>
        </el-row>
        <el-table :data="dmProductCustomsList" :row-class-name="rowDmProductCustomsIndex"
          @selection-change="handleDmProductCustomsSelectionChange" ref="dmProductCustoms">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="序号" align="center" prop="index" width="50" />
          <el-table-column label="报关名称英文" prop="customsEn" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.customsEn" placeholder="请输入报关名称英文" />
            </template>
          </el-table-column>
          <el-table-column label="报关名称中文" prop="customsZh" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.customsZh" placeholder="请输入报关名称中文" />
            </template>
          </el-table-column>
          <el-table-column label="材质" prop="material" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.material" placeholder="请输入材质" />
            </template>
          </el-table-column>
          <el-table-column label="含电池" prop="hasBattery" width="150">
            <template #default="scope">
              <el-select v-model="scope.row.hasBattery" placeholder="请选择含电池">
                <el-option v-for="dict in sys_yes_no" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="含液体" prop="hasLiquid" width="150">
            <template #default="scope">
              <el-select v-model="scope.row.hasLiquid" placeholder="请选择含液体">
                <el-option v-for="dict in sys_yes_no" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="纺织品" prop="hasTextile" width="150">
            <template #default="scope">
              <el-select v-model="scope.row.hasTextile" placeholder="请选择纺织品">
                <el-option v-for="dict in sys_yes_no" :key="dict.value" :label="dict.label"
                  :value="dict.value"></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="报关价格" prop="price" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.price" placeholder="请输入报关价格" />
            </template>
          </el-table-column>
        </el-table>


        <el-divider content-position="center">采购信息信息</el-divider>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" icon="Plus" @click="handleAddDmProductPurchase">添加</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" icon="Delete" @click="handleDeleteDmProductPurchase">删除</el-button>
          </el-col>
        </el-row>
        <el-table :data="dmProductPurchaseList" :row-class-name="rowDmProductPurchaseIndex"
          @selection-change="handleDmProductPurchaseSelectionChange" ref="dmProductPurchase">
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column label="序号" align="center" prop="index" width="50" />
          <el-table-column label="首选" prop="firstChoice" width="150">
            <template #default="scope">
              <el-radio-group v-model="scope.row.firstChoice">
                <el-radio v-for="dict in sys_yes_no" :key="dict.value" :label="dict.value"
                  @change="() => updateFirstChoice(scope.row, dmProductPurchaseList)">{{ dict.label }}</el-radio>
              </el-radio-group>
            </template>
          </el-table-column>
          <el-table-column label="箱规名称" prop="cartonSizeName" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.cartonSizeName" placeholder="请输入箱规名称" />
            </template>
          </el-table-column>
          <el-table-column label="外箱规格cm" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.boxLength" placeholder="长" />
              <el-input v-model="scope.row.boxWidth" placeholder="宽" />
              <el-input v-model="scope.row.boxHeight" placeholder="高" />
            </template>
          </el-table-column>
          <el-table-column label="单箱数量pcs" prop="quantityPerBox" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.quantityPerBox" placeholder="单箱数量pcs" />
            </template>
          </el-table-column>
          <el-table-column label="单箱重量g" prop="boxWeight" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.boxWeight" placeholder="单箱重量g" />
            </template>
          </el-table-column>
          <el-table-column label="包装规格cm" width="120px">
            <template #default="scope">
              <el-input v-model="scope.row.length" placeholder="长" />
              <el-input v-model="scope.row.width" placeholder="宽" />
              <el-input v-model="scope.row.height" placeholder="高" />
            </template>
          </el-table-column>
          <el-table-column label="单品净重g" prop="netWeight" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.netWeight" placeholder="单品净重g" />
            </template>
          </el-table-column>
          <el-table-column label="单品毛重g" prop="grossWeight" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.grossWeight" placeholder="单品毛重g" />
            </template>
          </el-table-column>
          <el-table-column label="产品材质" prop="material" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.material" placeholder="请输入产品材质" />
            </template>
          </el-table-column>
        </el-table>


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
          <el-table-column label="首选" prop="firstChoice" width="150">
            <template #default="scope">
              <el-radio-group v-model="scope.row.firstChoice">
                <el-radio v-for="dict in sys_yes_no" :key="dict.value" :label="dict.value"
                  @change="() => updateFirstChoice(scope.row, dmSupplierPriceOfferList)">{{ dict.label }}</el-radio>
              </el-radio-group>
            </template>
          </el-table-column>
          <el-table-column label="供应商" prop="supplierCode" width="150">
            <template #default="scope">
              <!-- <el-input v-model="scope.row.supplierCode" placeholder="请选择供应商" /> -->
              <el-select v-model="scope.row.supplierCode" :multiple="false" filterable remote placeholder="请选择供应商"
                remote-show-suffix :remote-method="getSupplierInfo" clearable>
                <el-option v-for="item in factoryList" :key="item.supplierCode"
                  :label="`${item.supplierName}` + ' / ' + `${item.supplierCode}`" :value="item.supplierCode">
                  <span style="float: left">{{ item.supplierName }}</span>
                  <span
                    style=" float: right; color: var(--el-text-color-secondary); font-size: 13px; margin-left: 10px;">{{
                      item.supplierCode }}</span>
                </el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="币种" prop="currency" width="150">
            <template #default="scope">
              <!-- <el-input v-model="scope.row.currency" placeholder="请输入币种" /> -->
              <el-select v-model="scope.row.currency" placeholder="请选择币种">
                <el-option v-for="dict in dm_currency_code" :key="dict.value"
                  :label="`${dict.label}` + ' / ' + `${dict.remark}`" :value="parseInt(dict.value)">
                  <span style="float: left">{{ dict.label }}</span>
                  <span style=" float: right; color: var(--el-text-color-secondary); font-size: 13px; ">{{ dict.remark
                  }}</span>
                </el-option>
              </el-select>
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
          <el-table-column label="采购链接" prop="link" width="150">
            <template #default="scope">
              <el-input v-model="scope.row.link" placeholder="请输入采购链接" />
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


    <!-- 添加或修改选品计划对话框 -->
    <el-dialog :title="titlePlan" v-model="openPlan" width="600px" append-to-body>
      <el-form ref="planRef" :model="formPlan" :rules="rules" label-width="120px">
        <el-form-item label="选品计划名称" prop="planName">
          <el-input v-model="formPlan.planName" placeholder="请输入选品计划名称" />
        </el-form-item>

        <el-form-item label="SKU" prop="planSkuId">
          <el-input disabled v-model="formPlan.planSkuId" type="textarea" placeholder="请选择SKU" />
        </el-form-item>
        <el-form-item label="货代头程报价" prop="forwarderPrice">
          <el-input v-model="formPlan.forwarderPrice" placeholder="请输入本次货代头程报价（人民币）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitFormPlan">确 定</el-button>
          <el-button @click="cancelPlan">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Product">
import { listProduct, getProduct, delProduct, addProduct, updateProduct } from "@/api/erp/product";
import { addPlan } from "@/api/erp/plan";
import { listCommission } from "@/api/erp/commission";
import { listFactory, queryFactoryByCodes } from "@/api/erp/factory";


const { proxy } = getCurrentInstance();
const { dm_product_sale_status, record_status, sys_yes_no, dm_product_flag, dm_platform, dm_currency_code, dm_unit_type } = proxy.useDict('dm_product_sale_status', 'record_status', 'sys_yes_no', 'dm_product_flag', 'dm_platform', 'dm_currency_code', 'dm_unit_type');

const productList = ref([]);
const dmProductCustomsList = ref([]);
const open = ref(false);
const noAdd = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const planSkuId = ref([]);
const checkedDmProductCustoms = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const titlePlan = ref("");
const daterangeCreateTime = ref([]);
const openPlan = ref(false);
const categoryCommissionList = ref([]);
const dmProductPlatformTrendList = ref([]);
const checkedDmProductPlatformTrend = ref([]);

const dmProductPurchaseList = ref([]);
const checkedDmProductPurchase = ref([]);
const factoryList = ref([]);

const dmSupplierPriceOfferList = ref([]);
const checkedDmSupplierPriceOffer = ref([]);

const dmProductPriceList = ref([]);
const checkedDmProductPrice = ref([]);

const data = reactive({
  form: {},
  formPlan: {},
  categoryCommissionQueryParams: {
    platformName: ""
  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    skuId: null,
    skuName: null,
    saleStatus: null,
    categoryId: null,
    brandId: null,
    status: null,
    competitorLink: null,
    createTime: null,
  },
  supplierQueryParams: {
    supplierCode: ''
  },
  rules: {
    skuId: [
      { required: true, message: "SKU不能为空", trigger: "blur" }
    ],
    skuName: [
      { required: true, message: "产品名称不能为空", trigger: "blur" }
    ],
    modelNumber: [
      { required: true, message: "型号(SPU)不能为空", trigger: "blur" }
    ],
    pictureUrl: [
      { required: true, message: "图片不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules, formPlan, supplierQueryParams } = toRefs(data);

/** 查询类目佣金列表 */
function getCategorCommission() {
  loading.value = true;
  listCommission(queryParams.value).then(response => {
    categoryCommissionList.value = response.rows;
  });
}

/** 查询产品信息列表 */
function getList() {
  loading.value = true;
  queryParams.value.params = {};
  if (null != daterangeCreateTime && '' != daterangeCreateTime) {
    queryParams.value.params["beginCreateTime"] = daterangeCreateTime.value[0];
    queryParams.value.params["endCreateTime"] = daterangeCreateTime.value[1];
  }
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
    saleStatus: 0,
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
  dmProductCustomsList.value = [];
  dmProductPlatformTrendList.value = [];
  proxy.resetForm("productRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  daterangeCreateTime.value = [];
  proxy.resetForm("queryRef");
  handleQuery();
}

/** 产品价格策略序号 */
function rowDmProductPriceIndex({ row, rowIndex }) {
  row.index = rowIndex + 1;
}

/** 产品价格策略添加按钮操作 */
function handleAddDmProductPrice() {
  let obj = {};
  obj.sellingPrice = "";
  obj.originalPrice = "";
  obj.priceStrategyName = "";
  obj.firstChoice = "N";
  dmProductPriceList.value.push(obj);
}

/** 产品价格策略删除按钮操作 */
function handleDeleteDmProductPrice() {
  if (checkedDmProductPrice.value.length == 0) {
    proxy.$modal.msgError("请先选择要删除的产品价格策略数据");
  } else {
    const dmProductPrices = dmProductPriceList.value;
    const checkedDmProductPrices = checkedDmProductPrice.value;
    dmProductPriceList.value = dmProductPrices.filter(function (item) {
      return checkedDmProductPrices.indexOf(item.index) == -1
    });
  }
}

/** 复选框选中数据 */
function handleDmProductPriceSelectionChange(selection) {
  checkedDmProductPrice.value = selection.map(item => item.index)
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  planSkuId.value = selection.map(item => item.skuId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加产品信息";
  noAdd.value = false;
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getProduct(_id).then(response => {
    form.value = response.data;
    dmProductCustomsList.value = response.data.dmProductCustomsList;
    dmProductPlatformTrendList.value = response.data.dmProductPlatformTrendList;
    dmProductPurchaseList.value = response.data.dmProductPurchaseList;
    dmSupplierPriceOfferList.value = response.data.dmSupplierPriceOfferList;
    dmProductPriceList.value = response.data.dmProductPriceList;
    open.value = true;
    title.value = "修改产品信息";
    if (dmProductCustomsList.value.length >= 1) {
      noAdd.value == true;
    }
    if (dmSupplierPriceOfferList.value.length >= 1) {
      let codes = [];
      for (const item of dmSupplierPriceOfferList.value) {
        codes.push(item.supplierCode);
      }
      supplierQueryParams.value.supplierCodes = codes;
      getSupplierInfoByCodes();
    }
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["productRef"].validate(valid => {
    if (valid) {
      form.value.dmProductCustomsList = dmProductCustomsList.value;
      form.value.dmProductPlatformTrendList = dmProductPlatformTrendList.value;
      form.value.dmProductPurchaseList = dmProductPurchaseList.value;
      form.value.dmSupplierPriceOfferList = dmSupplierPriceOfferList.value;
      form.value.dmProductPriceList = dmProductPriceList.value;
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
  const _skuIds = row.skuId || planSkuId.value;
  proxy.$modal.confirm('是否确认删除产品信息编号为"' + _skuIds + '"的数据项？').then(function () {
    return delProduct(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

/** 海关信息序号 */
function rowDmProductCustomsIndex({ row, rowIndex }) {
  row.index = rowIndex + 1;
}

/** 海关信息添加按钮操作 */
function handleAddDmProductCustoms() {
  let obj = {};
  obj.customsEn = "";
  obj.customsZh = form.value.skuName;
  obj.material = "";
  obj.hasBattery = "N";
  obj.hasLiquid = "N";
  obj.hasTextile = "N";
  obj.price = "";
  dmProductCustomsList.value.push(obj);
  if (dmProductCustomsList.value.length > 0) {
    noAdd.value = true;
  }
}

/** 海关信息删除按钮操作 */
function handleDeleteDmProductCustoms() {
  if (checkedDmProductCustoms.value.length == 0) {
    proxy.$modal.msgError("请先选择要删除的海关信息数据");
  } else {
    const dmProductCustomss = dmProductCustomsList.value;
    const checkedDmProductCustomss = checkedDmProductCustoms.value;
    dmProductCustomsList.value = dmProductCustomss.filter(function (item) {
      return checkedDmProductCustomss.indexOf(item.index) == -1
    });
    if (dmProductCustomsList.value.length == 0) {
      noAdd.value = false;
    }
  }
}

/** 复选框选中数据 */
function handleDmProductCustomsSelectionChange(selection) {
  checkedDmProductCustoms.value = selection.map(item => item.index)
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('erp/product/export', {
    ...queryParams.value
  }, `product_${new Date().getTime()}.xlsx`)
}

// 表单重置
function resetPlan() {
  form.value = {
    planName: null,
    planSkuId: [],
    forwarderPrice: 0
  };
  proxy.resetForm("planRef");
}

//生成选品计划
function handlePlan() {
  resetPlan();
  openPlan.value = true;
  titlePlan.value = "添加选品计划";
  formPlan.value.planSkuId = planSkuId.value;
}

// 取消按钮
function cancelPlan() {
  openPlan.value = false;
  resetPlan();
}

/** 产品销量趋势添加按钮操作 */
function handleAddDmProductPlatformTrend() {
  let obj = {};
  obj.platformId = "";
  obj.competitorSaleNumber = "";
  obj.competitorLink = "";
  obj.competitorSkuId = "";
  obj.competitorSalePrice = "";
  dmProductPlatformTrendList.value.push(obj);
}

/** 产品销量趋势删除按钮操作 */
function handleDeleteDmProductPlatformTrend() {
  if (checkedDmProductPlatformTrend.value.length == 0) {
    proxy.$modal.msgError("请先选择要删除的产品销量趋势数据");
  } else {
    const dmProductPlatformTrends = dmProductPlatformTrendList.value;
    const checkedDmProductPlatformTrends = checkedDmProductPlatformTrend.value;
    dmProductPlatformTrendList.value = dmProductPlatformTrends.filter(function (item) {
      return checkedDmProductPlatformTrends.indexOf(item.index) == -1
    });
  }
}

/** 产品销量趋势序号 */
function rowDmProductPlatformTrendIndex({ row, rowIndex }) {
  row.index = rowIndex + 1;
}

/** 复选框选中数据 */
function handleDmProductPlatformTrendSelectionChange(selection) {
  checkedDmProductPlatformTrend.value = selection.map(item => item.index)
}

/** 提交按钮 */
function submitFormPlan() {
  proxy.$refs["planRef"].validate(valid => {

    if (formPlan.value.planSkuId.length == 0) {
      proxy.$modal.msgError("生成计划时 SKU不能为空");
    } else {
      if (valid) {
        formPlan.value.planSkuId = formPlan.value.planSkuId.join(",");
        addPlan(formPlan.value).then(response => {
          proxy.$modal.msgSuccess("生成计划成功");
          openPlan.value = false;
        });
      } else {
        proxy.$modal.msgError("生成计划失败");
      }
    }
  });
}

/** 采购信息，产品规格 */

/** 采购信息序号 */
function rowDmProductPurchaseIndex({ row, rowIndex }) {
  row.index = rowIndex + 1;
}

function handleAddDmProductPurchase() {
  let obj = {};
  obj.cartonSizeName = "";
  obj.length = "";
  obj.width = "";
  obj.height = "";
  obj.netWeight = "";
  obj.material = "";
  obj.boxLength = "";
  obj.boxWidth = "";
  obj.boxHeight = "";
  obj.quantityPerBox = "";
  obj.boxWeight = "";
  obj.grossWeight = "";
  obj.firstChoice = "N";
  dmProductPurchaseList.value.push(obj);
}

/** 采购信息删除按钮操作 */
function handleDeleteDmProductPurchase() {
  if (checkedDmProductPurchase.value.length == 0) {
    proxy.$modal.msgError("请先选择要删除的采购信息数据");
  } else {
    const dmProductPurchases = dmProductPurchaseList.value;
    const checkedDmProductPurchases = checkedDmProductPurchase.value;
    dmProductPurchaseList.value = dmProductPurchases.filter(function (item) {
      return checkedDmProductPurchases.indexOf(item.index) == -1
    });
  }
}

/** 复选框选中数据 */
function handleDmProductPurchaseSelectionChange(selection) {
  checkedDmProductPurchase.value = selection.map(item => item.index)
}



/** 供应商报价序号 */
function rowDmSupplierPriceOfferIndex({ row, rowIndex }) {
  row.index = rowIndex + 1;
}

/** 供应商报价添加按钮操作 */
function handleAddDmSupplierPriceOffer() {
  let obj = {};
  obj.supplierCode = "";
  obj.currency = "";
  obj.tax = "";
  obj.taxRate = "";
  obj.price = "";
  obj.orderNumber = "";
  obj.link = "";
  obj.deliveryTime = "";
  obj.firstChoice = "N";
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

function getSupplierInfo(name) {
  if (name != null && '' != name) {
    queryParams.value.supplierName = name;
    listFactory(queryParams.value).then(response => {
      factoryList.value = response.rows;
    });
  }
}

function getSupplierInfoByCode(code) {
  console.log(11111);
  factoryList.value = [];
  if (code != null && '' != code) {
    supplierQueryParams.value.supplierCode = code;
  }
  listFactory(supplierQueryParams.value).then(response => {
    factoryList.value = response.data;
  });
}

function getSupplierInfoByCodes() {
  if (supplierQueryParams.value != null) {
    queryFactoryByCodes(supplierQueryParams.value).then(response => {
      factoryList.value = response.data;
    });
  }
}

function updateFirstChoice(selectedRow, data) {
  data.forEach(row => {
    if (row.id !== selectedRow.id) {
      row.firstChoice = 'N';
    }
  });
}

onMounted(() => {
  // getSupplierInfoByCode();
});

getList();
</script>
