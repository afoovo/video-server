package com.afo.video.service.impl;

import com.afo.video.domain.Video;
import com.afo.video.mapper.VideoMapper;
import com.afo.video.service.VideoService;
import com.mybatisflex.core.query.QueryWrapper;
import com.mybatisflex.solon.service.impl.ServiceImpl;
import org.noear.solon.annotation.Inject;
import org.noear.solon.annotation.Managed;

import java.util.List;

import static com.afo.video.domain.table.VideoTableDef.VIDEO;

@Managed
public class VideoServiceImpl extends ServiceImpl<VideoMapper, Video> implements VideoService {
    @Inject
    private VideoMapper videoMapper;

    @Override
    public List<Video> search(String keyword) {
        QueryWrapper queryWrapper = QueryWrapper.create()
                .select()
                .from(VIDEO)
                .where(VIDEO.TITLE.like(keyword))
                .or(VIDEO.DESCRIPTION.like(keyword));

        return videoMapper.selectListByQuery(queryWrapper);
    }

    @Override
    public List<Video> listByUserId(Long userId) {
        QueryWrapper queryWrapper = QueryWrapper.create()
                .select()
                .from(VIDEO)
                .where(VIDEO.USER_ID.eq(userId));

        return videoMapper.selectListByQuery(queryWrapper);
    }

    @Override
    public List<Video> listByCategoryId(Long id) {
        QueryWrapper queryWrapper = QueryWrapper.create()
                .select()
                .from(VIDEO)
                .where(VIDEO.CATEGORY_ID.eq(id));

        return videoMapper.selectListByQuery(queryWrapper);
    }


}