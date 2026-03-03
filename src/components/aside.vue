<template>
  <el-menu
  :style="{ width: !mainStore.isCollapse ? '200px' : '64px'}"
    active-text-color="#ffd04b"
    background-color="#545c64"
    class="aside-container"
    default-active="2"
    text-color="#fff"
    @open="handleOpen"
    @close="handleClose"
    :collapse="mainStore.isCollapse"
  >
    <p class="logo-lg">{{ mainStore.isCollapse ? "后台" : "后台管理系统" }}</p>
    <TreeMenu :index="1" :menuData="menuData" />
  </el-menu>
</template>

<script setup>
import TreeMenu from "./treeMenu.vue";
import { useRouter } from "vue-router";
import { reactive } from "vue";
import { useMainStore } from '../store/menu'
const mainStore = useMainStore()
// const { isCollapse } = mainStore
// console.log(mainStore.isCollapse,"iscollpase")

const router = useRouter();
const menuData = reactive(router.options.routes[0].children);

console.log(router);
const handleOpen = (key, keyPath) => {
  console.log(key, keyPath);
};
const handleClose = (key, keyPath) => {
  console.log(key, keyPath);
};
</script>

<style lang="less" scoped>
.aside-container {
  height: 100%;
}
.logo-lg {
  font-size: 20px;
  color: #fff;
  text-align: center;
  height: 50px;
  line-height: 50px;
}
</style>
