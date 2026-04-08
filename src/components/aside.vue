<template>
  <el-menu
  :style="{ width: !mainStore.isCollapse ? '200px' : '64px'}"
    active-text-color="#ffd04b"
    background-color="#545c64"
    class="aside-container"
    text-color="#fff"
    @open="handleOpen"
    @close="handleClose"
    :collapse="mainStore.isCollapse"
    :default-active="active"
  >
    <p class="logo-lg">{{ mainStore.isCollapse ? "后台" : "后台管理系统" }}</p>
    <TreeMenu :index="1" :menuData="menuData" />
  </el-menu>
</template>

<script setup>
import TreeMenu from "./treeMenu.vue";
import { computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useMainStore } from '../store/menu'
const mainStore = useMainStore()
const route = useRoute()

const menuData = computed(() => mainStore.menuList)
const active = computed(() => mainStore.menuActive)

const findActiveIndexByPath = (list = [], targetPath, prefix = "1") => {
  for (const item of list) {
    const currentIndex = `${prefix}-${item?.meta?.id}`;
    const hasChildren = item?.children && item.children.length > 0;
    if (hasChildren) {
      const found = findActiveIndexByPath(item.children, targetPath, currentIndex);
      if (found) return found;
    } else {
      if (item?.meta?.path === targetPath) return currentIndex;
    }
  }
  return null;
};

const findFirstLeafIndex = (list = [], prefix = "1") => {
  for (const item of list) {
    const currentIndex = `${prefix}-${item?.meta?.id}`;
    const hasChildren = item?.children && item.children.length > 0;
    if (hasChildren) {
      const found = findFirstLeafIndex(item.children, currentIndex);
      if (found) return found;
    } else {
      return currentIndex;
    }
  }
  return null;
};

// 路由重定向/刷新后要同步高亮：根据当前路由 path 反推 el-menu 的 index
watch(
  () => [route.path, menuData.value?.length],
  ([path]) => {
    if (!menuData.value?.length) return;

    let idx = findActiveIndexByPath(menuData.value, path);
    if (!idx && path === "/") {
      // 你配置了访问 / 时跳到“第一页”，这里兜底匹配 dashboard 或第一个叶子
      idx = findActiveIndexByPath(menuData.value, "/dashboard") || findFirstLeafIndex(menuData.value);
    }

    if (idx) mainStore.updateMenuActive(idx);
  },
  { immediate: true }
);

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
