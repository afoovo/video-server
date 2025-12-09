package com.afo.video.service;

import com.afo.video.common.api.AjaxResult;
import org.noear.solon.core.handle.Context;
import org.noear.solon.core.handle.UploadedFile;

import java.io.IOException;

/**
 * 文件服务接口
 */
public interface FileService {

    /**
     * 本地视频上传
     *
     * @param file        上传的文件
     * @param cover       上传的封面
     * @param title       视频标题
     * @param description 视频描述
     * @param userId      用户ID
     * @return 上传结果
     */
    AjaxResult uploadLocally(UploadedFile file, UploadedFile cover, String title, String description, Long userId) throws IOException;

    /**
     * 云存储视频上传
     *
     * @param file        上传的文件
     * @param cover       上传的封面
     * @param title       视频标题
     * @param description 视频描述
     * @param userId      用户ID
     * @return 上传结果
     */
    AjaxResult uploadCloud(UploadedFile file, UploadedFile cover, String title, String description, Long userId) throws IOException;

    /**
     * 用户头像上传
     *
     * @param file   头像文件
     * @param userId 用户ID
     * @return 上传结果
     */
    AjaxResult uploadAvatar(UploadedFile file, Long userId) throws IOException;
    
    /**
     * 从本地存储下载文件
     *
     * @param videoId 要下载的视频ID
     * @param ctx     上下文
     */
    void downloadLocally(Long videoId, Context ctx) throws Throwable;
    
    /**
     * 从云存储下载文件
     *
     * @param videoId 要下载的视频ID
     * @param ctx     上下文
     */
    void downloadCloud(Long videoId, Context ctx) throws Throwable;
}