package com.afo.video.controller;

import cn.dev33.satoken.stp.StpUtil;
import com.afo.video.common.api.AjaxResult;
import com.afo.video.domain.User;
import com.afo.video.domain.Video;
import com.afo.video.mapper.UserMapper;
import com.afo.video.mapper.VideoMapper;
import com.afo.video.service.FileService;
import com.mybatisflex.core.paginate.Page;
import com.mybatisflex.core.query.QueryWrapper;
import org.noear.solon.annotation.*;
import org.noear.solon.core.handle.UploadedFile;
import org.noear.solon.validation.annotation.Valid;

import java.util.List;

import static com.afo.video.domain.table.UserTableDef.USER;
import static com.afo.video.domain.table.VideoTableDef.VIDEO;

/**
 * 用户控制器
 */
@Controller
@Mapping("/user")
public class UserController {

    @Inject
    private UserMapper userMapper;
    @Inject
    private VideoMapper videoMapper;
    @Inject
    private FileService fileService;

    /**
     * 查询所有用户
     *
     * @return 用户列表
     */
    @Mapping("/list")
    public Object list() {
        List<User> all = userMapper.selectListByQuery(QueryWrapper.create());
        return AjaxResult.ok(all);
    }

    /**
     * 分页查询用户列表
     *
     * @param pageNum  页码
     * @param pageSize 每页数量
     * @return 分页用户列表
     */
    @Mapping("/page")
    public Object page(int pageNum, int pageSize) {
        Page<User> page = userMapper.paginate(new Page<>(pageNum, pageSize), QueryWrapper.create());
        return AjaxResult.ok(page);
    }

    /**
     * 模糊查询用户列表
     *
     * @param keyword 模糊查询关键词
     * @return 用户列表
     */
    @Mapping("/search/{keyword}")
    public Object search(@Path("keyword") String keyword) {
        QueryWrapper queryWrapper = QueryWrapper.create()
                .select()
                .from(USER)
                .where(USER.USER_NAME.like(keyword))
                .or(USER.ACCOUNT.like(keyword));
        List<User> users = userMapper.selectListByQuery(queryWrapper);
        return AjaxResult.ok(users);
    }

    /**
     * 根据ID获取用户
     *
     * @param id 用户ID
     * @return 用户详情
     */
    @Valid
    @Mapping("/get/{id}")
    public Object getById(@Path("id") Long id) {
        User user = userMapper.selectOneById(id);
        if (user == null) {
            return AjaxResult.error("用户不存在");
        }
        return AjaxResult.ok(user);
    }


    /**
     * 查询用户上传的视频列表
     *
     * @param id 用户ID
     * @return 视频列表
     */
    @Valid
    @Mapping("/{id}/videoList")
    public Object userVideoList(@Path("id") Long id) {
        List<Video> videos = videoMapper.selectListByQuery(
                QueryWrapper.create().select().from(VIDEO).where(VIDEO.USER_ID.eq(id)));
        return AjaxResult.ok(videos);
    }

    /**
     * 添加用户
     *
     * @param user 用户对象
     * @return 添加结果
     */
    @Post
    @Mapping("/add")
    public Object add(@Body User user) {
        boolean success = userMapper.insert(user) > 0;
        if (success) {
            return AjaxResult.ok("用户添加成功");
        } else {
            return AjaxResult.error("用户添加失败");
        }
    }

    /**
     * 更新用户
     *
     * @param user 用户对象
     * @return 更新结果
     */
    @Put
    @Mapping("/update")
    public Object update(@Body User user) {
        boolean success = userMapper.update(user) > 0;
        if (success) {
            return AjaxResult.ok("用户更新成功");
        } else {
            return AjaxResult.error("用户更新失败");
        }
    }

    /**
     * 删除用户
     *
     * @param id 用户ID
     * @return 删除结果
     */
    @Delete
    @Mapping("/delete/{id}")
    public Object delete(@Path("id") Long id) {
        boolean success = userMapper.deleteById(id) > 0;
        if (success) {
            return AjaxResult.ok("用户删除成功");
        } else {
            return AjaxResult.error("用户删除失败");
        }
    }

    /**
     * 头像上传
     *
     * @param file 头像文件
     * @return 上传结果
     */
    @Post
    @Mapping("/uploadAvatar")
    public Object uploadAvatar(@Param("file") UploadedFile file) {
        try {
            Long userId = StpUtil.getLoginIdAsLong();
            return fileService.uploadAvatar(file, userId);
        } catch (Exception e) {
            return AjaxResult.error("头像上传失败：" + e.getMessage());
        }
    }
}
