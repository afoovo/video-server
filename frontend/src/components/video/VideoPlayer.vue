<template>
  <div class="video-player-wrapper">
    <div ref="artRef" class="artplayer-container" />
  </div>
</template>

<script setup lang="ts">
  import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
  import Artplayer from 'artplayer';
  import { ElMessage } from 'element-plus';
  import { getVideoPlayUrl } from '@/api/video';

  const props = defineProps<{
    url: string;
    poster?: string;
    title?: string;
    videoId: string;
  }>();

  const emit = defineEmits<{
    ready: [player: Artplayer];
    play: [];
    pause: [];
    ended: [];
    error: [error: Error];
  }>();

  const artRef = ref<HTMLElement | null>(null);
  let art: Artplayer | null = null;

  // 初始化播放器
  const initPlayer = (): void => {
    if (!artRef.value) return;

    try {
      // 销毁之前的实例
      if (art) {
        art.destroy(false);
        art = null;
      }

      // 使用API函数获取视频播放URL
      let videoUrl = getVideoPlayUrl(props.videoId);

      // 确保URL格式正确，添加/api前缀（如果需要）
      if (
        !videoUrl.startsWith('http://') &&
        !videoUrl.startsWith('https://') &&
        !videoUrl.startsWith('/api')
      ) {
        videoUrl = `/api${videoUrl}`;
      }

      // 正确处理海报URL
      let posterUrl = props.poster || '';
      if (posterUrl && !posterUrl.startsWith('http://') && !posterUrl.startsWith('https://')) {
        posterUrl = posterUrl.startsWith('/api') ? posterUrl : `/api${posterUrl}`;
      }

      // 使用Artplayer基本配置，添加基础播放控件
      art = new Artplayer({
        //去掉var以避免作用域问题
        container: artRef.value as HTMLDivElement,
        url: videoUrl,
        poster: posterUrl,
        autoplay: false, // 自动播放
        muted: false, // 静音
        volume: 0.7, // 音量
        playsInline: true, // 内联播放
        theme: '#23ade5',
        // 基础播放控件配置
        fullscreen: true, // 显示全屏按钮
        airplay: true, // 启用AirPlay
        miniProgressBar: true, // 显示迷你进度条
        fullscreenWeb: true, // 显示网页全屏按钮
        backdrop: true, // 显示视频背景

        playbackRate: false, // 显示播放速度控制
        pip: false, // 显示画中画按钮
        screenshot: false, // 显示截图按钮
        setting: false, // 显示设置按钮
        flip: false, // 显示视频翻转按钮
        aspectRatio: false, // 显示视频比例按钮
        subtitleOffset: false, // 显示字幕偏移控制
        isLive: false, // 直播流
        autoSize: false, // 自动调整大小
        autoMini: false, // 自动切换到迷你模式
        loop: false, // 循环播放
        mutex: false, // 互斥播放
        autoPlayback: false, // 自动播放
      });
      art.on('play', () => {
        emit('play');
      });

      art.on('pause', () => {
        emit('pause');
      });

      art.on('ended', () => {
        emit('ended');
      });

      art.on('error', error => {
        emit('error', error);
        ElMessage.error('视频播放失败，请刷新页面重试');
      });
    } catch (error) {
      ElMessage.error('视频加载失败，请稍后重试');
      console.error('Video player initialization error:', error);
    }
  };

  // 监听URL变化
  watch(
    () => props.url,
    () => {
      initPlayer();
    }
  );

  onMounted(() => {
    nextTick(() => {
      initPlayer();
    });
  });

  onBeforeUnmount(() => {
    // 销毁播放器实例
    if (art && typeof art.destroy === 'function') {
      art.destroy(false);
      art = null;
    }
  });
</script>

<style lang="scss" scoped>
  .video-player-wrapper {
    position: relative;
    width: 100%;
    height: 0;
    padding-bottom: 56.25%; // 16:9 宽高比
    background: #000;
    border-radius: var(--el-border-radius-small);
    overflow: hidden;
  }

  .artplayer-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  // 优化播放器样式
  :deep(.art-video-player) {
    .art-progress {
      height: 4px;

      &:hover {
        height: 6px;
      }
    }

    // 优化全屏样式
    &.art-fullscreen {
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      z-index: 2048; // 使用合适的z-index值
    }
  }
</style>
