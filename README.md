# Video Server 后端服务文档

## 1. 项目概述

Video Server 是一个基于 Solon 框架开发的视频平台后端服务，提供视频上传、下载、播放、分类、搜索等核心功能，同时支持用户认证、权限管理等功能。

### 1.1 技术栈

| 技术 | 版本 | 用途 |
| --- | --- | --- |
| Java | 17 | 开发语言 |
| Solon | 3.7.2LTS | Web 框架 |
| Sa-Token | 最新 | 认证授权 |
| MyBatis-Flex | 最新 | ORM 框架 |
| MySQL | 8.0+ | 数据库 |
| MinIO/S3 | 最新 | 对象存储 |
| Maven | 3.6+ | 项目构建 |

### 1.2 项目结构

```
├── src/                      # 后端源码目录
│   ├── main/                 # 主源码
│   │   ├── java/com/afo/video/  # 业务代码
│   │   │   ├── common/       # 公共组件
│   │   │   ├── config/       # 配置类
│   │   │   ├── controller/   # 控制器
│   │   │   ├── domain/       # 实体类
│   │   │   ├── mapper/       # 数据访问层
│   │   │   ├── service/      # 业务逻辑层
│   │   │   └── App.java      # 应用入口
│   │   └── resources/        # 资源文件
│   │       ├── static/doc/   # API 文档
│   │       ├── app.yml       # 配置文件
│   │       └── schema.sql    # 数据库脚本
├── frontend/                 # 前端源码目录
└── README.md                 # 项目文档
```

## 2. 环境配置指南

### 2.1 本地开发环境

#### 2.1.1 前置依赖

- JDK 17+
- Maven 3.6+
- MySQL 8.0+
- MinIO/S3 服务（可选，用于云存储）

#### 2.1.2 数据库配置

1. 创建数据库：
   ```sql
   CREATE DATABASE `video-server` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. 执行数据库脚本：
   ```bash
   mysql -u root -p video-server < src/main/resources/schema.sql
   ```

#### 2.1.3 配置文件修改

编辑 `src/main/resources/app.yml` 文件，根据实际情况修改以下配置：

```yaml
# 数据库配置
mybatis-flex.datasource:
  default:
    driver-class-name: com.mysql.cj.jdbc.Driver
    url: jdbc:mysql://localhost:3306/video-server?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
    username: root
    password: 123

# S3/MinIO 配置
solon.cloud.file.s3.file:
  default: 'video'
  buckets:
    video:
      endpoint: 'http://localhost:9000/'
      regionId: 'None'
      accessKey: 'your-access-key'
      secretKey: 'your-secret-key'
      pathStyleAccessEnabled: true
```

#### 2.1.4 启动项目

```bash
# 编译项目
mvn clean compile

# 编译打包
先设置环境变量（trae bug终端每次都需要设置）
$env:JAVA_HOME='C:\Users\Administrator\jdk\jdk-17.0.12'; $env:PATH='C:\Users\Administrator\jdk\jdk-17.0.12\bin;' + $env:PATH; java -version
mvn clean compile package
# 运行项目
java -jar target/video-server.jar
```

项目将在 `http://localhost:8080` 启动。

### 2.2 生产环境部署

#### 2.2.2 运行项目

```bash
java -jar target/video-server.jar
```

## 3. API 接口文档

### 3.1 接口访问地址

- 本地开发环境：`http://localhost:8080`
- 生产环境：根据实际部署地址调整

### 3.2 接口文档查看

- OpenAPI 文档：`http://localhost:8080/static/doc/openapi.json`
- Postman 文档：`http://localhost:8080/static/doc/postman.json`

### 3.3 主要接口分类

| 分类 | 主要功能 | 接口前缀 |
| --- | --- | --- |
| 认证管理 | 登录、注册、登出 | `/auth` |
| 用户管理 | 用户列表、详情、新增、更新、删除 | `/user` |
| 视频管理 | 视频列表、详情、搜索、播放 | `/video` |
| 分类管理 | 分类列表、详情、视频列表 | `/category` |
| 文件管理 | 上传、下载 | `/file` |

## 4. 认证授权机制

### 4.1 Sa-Token 认证

项目使用 Sa-Token 进行认证授权管理且未全面覆盖，主要特点：

- Token 风格：UUID
- Token 有效期：30天（可配置）
- 支持同一账号并发登录
- 支持 Token 续期

### 4.2 认证流程

1. 用户登录：调用 `/auth/login` 接口，获取 Token
2. 访问需要认证的接口：在请求头中携带 `Authorization: Bearer {token}`
3. Token 验证：后端自动验证 Token 有效性
4. 用户登出：调用 `/auth/logout` 接口，销毁 Token

### 4.3 权限控制

目前项目采用简单的角色权限控制且未全面覆盖，后续将扩展为更细粒度的权限控制。

## 5. 接口调用规范

### 5.1 请求格式

- GET 请求：参数通过 URL 或 Query String 传递
- POST/PUT 请求：参数通过 Request Body 传递，格式为 JSON
- 文件上传：使用 `multipart/form-data` 格式

### 5.2 响应格式

所有接口返回统一的 JSON 格式：

```json
{
   "code": 0,
   "msg": "",
   "data": {},
   "dataCount": 0
}
```

### 5.3 状态码说明

| 状态码 | 说明 |
| --- | --- |
| 0 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 6. 核心功能说明

### 6.1 用户管理

#### 6.1.1 用户注册

- 接口：`POST /auth/register`
- 参数：用户名、密码
- 返回：用户信息和 Token

#### 6.1.2 用户登录

- 接口：`GET /auth/login`
- 参数：用户名、密码
- 返回：用户信息和 Token

#### 6.1.3 用户信息获取

- 接口：`GET /user/get/{id}`
- 参数：用户 ID
- 返回：用户详细信息

### 6.2 视频管理

#### 6.2.1 视频列表

- 接口：`GET /video/list`
- 返回：所有视频列表

#### 6.2.2 视频分页查询

- 接口：`GET /video/page`
- 参数：`pageNum`（页码）、`pageSize`（每页数量）
- 返回：分页视频列表

#### 6.2.3 视频搜索

- 接口：`GET /video/search/{name}`
- 参数：视频名称（模糊查询）
- 返回：搜索结果列表

#### 6.2.4 视频详情

- 接口：`GET /video/{Id}`
- 参数：`Id`（视频 ID）
- 返回：视频详情

### 6.3 文件管理

#### 6.3.1 本地文件上传

- 接口：`POST /file/uploadLocally`
- 参数：`file`（视频文件）、`cover`（封面文件）、`title`（视频标题）、`desc`（视频描述）
- 返回：上传结果

#### 6.3.2 云存储文件上传

- 接口：`POST /file/uploadCloud`
- 参数：`file`（视频文件）、`cover`（封面文件）、`title`（视频标题）、`desc`（视频描述）
- 返回：上传结果

#### 6.3.3 文件下载

- 本地下载：`GET /file/downloadLocally/{videoId}`
- 云存储下载：`GET /file/downloadCloud/{videoId}`

### 6.4 分类管理

#### 6.4.1 分类列表

- 接口：`GET /category/list`
- 返回：所有分类列表

#### 6.4.2 分类详情

- 接口：`GET /category/{id}`
- 参数：分类 ID
- 返回：分类详细信息

#### 6.4.3 分类视频列表

- 接口：`GET /category/{id}/videoList`
- 参数：分类 ID
- 返回：该分类下的视频列表

## 7. 数据格式说明

### 7.1 用户数据结构

```json
{
  "id": 1,
  "userName": "admin",
  "account": "admin",
  "email": "admin@example.com",
  "sex": "男",
  "roleId": 1,
  "status": 1,
  "createTime": "2023-01-01 00:00:00",
  "updateTime": "2023-01-01 00:00:00"
}
```

### 7.2 视频数据结构

```json
{
  "id": 1,
  "title": "测试视频",
  "desc": "这是一个测试视频",
  "coverUrl": "http://example.com/cover.jpg",
  "videoUrl": "http://example.com/video.mp4",
  "userId": 1,
  "categoryId": 1,
  "playCount": 0,
  "likeCount": 0,
  "commentCount": 0,
  "status": 1,
  "createTime": "2023-01-01 00:00:00",
  "updateTime": "2023-01-01 00:00:00"
}
```

### 7.3 分类数据结构

```json
{
  "id": 1,
  "name": "科技",
  "description": "科技类视频",
  "status": 1,
  "createTime": "2023-01-01 00:00:00",
  "updateTime": "2023-01-01 00:00:00"
}
```

## 8. 错误处理方式

### 8.1 全局异常处理

项目实现了全局异常处理机制，所有未捕获的异常都会被统一处理，返回标准的错误响应格式。

### 8.3 错误日志

错误日志会被记录到 `logs/VideoServer.log` 文件中，便于问题排查。

## 9. 开发与测试流程

### 9.1 代码规范

- 遵循 Java 编码规范
- 使用 Lombok 简化代码
- 使用 MyBatis-Flex 进行数据库操作
- 接口返回统一格式

## 10. 缺少的功能（待实现）

### 10.1 FileController

- [ ] 视频封面生成功能
- [ ] 视频时长提取功能
- [ ] 文件删除接口
- [ ] 文件重命名功能

### 10.2 VideoController

- [ ] 视频点赞/收藏功能
- [ ] 视频评论功能
- [ ] 视频统计（播放量、点赞数等）
- [ ] 视频审核状态管理
- [ ] 视频推荐算法接口

### 10.3 CategoryController

- [ ] 分类下视频数量统计

## 11. 常见问题解答

### 11.1 如何获取 Token？

调用 `/auth/login` 接口，使用正确的用户名和密码登录，接口返回的 `data` 字段中包含 Token。

### 11.2 如何上传视频？

使用 `POST /file/uploadLocally` 或 `POST /file/uploadCloud` 接口，使用 `multipart/form-data` 格式上传视频文件和封面文件。

### 11.3 如何播放视频？

调用 `/video/{Id}` 接口，传入视频 ID，接口返回视频详情，其中包含视频流的 URL。可以直接在前端使用 `<video>` 标签播放。

### 11.4 如何搜索视频？

调用 `/video/search/{name}` 接口，传入视频名称，接口返回匹配的视频列表。

### 11.5 如何获取分类下的视频？

调用 `/category/{id}/videoList` 接口，传入分类 ID，接口返回该分类下的视频列表。

## 12. 联系方式

- 项目负责人：[负责人姓名]
- 技术支持：[技术支持邮箱]
- 问题反馈：[问题反馈地址]

## 13. 版本更新记录
---

**文档更新时间：** 2025-11-27
**文档版本：** v1.0.0