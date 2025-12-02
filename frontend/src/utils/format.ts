/**
 * 格式化工具函数集
 * 提供数字、时间、时长和文件大小的格式化功能
 */

import dayjs from './dayjs';

/**
 * 格式化数字（播放量、点赞数等）
 * @param {number|string} num - 要格式化的数字
 * @returns {string} 格式化后的数字字符串
 */
export function formatNumber(num: number | string): string {
  // 参数验证和类型转换
  const parsedNum = Number(num);
  if (isNaN(parsedNum) || parsedNum < 0) return '0';

  // 大于等于10万时显示为x.x万
  if (parsedNum >= 100000) {
    return `${(parsedNum / 10000).toFixed(1)}万`;
  }
  // 大于等于1万时也可以显示为x.x万
  else if (parsedNum >= 10000) {
    return `${(parsedNum / 10000).toFixed(1)}万`;
  }
  return parsedNum.toString();
}

/**
 * 格式化时间（发布时间等）
 * @param {Date|string|number} time - 要格式化的时间
 * @returns {string} 格式化后的时间字符串
 */
export function formatTime(time: Date | string | number): string {
  if (!time) return '';

  try {
    const date = dayjs(time);
    // 验证日期是否有效
    if (!date.isValid()) return '';

    const now = dayjs();
    const diffDays = now.diff(date, 'day');

    // 超过30天显示具体日期
    if (diffDays >= 30) {
      return date.format('YYYY-MM-DD');
    }
    // 否则显示相对时间
    return date.fromNow();
  } catch (error) {
    console.warn('Invalid time format:', error);
    return '';
  }
}

/**
 * 格式化视频时长
 * @param {number|string} seconds - 视频时长（秒）
 * @returns {string} 格式化后的时长字符串 (MM:SS)
 */
export function formatDuration(seconds: number | string): string {
  // 参数验证
  const parsedSeconds = Number(seconds);
  if (isNaN(parsedSeconds) || parsedSeconds < 0) return '00:00';

  const minutes = Math.floor(parsedSeconds / 60);
  const remainingSeconds = Math.floor(parsedSeconds % 60);

  // 确保分钟和秒都正确格式化（两位数）
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = remainingSeconds.toString().padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
}

/**
 * 格式化文件大小
 * @param {number|string} bytes - 文件大小（字节）
 * @returns {string} 格式化后的文件大小字符串
 */
export function formatFileSize(bytes: number | string): string {
  // 参数验证
  const parsedBytes = Number(bytes);
  if (isNaN(parsedBytes) || parsedBytes < 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

  // 处理0的特殊情况
  if (parsedBytes === 0) return '0 B';

  const i = Math.min(Math.floor(Math.log(parsedBytes) / Math.log(k)), sizes.length - 1);
  const formattedSize = (parsedBytes / Math.pow(k, i)).toFixed(2);

  return `${formattedSize} ${sizes[i]}`;
}
