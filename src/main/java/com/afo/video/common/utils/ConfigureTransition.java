package com.afo.video.common.utils;

public class ConfigureTransition {

    /**
     * 解析文件大小配置字符串为字节数
     *
     * @param sizeStr 大小字符串，如 "10mb", "500kb"
     * @return 字节数
     */
    public static long parseFileSize(String sizeStr) {
        if (sizeStr == null || sizeStr.isEmpty()) {
            return 10 * 1024 * 1024; // 默认10MB
        }

        sizeStr = sizeStr.trim().toLowerCase();
        long size;
        try {
            if (sizeStr.endsWith("kb")) {
                size = Long.parseLong(sizeStr.substring(0, sizeStr.length() - 2).trim()) * 1024;
            } else if (sizeStr.endsWith("mb")) {
                size = Long.parseLong(sizeStr.substring(0, sizeStr.length() - 2).trim()) * 1024 * 1024;
            } else if (sizeStr.endsWith("gb")) {
                size = Long.parseLong(sizeStr.substring(0, sizeStr.length() - 2).trim()) * 1024 * 1024 * 1024;
            } else {
                size = Long.parseLong(sizeStr.trim());
            }
        } catch (NumberFormatException e) {
            size = 10 * 1024 * 1024; // 默认10MB
        }
        return size;
    }
}