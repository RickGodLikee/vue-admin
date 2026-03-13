import "./assets/main.css";
import router from "./router/index.js";
import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import PanelHead from "./components/panelHead.vue";

router.beforeEach((to, from) => {
  const token = localStorage.getItem("pz_token");
  if (!token && to.path !== "/login") {
    return "/login";
  } else if (token && to.path === "/login") {
    return "/";
  } else {
    return true;
  }
});

const pinia = createPinia();

// 如果您正在使用CDN引入，请删除下面一行。
import * as ElementPlusIconsVue from "@element-plus/icons-vue";

const app = createApp(App);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}
app.component("PanelHead", PanelHead);
app.use(router);
app.use(pinia);
app.use(ElementPlus);
app.mount("#app");
