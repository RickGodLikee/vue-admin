<template>

</template>

<script setup>
import { authAdmin } from '@/api';
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';

const paginationData = reactive({
    pageNum: 1,
    pageSize: 10,
})

onMounted(() => {
    authAdmin(paginationData).then((res) => {
        console.log(res,"res")
    })
});

</script>

<style lang="less" scoped>

</style>