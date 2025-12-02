<template>
  <div class="upload-page">
    <el-card class="upload-card">
      <template #header>
        <h2>上传视频</h2>
      </template>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" class="upload-form">
        <!-- 视频文件上传 -->
        <el-form-item label="视频文件" prop="videoFile">
          <el-upload
            class="video-uploader"
            drag
            :accept="computedAllowedFileTypes.join(',')"
            :auto-upload="false"
            :show-file-list="false"
            :before-upload="handleBeforeUpload"
            @change="handleVideoChange"
          >
            <template v-if="!form.videoFile">
              <el-icon class="upload-icon">
                <Upload />
              </el-icon>
              <div class="upload-text">将视频拖到此处，或<em>点击上传</em></div>
              <div class="upload-tip">
                支持
                {{
                  computedAllowedFileTypes.map(type => type.split('/')[1].toUpperCase()).join('、')
                }}
                格式，最大 500MB
              </div>
            </template>
            <template v-else>
              <div class="file-info">
                <el-icon class="file-icon">
                  <VideoCamera />
                </el-icon>
                <span class="file-name">{{ form.videoFile.name }}</span>
                <span class="file-size">{{ formatFileSize(form.videoFile.size) }}</span>
                <el-button type="danger" link @click.stop="handleRemoveVideo"> 删除 </el-button>
              </div>
            </template>
          </el-upload>
        </el-form-item>

        <!-- 封面图上传 -->
        <el-form-item v-if="showCoverUpload" label="封面图" prop="coverFile">
          <el-upload
            class="cover-uploader"
            accept="image/*"
            :auto-upload="false"
            :show-file-list="false"
            :before-upload="handleBeforeUploadCover"
            @change="handleCoverChange"
          >
            <template v-if="!coverUrl">
              <el-icon class="upload-icon">
                <Plus />
              </el-icon>
              <div class="upload-text">上传封面</div>
            </template>
            <template v-else>
              <img :src="coverUrl" class="cover-preview" alt="" />
              <div class="cover-actions">
                <el-button type="danger" circle @click.stop="handleRemoveCover">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </template>
          </el-upload>
          <div class="upload-tip">建议尺寸 16:9，最大 2MB</div>
        </el-form-item>

        <!-- 视频信息 -->
        <el-form-item label="标题" prop="title">
          <el-input
            v-model="form.title"
            placeholder="请输入视频标题"
            :maxlength="maxTitleLength"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入视频描述"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <!-- 上传进度 -->
        <div v-if="uploading" class="upload-progress">
          <el-progress
            :percentage="uploadProgress"
            :status="uploadProgress === 100 ? 'success' : ''"
          />
          <div class="progress-text">
            {{ uploadProgress === 100 ? '处理中...' : '上传中...' }}
          </div>
        </div>

        <!-- 提交按钮 -->
        <el-form-item>
          <el-button
            type="primary"
            :loading="uploading"
            :disabled="!form.videoFile"
            @click="handleSubmit"
          >
            开始上传
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
  import { ref, reactive, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { ElMessage } from 'element-plus';
  import { Upload, Plus, VideoCamera, Delete } from '@element-plus/icons-vue';
  import { uploadVideoLocally, uploadVideoToCloud } from '@/api/video';
  import { formatFileSize } from '@/utils/format';

  // 定义组件props
  const props = defineProps({
    showCoverUpload: {
      type: Boolean,
      default: true,
    },
    allowedFileTypes: {
      type: Array,
      default: () => ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-matroska'],
    },
    maxTitleLength: {
      type: Number,
      default: 100,
    },
    apiMethod: {
      type: String,
      default: 'uploadVideoLocally', // 'uploadVideoToCloud' 或 'uploadVideoLocally'
    },
  });

  // 定义组件emit事件
  const emit = defineEmits(['upload-success']);

  const router = useRouter();
  const formRef = ref(null);
  const uploading = ref(false);
  const uploadProgress = ref(0);
  const coverUrl = ref('');

  const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
  const computedAllowedFileTypes = computed(() => props.allowedFileTypes);

  // 表单数据
  const form = reactive({
    videoFile: null,
    coverFile: null,
    title: '',
    description: '',
  });

  // 表单验证规则
  const rules = {
    videoFile: [{ required: true, message: '请上传视频文件', trigger: 'change' }],
    title: [
      { required: true, message: '请输入视频标题', trigger: 'blur' },
      {
        min: 2,
        max: props.maxTitleLength,
        message: `标题长度在 2 到 ${props.maxTitleLength} 个字符`,
        trigger: 'blur',
      },
    ],
    description: [{ max: 500, message: '描述最多 500 个字符', trigger: 'blur' }],
  };

  // 视频文件上传前验证
  const handleBeforeUpload = file => {
    const isAllowedType = computedAllowedFileTypes.value.includes(file.type);
    const isLtMaxSize = file.size <= MAX_FILE_SIZE;

    if (!isAllowedType) {
      ElMessage.error(`只能上传 ${computedAllowedFileTypes.value.join(', ')} 格式的视频！`);
      return false;
    }
    if (!isLtMaxSize) {
      ElMessage.error(`视频大小不能超过 ${MAX_FILE_SIZE / 1024 / 1024}MB！`);
      return false;
    }
    return true;
  };

  // 封面图上传前验证
  const handleBeforeUploadCover = file => {
    const isImage = file.type.startsWith('image/');
    const isLt2M = file.size / 1024 / 1024 < 2;

    if (!isImage) {
      ElMessage.error('只能上传图片文件！');
      return false;
    }
    if (!isLt2M) {
      ElMessage.error('图片大小不能超过 2MB！');
      return false;
    }
    return true;
  };

  // 视频文件变更
  const handleVideoChange = file => {
    if (file) {
      // 确保获取到正确的文件对象
      form.videoFile = file.raw || file;
      // 自动设置标题
      if (!form.title) {
        form.title = (file.name || '').replace(/\.[^/.]+$/, '');
      }
    }
  };

  // 封面图变更
  const handleCoverChange = file => {
    if (file) {
      // 确保获取到正确的文件对象
      const coverFile = file.raw || file;
      form.coverFile = coverFile;
      coverUrl.value = URL.createObjectURL(coverFile);
    }
  };

  // 移除视频
  const handleRemoveVideo = () => {
    form.videoFile = null;
  };

  // 移除封面
  const handleRemoveCover = () => {
    form.coverFile = null;
    coverUrl.value = '';
  };

  // 提交上传
  const handleSubmit = async () => {
    if (!formRef.value) return;

    try {
      // 检查用户是否已登录
      const token = localStorage.getItem('token');
      if (!token) {
        ElMessage.error('请先登录');
        await router.push('/login');
        return;
      }

      await formRef.value.validate();

      uploading.value = true;
      uploadProgress.value = 0;

      const formData = new FormData();

      // 添加调试日志
      console.log('准备上传的视频文件:', form.videoFile);
      console.log('文件类型:', form.videoFile?.type);
      console.log('文件大小:', form.videoFile?.size);

      formData.append('file', form.videoFile);
      if (form.coverFile) {
        console.log('准备上传的封面文件:', form.coverFile);
        formData.append('cover', form.coverFile);
      }
      formData.append('title', form.title);
      formData.append('description', form.description || '');

      // 调试FormData内容
      console.log('FormData内容:');
      for (const pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      let res;
      // 根据props.apiMethod选择不同的API方法
      if (props.apiMethod === 'uploadVideoLocally') {
        res = await uploadVideoLocally(formData, progress => {
          uploadProgress.value = Math.min(100, Math.round(progress * 100));
        });
      } else {
        res = await uploadVideoToCloud(formData, progress => {
          uploadProgress.value = Math.min(100, Math.round(progress * 100));
        });
      }

      ElMessage.success('上传成功');

      // 触发上传成功事件
      emit('upload-success', res);

      // 如果没有监听upload-success事件，则使用默认路由跳转
      const videoId = res.id || res.videoId;
      if (videoId) {
        await router.push(`/video/${videoId}`);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      ElMessage.error(error.message || '上传失败');
    } finally {
      uploading.value = false;
      uploadProgress.value = 0;
    }
  };
</script>

<style lang="scss" scoped>
  .upload-page {
    padding: 20px;
  }

  .upload-card {
    max-width: 800px;
    margin: 0 auto;
  }

  .video-upload {
    .upload-form {
      max-width: 800px;
      margin: 0 auto;
    }

    .video-uploader {
      :deep(.el-upload) {
        width: 100%;

        .el-upload-dragger {
          width: 100%;
          height: 200px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;

          .upload-icon {
            font-size: 48px;
            color: var(--el-text-color-secondary);
          }

          .upload-text {
            margin: 16px 0;
            color: var(--el-text-color-regular);

            em {
              color: var(--el-color-primary);
              font-style: normal;
            }
          }

          .upload-tip {
            color: var(--el-text-color-secondary);
            font-size: 12px;
          }

          .file-info {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 20px;

            .file-icon {
              font-size: 24px;
              color: var(--el-color-primary);
            }

            .file-name {
              flex: 1;
            }

            .file-size {
              color: var(--el-text-color-secondary);
            }
          }
        }
      }
    }

    .cover-uploader {
      :deep(.el-upload) {
        width: 200px;
        height: 112px;
        border: 1px dashed var(--el-border-color);
        border-radius: 6px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        transition: var(--el-transition-duration);

        &:hover {
          border-color: var(--el-color-primary);
        }

        .upload-icon {
          font-size: 28px;
          color: #8c939d;
        }

        .upload-text {
          color: #8c939d;
          font-size: 12px;
          margin-top: 8px;
        }
      }

      .cover-preview {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .cover-actions {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: none;
      }

      &:hover .cover-actions {
        display: block;
      }
    }

    .upload-tip {
      color: var(--el-text-color-secondary);
      font-size: 12px;
      margin-top: 4px;
    }

    .upload-progress {
      margin: 20px 0;

      .progress-text {
        margin-top: 8px;
        text-align: center;
        color: var(--el-text-color-secondary);
      }
    }
  }
</style>
