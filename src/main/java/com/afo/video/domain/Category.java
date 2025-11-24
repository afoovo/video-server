package com.afo.video.domain;

import com.mybatisflex.annotation.Id;
import com.mybatisflex.annotation.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
@Table("category")
public class Category extends BaseEntity {
    @Id
    private Long id;
    private String name;
    private String description;
    private Integer status;
}
