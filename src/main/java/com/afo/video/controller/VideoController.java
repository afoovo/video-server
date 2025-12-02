package com.afo.video.controller;

import com.afo.video.common.api.AjaxResult;
import com.afo.video.domain.Video;
import com.afo.video.service.VideoService;
import com.mybatisflex.core.paginate.Page;
import org.noear.solon.annotation.Controller;
import org.noear.solon.annotation.Inject;
import org.noear.solon.annotation.Mapping;
import org.noear.solon.annotation.Path;
import org.noear.solon.core.handle.Context;
import org.noear.solon.validation.annotation.Valid;

import java.io.File;
import java.util.List;

/**
 * 视频列表控制器
 */
@Controller
@Mapping("/video")
public class VideoController {

    @Inject
    private VideoService videoService;

    /**
     * 查询所有视频
     *
     * @return 视频列表
     */
    @Mapping("/list")
    public Object list() {
        List<Video> all = videoService.list();
        return AjaxResult.ok(all);
    }

    /**
     * 分页查询视频列表
     *
     * @param pageNum  页码
     * @param pageSize 每页数量
     * @return 视频列表
     */
    @Mapping("/page")
    public Object page(int pageNum, int pageSize) {
        Page<Video> page = videoService.page(new Page<>(pageNum, pageSize));//需要new一个page
        return AjaxResult.ok(page.getRecords());//当前页的记录
    }

    /**
     * 搜索相关视频（模糊查询）
     *
     * @param name 搜索名称
     * @return 视频列表
     */

    @Valid
    @Mapping("/search/{name}")
    public Object search(@Path("name") String name) {
        List<Video> videos = videoService.search(name);
        return AjaxResult.ok(videos);
    }


    /**
     * 获取视频详情
     *
     * @param Id 视频ID
     * @return 视频详情
     */
    @Valid
    @Mapping("/{Id}")
    public Object get(@Path("Id") Long Id) {
        Video video = videoService.getById(Id);
        if (video == null) {
            return AjaxResult.error("视频不存在");
        }
        // 返回视频详情
        return AjaxResult.ok(video);
    }

    /**
     * 视频流式播放
     *
     * @param Id  视频ID
     * @param ctx 上下文
     */
    @Mapping("/play/{Id}")
    public void play(@Path("Id") Long Id, Context ctx) throws Throwable {
        Video video = videoService.getById(Id);
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

        // 设置响应头，支持视频流式播放
        ctx.headerOrDefault("Content-Type", "video/mp4");
        ctx.headerOrDefault("Accept-Ranges", "bytes");
        ctx.outputAsFile(file);
    }

}