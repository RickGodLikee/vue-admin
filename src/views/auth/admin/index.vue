<template>
    <panel-head :route="route"></panel-head>
  <el-table :data="tableData.list" style="width: 100%">
    <el-table-column prop="id" label="id"> </el-table-column>
    <el-table-column prop="name" label="昵称"> </el-table-column>
    <el-table-column prop="permissions_id" label="所属组别">
      <template #default="scope">
        {{ permissionName(scope.row.permissions_id) }}
      </template>
    </el-table-column>
    <el-table-column prop="mobile" label="手机号" />

    <el-table-column prop="active" label="状态">
      <template #default="scope">
        <el-tag :type="scope.row.active ? 'success' : 'danger'">
          {{ scope.row.active ? "正常" : "失效" }}</el-tag
        >
      </template>
    </el-table-column>
    <el-table-column prop="create_time" label="创建时间">
      <template #default="scope">
        <div class="flex-box">
          <el-icon><Clock /></el-icon>
          <span style="margin-left: 10px">{{ scope.row.create_time }}</span>
        </div>
      </template>
    </el-table-column>

    <el-table-column label="操作">
      <template #default="scope">
        <el-button type="primary" @click="openVisible(scope.row)"
          >编辑</el-button>
      </template>
    </el-table-column>
  </el-table>
  <div class="pagination-info">
    <el-pagination
      v-model:current-page="paginationData.pageNum"
      :page-size="paginationData.pageSize"
      size="small"
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
    :before-close="handleClose"
  >
    <el-form ref="formRef" :model="formData" label-width="100px" :rules="rules">
      <el-form-item label="手机号" prop="mobile">
        <el-input v-model="formData.mobile" disabled />
      </el-form-item>
      <el-form-item label="昵称" prop="name">
        <el-input v-model="formData.name" />
      </el-form-item>
      <el-form-item label="菜单权限" prop="permissions_id">
        <el-select
            v-model="formData.permissions_id"
            placeholder="请选择菜单权限"
            style="width: 240px;"
        >
            <el-option
                v-for="item in options"
                :key="item.id"
                :label="item.name"
                :value="item.id"
            >

            </el-option>
        </el-select>
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
import { authAdmin, menuSelectlist, getMenuList, updateUser, } from "@/api";
import { ref, reactive, onMounted } from "vue";
import dayjs from "dayjs";
import { ElMessage } from "element-plus";
import { useRoute} from "vue-router";

const route = useRoute();

const paginationData = reactive({
  pageNum: 1,
  pageSize: 10,
});
const tableData = reactive({
  list: [],
  total: 0,
});

const formRef = ref();

const formData = reactive({
  mobile: "",
  permissions_id: "",
});

onMounted(() => {
    getListData()
  menuSelectlist().then(({ data }) => {
    options.value = data.data;
  });
});
// 请求列表
const getListData = () => {
  authAdmin(paginationData).then((res) => {
    console.log(res, "res");
    const { list, total } = res.data.data;
    list.forEach((item) => {
      item.create_time = dayjs(item.create_time).format("YYYY-MM-DD");
    });
    tableData.list = list;
    tableData.total = total;
  });
}

const options = ref([]);

const rules = reactive({
  name: [
    { required: true, message: "请输入昵称", trigger: "blur" },
    { min: 3, max: 20, message: "长度请控制在 3 - 20", trigger: "blur" },
  ],
  permissions_id:[{required:true,trigger:'blur', message:'请选择菜单权限'}]
});

// 根据全县id匹配全县名称
const permissionName = (id) => {
  const data = options.value.find((el) => el.id === id);
  return data ? data.name : "超级管理员";
};

const openVisible = (rowData) => {
    dialogVisible.value = true
    Object.assign(formData, {mobile: rowData.mobile, name: rowData.name, permissions_id: rowData.permissions_id})

};

const handleSizeChange = (val) => {
  paginationData.pageSize = val;
  getListData();
};

const handleCurrentChange = (val) => {
  paginationData.pageNum = val;
  getListData();
};

// 弹窗
const dialogVisible = ref(false);

const handleClose = (done) => {
  dialogVisible.value = false;
  //   formRef.value.resetFields();
  //   treeRef.value.setCheckedKeys([]);
};

const confirm = async (formEl) => {
    if (!formEl) return;
    await formEl.validate((valid, fields) => {
        if(valid){
            const {name, permissions_id } = formData
            updateUser({name, permissions_id}).then(({data})=>{
                if(data.code === 10000){
                    dialogVisible.value = false
                    getListData()
                }
            })
        }else{
            console.log('error submit!', fields)
        }
    })

}
</script>

<style lang="less" scoped>
.flex-box {
  display: flex;
  align-items: center;
}
</style>
