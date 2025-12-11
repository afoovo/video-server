<template>
  <div class="comment-list">
    <!-- 评论输入框 -->
    <div v-if="isLoggedIn" class="comment-input">
      <el-avatar :src="currentUser?.avatar" :size="40" />
      <el-input
        v-model="commentText"
        type="textarea"
        :rows="2"
        placeholder="发表评论..."
        :maxlength="500"
        show-word-limit
        @keyup.enter.ctrl="handleSubmit"
      />
      <el-button
        type="primary"
        :disabled="!commentText.trim()"
        :loading="submitting"
        @click="handleSubmit"
      >
        发表评论
      </el-button>
    </div>
    <div v-else class="login-tip">
      <el-link type="primary" @click="router.push('/login')">登录</el-link>
      后发表评论
    </div>

    <!-- 评论列表 -->
    <div v-loading="loading" class="comments">
      <div class="comment-header">
        <span class="total">{{ total }} 条评论</span>
        <el-radio-group v-model="sortBy" size="small" @change="handleSortChange">
          <el-radio-button value="latest">最新</el-radio-button>
          <el-radio-button value="hot">最热</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 评论项 -->
      <div v-for="comment in comments" :key="comment.id" class="comment-item">
        <el-avatar :src="comment.user?.avatar" :size="40" />
        <div class="comment-content">
          <div class="comment-header">
            <span class="userName">{{ comment.user?.userName }}</span>
            <span class="time">{{ formatTime(comment.createTime) }}</span>
          </div>
          <div class="comment-text">
            {{ comment.content }}
          </div>
          <div class="comment-actions">
            <el-button
              link
              :type="comment.liked ? 'primary' : 'default'"
              @click="handleLike(comment)"
            >
              <el-icon>
                <Star />
              </el-icon>
              {{ formatNumber(comment.likesCount) }}
            </el-button>
            <el-button link @click="handleReply(comment)"> 回复</el-button>
            <el-button v-if="canDelete(comment)" link type="danger" @click="handleDelete(comment)">
              删除
            </el-button>
          </div>

          <!-- 回复列表 -->
          <div v-if="comment.replies?.length" class="replies">
            <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
              <el-avatar :src="reply.user?.avatar" :size="32" />
              <div class="reply-content">
                <div class="reply-header">
                  <span class="userName">{{ reply.user?.userName }}</span>
                  <span class="time">{{ formatTime(reply.createTime) }}</span>
                </div>
                <div class="reply-text">
                  <template v-if="reply.replyTo">
                    回复 <span class="reply-to">@{{ reply.replyTo.userName }}</span
                    >：
                  </template>
                  {{ reply.content }}
                </div>
                <div class="reply-actions">
                  <el-button
                    link
                    :type="reply.liked ? 'primary' : 'default'"
                    @click="handleLike(reply)"
                  >
                    <el-icon>
                      <Star />
                    </el-icon>
                    {{ formatNumber(reply.likesCount) }}
                  </el-button>
                  <el-button link @click="handleReply(comment, reply)"> 回复</el-button>
                  <el-button
                    v-if="canDelete(reply)"
                    link
                    type="danger"
                    @click="handleDelete(reply)"
                  >
                    删除
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 回复输入框 -->
          <div v-if="replyingTo === comment.id" class="reply-input">
            <el-input
              v-model="replyText"
              type="textarea"
              :rows="2"
              :placeholder="replyToUser ? `回复 @${replyToUser.userName}` : '发表回复...'"
              :maxlength="500"
              show-word-limit
              @keyup.enter.ctrl="handleSubmitReply"
            />
            <div class="reply-actions">
              <el-button @click="cancelReply">取消</el-button>
              <el-button
                type="primary"
                :disabled="!replyText.trim()"
                :loading="submitting"
                @click="handleSubmitReply"
              >
                发表回复
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页器 -->
      <el-pagination
        v-if="total > pageSize"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
  import { computed, onMounted, ref, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import { useUserStore } from '@/stores/user';
  import { ElMessage, ElMessageBox } from 'element-plus';
  import { Star } from '@element-plus/icons-vue';
  import { formatNumber, formatTime } from '@/utils/format';
  import { createComment, deleteComment, getVideoComments, likeComment } from '@/api/comment';

  const props = defineProps({
    videoId: {
      type: [String, Number],
      required: true,
    },
  });

  // 状态管理
  const userStore = useUserStore();
  const router = useRouter();

  const isLoggedIn = computed(() => userStore.isLoggedIn);
  const currentUser = computed(() => userStore.user);

  // 评论列表状态
  const comments = ref([]);
  const total = ref(0);
  const loading = ref(false);
  const submitting = ref(false);
  const currentPage = ref(1);
  const pageSize = ref(10);
  const sortBy = ref('latest');

  // 评论输入状态
  const commentText = ref('');
  const replyText = ref('');
  const replyingTo = ref(null);
  const replyToUser = ref(null);

  // 加载评论列表
  const loadComments = async () => {
    loading.value = true;
    try {
      if (!props.videoId) {
        console.error('视频ID为空，无法加载评论');
        return;
      }

      console.log(
        `开始加载视频 ${props.videoId} 的评论，当前页: ${currentPage.value}，每页数量: ${pageSize.value}, 排序: ${sortBy.value}`
      );

      const params = {
        videoId: props.videoId,
        pageNum: currentPage.value,
        pageSize: pageSize.value,
        sort: sortBy.value,
      };

      console.log('请求参数:', JSON.stringify(params));

      const res = await getVideoComments(params);
      console.log('评论API响应:', res);

      if (res && res.records) {
        // 直接使用 records 字段
        const commentData = res.records;
        console.log(`直接从响应中获取到 ${commentData.length} 条评论`);
        processComments(commentData);
        total.value = res.total || 0;
      } else if (res && res.data && res.data.records) {
        // 使用 data.records 字段
        const commentData = res.data.records;
        console.log(`从 data 字段获取到 ${commentData.length} 条评论`);
        processComments(commentData);
        total.value = res.data.total || 0;
      } else {
        console.error('评论数据格式不正确:', res);
        comments.value = [];
        total.value = 0;
      }
    } catch (error) {
      console.error('加载评论出错:', error);
      ElMessage.error('加载评论失败，请稍后重试');
      comments.value = [];
      total.value = 0;
    } finally {
      loading.value = false;
    }
  };

  // 处理评论数据
  const processComments = commentData => {
    if (!Array.isArray(commentData)) {
      console.error('评论数据不是数组:', commentData);
      comments.value = [];
      return;
    }

    console.log('处理前的评论数据:', JSON.stringify(commentData));

    // 清理并处理评论数据
    comments.value = commentData.map(comment => {
      // 确保必要字段存在
      const processedComment = {
        id: comment.id,
        content: comment.content || '(无内容)',
        videoId: comment.videoId,
        userId: comment.userId,
        user: comment.user || {
          id: comment.userId,
          userName: '未知用户',
          avatar: '/static/default/avatars/default.jpg',
        },
        likesCount: comment.likesCount || 0,
        liked: comment.liked || false,
        replyCount: comment.replyCount || 0,
        replies: Array.isArray(comment.replies)
          ? comment.replies.map(reply => ({
              ...reply,
              user: reply.user || {
                id: reply.userId,
                userName: '未知用户',
                avatar: '/static/default/avatars/default.jpg',
              },
              likesCount: reply.likesCount || 0,
              liked: reply.liked || false,
            }))
          : [],
        createTime: comment.createTime || new Date().toISOString(),
      };

      // 确保用户头像路径正确
      if (processedComment.user && processedComment.user.avatar) {
        if (
          !processedComment.user.avatar.startsWith('http') &&
          !processedComment.user.avatar.startsWith('/api/') &&
          !processedComment.user.avatar.startsWith('/static/')
        ) {
        }
      }

      return processedComment;
    });

    console.log('处理后的评论数据:', JSON.stringify(comments.value));
  };

  // 发表评论
  const handleSubmit = async () => {
    if (!isLoggedIn.value) {
      router.push('/login');
      return;
    }

    if (!commentText.value.trim()) return;

    submitting.value = true;
    try {
      const data = {
        videoId: props.videoId,
        content: commentText.value.trim(),
      };
      await createComment(data);
      ElMessage.success('评论发表成功');
      commentText.value = '';
      // 重新加载评论列表
      await loadComments();
    } catch (error) {
      console.error('Failed to submit comment:', error);
      if (error.response && error.response.status === 403) {
        ElMessage.error('权限不足，请联系管理员');
      } else {
        ElMessage.error('评论发表失败');
      }
    } finally {
      submitting.value = false;
    }
  };

  // 回复评论
  const handleReply = (comment, replyTo = null) => {
    if (!isLoggedIn.value) {
      router.push('/login');
      return;
    }

    replyingTo.value = comment.id;
    replyToUser.value = replyTo?.user || null;
    replyText.value = '';
  };

  // 提交回复
  const handleSubmitReply = async () => {
    if (!replyText.value.trim()) return;

    submitting.value = true;
    try {
      const data = {
        videoId: props.videoId,
        content: replyText.value.trim(),
        parentId: replyingTo.value,
        replyToId: replyToUser.value?.id,
      };
      await createComment(data);
      ElMessage.success('回复发表成功');
      cancelReply();
      await loadComments();
    } catch (error) {
      console.error('Failed to submit reply:', error);
      ElMessage.error('回复发表失败');
    } finally {
      submitting.value = false;
    }
  };

  // 取消回复
  const cancelReply = () => {
    replyingTo.value = null;
    replyToUser.value = null;
    replyText.value = '';
  };

  // 点赞评论
  const handleLike = async comment => {
    if (!isLoggedIn.value) {
      router.push('/login');
      return;
    }

    try {
      await likeComment(comment.id);
      comment.liked = !comment.liked;
      comment.likesCount += comment.liked ? 1 : -1;
    } catch (error) {
      console.error('Failed to like comment:', error);
      ElMessage.error('操作失败');
    }
  };

  // 删除评论
  const handleDelete = async comment => {
    try {
      await ElMessageBox.confirm('确定要删除这条评论吗？', '提示', {
        type: 'warning',
      });
      await deleteComment(comment.id);
      ElMessage.success('删除成功');
      await loadComments();
    } catch (error) {
      if (error !== 'cancel') {
        console.error('Failed to delete comment:', error);
        ElMessage.error('删除失败');
      }
    }
  };

  // 判断是否可以删除评论
  const canDelete = comment =>
    isLoggedIn.value &&
    (comment.userId === currentUser.value?.id || currentUser.value?.role === 'ADMIN');

  // 分页和排序处理
  const handleSortChange = () => {
    currentPage.value = 1;
    loadComments();
  };

  const handleSizeChange = val => {
    pageSize.value = val;
    loadComments();
  };

  const handleCurrentChange = val => {
    currentPage.value = val;
    loadComments();
  };

  // 监听视频ID变化
  watch(
    () => props.videoId,
    (newId, oldId) => {
      console.log(`视频ID变化: ${oldId} => ${newId}`);
      if (newId) {
        currentPage.value = 1;
        loadComments();
      }
    },
    { immediate: true }
  );

  // 初始化
  onMounted(() => {
    console.log('评论组件加载，视频ID:', props.videoId);
    if (props.videoId) {
      loadComments();
    }
  });

  // 暴露方法给父组件调用
  defineExpose({
    loadComments,
    refreshComments: loadComments,
  });
</script>

<style lang="scss" scoped>
  // 移除所有样式，因为已经移到全局样式中
</style>
