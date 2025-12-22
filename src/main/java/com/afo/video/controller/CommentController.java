package com.afo.video.controller;

import com.afo.video.common.api.AjaxResult;
import com.afo.video.domain.Comment;
import com.afo.video.service.CommentService;
import org.noear.solon.annotation.*;

/**
 * 评论控制器
 */
@Mapping("/comment")
@Controller
public class CommentController {
    @Inject
    private CommentService commentService;

    @Mapping("/list/video/{videoId}")
    public Object getByVideoId(@Path("videoId") Long videoId) {
        return AjaxResult.ok(commentService.listByVideoId(videoId));
    }

    @Post
    @Mapping("/create")
    public Object createComment(@Body Comment comment) {
        commentService.save(comment);
        return AjaxResult.ok("保存成功");
    }

    @Delete
    @Mapping("/delete/{id}")
    public Object deleteComment(@Path("id") Long id) {
        commentService.removeById(id);
        return AjaxResult.ok("删除成功");
    }
}
