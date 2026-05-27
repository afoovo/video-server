package com.afo.video.controller;

import com.afo.video.common.api.AjaxResult;
import com.afo.video.domain.Category;
import com.afo.video.domain.Video;
import com.afo.video.mapper.CategoryMapper;
import com.afo.video.mapper.VideoMapper;
import com.mybatisflex.core.query.QueryWrapper;
import org.noear.solon.annotation.Controller;
import org.noear.solon.annotation.Inject;
import org.noear.solon.annotation.Mapping;
import org.noear.solon.annotation.Path;

import java.util.List;

import static com.afo.video.domain.table.VideoTableDef.VIDEO; // 类型安全的最佳实践

/**
 * 分类控制器
 */
@Controller
@Mapping("/category")
public class CategoryController {
    @Inject
    private CategoryMapper categoryMapper;
    @Inject
    private VideoMapper videoMapper;

    /**
     * 获取所有分类
     *
     * @return 分类列表
     */
    @Mapping("/list")
    public Object list() {
        List<Category> categories = categoryMapper.selectListByQuery(QueryWrapper.create());
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
        Category category = categoryMapper.selectOneById(id);
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
        List<Video> videos = videoMapper.selectListByQuery(
                QueryWrapper.create().select().from(VIDEO).where(VIDEO.CATEGORY_ID.eq(id)));
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
        boolean result = categoryMapper.insertOrUpdate(category) > 0;
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
        boolean result = categoryMapper.deleteById(id) > 0;
        return AjaxResult.ok(result);
    }
}
