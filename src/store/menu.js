import { defineStore } from "pinia";

export const useMainStore = defineStore("main", {
  state: () => ({
    isCollapse: false,
    selectMenu: []
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
  },
});