package com.afo.video;

import org.noear.solon.Solon;
import org.noear.solon.annotation.Import;
import org.noear.solon.annotation.SolonMain;

@SolonMain
@Import(scanPackages = "com.afo.video")
public class App {
    public static void main(String[] args) {
        Solon.start(App.class, args);
        // 启动成功
        System.out.println("启动成功");
    }
}