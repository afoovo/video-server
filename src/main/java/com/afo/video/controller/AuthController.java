package com.afo.video.controller;

import cn.dev33.satoken.annotation.SaCheckLogin;
import com.afo.video.common.api.AjaxJson;
import com.afo.video.service.AuthService;
import org.noear.solon.annotation.Controller;
import org.noear.solon.annotation.Inject;
import org.noear.solon.annotation.Mapping;
import org.noear.solon.annotation.Param;

/**
 * 登录注册
 */
@Controller
@Mapping("/auth")
public class AuthController {

    @Inject
    AuthService authService;

    /**
     * 登录
     * @param account 账号
     * @param password 密码
     */
    @Mapping("/login")
    public AjaxJson login(@Param("account") String account, @Param("password") String password) {
        return authService.login(account, password);
    }

    /**
     * 注册
     * @param account 账号
     * @param password 密码
     */
    @Mapping("/register")
    public AjaxJson register(@Param("account") String account, @Param("password") String password) {
        return authService.register(account, password);
    }
    /**
     * 登出
     */
//    注解式验证
//    @SaCheckLogin                    // 必须登录
//    @SaCheckRole("admin")           // 必须具有admin角色
//    @SaCheckPermission("video:add") // 必须具有video:add权限
    @Mapping("/logout")
    public AjaxJson logout() {
        return authService.logout();
    }
}
