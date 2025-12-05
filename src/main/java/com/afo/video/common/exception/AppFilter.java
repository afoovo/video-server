package com.afo.video.common.exception;

import com.afo.video.common.api.AjaxResult;
import org.noear.solon.annotation.Managed;
import org.noear.solon.core.exception.StatusException;
import org.noear.solon.core.handle.Context;
import org.noear.solon.core.handle.Filter;
import org.noear.solon.core.handle.FilterChain;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Managed //index 为顺序位（不加，则默认为0）
public class AppFilter implements Filter {
    private final Logger log = LoggerFactory.getLogger(AppFilter.class);

    // 使用最底层的全局过滤
    @Override
    public void doFilter(Context ctx, FilterChain chain) throws Throwable {
        try {
            chain.doFilter(ctx);
        } catch (StatusException e) {
            if (e.getCode() == 404) {
                ctx.status(404);
            } else {
                log.error("状态异常", e);
                // 返回JSON格式的错误信息
                ctx.render(new AjaxResult<>(e.getCode(), e.getMessage(), null));
            }
        } catch (Throwable e) {
            log.error("服务端运行出错", e);
            // 返回JSON格式的错误信息
            ctx.render(AjaxResult.error("服务端运行出错"));

        }
    }
}