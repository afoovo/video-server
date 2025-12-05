<template>
  <div class="app-container">
    <app-header />
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <app-footer />
  </div>
</template>

<script setup>
  import AppHeader from '@/components/layout/AppHeader.vue';
  import AppFooter from '@/components/layout/AppFooter.vue';
  import { useUserStore } from '@/stores/user';
  // 应用初始化时加载用户状态
  onMounted(async () => {
    const userStore = useUserStore(); //pinia推荐做法
    await userStore.initialize();
  });
</script>

<style lang="scss">
  // 导入全局样式
  @use './styles/global';

  .app-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;

    .main-content {
      flex: 1;
      padding: var(--spacing-lg);
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
      box-sizing: border-box;
    }
  }
</style>
