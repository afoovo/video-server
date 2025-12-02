<template>
  <div class="not-found">
    <h1>404</h1>
    <p>页面不存在</p>
    <el-button type="primary" @click="$router.push('/')"> 返回首页 </el-button>
  </div>
</template>

<script setup>
  // 无需额外逻辑
</script>

<style scoped>
  .not-found {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
  }
  h1 {
    font-size: 120px;
    margin: 0;
    color: #409eff;
  }
  p {
    font-size: 20px;
    margin: 16px 0 32px;
    color: #606266;
  }
</style>
