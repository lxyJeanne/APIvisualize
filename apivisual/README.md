# React 应用使用指南

## 安装 Node.js

1. 访问 [Node.js 官网](https://nodejs.org/)。
2. 下载适合你操作系统的安装包并进行安装。

## 下载项目文件

1. 下载并解压 `apivisual.zip` 文件。

## 安装依赖

1. 打开终端（对于 Unix 系统）或命令提示符（对于 Windows 系统）。
2. 导航到解压后的项目文件夹。
3. 安装项目依赖：
    ```bash
    npm install
    ```

## 启动应用

1. 双击 `start-server.bat`（Windows 系统）或运行以下命令（Unix 系统）：
    ```sh
    ./start-server.sh
    ```

    `start-server.sh`（Unix 系统）：
    ```sh
    #!/bin/bash
    npx serve -s build
    ```

    `start-server.bat`（Windows 系统）：
    ```bat
    @echo off
    npx serve -s build
    pause
    ```

## 访问应用

1. 打开浏览器并访问 `http://localhost:5000`。

如果遇到任何问题，请联系技术支持团队。
