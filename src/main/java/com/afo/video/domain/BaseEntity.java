package com.afo.video.domain;

import com.mybatisflex.annotation.Column;
import lombok.Data;
import java.util.Date;

@Data
public class BaseEntity {

    /**
     * 创建时间
     */
    @Column("create_time")
    private Date createTime;
    /**
     * 更新时间
     */
    @Column("update_time")
    private Date updateTime;

}