package com.afo.video.service.impl;

import com.afo.video.domain.Comment;
import com.afo.video.mapper.CommentMapper;
import com.afo.video.service.CommentService;
import com.mybatisflex.core.query.QueryWrapper;
import com.mybatisflex.solon.service.impl.ServiceImpl;
import org.noear.solon.annotation.Managed;

import java.util.List;

import static com.afo.video.domain.table.CommentTableDef.COMMENT;//类型安全的最佳实践

@Managed
public class CommentServiceImpl extends ServiceImpl<CommentMapper, Comment> implements CommentService {

    //不需要注入mapper。使用getmapper()即可，规范如此
    @Override
    public List<Comment> listByVideoId(Long videoId) {
        QueryWrapper queryWrapper = QueryWrapper.create().select().from(COMMENT).where(COMMENT.VIDEO_ID.eq(videoId));
        return getMapper().selectListByQuery(queryWrapper);
    }
}
