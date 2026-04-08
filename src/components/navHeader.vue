<template>
  <div class="header-container">
    <div class="header-left flex-box">
      <el-icon class="fold-icon" size="20" @click="mainStore.toggleCollapse">
        <Fold/>
      </el-icon>
      <ul class="flex-box">
        <li 
        v-for="(item,index) in selectMenu" 
        :key="item.path" 
        class="flex-box tab" 
        :class="{selected: route.path === item.path}"
        >
          <el-icon size="12"><component :is="item.icon" /></el-icon>
          <router-link class="text flex-box" :to="{ path: item.path }">
            {{item.name}}
          </router-link>
          <el-icon class="close" @click.stop="closeTab(item,index)" size="12"><Close /></el-icon>
        </li>
      </ul>
    </div>
    <div class="header-right">
      <el-dropdown @command = "handleClick">
        <div class="el-dropdown-link flex-box">
          <el-avatar
            size="40px"
            :src="userInfo.avatar"
          />
          <p class="user-name">{{ userInfo.name }}</p>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="cancel">退出</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>
<script setup>
import { computed } from "vue";
import { useMainStore } from "../store/menu";
import { useRoute, useRouter } from "vue-router";
const route = useRoute();
const router = useRouter();
const mainStore = useMainStore();
const selectMenu = computed(() => mainStore.selectMenu);

const userInfo = JSON.parse(localStorage.getItem('pz_userInfo'))

const closeTab = (item, index) => {
  console.log(selectMenu,"selectmenu",item,"oo", index);
  mainStore.removeMenu(item);
  if (route.path !== item.path) {
    return;
  }
  const selectMenuData = selectMenu.value;
  // 删除最后一项
  if(index === selectMenuData.length) {
    if (!selectMenuData.length) {
      router.push('/');
    }else {
    router.push({
      path: selectMenuData[index - 1].path
    });
  }
  } else { // 删除中间项
    router.push({
      path: selectMenuData[index].path
    });
  }
};

const handleClick = (command) => {
  if(command == 'cancel'){
    localStorage.removeItem('pz_token')
    localStorage.removeItem('pz_userInfo')
    localStorage.removeItem('pz_main_store')
    window.location.href = window.location.origin
  }
}
</script>
<style lang="less" scoped>
.flex-box {
  display: flex;
  align-items: center;
  height: 100%;
}
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  background-color: #fff;
  padding-right: 25px;
  .header-left {
    height: 100%;
    .fold-icon {
      cursor: pointer;
      width: 45px;
      height: 100%;
    }
    .fold-icon:hover {
      background-color: #f0f0f0;
    }
    .tab {
      padding: 0 10px;
      height: 100%;
      // border-right: 1px solid #e8e8e8;
      .text {
        margin: 0 5px;
      }
      .close {
        visibility: hidden;
      }
      &.selected {
        a {
          color: #409eff;
        }
        i {
          color: #409eff;
        }
        background-color: #f5f5f5;
      }
       &.selected .close {
        visibility: visible;
        cursor: pointer;
        color: #000;
      }
    }
    .tab:hover {
      background-color: #f5f5f5;
      .close {
        visibility: visible;
        cursor: pointer;
        color: #000;
      }
    }
  }
  .header-right {
    .user-name {
      margin-left: 10px;
    }
  }
  a {
    height: 100%;
    color: #333;
    font-size: 15px;
    text-decoration: none;
  }
}
</style>
