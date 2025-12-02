import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

// 加载相对时间插件
dayjs.extend(relativeTime);

// 设置全局中文语言包
dayjs.locale('zh-cn');

export default dayjs;
