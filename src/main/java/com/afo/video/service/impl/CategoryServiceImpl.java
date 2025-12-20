package com.afo.video.service.impl;

import com.afo.video.domain.Category;
import com.afo.video.mapper.CategoryMapper;
import com.afo.video.service.CategoryService;
import com.mybatisflex.solon.service.impl.ServiceImpl;
import org.noear.solon.annotation.Managed;

@Managed
public class CategoryServiceImpl extends ServiceImpl<CategoryMapper, Category> implements CategoryService {
}
