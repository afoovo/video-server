# 视频平台前端项目
在trae的终端构建或运行后端项目时，需要先设置环境变量，这是软件bug：
```
$env:JAVA_HOME='C:\Users\Administrator\jdk\jdk-17.0.12'; $env:PATH='C:\Users\Administrator\jdk\jdk-17.0.12\bin;' + $env:PATH; java -version
```
充分利用现有实现，按照项目最佳实践结构，不编写多余功能代码

## 0.开发计划清单
开发计划：

信息完善页：
- 完善用户信息：用户可以在个人中心页完善自己的信息，包括用户昵称、头像、个人介绍。
- 首次注册的用户接着进行信息完善，修改昵称、上传头像、修改个人介绍。

视频卡片组件：
- 上传者：显示视频上传用户的昵称

用户信息功能：
- 个人中心页：用户基本信息、上传视频列表
- 视频信息加入用户信息：视频上传者


## 1. 项目概述

视频平台前端项目是一个基于 Vue 3 + TypeScript 开发的现代化视频分享平台，提供视频浏览、搜索、播放、上传、评论等核心功能。

### 1.1 技术栈

| 技术           | 版本      | 用途       |
|--------------|---------|----------|
| Vue          | 3.5.25  | 前端框架     |
| TypeScript   | 5.9.3   | 类型系统     |
| Vite         | 7.2.4   | 构建工具     |
| Element Plus | 2.11.8  | UI 组件库   |
| Pinia        | 3.0.4   | 状态管理     |
| Vue Router   | 4.6.3   | 路由管理     |
| Axios        | 1.13.2  | HTTP 客户端 |
| Artplayer    | 5.3.0   | 视频播放器    |
| Sass         | 1.94.2  | CSS 预处理器 |
| Dayjs        | 1.11.19 | 时间处理     |
| Lodash-es    | 4.17.21 | 工具库      |

### 1.2 项目结构

```
├── src/                      # 源码目录
│   ├── api/                  # API 封装
│   │   ├── auth.ts           # 认证相关 API
│   │   ├── category.ts       # 分类相关 API
│   │   ├── comment.ts        # 评论相关 API
│   │   ├── user.ts           # 用户相关 API
│   │   └── video.ts          # 视频相关 API
│   ├── assets/               # 静态资源
│   │   ├── default-avatar.png # 默认头像
│   │   ├── default-cover.jpg # 默认封面
│   │   └── logo.png          # 网站 Logo
│   ├── components/           # 组件
│   │   ├── comment/          # 评论相关组件
│   │   │   └── CommentList.vue # 评论列表组件
│   │   ├── common/           # 通用组件
│   │   │   └── UserInfoDisplay.vue # 用户信息展示组件
│   │   ├── layout/           # 布局组件
│   │   │   ├── AppFooter.vue # 底部组件
│   │   │   └── AppHeader.vue # 头部组件
│   │   ├── user/             # 用户相关组件
│   │   │   └── UserProfile.vue # 用户资料组件
│   │   └── video/            # 视频相关组件
│   │       ├── VideoCard.vue  # 视频卡片组件
│   │       ├── VideoDetail.vue # 视频详情组件
│   │       ├── VideoList.vue  # 视频列表组件
│   │       ├── VideoPlayer.vue # 视频播放器组件
│   │       └── VideoUpload.vue # 视频上传组件
│   ├── router/               # 路由配置
│   │   └── index.ts          # 路由主文件
│   ├── stores/               # 状态管理
│   │   ├── category.ts       # 分类状态管理
│   │   ├── comment.ts        # 评论状态管理
│   │   ├── user.ts           # 用户状态管理
│   │   └── video.ts          # 视频状态管理
│   ├── styles/               # 样式文件
│   │   ├── global.scss       # 全局样式
│   │   ├── layout.scss       # 布局样式
│   │   ├── main.scss         # 主样式
│   │   ├── mixins.scss       # 混合样式
│   │   └── variables.scss    # 变量定义
│   ├── types/                # 类型定义
│   │   ├── comment.ts        # 评论类型
│   │   ├── common.ts         # 通用类型
│   │   ├── user.ts           # 用户类型
│   │   └── video.ts          # 视频类型
│   ├── utils/                # 工具函数
│   │   ├── dayjs.ts          # 时间处理工具
│   │   ├── env.ts            # 环境变量工具
│   │   ├── format.ts         # 格式化工具
│   │   └── request.ts        # 请求工具
│   ├── views/                # 页面组件
│   │   ├── About.vue         # 关于页面
│   │   ├── FAQ.vue           # 常见问题页面
│   │   ├── Home.vue          # 首页
│   │   ├── Login.vue         # 登录页面
│   │   ├── NotFound.vue      # 404页面
│   │   ├── Register.vue      # 注册页面
│   │   └── Trending.vue      # 热门视频页面
│   ├── App.vue               # 根组件
│   └── main.ts               # 入口文件
├── .env                      # 环境变量
├── auto-imports.d.ts         # 自动导入类型定义
├── components.d.ts           # 组件类型定义
├── index.html                # HTML 模板
├── package.json              # 项目配置
├── tsconfig.json             # TypeScript 配置
├── tsconfig.node.json        # Node.js TypeScript 配置
├── vite.config.ts            # Vite 配置
└── README.md                 # 项目文档
```

## 2. 环境配置

### 2.1 前置依赖

- Node.js 18.0.0+
- pnpm 9.0.0+

### 2.2 安装依赖

```bash
pnpm install
```

### 2.3 开发环境

```bash
pnpm dev
```

项目将在 `http://localhost:5173` 启动。

### 2.4 构建生产版本

```bash
pnpm build
```

构建产物将输出到 `dist` 目录。

### 2.5 代码检查与格式化

```bash
# 代码检查
pnpm lint

# 代码修复
pnpm lint:fix

# 代码格式化
pnpm format
```

## 3. 核心功能

### 3.1 视频浏览与搜索

- 视频分类浏览
- 视频搜索功能

### 3.2 视频播放

- 基于 Artplayer 的视频播放器

### 3.3 用户管理

- 用户注册、登录
- 个人中心
- 用户信息管理

### 3.4 视频上传

- 支持本地视频上传
- 支持封面上传
- 支持视频信息编辑

### 3.5 互动功能

- 视频评论
- 评论回复
- 视频点赞
- 视频分享

## 4. 架构设计

### 4.1 状态管理

采用 Pinia 进行状态管理，主要包括以下 store：

| Store   | 功能     |
|---------|--------|
| user    | 用户信息管理 |
| video   | 视频信息管理 |
| comment | 评论信息管理 |

### 4.2 API 设计

API 封装采用模块化设计，主要包括以下模块：

| 模块      | 功能       |
|---------|----------|
| auth    | 认证相关 API |
| video   | 视频相关 API |
| user    | 用户相关 API |
| comment | 评论相关 API |

### 4.3 路由设计

| 路由         | 功能   | 认证要求 |
|------------|------|------|
| /          | 首页   | 无    |
| /trending  | 热门视频 | 无    |
| /video/:id | 视频详情 | 无    |
| /login     | 登录   | 游客   |
| /register  | 注册   | 游客   |
| /upload    | 上传视频 | 登录   |
| /profile   | 个人中心 | 登录   |

### 4.4 响应式设计

- 采用 Element Plus 的响应式布局
- 支持移动端和桌面端
- 适配不同屏幕尺寸

## 5. 数据流转流程

1. **组件初始化**：组件挂载时调用 store 中的方法获取数据
2. **Store 异步请求**：store 调用 API 封装的方法发起 HTTP 请求
3. **API 拦截处理**：请求经过拦截器处理，添加认证信息、统一 URL 格式
4. **后端响应**：后端返回数据，经过响应拦截器处理
5. **Store 状态更新**：store 更新状态，组件响应式更新
6. **组件渲染**：组件根据最新状态重新渲染

## 6. 后端对接规范

### 6.1 API 基础路径

- `http://localhost:8080`

### 6.2 认证机制

### 6.3 响应格式

```json
{
  "code": 0,          
  "msg": "",          
  "data": {},         
  "dataCount": 0      
}
```

### 6.4 错误处理

- 401：未认证，提示并选择跳转到登录页
- 404：资源不存在，提示错误信息
- 500：服务器内部错误，提示错误信息

## 7. 开发规范

### 7.1 代码规范

- 遵循 TypeScript 编码规范
- 使用 ESLint 进行代码检查
- 使用 Prettier 进行代码格式化
- 组件命名使用 PascalCase
- 变量命名使用 camelCase
- 常量命名使用 UPPER_CASE

### 7.2 组件设计

- 组件职责单一
- 支持 TypeScript 类型定义

### 7.3 状态管理规范

- 共享状态使用 Pinia
- 异步操作在 store 中处理

## 9. 常见问题解答

### 9.1 如何添加新页面？

1. 在 `src/views` 目录下创建新的页面组件
2. 在 `src/router/index.ts` 中配置路由
3. 在需要的地方添加导航链接

### 9.2 如何添加新的 API？

1. 在 `src/api` 目录下的对应模块中添加 API 函数
2. 在 `src/types` 目录下添加对应的类型定义
3. 在 store 中调用 API 函数
4. 在组件中使用 store 获取数据

### 9.3 如何处理跨域问题？

跨域问题已经在 `vite.config.ts` 中配置了代理，开发环境下会自动代理到后端服务。

### 9.4 如何添加新的组件？

1. 在 `src/components` 目录下创建新的组件
2. 在需要的地方导入并使用组件
3. 为组件添加 TypeScript 类型定义
