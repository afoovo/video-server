import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Ref } from 'vue';
import {
  getVideoComments,
  createComment,
  deleteComment,
  likeComment,
  getCommentReplies,
} from '@/api/comment';
import { ElMessage } from 'element-plus';
import type { Comment, CommentCreate, CommentListResponse } from '@/types/comment';

export const useCommentStore = defineStore('comment', () => {
  // 状态
  const comments: Ref<Comment[]> = ref([]);
  const total: Ref<number> = ref(0);
  const loading: Ref<boolean> = ref(false);
  const submitting: Ref<boolean> = ref(false);
  const currentVideoId: Ref<string | null> = ref(null);

  // 分页参数
  const currentPage: Ref<number> = ref(1);
  const pageSize: Ref<number> = ref(10);
  const sortBy: Ref<'latest' | 'hot'> = ref('latest');

  // 计算属性
  const hasComments = computed(() => comments.value.length > 0);
  const isEmpty = computed(() => !loading.value && !hasComments.value);

  // 加载评论列表
  async function fetchComments(
    videoId: string,
    params: { page?: number; size?: number; sort?: string } = {}
  ): Promise<CommentListResponse | null> {
    if (!videoId) return null;

    loading.value = true;
    currentVideoId.value = videoId;

    try {
      const res = await getVideoComments({
        videoId,
        pageNum: params.page || currentPage.value,
        pageSize: params.size || pageSize.value,
        sort: (params.sort || sortBy.value) as 'latest' | 'hot',
      });

      comments.value = res.comments;
      total.value = res.total;

      return res;
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      ElMessage.error('获取评论失败');
      return null;
    } finally {
      loading.value = false;
    }
  }

  // 加载回复列表
  async function fetchReplies(commentId: string): Promise<Comment[]> {
    try {
      const res = await getCommentReplies(commentId);
      const comment = comments.value.find(c => c.id === commentId);
      if (comment) {
        comment.replies = res.comments;
      }
      return res.comments;
    } catch (error) {
      console.error('Failed to fetch replies:', error);
      ElMessage.error('获取回复失败');
      return [];
    }
  }

  // 发表评论
  async function submitComment(data: CommentCreate): Promise<Comment | null> {
    submitting.value = true;
    try {
      const res = await createComment(data);
      ElMessage.success('评论发表成功');

      // 如果是回复，更新回复列表
      if (data.replyTo) {
        await fetchReplies(data.replyTo);
      } else {
        // 如果是主评论，刷新评论列表
        await fetchComments(currentVideoId.value!);
      }

      return res;
    } catch (error) {
      console.error('Failed to submit comment:', error);
      ElMessage.error('评论发表失败');
      return null;
    } finally {
      submitting.value = false;
    }
  }

  // 删除评论
  async function removeComment(id: string): Promise<boolean> {
    try {
      await deleteComment(id);
      ElMessage.success('删除成功');

      // 从列表中移除
      const index = comments.value.findIndex(c => c.id === id);
      if (index > -1) {
        comments.value.splice(index, 1);
        total.value--;
      }

      return true;
    } catch (error) {
      console.error('Failed to delete comment:', error);
      ElMessage.error('删除失败');
      return false;
    }
  }

  // 点赞评论
  async function toggleLike(comment: Comment): Promise<boolean> {
    try {
      const res = await likeComment(comment.id);
      if (res.data) {
        comment.isLiked = res.data.liked;
        comment.likeCount = res.data.likeCount;
      }
      return true;
    } catch (error) {
      console.error('Failed to like comment:', error);
      ElMessage.error('操作失败');
      return false;
    }
  }

  // 更新分页/排序
  function updateParams(params: { page?: number; size?: number; sort?: 'latest' | 'hot' }): void {
    if (params.page) currentPage.value = params.page;
    if (params.size) pageSize.value = params.size;
    if (params.sort) sortBy.value = params.sort;
  }

  // 重置状态
  function reset(): void {
    comments.value = [];
    total.value = 0;
    currentPage.value = 1;
    currentVideoId.value = null;
  }

  return {
    // 状态
    comments,
    total,
    loading,
    submitting,
    currentPage,
    pageSize,
    sortBy,

    // 计算属性
    hasComments,
    isEmpty,

    // 方法
    fetchComments,
    fetchReplies,
    submitComment,
    removeComment,
    toggleLike,
    updateParams,
    reset,
  };
});
