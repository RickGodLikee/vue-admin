import { createRouter, createWebHashHistory } from "vue-router";

import Layout from "../views/Main.vue";
import Login from "../views/login/index.vue";
import Admin from "../views/auth/admin/index.vue";
import Group from "../views/auth/group/index.vue";
import Staff from "../views/vppz/staff/index.vue";
import Order from "../views/vppz/order/index.vue";
import Dashboard from "../views/dashboard/index.vue";

const routes = [
  {
    path: "/",
    component: Layout,
    name: "main",
    children: [
      {
        path: "dashboard",
        meta: {
          id: "1",
          name: "控制台",
          icon: "Platform",
          path: "/dashboard",
          describe: "用于展示当前系统中的统计数据、统计图表及重要实时数据",
        },
        component: Dashboard,
      },
      {
        path: "auth",
        meta: {
          id: "2",
          name: "权限管理",
          icon: "Grid",
          //   path: "/auth",
          //   describe: "用于展示当前系统中的统计数据、统计图表及重要实时数据",
        },
        children: [
          {
            path: "",
            alias: ["admin"],
            meta: {
              id: "1",
              name: "账号管理",
              icon: "Avatar",
              path: "/auth/admin",
              describe: "管理员可以进行编辑，权限修改后需要登出才会生效",
            },
            component: Admin,
          },
          {
            path: "group",
            alias: ["admin"],
            meta: {
              id: "2",
              name: "菜单管理",
              icon: "Menu",
              path: "/auth/group",
              describe: "菜单规则通常对应一个控制器的方法",
            },
            component: Group,
          },
        ],
      },
      {
        path: "vppz",
        meta: {
          id: "3",
          name: "DIDI陪诊",
          icon: "BellFilled",
        },
        children: [
          {
            path: "staff",
            meta: {
              id: "1",
              name: "陪护管理",
              icon: "Checked",
              path: "/vppz/staff",
              describe: "管理员可以进行编辑，权限修改后需要登出才会生效",
            },
            component: Staff,
          },
          {
            path: "order",
            meta: {
              id: "2",
              name: "陪诊订单",
              icon: "Checked",
              path: "/vppz/order",
              describe: "管理员可以进行编辑，权限修改后需要登出才会生效",
            },
            component: Order,
          },
        ],
      },
    ],
  },
  {
    path: "/login",
    component: Login,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
