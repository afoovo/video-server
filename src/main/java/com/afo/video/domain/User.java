package com.afo.video.domain;

import com.mybatisflex.annotation.Column;
import com.mybatisflex.annotation.Id;
import com.mybatisflex.annotation.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.noear.solon.validation.annotation.NotBlank;
import org.noear.solon.validation.annotation.Email;
import org.noear.solon.validation.annotation.Length;

@EqualsAndHashCode(callSuper = true)
@Data
@Table("user")
public class User extends BaseEntity {
    @Id
    private Long id;

    @Column("user_name")
    @NotBlank(message = "用户名不能为空")
    @Length(min = 4, max = 20, message = "用户名长度必须在4-20个字符之间")
    private String userName;
    
    @NotBlank(message = "账号不能为空")
    @Length(min = 4, max = 20, message = "账号长度必须在4-20个字符之间")
    private String account;
    
    @NotBlank(message = "密码不能为空")
    @Length(min = 4, max = 20, message = "密码长度必须在4-20个字符之间")
    private String password;
    
    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
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