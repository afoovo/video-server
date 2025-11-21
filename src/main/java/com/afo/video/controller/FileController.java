package com.afo.video.controller;

import com.afo.video.common.api.AjaxResult;
import com.afo.video.common.utils.ConfigureTransition;
import com.afo.video.domain.Video;
import com.afo.video.mapper.VideoMapper;
import org.noear.solon.Utils;
import org.noear.solon.annotation.*;
import org.noear.solon.cloud.CloudClient;
import org.noear.solon.cloud.model.Media;
import org.noear.solon.core.handle.Context;
import org.noear.solon.core.handle.DownloadedFile;
import org.noear.solon.core.handle.Result;
import org.noear.solon.core.handle.UploadedFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * 文件上传下载
 */
@Controller
@Mapping("/file")
public class FileController {

    private final Logger log = LoggerFactory.getLogger(FileController.class); // 不需要注解，声明为final
    // 注入配置的最大文件大小
    @Inject("${server.request.maxFileSize}")
    String maxFileSize;
    @Inject
    VideoMapper videoMapper;

    /**
     * 文件上传本地
     *
     * @param file   上传的文件
     * @param userId 用户ID
     * @param title  视频标题
     * @param desc   视频描述
     * @return 上传结果
     */
    @Post
    @Mapping("/uploadLocally")
    public AjaxResult uploadLocally(@Param("file") UploadedFile file, @Param("userId") Long userId, @Param("title") String title, @Param("description") String desc) {
        try {
            if (file == null || file.isEmpty()) {
                return AjaxResult.error("请选择要上传的文件");
            }

            // 检查文件大小是否超过限制
            long maxSizeBytes = ConfigureTransition.parseFileSize(maxFileSize);
            if (file.getContentSize() > maxSizeBytes) {
                return AjaxResult.error("文件大小超过限制：最大允许" + maxFileSize);
            }

            // 文件上传目录
            String uploadPath = "static/uploads";
            // 创建static/uploads目录（如果不存在）
            String uploadDir = uploadPath + File.separator;
            File dir = new File(uploadDir);
            if (!dir.exists() && !dir.mkdirs()) {
                return AjaxResult.error("无法创建上传目录");
            }

            // 生成唯一文件名
            String fileName = file.getName();
            String ext = fileName.substring(fileName.lastIndexOf("."));
            String newFileName = Utils.guid() + ext;

            // 保存/上传文件
            String filePath = uploadDir + File.separator + newFileName;
            file.transferTo(new File(filePath));

            // 构建文件可访问路径
            String fileUrl = "/uploads/" + newFileName;

            // 创建视频对象并保存到数据库
            Video video = new Video();
            video.setId(System.currentTimeMillis()); // 使用时间戳作为ID
            video.setUserId(userId);
            video.setTitle(title);
            video.setDescription(desc);
            video.setFileUrl(fileUrl);
            video.setCoverUrl(fileUrl); // 暂时使用视频文件作为封面
            video.setDuration(0); // 时长待后续处理
            video.setStatus(1); // 设置为已发布
            video.setCreateTime(LocalDateTime.now());

            // 插入数据库
            videoMapper.insert(video);

            return AjaxResult.ok("文件上传成功");
        } catch (IOException e) {
            log.error("文件上传失败", e);
            return AjaxResult.error("文件上传失败：" + e.getMessage());
        } catch (Exception e) {
            log.error("服务器内部错误", e);
            return AjaxResult.error("服务器内部错误：" + e.getMessage());
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
    public void downloadLocally(@Param("videoId") Long videoId, Context ctx) throws Throwable {
        Video video = videoMapper.selectOneById(videoId);
        if (video == null) {
            ctx.render("视频不存在");
            return;
        }

        String filePath = "static" + video.getFileUrl();
        File file = new File(filePath);
        if (!file.exists()) {
            ctx.render("文件不存在：" + video.getTitle());
            return;
        }
        DownloadedFile downloadedFile = new DownloadedFile(file, video.getTitle());
        ctx.outputAsFile(downloadedFile);
    }

    /**
     * 文件上传到云存储
     *
     * @param file   上传的文件
     * @param userId 用户ID
     * @param title  视频标题
     * @param desc   视频描述
     * @return 上传结果
     */
    @Post
    @Mapping("/uploadCloud")
    public AjaxResult uploadCloud(@Param("file") UploadedFile file,
                                  @Param("userId") Long userId,
                                  @Param("title") String title,
                                  @Param("description") String desc) {
        try {
            // 检查文件服务是否可用
            if (CloudClient.file() == null) {
                log.error("文件服务不可用");
                return AjaxResult.error("文件服务不可用");
            }

            if (file == null || file.isEmpty()) {
                return AjaxResult.error("请选择要上传的文件");
            }

            // 检查文件大小是否超过限制
            long maxSizeBytes = ConfigureTransition.parseFileSize(maxFileSize);
            if (file.getContentSize() > maxSizeBytes) {
                return AjaxResult.error("文件大小超过限制：最大允许" + maxFileSize);
            }

            String fileName = file.getName();
            String key = fileName;//Utils.guid() + ext;

            // 使用CloudClient上传文件
            Result result = CloudClient.file().put("video",key, new Media(file.getContent(), Utils.mime(fileName)) );

            if (result.getCode() != Result.SUCCEED_CODE) {
                log.error("文件上传失败: {}", result.getDescription());
                return AjaxResult.error("文件上传失败: " + result.getDescription());
            }

            // 获取临时访问URL（可根据需要设置过期时间）
            String fileUrl = CloudClient.file().getTempUrl(key, Duration.ofHours(1L));

            // 创建视频对象并保存到数据库
            Video video = new Video();
            video.setId(System.currentTimeMillis()); // 使用时间戳作为ID
            video.setUserId(userId);
            video.setTitle(title);
            video.setDescription(desc);
            video.setFileUrl(fileUrl);
            video.setCoverUrl(fileUrl); // 暂时使用视频文件作为封面
            video.setDuration(0); // 时长待后续处理
            video.setStatus(1); // 设置为已发布
            video.setCreateTime(LocalDateTime.now());

            // 插入数据库
            videoMapper.insert(video);

            return AjaxResult.ok(Map.of("文件上传成功", Map.of("fileUrl", fileUrl, "videoId", video.getId())));
        } catch (IOException e) {
            log.error("文件上传失败", e);
            return AjaxResult.error("文件上传失败：" + e.getMessage());
        } catch (Exception e) {
            log.error("服务器内部错误", e);
            return AjaxResult.error("服务器内部错误");
        }
    }


    /**
     * 从云存储下载文件
     *
     * @param videoId 要下载的视频ID
     * @param ctx     上下文
     */
    @Get
    @Mapping("/downloadCloud/{videoId}")
    public void downloadCloud(@Param("videoId") Long videoId, Context ctx) throws Throwable {
        // 检查文件服务是否可用
        if (CloudClient.file() == null) {
            ctx.render("文件服务不可用");
            return;
        }

        Video video = videoMapper.selectOneById(videoId);
        if (video == null) {
            ctx.render("视频不存在");
            return;
        }

        // 从CloudClient获取文件
        Media media = CloudClient.file().get(video.getFileUrl());
        if (media == null || media.body() == null) {
            ctx.render("文件不存在：" + video.getTitle());
            return;
        }

        // 设置响应头
        ctx.header("Content-Disposition");
        ctx.header("Content-Length");

        // 输出文件内容
        ctx.output(media.body());
    }
}