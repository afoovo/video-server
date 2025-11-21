package com.afo.video.domain;

import com.mybatisflex.annotation.Table;
import com.mybatisflex.annotation.Id;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Table("video")
public class Video  {
    @Id
    private Long id;
    private Long userId;
    private String title;
    private String description;
    private String fileUrl; // 完整 url
    private String coverUrl;
    private Integer duration; // 秒
    private Integer status;
    private LocalDateTime createTime;
}
