<template>
  <!-- 网格布局 -->
  <el-row class="login-container" justify="center" align="middle">
    <el-card style="max-width: 480px">
      <template #header>
        <div class="card-header">
          <img :src="imgUrl" alt="" class="login-img" />
          <!-- <h2 class="login-title">欢迎登录后台管理系统</h2> -->
        </div>
      </template>
      <div class="jump-link">
        <el-link type="primary" @click="handleChange">{{
          formType === 0 ? "没有账号？去注册" : "已有账号？去登录"
        }}</el-link>
      </div>
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        style="max-width: 600px"
        class="demo-ruleForm"
        :rules="rules"
      >
        <el-form-item prop="userName">
          <el-input
            v-model="loginForm.userName"
            placeholder="请输入手机号"
            prefix-icon="UserFilled"
          />
        </el-form-item>
        <el-form-item prop="passWord">
          <el-input
            v-model="loginForm.passWord"
            placeholder="请输入密码"
            type="password"
            prefix-icon="Lock"
          />
        </el-form-item>
        <el-form-item v-if="formType" prop="validCode">
          <el-input
            v-model="loginForm.validCode"
            placeholder="请输入验证码"
            prefix-icon="Lock"
          >
            <template #append>
              <span @click="countDownChange" style="cursor: pointer">
                {{ countDown.validText }}
              </span></template
            >
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin(loginFormRef)" :style="{ width: '100%' }">
            {{ formType === 0 ? "登录" : "注册" }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </el-row>
</template>

<script setup>
import { ref, reactive, computed, toRaw, } from "vue";
import { UserFilled, Lock } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
const imgUrl = new URL("../../../public/login-head.png", import.meta.url).href;
import { getCode, userAuthentication, login, menuPermissions } from "../../api/index";
import { useRouter } from "vue-router";
import { useMainStore } from "../../store/menu";
const mainStore = useMainStore()

// 切换表单 （0登录，1注册）
const formType = ref(0);
const loginFormRef = ref();

const rules = reactive({
  userName: [
    { required: true, message: "请输入手机号", trigger: "blur" },
    {
      pattern:
        /^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/,
      message: "请输入正确的手机号",
      trigger: "blur",
    },
  ],
  passWord: [
    { required: true, message: "请输入密码", trigger: "blur" },
    {
      pattern: /^[a-zA-Z0-9_-]{4,16}$/,
      message: "密码必须4-16位，且只能包含字母、数字、下划线或横线",
      trigger: "blur",
    },
  ],
  validCode: [{ required: true, message: "请输入验证码", trigger: "blur" }],
});
// 表单数据
const loginForm = reactive({
  userName: "",
  passWord: "",
  validCode: "",
});

const router = useRouter();

const routerList = computed(() => mainStore.routerList)

// 发送短信
const countDown = reactive({
  validText: "获取验证码",
  time: 60,
});
let flag = false;
let timer = null;

const handleChange = () => {
  // 切换表单时重置验证码状态
  if (timer) {
    clearInterval(timer);
    timer = null;
    flag = false;
    countDown.validText = "获取验证码";
    countDown.time = 60;
  }
  // 跳转到注册页面
  formType.value = formType.value === 0 ? 1 : 0;
};

const countDownChange = () => {
  // 如果已发送不处理
  if (flag) return;

  // 校验手机号
  const phoneReg =
    /^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/;
  if (!loginForm.userName || !phoneReg.test(loginForm.userName)) {
    console.log("进来了没", loginForm.userName);
    // alert("请输入手机号");
    return ElMessage({
      message: "请检查手机号是否正确",
      type: "warning",
    });
  }

  if (timer) {
    clearInterval(timer);
    timer = null;
  }

  // 开始倒计时
  countDown.validText = "60s后重新获取";
  flag = true;

  timer = setInterval(() => {
    countDown.time -= 1;
    if (countDown.time <= 0) {
      clearInterval(timer);
      timer = null;
      countDown.validText = "获取验证码";
      countDown.time = 60;
      flag = false;
    } else {
      countDown.validText = `${countDown.time}s后重新获取`;
    }
  }, 1000);
  getCode({ tel:loginForm.userName }).then((res) => {
    // 这里可以处理接口返回的数据，例如显示验证码或者提示用户
    if (res.data.code === 10000){
      ElMessage({
        message: "验证码已发送",
        type: "success",
      });
    } else {
      ElMessage({
        message: res.data.message || "验证码发送失败",
        type: "error",
      });
    }
  });
};

const handleLogin = async (formRef) => {
  if (!formRef) return;
  await formRef.validate((valid) => {
    if (valid) {
      // 这里可以处理登录或注册逻辑，例如调用接口进行验证
      if(formType.value){
        userAuthentication(loginForm).then((res) => {
          if (res.data.code === 10000) {
            // 注册成功
            ElMessage({
              message: "注册成功，请登录",
              type: "success",
            });
            formType.value = 0; // 切换到登录表单
            loginForm.validCode = ""; // 清空验证码输入框
          } else {
            ElMessage({
              message: res.data.message || "注册失败",
              type: "error",
            });
          }
        });
      }else {
        login(loginForm).then((res) => {
          if (res.data.code === 10000) {
            // 登录成功
            ElMessage({
              message: "登录成功",
              type: "success",
            });
            console.log(res,"res")
            localStorage.setItem("pz_token", res.data.data.token);
            // 将用户信息存储到 localStorage,需要JSON.stringify转换 
            localStorage.setItem("pz_userInfo", JSON.stringify(res.data.data.userInfo));
            // 可以在这里处理登录成功后的逻辑，例如跳转到首页
            menuPermissions().then(({data})=>{
              mainStore.dynamicMenu(data.data)
              console.log(routerList,"routerList")
              toRaw(routerList.value).forEach(item => {
                router.addRoute('main',item)
              });
              router.push({ path: "/" });

            })
          } else {
            ElMessage({
              message: res.data.message || "登录失败",
              type: "error",
            });
          }
        });
      }
    } else {
      ElMessage({
        message: "请检查输入是否正确",
        type: "error",
      });
      return false;
    }
  });
  

};
</script>

<style lang="less" scoped>
:deep(.el-card__header) {
  padding: 0;
}
.login-container {
  height: 100%;
  .card-header {
    background-color: #899fe1;
    img {
      width: 430px;
    }
  }
  .jump-link {
    text-align: right;
    margin-bottom: 10px;
  }
}
</style>
