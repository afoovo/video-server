package com.afo.video.service.impl;

import com.afo.video.domain.User;
import com.afo.video.mapper.UserMapper;
import com.afo.video.service.UserService;
import com.mybatisflex.solon.service.impl.ServiceImpl;
import org.noear.solon.annotation.Inject;
import org.noear.solon.annotation.Managed;

@Managed
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {
}
