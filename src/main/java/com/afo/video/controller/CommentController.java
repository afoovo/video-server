package com.afo.video.controller;

import com.afo.video.common.api.AjaxResult;
import com.afo.video.domain.Comment;
import com.afo.video.mapper.CommentMapper;
import com.mybatisflex.core.query.QueryWrapper;
import org.noear.solon.annotation.*;

import static com.afo.video.domain.table.CommentTableDef.COMMENT;

/**
 * 评论控制器
 */
@Mapping("/comment")
@Controller
public class CommentController {
    @Inject
    private CommentMapper commentMapper;

    @Mapping("/list/video/{videoId}")
    public Object getByVideoId(@Path("videoId") Long videoId) {
        QueryWrapper queryWrapper = QueryWrapper.create().select().from(COMMENT).where(COMMENT.VIDEO_ID.eq(videoId));
        return AjaxResult.ok(commentMapper.selectListByQuery(queryWrapper));
    }

    @Post
    @Mapping("/create")
    public Object createComment(@Body Comment comment) {
        commentMapper.insert(comment);
        return AjaxResult.ok("保存成功");
    }

    @Delete
    @Mapping("/delete/{id}")
    public Object deleteComment(@Path("id") Long id) {
        commentMapper.deleteById(id);
        return AjaxResult.ok("删除成功");
    }
}
