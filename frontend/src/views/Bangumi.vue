<template>
  <div class="bangumi-page">
    <div class="page-container">
      <div class="bangumi-header">
        <h1>番剧时间表</h1>
        <div class="refresh-info">
          <el-icon><Refresh /></el-icon>
          <span>页面每24小时自动刷新一次</span>
        </div>
      </div>

      <div class="iframe-container">
        <iframe ref="mikanIframe" :src="iframeSrc" width="100%" height="100%" frameborder="0" />
      </div>
    </div>
  </div>
</template>

<script setup>
  import { onMounted, ref } from 'vue';
  import { Refresh } from '@element-plus/icons-vue';

  const iframeSrc = ref('/bangumi/index');
  const mikanIframe = ref(null);

  const refreshIframe = () => {
    if (!mikanIframe.value) return;
    const ts = Date.now();
    mikanIframe.value.src = `${iframeSrc.value}?t=${ts}`;
  };

  onMounted(() => {
    document.title = '番剧时间表';
    setInterval(refreshIframe, 24 * 60 * 60 * 1000);
  });
</script>

<style lang="scss" scoped>
  .bangumi-page {
    height: 100%;
    display: flex;
    flex-direction: column;

    .page-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 1rem;
    }

    .bangumi-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #eee;

      h1 {
        margin: 0;
        font-size: 1.5rem;
      }

      .refresh-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #666;
        font-size: 0.9rem;
      }
    }

    .iframe-container {
      flex: 1;
      min-height: 0;
      border-radius: 4px;
      overflow: hidden;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    }
  }
</style>
