import request from "../utils/request";

export const getCode = (data) => {
  return request.post(`/get/code`, data);
};

export const userAuthentication = (data) => {
  return request.post(`/user/authentication`, data);
};

export const login = (data) => {
  return request.post(`/login`, data);
};

export const authAdmin = (params) => {
  return request.get(`/auth/admin`, { params });
};

export const getUserMenu = () => {
  return request.get(`/user/getmenu`,);
}

export const setUserMenu = (data) => {
  return request.post(`/user/setmenu`, data);
}

export const getMenuList  = (params) => {
  return request.get(`/menu/list`, { params });
}

export const menuSelectlist = (params) => {
  return request.get(`/menu/selectlist`,{ params })
}

export const updateUser = (data) => {
  return request.post(`/update/user`, data);
}
export const menuPermissions = (params) => {
  return request.get(`/menu/permissions`, { params });
}