<template>
    <panel-head></panel-head>
    <div class="btns">
        <el-button :icon="Plus"  type="primary" @click="openVisible(null)" size="small">新增</el-button>
    </div>
  <el-table :data="tableData.list" style="width: 100%">
    <el-table-column prop="id" label="id" > </el-table-column>
    <el-table-column prop="name" label="昵称" > </el-table-column>
    <el-table-column prop="permissionName" label="菜单权限" width="500px" />
    <el-table-column label="操作">
      <template #default="scope">
        <el-button type="primary" @click="openVisible(scope.row)"
          >编辑</el-button
        >
      </template>
    </el-table-column>
  </el-table>
  <div class="pagination-info">
      <el-pagination
          v-model:current-page="paginationData.pageNum"
          :page-size="paginationData.pageSize"
          size="samll"
          :background="false"
          layout="total, prev, pager, next"
          :total="tableData.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
  </div>
  <el-dialog
    v-model="dialogVisible"
    title="添加权限"
    width="500"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    :before-close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      label-width="100px"
      :rules="rules"
    >
      <el-form-item v-show="false" prop="id">
        <el-input v-model="formData.id"></el-input>
      </el-form-item>
      <el-form-item label="名称" prop="name">
        <el-input v-model="formData.name" placeholder="请填写权限名称" />
      </el-form-item>
      <el-form-item label="权限" prop="permissions">
        <el-tree
          ref="treeRef"
          :data="permissionData"
          style="max-width: 600px"
          show-checkbox
          node-key="id"
          :default-checked-keys="defaultCheckedKeys"
          :default-expanded-keys="[2]"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="confirm(formRef)">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from "vue";
import { ElDialog, ElForm, ElFormItem, ElInput, ElTree } from "element-plus";
import { getUserMenu, setUserMenu, getMenuList } from "@/api";
import { Plus } from "@element-plus/icons-vue";

onMounted(() => {
  getUserMenu().then((res) => {
    console.log(res, "获取用户菜单");
    permissionData.value = res.data.data;
  });
  getListData();
});

// 分页数据
const tableData = reactive({
  list: [],
  total: 0,
});

const paginationData = reactive({
  pageNum: 1,
  pageSize: 10,
});

const handleSizeChange = (val) => {
  paginationData.pageSize = val;
  getListData();
};

const handleCurrentChange = (val) => {
  paginationData.pageNum = val;
  getListData();
};

// 请求列表数据
const getListData = () => {
  getMenuList(paginationData).then((res) => {
    const { list, total } = res.data.data;
    tableData.list = list;
    tableData.total = total;
  });
};

const openVisible = (rowData) => {
  dialogVisible.value = true;
  // form弹窗打开，form生成是异步的
  nextTick(() => {
    if (rowData) {
      Object.assign(formData, {
        id: rowData.id,
        name: rowData.name,
      });
      treeRef.value.setCheckedKeys(rowData.permission);
    }
  });
};

const formRef = ref();

//  选中权限
const defaultCheckedKeys = [4, 5];

const rules = reactive({
  name: [
    { required: true, message: "请输入权限名称", trigger: "blur" },
    { min: 3, max: 20, message: "长度请控制在 3 - 20", trigger: "blur" },
  ],
});

const dialogVisible = ref(false);

const formData = reactive({
  id: "",
  name: "",
  permissions: "",
});

const permissionData = ref([]);
const treeRef = ref();

const handleClose = (done) => {
  dialogVisible.value = false;
  formRef.value.resetFields();
  treeRef.value.setCheckedKeys([]);
};

const confirm = async (formEl) => {
  if (!formEl) return;
  await formEl.validate((valid, fields) => {
    if (valid) {
      const permissions = JSON.stringify(treeRef.value.getCheckedKeys());
      setUserMenu({ name: formData.name, permissions, id: formData.id }).then(
        (res) => {
          console.log(res, "设置用户菜单");
          handleClose();
          getListData();
        },
      );
    } else {
      console.log("表单验证失败", fields);
      return false;
    }
  });
};
</script>
<style scoped>
.btns {
    padding: 10px 0 10px 10px;
    background-color: #fff;
}
</style>
