package com.afo.video.domain;

import com.mybatisflex.annotation.Column;
import com.mybatisflex.annotation.Id;
import com.mybatisflex.annotation.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
@Table("user")
public class User extends BaseEntity {
    @Id
    private Long id;

    @Column("user_name")
    private String userName;
    private String account;
    private String password;
    private String email;
    private String sex;

    @Column("role_id")
    private Long roleId;

    private Integer status;
    private String salt;
    @Column("avatar_url")
    private String avatarUrl;
    private String bio;
}