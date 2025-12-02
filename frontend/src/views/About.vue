<template>
  <div class="about-page">
    <h1>关于我们</h1>
    <div class="content">
      <p>视频分享平台是一个专注于短视频分享的社区，我们致力于为创作者提供一个展示才华的舞台。</p>
      <p>
        我们的使命是连接创作者和观众，让每一个有才华的人都能被看见，让每一个优质的内容都能被发现。
      </p>

      <h2>我们的价值观</h2>
      <ul>
        <li><strong>创新</strong> - 我们鼓励原创内容和创新思维</li>
        <li><strong>尊重</strong> - 我们尊重每一位创作者和用户</li>
        <li><strong>包容</strong> - 我们欢迎多元化的内容和观点</li>
        <li><strong>高质量</strong> - 我们追求高质量的用户体验和内容</li>
      </ul>

      <h2>我们的团队</h2>
      <p>我们的团队由一群热爱视频创作和技术的人组成，致力于打造最好的视频分享平台。</p>
    </div>
  </div>
</template>

<script setup>
  // 页面加载时更新标题
  import { onMounted } from 'vue';

  onMounted(() => {
    document.title = '关于我们 - 视频分享平台';
  });
</script>

<style lang="scss" scoped>
  .about-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;

    h1 {
      margin-bottom: 2rem;
      text-align: center;
    }

    .content {
      line-height: 1.6;

      h2 {
        margin: 2rem 0 1rem;
      }

      p {
        margin-bottom: 1rem;
      }

      ul {
        margin-left: 1.5rem;
        margin-bottom: 1.5rem;

        li {
          margin-bottom: 0.5rem;
        }
      }
    }
  }
</style>
