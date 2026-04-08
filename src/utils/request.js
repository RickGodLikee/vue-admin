import axios from "axios";
import { ElMessage } from "element-plus";

const http = axios.create({
  baseURL: "https://v3pz.itndedu.com/v3pz",
  timeout: 10000,
});

// 请求拦截器
http.interceptors.request.use(
  (config) => {
    // 在发送请求之前可以添加一些公共的请求头或者参数
    // 例如：config.headers['Authorization'] = 'Bearer ' + token;
    const token = localStorage.getItem("pz_token");
    const whiteUrls = ["/login", "/register","/get/code","/user/authentication"];
    if (token && !whiteUrls.includes(config.url)) {
        config.headers['x-token'] = token;
    //   config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // 请求错误处理
    return Promise.reject(error);
  }
);

// 响应拦截器
http.interceptors.response.use(
  (response) => {
    // 对响应数据进行处理，例如统一处理错误码等
    // if (response.data.code !== 200) {
    //   // 可以根据实际情况进行错误处理，例如弹出提示等
    //   return Promise.reject(new Error(response.data.message || "Error"));
    // }
    if (response.data.code === -1) {
        ElMessage.warning(response.data.message);
    }
    if(response.data.code === -2) {
      ElMessage.error(response.data.message);
      localStorage.removeItem("pz_token");
      localStorage.removeItem("pz_userInfo");
      localStorage.removeItem('pz_main_store')
      setTimeout(() => {
        // window.location.href = "/login";
        window.location.href = window.location.origin
      }, 1000);
    }
    return response;
  },
  (error) => {
    // 响应错误处理
    return Promise.reject(error);
  }
);

export default http;