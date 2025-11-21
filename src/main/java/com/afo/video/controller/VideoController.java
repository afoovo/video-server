package com.afo.video.controller;

import com.afo.video.common.api.AjaxResult;
import com.afo.video.domain.Video;
import com.afo.video.mapper.VideoMapper;
import com.mybatisflex.core.paginate.Page;
import com.mybatisflex.core.query.QueryWrapper;
import org.noear.solon.annotation.Controller;
import org.noear.solon.annotation.Inject;
import org.noear.solon.annotation.Mapping;

import java.util.List;

/**
 * 视频列表控制器
 */
@Controller
@Mapping("/video")
public class VideoController {

    @Inject
    VideoMapper videoMapper;


    /**
     * 查询所有视频
     *
     * @return 视频列表
     */
    @Mapping("/listAll")
    public Object listAll() {
        List<Video> all = videoMapper.selectAll();
        return AjaxResult.ok(all);
    }


    /**
     * 分页查询视频列表
     *
     * @param pageNum  页码
     * @param pageSize 每页数量
     * @return 分页视频列表
     */
    @Mapping("/paginate")
    public Object paginate(int pageNum, int pageSize) {
        //分页查询
        QueryWrapper query = new QueryWrapper();
        // 第一页查询（需要获取总记录数）
        Page<Video> firstPage = videoMapper.paginate(pageNum, pageSize, query);
        // 分页查询视频列表
        long totalRow = firstPage.getTotalRow();
        // 第二页及以后（传入已知的总记录数，避免重复查询）
        Page<Video> secondPage = videoMapper.paginate(pageNum, pageSize, totalRow, query);
        return AjaxResult.ok(firstPage);
    }

    /**
     * 搜索相关视频（模糊查询）
     *
     * @return 视频列表
     */
    @Mapping("/search/{name}")
    public Object search(String name) {
        // 查询视频列表
        List<Video> videos = videoMapper.selectListByQuery(QueryWrapper.create().like(Video::getTitle, name));
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
        Video video = videoMapper.selectOneById(videoId);
        if (video == null) {
            return AjaxResult.error("视频不存在");
        }
        return AjaxResult.ok(video);
    }
}