import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import 'element-plus/dist/index.css';
import '@/styles/main.scss';
import '@/styles/global.scss';

const app = createApp(App);

// 注册所有图标 - 优化方式
Object.entries(ElementPlusIconsVue).forEach(([key, component]) => {
  app.component(key, component);
});

// 按顺序使用插件
app.use(createPinia());
app.use(router);
app.use(ElementPlus);

// 挂载应用
app.mount('#app');
