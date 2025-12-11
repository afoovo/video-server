<template>
  <div class="register-container">
    <el-card class="register-card">
      <template #header>
        <h2 class="register-title">用户注册</h2>
      </template>

      <el-form
        ref="registerForm"
        :model="formData"
        :rules="rules"
        label-width="80px"
        @submit.prevent="handleSubmit"
      >
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="formData.userName" placeholder="请输入用户名" />
        </el-form-item>

        <el-form-item label="账号" prop="account">
          <el-input v-model="formData.account" placeholder="请输入账号" />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="formData.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="formData.confirmPassword"
            type="password"
            placeholder="请确认密码"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" native-type="submit" :loading="loading" class="submit-btn">
            注册
          </el-button>
          <router-link to="/login" class="login-link"> 已有账号？立即登录 </router-link>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
  import { ref, reactive } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import { register } from '@/api/auth';
  import { useUserStore } from '@/stores/user';

  export default {
    name: 'Register',
    setup() {
      const router = useRouter();
      const registerForm = ref(null);
      const loading = ref(false);

      const formData = reactive({
        userName: '',
        account: '',
        email: '',
        password: '',
        confirmPassword: '',
      });

      const validatePass2 = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请再次输入密码'));
        } else if (value !== formData.password) {
          callback(new Error('两次输入密码不一致!'));
        } else {
          callback();
        }
      };

      const rules = {
        userName: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 4, max: 20, message: '长度在 4 到 20 个字符', trigger: 'blur' },
        ],
        account: [
          { required: true, message: '请输入账号', trigger: 'blur' },
          { min: 4, max: 20, message: '长度在 4 到 20 个字符', trigger: 'blur' },
        ],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' },
        ],
        confirmPassword: [
          { required: true, message: '请再次输入密码', trigger: 'blur' },
          { validator: validatePass2, trigger: 'blur' },
        ],
      };

      async function handleSubmit() {
        if (!registerForm.value) return;
        try {
          loading.value = true;
          const registerData = { ...formData };
          // console.log('注册数据:', registerData)
          const response = await register(registerData);
          // console.log('注册响应:', response)

          // 保存token和用户信息到store和localStorage
          const userStore = useUserStore();
          if (response.token && response.user) {
            userStore.token = response.token;
            userStore.userInfo = response.user;

            // 同时保存到localStorage以保持持久化
            localStorage.setItem('token', response.token);
            localStorage.setItem('userInfo', JSON.stringify(response.user));
          }

          ElMessage.success('注册成功');
          await router.push('/profile/edit');
        } catch (error) {
          console.error('Register error:', error);
          if (error.response?.data?.message) {
            ElMessage.error(error.response.data.message);
          } else {
            ElMessage.error(error.message || '注册失败');
          }
        } finally {
          loading.value = false;
        }
      }

      return {
        registerForm,
        formData,
        rules,
        loading,
        handleSubmit,
      };
    },
  };
</script>

<style lang="scss" scoped></style>
