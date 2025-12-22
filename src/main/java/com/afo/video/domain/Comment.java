package com.afo.video.domain;

import com.mybatisflex.annotation.Column;
import com.mybatisflex.annotation.Id;
import com.mybatisflex.annotation.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
@Table("comment")
public class Comment extends BaseEntity {
    @Id
    private Long id;
    @Column("video_id")
    private Long videoId;
    @Column("user_id")
    private Long userId;
    @Column("parent_id")
    private Long parentId;
    private String content;
    private Integer status;
}
