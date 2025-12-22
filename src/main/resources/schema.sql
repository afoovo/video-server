CREATE DATABASE IF NOT EXISTS `video-server` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `video-server`;
create table `video-server`.category
(
    `id`          bigint NOT NULL auto_increment,
    `name`        varchar(255) DEFAULT NULL comment '分类名称',
    `description` text comment '分类描述',
    `status`      int          DEFAULT '1',
    `create_time` datetime     DEFAULT NULL,
    `update_time` datetime     DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 comment '视频分类表';


create table `video-server`.user
(
    id          bigint auto_increment primary key,
    user_name   varchar(255) comment '用户名、用户昵称',
    account     varchar(255) comment '账号',
    password    varchar(255) comment '密码',
    email       varchar(255) comment '邮箱',
    sex         enum ('MAN','WOMAN','OTHER') comment '性别',
    role_id     bigint comment '角色Id',
    status      int          default 1 comment '状态',
    create_time datetime,
    update_time datetime,
    salt        varchar(64) comment '密码盐',
    avatar_url  varchar(512) default '/avatars/default-avatar.jpg' comment '头像URL'

)
    comment '用户表';



create table `video-server`.video
(
    id          bigint auto_increment
        primary key,
    user_id     bigint        null comment '用户ID',
    title       varchar(255)  null comment '视频标题',
    description text          null comment '视频描述',
    category_id bigint        null comment '分类ID',
    file_url    varchar(512)  null comment '视频文件URL',
    cover_url   varchar(512)  null comment '视频封面URL',
    duration    int           null comment '视频时长（秒）',
    status      int default 1 null,
    create_time datetime      null,
    update_time datetime      null,
    constraint video_ibfk_1
        foreign key (user_id) references `video-server`.user (id),
    constraint video_ibfk_2
        foreign key (category_id) references `video-server`.category (id)
)
    comment '视频表';

create index category_id
    on `video-server`.video (category_id);
create index user_id
    on `video-server`.video (user_id);
-- 数据库查询会自动利用索引，无需修改impl或其他查询语句

ALTER TABLE `video-server`.user
    ADD COLUMN bio TEXT COMMENT '个人介绍';

-- 评论表
CREATE TABLE `comment`
(
    `id`          BIGINT PRIMARY KEY AUTO_INCREMENT,
    `video_id`    BIGINT NOT NULL COMMENT '视频ID',
    `user_id`     BIGINT NOT NULL COMMENT '用户ID',
    `content`     TEXT   NOT NULL COMMENT '评论内容',
    `parent_id`   BIGINT   DEFAULT NULL COMMENT '父评论ID（用于回复）',
    `status`      TINYINT  DEFAULT 1 COMMENT '状态：1-正常，0-删除',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 添加测试评论数据
INSERT INTO `comment` (`video_id`, `user_id`, `content`, `parent_id`, `status`) 
VALUES (1765434085906, 781181076234465280, '这个视频太棒了！讲解得非常清晰，学到了很多知识。', NULL, 1);

INSERT INTO `comment` (`video_id`, `user_id`, `content`, `parent_id`, `status`) 
VALUES (1765434085906, 785163957097099264, '感谢分享，内容很实用，期待更多优质视频！', NULL, 1);

