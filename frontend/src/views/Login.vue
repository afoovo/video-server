<template>
  <div class="login-container">
    <el-form ref="formRef" :model="loginForm" :rules="rules" label-width="80px" class="login-form">
      <h2 class="login-title">用户登录</h2>
      <el-form-item label="账号" prop="account">
        <el-input
          v-model="loginForm.account"
          placeholder="请输入账号"
          @keyup.enter="handleSubmit"
        />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input
          v-model="loginForm.password"
          type="password"
          show-password
          placeholder="请输入密码"
          @keyup.enter="handleSubmit"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" @click="handleSubmit">登录</el-button>
        <el-button @click="router.push('/register')">注册账号</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
  import { onMounted, ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useUserStore } from '@/stores/user';
  import { ElMessage } from 'element-plus';

  const router = useRouter();
  const route = useRoute();
  const userStore = useUserStore();

  const formRef = ref(null);
  const loading = ref(false);
  const loginForm = ref({
    account: '',
    password: '',
    rememberMe: false,
  });

  const rules = {
    account: [
      { required: true, message: '请输入账号', trigger: 'blur' },
      {
        trigger: 'blur',
      },
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      {
        trigger: 'blur',
      },
    ],
  };

  // 从本地存储加载记住的账号和密码
  const loadRememberedCredentials = () => {
    const rememberedAccount = localStorage.getItem('rememberedAccount');
    const rememberedPassword = localStorage.getItem('rememberedPassword');

    if (rememberedAccount && rememberedPassword) {
      loginForm.value.account = rememberedAccount;
      loginForm.value.password = rememberedPassword;
      loginForm.value.rememberMe = true;
    }
  };

  // 保存记住的账号和密码
  const saveRememberedCredentials = () => {
    if (loginForm.value.rememberMe) {
      localStorage.setItem('rememberedAccount', loginForm.value.account);
      localStorage.setItem('rememberedPassword', loginForm.value.password);
    } else {
      localStorage.removeItem('rememberedAccount');
      localStorage.removeItem('rememberedPassword');
    }
  };

  async function handleSubmit() {
    if (!formRef.value) return;

    try {
      await formRef.value.validate();
      loading.value = true;

      const success = await userStore.login({
        account: loginForm.value.account,
        password: loginForm.value.password,
      });

      if (success) {
        // 处理记住密码
        saveRememberedCredentials();

        ElMessage.success('登录成功');
        const redirect = route.query.redirect || '/';
        await router.push(redirect);
      }
    } catch (error) {
      console.error('登录失败:', error);
      ElMessage.error(error.message || '登录失败，请检查用户名和密码');
    } finally {
      loading.value = false;
    }
  }

  // 页面加载时检查是否有记住的登录信息
  onMounted(() => {
    loadRememberedCredentials();
  });
</script>

<style lang="scss" scoped></style>
