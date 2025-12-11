package com.afo.video.service.impl;

import cn.dev33.satoken.stp.SaTokenInfo;
import cn.dev33.satoken.stp.StpUtil;
import com.afo.video.common.api.AjaxJson;
import com.afo.video.domain.User;
import com.afo.video.mapper.UserMapper;
import com.afo.video.service.AuthService;
import com.mybatisflex.core.query.QueryWrapper;
import com.mybatisflex.solon.service.impl.ServiceImpl;
import org.noear.solon.Utils;
import org.noear.solon.annotation.Inject;
import org.noear.solon.annotation.Managed;
import org.noear.solon.cloud.CloudClient;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.afo.video.domain.table.UserTableDef.USER;

@Managed
public class AuthServiceImpl extends ServiceImpl<UserMapper, User> implements AuthService {

    @Inject
    private UserMapper userMapper;

    @Override
    public AjaxJson login(String account, String password) {

        // 查询用户 - 使用QueryWrapper构建查询条件
        QueryWrapper query = QueryWrapper.create()
                .where(USER.ACCOUNT.eq(account).or(USER.USER_NAME.eq(account)));
        User user = userMapper.selectOneByQuery(query);

        if (user == null) {
            return AjaxJson.getError("用户不存在");
        }

        // 验证密码
        if (!verifyPassword(password, user.getPassword(), user.getSalt())) {
            return AjaxJson.getError("密码错误");
        }

        // 检查用户状态
        if (user.getStatus() != null && user.getStatus() == 0) {
            return AjaxJson.getError("用户已被禁用");
        }

        // 登录成功，生成token
        StpUtil.login(user.getId());

        // 获取token信息
        SaTokenInfo tokenInfo = StpUtil.getTokenInfo();

        // 返回登录结果
        Map<String, Object> result = new HashMap<>();
        result.put("token", tokenInfo.getTokenValue());
        result.put("user", user);

        return AjaxJson.getSuccess("登录成功", result);
    }

    @Override
    public AjaxJson register(User user) {

        // 检查账号是否已存在
        QueryWrapper query = QueryWrapper.create()
                .where(USER.ACCOUNT.eq(user.getAccount()).or(USER.USER_NAME.eq(user.getUserName())));
        List<User> existingUsers = userMapper.selectListByQuery(query);

        if (!existingUsers.isEmpty()) {
            return AjaxJson.getError("账号已存在");
        }

        // 设置用户ID
        user.setId(CloudClient.id().generate());// 使用Solon-Cloud生成ID(默认实现为Snowflake)

        // 生成密码盐和加密密码
        String salt = Utils.guid();
        String encryptedPassword = encryptPassword(user.getPassword(), salt);

        user.setPassword(encryptedPassword);
        user.setSalt(salt);
        user.setStatus(1); // 启用状态
        user.setSex("OTHER"); // 默认性别为其他

        // 设置创建时间
        user.setCreateTime(new Date());

        // 保存用户
        boolean success = userMapper.insert(user) > 0;

        if (success) {
            // 注册成功后自动登录
            StpUtil.login(user.getId());

            // 获取token信息
            SaTokenInfo tokenInfo = StpUtil.getTokenInfo();

            // 返回注册结果
            Map<String, Object> result = new HashMap<>();
            result.put("token", tokenInfo.getTokenValue());
            result.put("用户名", user.getUserName());
            result.put("账号", user.getAccount());
            result.put("邮箱", user.getEmail());
            result.put("性别", user.getSex());

            return AjaxJson.getSuccess("注册成功", result);
        } else {
            return AjaxJson.getError("注册失败");
        }
    }

    @Override
    public AjaxJson logout() {
        //方法式验证，简化检查是否登录（checkLogin）、登出（logout）等
        StpUtil.logout();//auth携带token，自动校验是否登录，未登录则直接返回
        return AjaxJson.getSuccess("登出成功");
    }

    /**
     * 加密密码
     */
    private String encryptPassword(String password, String salt) {
        return Utils.md5(Utils.md5(password) + salt);
    }

    /**
     * 验证密码
     */
    private boolean verifyPassword(String inputPassword, String storedPassword, String salt) {
        if (Utils.isEmpty(storedPassword) || Utils.isEmpty(salt)) {
            return false;
        }
        String encryptedInput = encryptPassword(inputPassword, salt);
        return encryptedInput.equals(storedPassword);
    }
}