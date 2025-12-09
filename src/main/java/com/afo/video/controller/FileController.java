package com.afo.video.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.afo.video.common.api.AjaxResult;
import com.afo.video.service.FileService;
import org.noear.solon.annotation.*;
import org.noear.solon.core.handle.Context;
import org.noear.solon.core.handle.UploadedFile;
import org.noear.solon.validation.annotation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * 文件上传下载
 */
@Controller
@Mapping("/file")
public class FileController {

    private final Logger log = LoggerFactory.getLogger(FileController.class);

    @Inject
    private FileService fileService;

    /**
     * 视频上传本地
     *
     * @param file        上传的视频文件
     * @param cover       上传的封面文件
     * @param title       视频标题
     * @param description 视频描述
     * @return 上传结果
     */
    @Post
    @Mapping("/uploadLocally")
    @Valid
    public AjaxResult uploadLocally(@Param("file") UploadedFile file,
                                    @Param("cover") UploadedFile cover,
                                    @Param("title") String title,
                                    @Param("description") String description) {
        try {
            // 获取当前登录用户ID
            Long userId = StpUtil.getLoginIdAsLong();
            return fileService.uploadLocally(file, cover, title, description, userId);
        } catch (Exception e) {
            log.error("文件上传失败", e);
            return AjaxResult.error("文件上传失败：" + e.getMessage());
        }
    }

    /**
     * 视频上传到云存储
     *
     * @param file        上传的视频文件
     * @param cover       上传的封面文件
     * @param title       视频标题
     * @param description 视频描述
     * @return 上传结果
     */
    @Post
    @Mapping("/uploadCloud")
    @Valid
    public AjaxResult uploadCloud(@Param("file") UploadedFile file,
                                  @Param("cover") UploadedFile cover,
                                  @Param("title") String title,
                                  @Param("description") String description) {
        try {
            // 获取当前登录用户ID
            Long userId = StpUtil.getLoginIdAsLong();
            return fileService.uploadCloud(file, cover, title, description, userId);
        } catch (Exception e) {
            log.error("文件上传失败", e);
            return AjaxResult.error("文件上传失败：" + e.getMessage());
        }
    }

    /**
     * 从本地存储下载文件
     *
     * @param videoId 要下载的视频ID
     * @param ctx     上下文
     */
    @Get
    @Mapping("/downloadLocally/{videoId}")
    public void downloadLocally(@Path("videoId") Long videoId, Context ctx) throws Throwable {
        fileService.downloadLocally(videoId, ctx);
    }

    /**
     * 从云存储下载文件
     *
     * @param videoId 要下载的视频ID
     * @param ctx     上下文
     */
    @Get
    @Mapping("/downloadCloud/{videoId}")
    public void downloadCloud(@Path("videoId") Long videoId, Context ctx) throws Throwable {
        fileService.downloadCloud(videoId, ctx);
    }
}