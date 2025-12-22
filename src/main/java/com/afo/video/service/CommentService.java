package com.afo.video.service;

import com.afo.video.domain.Comment;
import com.mybatisflex.core.service.IService;
import org.noear.solon.annotation.Managed;

import java.util.List;

@Managed
public interface CommentService extends IService<Comment> {
    List<Comment> listByVideoId(Long videoId);
}

