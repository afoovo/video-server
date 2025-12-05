package com.afo.video.service;

import com.afo.video.domain.User;
import com.mybatisflex.core.service.IService;
import org.noear.solon.annotation.Managed;

import java.util.List;

/**
 * 用户服务接口
 */
@Managed
public interface UserService extends IService<User> {

    List<User> search(String keyword);
}
