package com.afo.video.service;

import com.afo.video.common.api.AjaxJson;
import com.afo.video.domain.User;
import com.mybatisflex.core.service.IService;
import org.noear.solon.annotation.Managed;

@Managed
public interface AuthService extends IService<User> {
    AjaxJson login(String account, String password);

    AjaxJson register(User user);

    AjaxJson logout();
}
