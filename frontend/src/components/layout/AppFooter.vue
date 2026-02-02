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
  
  // 混入函数定义
  @mixin flex-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  @mixin flex-center {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  @mixin hover-transition {
    transition: all 0.3s ease;
  }

  .app-footer {
    height: $footer-height;
    background-color: $white;
    border-top: 1px solid $border-color;
    padding: $spacing-md 0;

    .footer-content {
      margin: 0 auto;
      @include flex-between;
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
              font-size: $font-size-sm;
              @include hover-transition;

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
            @include hover-transition;

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

  // 响应式布局优化
  @media (max-width: $breakpoint-md) {
    .app-footer {
      .footer-content {
        flex-direction: column;
        gap: $spacing-md;
        text-align: center;

        .footer-section {
          margin-bottom: $spacing-md;
        }

        .social-links {
          @include flex-center;
        }
      }
    }
  }
</style>
