package com.afo.video.service.impl;

import com.afo.video.common.api.AjaxResult;
import com.afo.video.common.utils.ConfigureTransition;
import com.afo.video.domain.User;
import com.afo.video.domain.Video;
import com.afo.video.mapper.UserMapper;
import com.afo.video.mapper.VideoMapper;
import com.afo.video.service.FileService;
import org.noear.solon.Utils;
import org.noear.solon.annotation.Inject;
import org.noear.solon.annotation.Managed;
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
import java.util.Date;
import java.util.Map;

/**
 * 文件服务实现类
 */
@Managed
public class FileServiceImpl implements FileService {

    private final Logger log = LoggerFactory.getLogger(FileServiceImpl.class);

    @Inject
    private VideoMapper videoMapper;
    @Inject
    private UserMapper userMapper;

    @Inject("${server.request.maxFileSize}")
    private String maxFileSize;

    @Override
    public AjaxResult uploadLocally(UploadedFile file, UploadedFile cover, String title, String description, Long userId) throws IOException {
        try {
            if (file == null || file.isEmpty()) {
                return AjaxResult.error("请选择要上传的视频文件");
            }

            // 检查文件类型是否为视频
            String contentType = file.getContentType();
            if (!contentType.startsWith("video/")) {
                return AjaxResult.error("仅支持上传视频文件");
            }

            // 检查文件大小是否超过限制
            long maxSizeBytes = ConfigureTransition.parseFileSize(maxFileSize);
            if (file.getContentSize() > maxSizeBytes) {
                return AjaxResult.error("文件大小超过限制：最大允许" + maxFileSize);
            }

            // 生成视频ID作为文件夹名称
            long videoId = System.currentTimeMillis();
            String folderName = String.valueOf(videoId);

            // 文件上传目录
            String uploadPath = "static/uploads";
            // 创建以视频ID命名的文件夹
            String videoDir = uploadPath + File.separator + folderName;
            File dir = new File(videoDir);
            if (!dir.exists() && !dir.mkdirs()) {
                return AjaxResult.error("无法创建上传目录");
            }

            // 保存视频文件
            String videoFileName = file.getName();
            String videoExt = videoFileName.substring(videoFileName.lastIndexOf("."));
            // 使用原始文件名
            String baseVideoName = videoFileName.substring(0, videoFileName.lastIndexOf("."));
            String newVideoFileName = baseVideoName + videoExt;
            String videoFilePath = videoDir + File.separator + newVideoFileName;
            file.transferTo(new File(videoFilePath));

            // 构建视频文件可访问路径
            String videoFileUrl = "/static/uploads/" + folderName + "/" + newVideoFileName;

            // 处理封面文件
            String coverUrl = null;
            if (cover != null && !cover.isEmpty()) {
                // 检查封面文件类型是否为图片
                String coverContentType = cover.getContentType();
                if (coverContentType != null && coverContentType.startsWith("image/")) {
                    String coverFileName = cover.getName();
                    String coverExt = coverFileName.substring(coverFileName.lastIndexOf("."));
                    // 使用原始封面文件名
                    String baseCoverName = coverFileName.substring(0, coverFileName.lastIndexOf("."));
                    String newCoverFileName = baseCoverName + coverExt;
                    String coverFilePath = videoDir + File.separator + newCoverFileName;
                    cover.transferTo(new File(coverFilePath));
                    coverUrl = "/static/uploads/" + folderName + "/" + newCoverFileName;
                } else {
                    return AjaxResult.error("封面文件必须为图片类型");
                }
            }

            // 创建视频对象并保存到数据库
            Video video = new Video();
            video.setId(videoId); // 使用生成的ID
            video.setUserId(userId);
            video.setTitle(title);
            video.setDescription(description);
            video.setFileUrl(videoFileUrl);
            video.setCoverUrl(coverUrl); // 可能为 null
            video.setDuration(0); // 时长待后续处理，后端使用javaCV依赖太多太大，可能交给前端
            video.setStatus(1); // 设置为已发布
            video.setCreateTime(new Date());

            // 插入数据库
            if (videoMapper.insert(video) > 0) {
                return AjaxResult.ok(Map.of("fileUrl", videoFileUrl, "coverUrl", coverUrl, "videoId", video.getId()));
            } else {
                return AjaxResult.error("视频信息保存失败");
            }
        } catch (IOException e) {
            log.error("文件上传失败", e);
            throw e;
        } catch (Exception e) {
            log.error("服务器内部错误", e);
            return AjaxResult.error("服务器内部错误：" + e.getMessage());
        }
    }

    @Override
    public AjaxResult uploadCloud(UploadedFile file, UploadedFile cover, String title, String description, Long userId) throws IOException {
        try {
            // 检查文件服务是否可用
            if (CloudClient.file() == null) {
                log.error("文件服务不可用");
                return AjaxResult.error("文件服务不可用");
            }

            if (file == null || file.isEmpty()) {
                return AjaxResult.error("请选择要上传的视频文件");
            }

            // 检查文件大小是否超过限制
            long maxSizeBytes = ConfigureTransition.parseFileSize(maxFileSize);
            if (file.getContentSize() > maxSizeBytes) {
                return AjaxResult.error("文件大小超过限制：最大允许" + maxFileSize);
            }

            // 生成视频ID作为文件夹名称
            long videoId = System.currentTimeMillis();
            String folderName = String.valueOf(videoId);

            // 处理视频文件
            String videoFileName = file.getName();
            String videoExt = videoFileName.substring(videoFileName.lastIndexOf("."));
            // 使用原始文件名
            String baseVideoName = videoFileName.substring(0, videoFileName.lastIndexOf("."));
            String newVideoFileName = folderName + "/" + baseVideoName + videoExt;

            // 使用CloudClient上传视频文件
            Result videoResult = CloudClient.file().put("video", newVideoFileName,
                    new Media(file.getContent(), Utils.mime(videoFileName)));

            if (videoResult.getCode() != Result.SUCCEED_CODE) {
                log.error("视频文件上传失败: {}", videoResult.getDescription());
                return AjaxResult.error("视频文件上传失败: " + videoResult.getDescription());
            }

            // 获取视频文件临时访问URL
            String videoFileUrl = CloudClient.file().getTempUrl(newVideoFileName, Duration.ofHours(1L));

            // 处理封面文件
            String coverUrl;
            if (cover != null && !cover.isEmpty()) {
                // 检查封面文件类型是否为图片
                String coverContentType = cover.getContentType();
                if (coverContentType != null && coverContentType.startsWith("image/")) {
                    String coverFileName = cover.getName();
                    String coverExt = coverFileName.substring(coverFileName.lastIndexOf("."));
                    // 使用原始封面文件名(去掉扩展名) + 时间戳作为新文件名，保留扩展名
                    String baseCoverName = coverFileName.substring(0, coverFileName.lastIndexOf("."));
                    String newCoverFileName = folderName + "/" + baseCoverName + coverExt;

                    // 上传封面文件
                    Result coverResult = CloudClient.file().put("video", newCoverFileName,
                            new Media(cover.getContent(), Utils.mime(coverFileName)));

                    if (coverResult.getCode() != Result.SUCCEED_CODE) {
                        log.error("封面文件上传失败: {}", coverResult.getDescription());
                        return AjaxResult.error("封面文件上传失败: " + coverResult.getDescription());
                    }

                    // 获取封面文件临时访问URL
                    coverUrl = CloudClient.file().getTempUrl(newCoverFileName, Duration.ofHours(1L));
                } else {
                    return AjaxResult.error("封面文件必须为图片类型");
                }
            } else {
                // 如果没有上传封面，默认使用视频文件作为封面
                coverUrl = videoFileUrl;
            }

            // 创建视频对象并保存到数据库
            Video video = new Video();
            video.setId(videoId); // 使用生成的ID
            video.setUserId(userId);
            video.setTitle(title);
            video.setDescription(description);
            video.setFileUrl(videoFileUrl);
            video.setCoverUrl(coverUrl);
            video.setDuration(0); // 时长待后续处理
            video.setStatus(1); // 设置为已发布
            video.setCreateTime(new Date());

            // 插入数据库
            if (videoMapper.insert(video) > 0) {
                return AjaxResult.ok(Map.of("fileUrl", videoFileUrl, "coverUrl", coverUrl, "videoId", video.getId()));
            } else {
                return AjaxResult.error("视频信息保存失败");
            }
        } catch (IOException e) {
            log.error("文件上传失败", e);
            throw e;
        } catch (Exception e) {
            log.error("服务器内部错误", e);
            return AjaxResult.error("服务器内部错误");
        }
    }

    @Override
    public AjaxResult uploadAvatar(UploadedFile file, Long userId) throws IOException {
        try {
            if (file == null || file.isEmpty()) {
                return AjaxResult.error("请选择要上传的头像文件");
            }

            // 检查文件类型是否为图片
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return AjaxResult.error("仅支持上传图片文件");
            }

            // 检查文件大小是否超过限制（头像文件限制为5MB）
            long maxSizeBytes = 5 * 1024 * 1024; // 5MB
            if (file.getContentSize() > maxSizeBytes) {
                return AjaxResult.error("头像文件大小超过限制：最大允许5MB");
            }

            // 生成头像文件名
            String fileName = file.getName();
            String ext = fileName.substring(fileName.lastIndexOf("."));
            String newFileName = "avatar_" + userId + "_" + System.currentTimeMillis() + ext;

            // 头像上传目录
            String uploadPath = "static/uploads/avatar";
            File dir = new File(uploadPath);
            if (!dir.exists() && !dir.mkdirs()) {
                return AjaxResult.error("无法创建头像上传目录");
            }

            // 保存头像文件
            String avatarFilePath = uploadPath + File.separator + newFileName;
            file.transferTo(new File(avatarFilePath));

            // 构建头像文件可访问路径（使用/static前缀）
            String avatarUrl = "/static/uploads/avatar/" + newFileName;
            // 更新用户表中的头像字段
            User user = new User();
            user.setId(userId); // 设置用户ID作为主键
            user.setAvatarUrl(avatarUrl);
            userMapper.update(user);

            return AjaxResult.ok(Map.of("avatarUrl", avatarUrl));
        } catch (IOException e) {
            log.error("头像上传失败", e);
            throw e;
        } catch (Exception e) {
            log.error("服务器内部错误", e);
            return AjaxResult.error("服务器内部错误：" + e.getMessage());
        }
    }


    @Override
    public void downloadLocally(Long videoId, Context ctx) throws Throwable {
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

    @Override
    public void downloadCloud(Long videoId, Context ctx) throws Throwable {
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