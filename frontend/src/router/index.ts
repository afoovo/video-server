/**
 * 路由配置文件
 * 提供应用的路由定义和导航控制
 */
import {
  createRouter,
  createWebHistory,
  type NavigationGuardNext,
  type RouteLocationNormalized,
  type Router,
  type RouteRecordRaw,
} from 'vue-router';

// 扩展路由元数据接口
declare module 'vue-router' {
  interface RouteMeta {
    title?: string;
    keepAlive?: boolean;
    requiresAuth?: boolean;
    requiresGuest?: boolean;
    transition?: string;
    layout?: 'main' | 'blank' | 'auth'; // 布局类型
    breadcrumb?: string[]; // 面包屑路径
  }
}

// 为Vue模块添加类型声明

// 路由类型定义
const routes: RouteRecordRaw[] = [
  // 核心页面路由
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/Home.vue').then(m => m.default || m),
    meta: {
      title: '首页',
      keepAlive: false,
    },
  },
  {
    path: '/trending',
    name: 'trending',
    component: () => import('@/views/Trending.vue').then(m => m.default || m),
    meta: {
      title: '热门视频',
      keepAlive: false,
    },
  },
  {
    path: '/search',
    name: 'search',
    component: () => import('@/views/SearchResults.vue').then(m => m.default || m),
    meta: {
      title: '搜索结果',
      keepAlive: false,
    },
  },
  {
    path: '/video/:id',
    name: 'video-detail',
    component: () => import('@/components/video/VideoDetail.vue').then(m => m.default || m),
    meta: {
      title: '视频详情',
      keepAlive: false,
      transition: 'fade',
    },
  },

  // 认证相关路由
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Login.vue').then(m => m.default || m),
    meta: {
      title: '登录',
      requiresGuest: true,
      keepAlive: false,
    },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/Register.vue').then(m => m.default || m),
    meta: {
      title: '注册',
      requiresGuest: true,
      keepAlive: false,
    },
  },

  // 需要认证的路由
  {
    path: '/upload',
    name: 'upload',
    component: () => import('@/components/video/VideoUpload.vue').then(m => m.default || m),
    meta: {
      title: '上传视频',
      requiresAuth: true,
      keepAlive: false,
    },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/components/user/UserProfile.vue').then(m => m.default || m),
    meta: {
      title: '个人中心',
      requiresAuth: true,
      keepAlive: true,
    },
  },
  {
    path: '/profile/completion',
    name: 'UserInfoCompletion',
    component: () => import('@/components/user/UserInfoCompletion.vue').then(m => m.default || m),
    meta: {
      title: '编辑个人信息',
      requiresAuth: true,
    },
  },

  // 信息页面路由
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/About.vue').then(m => m.default || m),
    meta: {
      title: '关于我们',
      keepAlive: true,
    },
  },
  {
    path: '/faq',
    name: 'faq',
    component: () => import('@/views/FAQ.vue').then(m => m.default || m),
    meta: {
      title: '常见问题',
      keepAlive: true,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFound.vue').then(m => m.default || m),
    meta: {
      title: '页面未找到',
      keepAlive: false,
    },
  },
];

const router: Router = createRouter({
  history: createWebHistory(),
  routes,
  // 优化滚动行为
  scrollBehavior(
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    savedPosition?: { top?: number; left?: number } | null
  ) {
    // 如果有保存的位置（如浏览器的前进/后退按钮），则恢复到该位置
    if (savedPosition) {
      return savedPosition;
    }
    // 对于视频详情页，可以平滑滚动到顶部
    if (to.name === 'video-detail') {
      return { top: 0, behavior: 'smooth' };
    }
    // 默认滚动到顶部
    return { top: 0 };
  },
});

/**
 * 获取认证状态
 * @returns {boolean} 是否已认证
 */
function isAuthenticated(): boolean {
  try {
    const token = localStorage.getItem('token');
    return !!token;
  } catch (error) {
    console.error('检查认证状态时出错:', error);
    return false;
  }
}

/**
 * 设置页面标题
 * @param {string} title - 页面标题
 */
function setPageTitle(title?: string): void {
  const defaultTitle = '视频平台';
  document.title = title ? `${title} - ${defaultTitle}` : defaultTitle;
}

// 路由守卫
router.beforeEach(
  (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext): void => {
    // 设置页面标题
    setPageTitle(to.meta?.title);

    // 处理需要认证的路由
    if (to.meta.requiresAuth === true && !isAuthenticated()) {
      // 保存当前路径，用于登录后重定向
      next({ name: 'login', query: { redirect: to.fullPath } });
      return;
    }

    // 处理需要游客状态的路由（如登录/注册页）
    if (to.meta.requiresGuest === true && isAuthenticated()) {
      // 已登录用户重定向到首页或来源页
      const redirectName = typeof from.name === 'string' ? from.name : 'home';
      next({ name: redirectName });
      return;
    }

    // 允许访问
    next();
  }
);

// 路由完成后的钩子，可以用于性能监控等
router.afterEach(() => {
  // 这里可以添加页面加载完成后的逻辑
});

// 全局错误处理
router.onError((error: Error): void => {
  console.error('路由错误:', error);
  // 这里可以添加错误上报或用户友好提示
});

export default router;
