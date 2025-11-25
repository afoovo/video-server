package com.afo.video.domain;

import com.mybatisflex.annotation.Column;
import com.mybatisflex.annotation.Id;
import com.mybatisflex.annotation.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
@Table("video")
public class Video extends BaseEntity {
    @Id
    private Long id;

    @Column("user_id")
    private Long userId;

    private String title;
    private String description;

    @Column("category_id")
    private Long categoryId;

    @Column("file_url")
    private String fileUrl;

    @Column("cover_url")
    private String coverUrl;

    private Integer duration; // 秒
    private Integer status;
}
