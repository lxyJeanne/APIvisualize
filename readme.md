# React + Flask 应用使用指南

这是一个包含前端和后端的全栈应用程序。前端使用 React，后端使用 Flask。本文将指导你如何在本地运行这个项目。

## 先决条件

在开始之前，请确保你的电脑上已经安装了以下软件：

- **Node.js 和 npm**：用于运行和管理前端依赖项。可以从 [Node.js 官方网站](https://nodejs.org/)下载。
- **Python 3**：用于运行后端 Flask 服务器。可以从 [Python 官方网站](https://www.python.org/)下载。

## 克隆仓库

首先，下载ZIp压缩包并解压。

打开CMD或者Bash，进入目录：
```sh
cd C:\Users\User.name\Desktop\APIvisual-master #替换成实际文件夹目录
```

## 安装依赖项：

**后端**

复制下面文本到CMD：
```sh
cd Flask
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
python app.py
```
若成功启动服务器，可看到:
```sh
 * Serving Flask app 'app'
 * Debug mode: off
WARNING: This is a development server. Do not use it in a production deployment. Use a production WSGI server instead.
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5000
 * Running on http://10.198.67.90:5000  #主机本地IP地址
Press CTRL+C to quit
```

**前端**


复制下面文本到CMD：
```sh
cd ../apivisual
npm install #安装依赖库
```
找到后端的主机IP地址，将http://（Ip address) 复制到apiConfig.js中，替换BASE_URL并保存 Ctrl+S。

文件地址：apivisual\src\apiConfig.js
```sh
// apiConfig.js 示例
const BASE_URL = 'http://10.198.67.90:5000'; # 替换为你的实际 IP 地址,如上打开服务器即可看到
```
启动前端界面
```sh
npm start
 ```
 若成功启动界面将自动开启浏览器，也可手动打开`http://localhost:3000`

## 常见问题
1. **我看到错误信息，提示找不到某些模块怎么办？**

    请确保你已经按照上述步骤正确安装了所有依赖项。如果问题依然存在，请尝试删除 node_modules 文件夹和 package-lock.json 文件，然后重新运行 npm install：

    ```sh
    rm -rf node_modules package-lock.json
    npm install
    ```
2. **我如何停止运行的服务器？**

    对于后端服务器，在运行 python app.py 的终端窗口中按 Ctrl + C。
    对于前端服务器，在运行 npm start 的终端窗口中按 Ctrl + C。
3. **如何在 Windows 上激活虚拟环境时解决 PowerShell 执行策略问题？**

    I. 以管理员身份打开 PowerShell：

    搜索“PowerShell”
    右键点击“Windows PowerShell”，选择“以管理员身份运行”。

    II. 运行以下命令来修改执行策略：
    ```sh
    Set-ExecutionPolicy RemoteSigned
    ```

    III. 当提示确认时，输入 Y 并按下 Enter：
    ```sh
    Execution Policy Change
    The execution policy helps protect you from scripts that you do not trust. Changing the execution policy might expose you to the security risks described in the about_Execution_Policies help topic at https:/go.microsoft.com/fwlink/?LinkID=135170. Do you want to change the execution policy?
    [Y] Yes  [A] Yes to All  [N] No  [L] No to All  [S] Suspend  [?] Help (default is "N"): Y
    ```
    IV. 重新激活虚拟环境：
    ```sh
    venv\Scripts\Activate
    pip install -r requirements.txt
    python app.py
    ```

如果还遇到任何问题，请联系技术支持团队。
