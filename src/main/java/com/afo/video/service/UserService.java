package com.afo.video.service;

import com.afo.video.domain.User;
import com.mybatisflex.core.service.IService;
import org.noear.solon.annotation.Managed;

/**
 * 用户服务接口
 */
@Managed
public interface UserService extends IService<User> {

}
