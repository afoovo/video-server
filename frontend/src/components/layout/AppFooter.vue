<template>
  <footer class="app-footer">
    <div class="footer-content">
      <div class="footer-section">
        <h4>关于我们</h4>
        <ul>
          <li>
            <router-link to="/about" aria-label="关于我们页面"> 关于我们 </router-link>
          </li>
        </ul>
      </div>

      <div class="footer-section">
        <h4>帮助中心</h4>
        <ul>
          <li>
            <router-link to="/faq" aria-label="常见问题页面"> 常见问题 </router-link>
          </li>
        </ul>
      </div>

      <div class="footer-section">
        <h4>关注我们</h4>
        <div class="social-links">
          <a
            href="https://weibo.com/xxx"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="访问我们的微博"
          >
            <el-icon><ChatDotRound /></el-icon>
          </a>
          <a
            href="https://wx.qq.com/xxx"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="关注我们的微信公众号"
          >
            <el-icon><ChatRound /></el-icon>
          </a>
        </div>
      </div>
    </div>

    <div class="copyright">
      <p>© 2024 视频分享平台 All Rights Reserved. | 地址: 中国某地</p>
    </div>
  </footer>
</template>

<script setup>
  import { ChatDotRound, ChatRound } from '@element-plus/icons-vue';
</script>

<style lang="scss" scoped>
  @use '@/styles/variables' as *;

  .app-footer {
    padding: $spacing-lg 0;
    background-color: $background-color; // 使用已定义的背景色变量
    border-top: 1px solid $border-color;

    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 $spacing-lg;
      display: flex;
      justify-content: space-between;

      .footer-section {
        flex: 1;

        h4 {
          margin-bottom: $spacing-md;
          font-size: $font-size-lg;
          font-weight: bold;
          color: $text-color;
        }

        ul {
          list-style: none;
          padding: 0;

          li {
            margin-bottom: $spacing-sm;

            a {
              color: $text-color-secondary;
              text-decoration: none;

              &:hover {
                color: $primary-color;
              }
            }
          }
        }

        .social-links {
          display: flex;
          gap: $spacing-md;

          a {
            color: $text-color-secondary;
            font-size: $font-size-xl;

            &:hover {
              color: $primary-color;
            }
          }
        }
      }
    }

    .copyright {
      margin-top: $spacing-lg;
      text-align: center;
      color: $text-color-secondary;
      font-size: $font-size-sm;
    }
  }

  // 响应式样式
  @media (max-width: $breakpoint-sm) {
    .app-footer {
      .footer-content {
        flex-direction: column;
        gap: $spacing-lg;

        .footer-section {
          margin-bottom: $spacing-md;
        }
      }
    }
  }
</style>
