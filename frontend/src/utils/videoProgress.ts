/**
 * 视频播放进度管理工具
 * 提供视频播放进度的保存、获取、清除功能
 */

// 本地存储键前缀
const PROGRESS_PREFIX = 'video_progress_';

/**
 * 保存视频播放进度
 * @param {string|number} videoId - 视频ID
 * @param {number} currentTime - 当前播放时间（秒）
 * @returns {boolean} 是否保存成功
 */
export function saveVideoProgress(videoId: string | number, currentTime: number): boolean {
  try {
    // 参数验证
    if (!videoId || typeof currentTime !== 'number' || isNaN(currentTime) || currentTime < 0) {
      return false;
    }

    const key = `${PROGRESS_PREFIX}${String(videoId)}`;
    localStorage.setItem(key, currentTime.toString());
    return true;
  } catch (error) {
    console.warn('Failed to save video progress:', error);
    return false;
  }
}

/**
 * 获取视频播放进度
 * @param {string|number} videoId - 视频ID
 * @returns {number} 上次播放时间（秒），如果不存在则返回0
 */
export function getVideoProgress(videoId: string | number): number {
  try {
    if (!videoId) return 0;

    const key = `${PROGRESS_PREFIX}${String(videoId)}`;
    const progress = localStorage.getItem(key);

    // 确保返回有效的数字
    const parsedProgress = parseFloat(progress || '0');
    return !isNaN(parsedProgress) ? parsedProgress : 0;
  } catch (error) {
    console.warn('Failed to get video progress:', error);
    return 0;
  }
}

/**
 * 清除单个视频的播放进度
 * @param {string|number} videoId - 视频ID
 * @returns {boolean} 是否清除成功
 */
export function clearVideoProgress(videoId: string | number): boolean {
  try {
    if (!videoId) return false;

    const key = `${PROGRESS_PREFIX}${String(videoId)}`;
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn('Failed to clear video progress:', error);
    return false;
  }
}

/**
 * 清除所有视频的播放进度
 * @returns {number} 清除的进度条目数量
 */
export function clearAllProgress(): number {
  try {
    const keysToRemove = Object.keys(localStorage).filter(key => key.startsWith(PROGRESS_PREFIX));

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });

    return keysToRemove.length;
  } catch (error) {
    console.warn('Failed to clear all video progress:', error);
    return 0;
  }
}
