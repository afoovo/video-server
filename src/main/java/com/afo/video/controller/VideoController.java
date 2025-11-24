package com.afo.video.controller;

import com.afo.video.common.api.AjaxResult;
import com.afo.video.domain.Video;
import com.afo.video.service.VideoService;
import com.mybatisflex.core.paginate.Page;
import org.noear.solon.annotation.*;

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
     * @return 分页视频列表
     */
    @Mapping("/page")
    public Object page(int pageNum, int pageSize) {
        Page<Video> page = videoService.page(new Page<>(pageNum, pageSize));//需要new一个page
        return AjaxResult.ok(page);
    }

    /**
     * 搜索相关视频（模糊查询）
     *
     * @param name 搜索名称
     * @return 视频列表
     */
    @Mapping("/search/{name}")
    public Object search(@Path("name") String name) {
        List<Video> videos = videoService.search(name);
        return AjaxResult.ok(videos);
    }



    /**
     * 查询用户上传的视频列表
     *
     * @param userId 用户ID
     * @return 视频列表
     */
     @Mapping("/user/{userId}")
    public Object userVideoList(@Path("userId") Long userId) {
        List<Video> videos = videoService.listByUserId(userId);
        return AjaxResult.ok(videos);
    }

    /**
     * 播放视频
     *
     * @param videoId 视频ID
     * @return 视频详情
     */
    @Mapping("/play")
    public Object play(Long videoId) {
        Video video = videoService.getById(videoId);
        if (video == null) {
            return AjaxResult.error("视频不存在");
        }
        // 返回视频体
        return AjaxResult.ok(video.getFileUrl());
    }


}