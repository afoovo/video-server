package com.afo.video.common.api;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AjaxResult<T> {
    private int code;
    private String msg;
    private T data;

    public static <T> AjaxResult<T> ok(T data) {
        return new AjaxResult<>(200, "success", data);
    }

    public static <T> AjaxResult<T> error(String msg) {
        return new AjaxResult<>(500, msg, null);
    }
}