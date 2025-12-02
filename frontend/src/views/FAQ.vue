<template>
  <div class="faq-page">
    <h1>常见问题</h1>
    <div class="content">
      <el-collapse v-model="activeNames">
        <el-collapse-item title="1. 如何注册账户？" name="1">
          <p>您可以通过以下步骤注册账户：</p>
          <ol>
            <li>点击页面右上角的"注册"按钮</li>
            <li>填写必要的注册信息，包括用户名、邮箱和密码</li>
            <li>阅读并同意我们的使用条款和隐私政策</li>
            <li>点击"注册"按钮完成注册</li>
            <li>系统会向您的邮箱发送验证邮件，请按照邮件提示完成验证</li>
          </ol>
        </el-collapse-item>

        <el-collapse-item title="2. 如何上传视频？" name="2">
          <p>上传视频的步骤如下：</p>
          <ol>
            <li>登录您的账户</li>
            <li>点击页面顶部的"上传"按钮</li>
            <li>选择要上传的视频文件</li>
            <li>填写视频标题、描述和标签</li>
            <li>选择视频分类和隐私设置</li>
            <li>点击"上传"按钮开始上传</li>
          </ol>
          <p>注意：我们支持的最大视频文件大小为2GB，支持的格式包括MP4、MOV、AVI等常见格式。</p>
        </el-collapse-item>

        <el-collapse-item title="3. 如何编辑个人资料？" name="3">
          <p>编辑个人资料的步骤：</p>
          <ol>
            <li>登录您的账户</li>
            <li>点击右上角的头像，选择"个人资料"</li>
            <li>点击"编辑资料"按钮</li>
            <li>修改您想要更新的信息，如头像、用户名、个人简介等</li>
            <li>点击"保存"按钮完成更新</li>
          </ol>
        </el-collapse-item>

        <el-collapse-item title="4. 如何管理我的视频？" name="4">
          <p>您可以按照以下步骤管理您的视频：</p>
          <ol>
            <li>登录您的账户</li>
            <li>点击右上角的头像，选择"我的视频"</li>
            <li>在这里您可以：</li>
            <ul>
              <li>查看所有已上传的视频</li>
              <li>编辑视频信息</li>
              <li>删除视频</li>
              <li>更改视频的隐私设置</li>
              <li>查看视频的统计数据</li>
            </ul>
          </ol>
        </el-collapse-item>

        <el-collapse-item title="5. 如何举报不当内容？" name="5">
          <p>如果您发现不当内容，可以按照以下步骤举报：</p>
          <ol>
            <li>找到要举报的视频</li>
            <li>点击视频下方的"更多"按钮</li>
            <li>选择"举报"选项</li>
            <li>选择举报原因并填写详细信息</li>
            <li>点击"提交"按钮完成举报</li>
          </ol>
          <p>我们的审核团队会在收到举报后尽快处理。</p>
        </el-collapse-item>

        <el-collapse-item title="6. 如何联系客服？" name="6">
          <p>您可以通过以下方式联系我们的客服团队：</p>
          <ul>
            <li>发送邮件至：support@videoshare.example.com</li>
            <li>在工作时间（周一至周五 9:00-18:00）拨打客服电话：400-123-4567</li>
            <li>通过网站底部的"联系我们"页面提交工单</li>
          </ul>
        </el-collapse-item>

        <el-collapse-item title="7. 如何删除我的账户？" name="7">
          <p>如果您想删除账户，请按照以下步骤操作：</p>
          <ol>
            <li>登录您的账户</li>
            <li>进入"账户设置"页面</li>
            <li>找到"删除账户"选项</li>
            <li>阅读删除账户的注意事项</li>
            <li>输入您的密码确认删除</li>
            <li>点击"确认删除"按钮</li>
          </ol>
          <p>注意：删除账户后，您的所有数据将被永久删除且无法恢复。</p>
        </el-collapse-item>
      </el-collapse>

      <div class="contact-section">
        <p>如果您的问题未在以上常见问题中找到答案，请随时联系我们的客服团队。</p>
        <el-button type="primary" @click="$router.push('/contact')"> 联系我们 </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue';

  const activeNames = ref(['1']);

  onMounted(() => {
    document.title = '常见问题 - 视频分享平台';
  });
</script>

<style lang="scss" scoped>
  .faq-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;

    h1 {
      margin-bottom: 2rem;
      text-align: center;
    }

    .content {
      .el-collapse {
        margin-bottom: 2rem;
      }

      .contact-section {
        text-align: center;
        margin-top: 2rem;
        padding: 2rem;
        background-color: #f5f7fa;
        border-radius: 4px;

        p {
          margin-bottom: 1rem;
        }
      }
    }
  }
</style>
