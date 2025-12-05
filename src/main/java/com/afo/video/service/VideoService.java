package com.afo.video.service;

import com.afo.video.domain.Video;
import com.mybatisflex.core.service.IService;
import org.noear.solon.annotation.Managed;

import java.util.List;

/**
 * 视频服务接口
 */
@Managed
public interface VideoService extends IService<Video> {

    List<Video> search(String keyword);

    List<Video> listByCategoryId(Long id);

    List<Video> listByUserId(Long userId);
}
