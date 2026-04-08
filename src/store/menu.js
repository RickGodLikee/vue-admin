import { defineStore } from "pinia";

export const useMainStore = defineStore("main", {
  state: () => ({
    isCollapse: false,
    selectMenu: [],
    routerList: [],
    menuList:[],
    menuActive: "1-1",
  }),
  actions: {
    toggleCollapse() {
      this.isCollapse = !this.isCollapse;
    },
    addMenu(payload) {
      if (this.selectMenu.findIndex(item => item.path === payload.path) === -1) {
        this.selectMenu.push(payload);
      }
    },
    removeMenu(payload) {
      // 找到点击数据的索引
      console.log("chufa",payload);
      const index = this.selectMenu.findIndex(item => item.name === payload.name);
      // this.selectMenu = this.selectMenu.filter(item => item.path !== payload.path);
      // 根据索引删除数据
      this.selectMenu.splice(index, 1);
    },
    dynamicMenu (payload){
      // 通过glob导入文件
      const modules = import.meta.glob('../views/**/**/*.vue')
      this.menuList = JSON.parse(JSON.stringify(payload))
      console.log(modules)
      function routerSet(router){
        // 判断没有子菜单，拼接路由数据
        router.forEach(route => {
          // 保证注入的 route.path 与跳转使用的 meta.path 一致，避免匹配不到导致空白
          if (route?.meta?.path) {
            route.path = route.meta.path
          }
          if(!route.children) {
            const url = `../views${route.meta.path}/index.vue`
            const loader = modules[url]
            if (!loader) {
              console.warn("[dynamicMenu] component not found:", url, route)
            }
            route.component = loader
          } else {
            routerSet(route.children)
          }
          
        });
      }
      routerSet(payload)
      // 拿到完整的路由数据
      // 注意：这里必须保存“已经补齐 component 的路由树”，否则 addRoute 后点击会空白
      this.routerList = payload
    },
    updateMenuActive(payload) {
      console.log(payload,"payload13")
      this.menuActive = payload;
    }

  },
  persist: {
    key: "pz_main_store",
    storage: localStorage,
    pick: ["isCollapse", "selectMenu", "routerList", "menuList", "menuActive"],
  },
})