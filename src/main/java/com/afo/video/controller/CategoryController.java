package com.afo.video.controller;

import com.afo.video.common.api.AjaxResult;
import com.afo.video.domain.Category;
import com.afo.video.domain.Video;
import com.afo.video.service.CategoryService;
import com.afo.video.service.VideoService;
import org.noear.solon.annotation.Controller;
import org.noear.solon.annotation.Inject;
import org.noear.solon.annotation.Mapping;
import org.noear.solon.annotation.Path;

import java.util.List;

/**
 * 分类控制器
 */
@Controller
@Mapping("/category")
public class CategoryController {
    @Inject
    private CategoryService categoryService;
    @Inject
    private VideoService videoService;

    /**
     * 获取所有分类
     *
     * @return 分类列表
     */
    @Mapping("/list")
    public Object list() {
        List<Category> categories = categoryService.list();
        return AjaxResult.ok(categories);
    }

    /**
     * 获取分类详情
     *
     * @param id 分类ID
     * @return 分类详情
     */
    @Mapping("/{id}")
    public Object detail(@Path("id") Long id) {
        Category category = categoryService.getById(id);
        return AjaxResult.ok(category);
    }

    /**
     * 查询分类视频列表
     *
     * @param id 分类ID
     * @return 视频列表
     */
    @Mapping("/{id}/videoList")
    public Object categoryVideoList(@Path("id") Long id) {
        List<Video> videos = videoService.listByCategoryId(id);
        return AjaxResult.ok(videos);
    }

    /**
     * 创建或更新分类
     *
     * @param category 分类信息
     * @return 创建结果
     */
    @Mapping("/saveOrUpdate")
    public Object saveOrUpdate(Category category) {
        boolean result = categoryService.saveOrUpdate(category);
        return AjaxResult.ok(result);
    }

    /**
     * 删除分类
     *
     * @param id 分类ID
     * @return 删除结果
     */
    @Mapping("/delete/{id}")
    public Object delete(@Path("id") Long id) {
        boolean result = categoryService.removeById(id);
        return AjaxResult.ok(result);
    }
}
