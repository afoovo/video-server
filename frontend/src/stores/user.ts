/**
 * 用户状态管理
 * 适配sa-token认证机制
 */
import { defineStore } from 'pinia';
import type { Ref } from 'vue';
import { computed, ref } from 'vue';
import { getCurrentUser, login as loginApi, logout as logoutApi } from '@/api/auth';
import { ElMessage } from 'element-plus';
import type { LoginForm, User } from '@/types/user';

export const useUserStore = defineStore('user', () => {
  // 默认值
  const DEFAULT_AVATAR = new URL('@/assets/default-avatar.png', import.meta.url).href;

  /**
   * 安全地解析 localStorage 中的数据
   * @param key - 存储键名
   * @param defaultValue - 默认值
   * @returns 解析后的数据
   */
  function safeParseJSON<T>(key: string, defaultValue: T): T {
    try {
      const value = localStorage.getItem(key);
      if (!value || value === 'undefined' || value === 'null') {
        return defaultValue;
      }
      return JSON.parse(value) as T;
    } catch (e) {
      console.warn(`解析${key}失败:`, e);
      return defaultValue;
    }
  }

  // 状态定义
  const token: Ref<string> = ref(localStorage.getItem('token') || '');
  const userInfo: Ref<Partial<User>> = ref(safeParseJSON<Partial<User>>('userInfo', {}));
  const initialized: Ref<boolean> = ref(false);

  // 计算属性
  const isLoggedIn = computed(() => !!token.value);
  const username = computed(() => userInfo.value?.userName || '');
  const avatar = computed(() => {
    const avatarPath = userInfo.value?.avatarUrl;
    if (!avatarPath) return DEFAULT_AVATAR;
    return avatarPath;
  });
  const userId = computed(() => userInfo.value?.id);

  /**
   * 获取最新的用户信息
   * @returns 用户信息或null
   */
  async function refreshUserInfo(): Promise<User | null> {
    if (!userId.value) {
      console.warn('没有用户ID，无法刷新用户信息');
      return null;
    }

    try {
      const user = await getCurrentUser();

      if (user && user.id) {
        // 更新本地用户信息
        userInfo.value = user;
        localStorage.setItem('userInfo', JSON.stringify(user));
        return user;
      } else {
        console.error('获取到的用户信息无效:', user);
        return null;
      }
    } catch (error) {
      console.error('刷新用户信息失败:', error);
      return null;
    }
  }

  /**
   * 清除认证状态
   * 移除本地存储中的认证信息
   */
  function clearAuthState(): void {
    token.value = '';
    userInfo.value = {};
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
  }

  /**
   * 用户登录
   * @param credentials - 登录凭证
   * @returns 登录是否成功
   */
  async function login(credentials: LoginForm): Promise<boolean> {
    try {
      const response = await loginApi(credentials);

      if (!response || !response.token || !response.user) {
        throw new Error('登录响应格式错误');
      }

      // 保存token和用户信息
      token.value = response.token;
      userInfo.value = response.user;

      // 保存到本地存储
      localStorage.setItem('token', response.token);
      localStorage.setItem('userInfo', JSON.stringify(response.user));

      return true;
    } catch (error) {
      console.error('登录失败:', {
        error,
        response: (error as any).response?.data,
        message: (error as any).message,
      });

      if ((error as any).response?.data?.msg) {
        ElMessage.error((error as any).response.data.msg);
      } else {
        ElMessage.error((error as any).message || '登录失败');
      }
      return false;
    }
  }

  /**
   * 用户注销
   */
  async function logout(): Promise<void> {
    try {
      if (isLoggedIn.value) {
        // 先清理本地状态
        clearAuthState();

        // 发送登出请求
        await logoutApi();
        ElMessage.success('已退出登录');
      }
    } catch (error) {
      console.error('登出处理失败:', error);
      // 确保在出错时也清除本地状态
      clearAuthState();
    }
  }

  /**
   * 初始化用户状态
   * 应用启动时调用
   * @returns 是否已登录
   */
  async function initialize(): Promise<boolean> {
    if (initialized.value) {
      return isLoggedIn.value;
    }

    // 检查本地存储状态
    const localToken = localStorage.getItem('token');
    const localUserInfo = localStorage.getItem('userInfo');

    // 如果存储中有token但内存中没有，同步到内存
    if (localToken && !token.value) {
      token.value = localToken;
    }

    // 如果存储中有userInfo但内存中是空对象，同步到内存
    if (localUserInfo && Object.keys(userInfo.value).length === 0) {
      try {
        userInfo.value = JSON.parse(localUserInfo) as Partial<User>;
      } catch (e) {
        console.error('解析userInfo失败:', e);
      }
    }

    initialized.value = true;
    return isLoggedIn.value;
  }

  // 用户信息，用于UserProfile组件和其他需要完整用户信息的地方
  const user = computed(() =>
    // 如果userInfo为空对象，返回null
    Object.keys(userInfo.value).length > 0 ? userInfo.value : null
  );

  return {
    token,
    userInfo,
    user,
    isLoggedIn,
    username,
    avatar,
    userId,
    login,
    logout,
    initialize,
    clearAuthState,
    refreshUserInfo,
  };
});
