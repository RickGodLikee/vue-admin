<template>
    <div>
    <el-button type="primary" @click="openVisible(null)">添加陪护师</el-button>
    </div>
  <el-dialog
    v-model="dialogVisible"
    title="陪护师添加"
    width="500"
    :before-close="handleClose"
  >
    <el-form ref="formRef" :model="formData" label-width="100px" :rules="rules">
      <el-form-item prop="id" v-show="false">
        <el-input v-model="formData.id" />
      </el-form-item>
      <el-form-item label="昵称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入昵称" />
      </el-form-item>
      <el-form-item label="头像" prop="avatar">
        <el-button v-if="!formData.avatar" type="primary" @click="handleUpload">
          点击上传
        </el-button>
        <el-image
          v-else
          :src="formData.avatar"
          style="width: 100px; height: 100px"
        />
      </el-form-item>
      <el-form-item label="性别" prop="sex">
        <el-select v-model="formData.sex" placeholder="请选择性别">
          <el-option label="男" value="1" />
          <el-option label="女" value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="年龄" prop="age">
        <el-input-number v-model="formData.age" :min="18" :max="50" />
      </el-form-item>
      <el-form-item label="手机号" prop="mobile">
        <el-input v-model="formData.mobile" placeholder="请输入手机号" />
      </el-form-item>
      <el-form-item label="是否生效" prop="active">
        <el-radio-group v-model="formData.active">
          <el-radio :value="0">失效</el-radio>
          <el-radio :value="1">生效</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
        <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="confirm(formRef)">确认</el-button>
      </span>
    </template>
  </el-dialog>
  <el-dialog 
  v-model="dialogImageVisible"
    title="选择图片"
    width="680"
    :before-close="beforeClose"
  >
      <div class="image-list">
        <div v-for="(item, index) in fileList" :key="item.name" class="img-box" @click="selectIndex = index">
          <el-image :src="item.url" style="width: 148px; height: 148px" />
          <div class="select" v-if="selectIndex === index">
            <el-icon color="#fff"><Check /></el-icon>
          </div>

        </div>
      </div>
             <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogImageVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmImage">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { reactive, ref, onMounted } from "vue";
import { Check, Plus } from "@element-plus/icons-vue";
import { photoList, addCompanion } from "@/api";

onMounted(() => {
  getPhotoList();
});

const getPhotoList = () => {
  photoList().then((res) => {
    fileList.value = res.data.data;
    console.log(res, "照片列表");
  });
};

const formRef = ref();

const formData = reactive({
  id: "",
  mobile: "",
  active: 1,
  age: 28,
  avatar: "",
  name: "",
  sex: "",
});

const fileList = ref([]);

const selectIndex = ref(0);

const dialogVisible = ref(false);
const dialogImageVisible = ref(false);

const rules = reactive({
    name: [{ required: true, message: "请填写昵称", trigger: "blur" }],
    mobile: [{ required: true, message: "请填写手机号", trigger: "blur" }],
    avatar: [{ required: true, message: "请选择头像"}],
    sex: [{ required: true, message: "请选择性别", trigger: "change" }],
    // age: [{ required: true, message: "请输入年龄", trigger: "change" }],
});
const openVisible = () => {
  dialogVisible.value = true;
};

const handleUpload = () => {
  dialogImageVisible.value = true;
};

const handleClose = () => {
  dialogVisible.value = false;
   formData.resetFields();
};

const confirm = async (formRef) => {
    if(!formRef) return
  await formRef.validate((valid) => {
    if (valid) {
        formData.active = Number(formData.active)
        // formData.sex = formData.sex ? Number(formData.sex) : formData.sex
        addCompanion(formData).then((res) => {
            console.log(res, "添加陪护师");
            if (res.data.code === 10000) {
                    ElMessage({
                        message: "添加成功",
                        type: "success",
                    });
            beforeClose();
            // getPhotoList();
            }else{
                ElMessage({
                    message: res.data.message || "添加失败",
                    type: "error",
                });
            }
        });
      console.log("submit!", formData);
    } else {
      console.log("error submit!");
      return false;
    }
  });
};

const beforeClose = () => {
  dialogImageVisible.value = false;
};
const confirmImage = () => {
  formData.avatar = fileList.value[selectIndex.value].url;
  dialogImageVisible.value = false;
};
</script>
<style scoped>
    .btns {
    padding: 10px 0 10px 10px;
    background-color: #fff;
}
.image-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  .img-box {
    position: relative;
    .select {
      position: absolute;
      left: 0px;
      top: 0px;
      width: 24px;
      height: 24px;
      background-color: #67c23a;
      z-index: 999;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
  .el-image {
    margin-right: 10px;
    margin-bottom: 10px;
  }
}
</style>
