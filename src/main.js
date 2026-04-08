import "./assets/main.css";
import router from "./router/index.js";
import { createApp } from "vue";
import App from "./App.vue";
import { createPinia, setActivePinia } from "pinia";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import PanelHead from "./components/panelHead.vue";
import { createPersistedState } from "pinia-plugin-persistedstate";
import { menuPermissions } from "./api";
import { useMainStore } from "./store/menu";

// 只注入动态路由一次，避免重复 addRoute
let __dynamicRoutesInjected = false;

const flattenLeafRoutes = (routes = []) => {
  const res = [];
  const walk = (list) => {
    list.forEach((r) => {
      if (r?.children?.length) return walk(r.children);
      res.push(r);
    });
  };
  walk(routes);
  return res;
};

const ensureDynamicRoutes = (mainStore) => {
  const registeredPaths = new Set(router.getRoutes().map((r) => r.path));
  // 只注册“叶子页面路由”，避免嵌套路由 + 绝对子路径组合导致匹配/渲染异常
  const leaves = flattenLeafRoutes(mainStore.routerList);
  leaves.forEach((item) => {
    const fullPath = item?.meta?.path || item?.path;
    if (!fullPath || registeredPaths.has(fullPath)) return;
    // 子路由建议使用相对路径（去掉开头的 `/`），避免父子嵌套渲染异常
    const childPath = fullPath.replace(/^\//, "");
    router.addRoute("main", {
      ...item,
      path: childPath,
    });
    registeredPaths.add(fullPath);
  });
};

const pinia = createPinia();
pinia.use(createPersistedState({
  storage: localStorage, // 使用 localStorage 进行持久化
}));
// 确保在非组件环境（路由守卫）里也能拿到同一个 pinia 实例
setActivePinia(pinia);

// 方便控制台调试（例如 window.__router.getRoutes()）
window.__router = router;

router.beforeEach(async (to, from) => {
  const token = localStorage.getItem("pz_token");
  const mainStore = useMainStore(pinia);
  const hadMatch = to.matched && to.matched.length > 0;
  
  if (!token && to.path !== "/login") {
    return "/login";
  } 
  if(token && to.path === "/login") {
    return "/";
  }

  // 2. 已登录但路由未准备好（登录后第一次进入 或 刷新后）
  if (token && mainStore.routerList.length === 0) {
    const { data } = await menuPermissions();
    mainStore.dynamicMenu(data.data);
  }

  // 刷新后：routerList 可能来自持久化（缺少 component 函数），需要重建一次
  if (token && mainStore.routerList.length) {
    // component 是函数，不能持久化；因此刷新后必须重建一次
    if (!__dynamicRoutesInjected) {
      mainStore.dynamicMenu(JSON.parse(JSON.stringify(mainStore.routerList)));
      ensureDynamicRoutes(mainStore);
      __dynamicRoutesInjected = true;
    }
    ensureDynamicRoutes(mainStore);

    // 关键：如果本次导航开始时没匹配到路由，注入后需要重新进入一次才能渲染
    // 否则会出现地址变了但页面空白的情况
    if (!hadMatch) {
      return to.fullPath;
    }
  }

  return true
});

// 如果您正在使用CDN引入，请删除下面一行。
import * as ElementPlusIconsVue from "@element-plus/icons-vue";

const app = createApp(App);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}
app.use(pinia);
app.component("PanelHead", PanelHead);
app.use(router);
app.use(ElementPlus);
app.mount("#app");
