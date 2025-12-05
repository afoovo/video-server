package com.afo.video.service.impl;

import com.afo.video.domain.User;
import com.afo.video.mapper.UserMapper;
import com.afo.video.service.UserService;
import com.mybatisflex.core.query.QueryWrapper;
import com.mybatisflex.solon.service.impl.ServiceImpl;
import org.noear.solon.annotation.Inject;
import org.noear.solon.annotation.Managed;


import java.util.List;

import static com.afo.video.domain.table.UserTableDef.USER;

@Managed
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {
    @Inject
    private UserMapper userMapper;

    @Override
    public List<User> search(String keyword) {

        QueryWrapper queryWrapper = QueryWrapper.create()
                .select()
                .from(USER)
                .where(USER.USER_NAME.like(keyword))
                .or(USER.ACCOUNT.like(keyword));
        return userMapper.selectListByQuery(queryWrapper);
    }
}
