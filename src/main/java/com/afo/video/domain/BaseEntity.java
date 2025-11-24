package com.afo.video.domain;

import lombok.Data;
import java.util.Date;

@Data
public class BaseEntity {

    /**
     * 创建时间
     */
    private Date createTime;
    /**
     * 更新时间
     */
    private Date updateTime;

}