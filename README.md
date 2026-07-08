# ENHE 经营系统操作台

ENHE 经营系统操作台是用于本地经营巡检的桌面应用。

它用于读取经营报告、检查风险状态、录入真实外部渠道数据、运行白名单检查命令，并把数据库迁移、种子数据、部署和真实回填等危险动作排除在应用之外。

品牌素材存放在 `public/brand/`，用于窗口图标、网页图标、Windows 安装包图标和应用内导航标识。

## 项目介绍

本应用为 ENHE AI 工具站提供一个更安全的本地运营入口，让非技术人员也能按步骤完成经营巡检。

核心页面：

- 首页总览：查看当前运营状态、阻塞项、风险和关键指标。
- 新手指南：按步骤引导新用户完成首次使用。
- 外部数据：只录入真实渠道发布数据。
- 命令运行：只运行白名单检查和演练命令。
- 报告中心：查看经营系统生成的报告。
- 风险中心：查看隔离项和高风险事项。
- 结构核对：记录生产和预发结构人工核对结果。
- 每周运营：查看每周运营动作和演练状态。
- 设置：配置本地项目路径，不保存密钥。

安全边界：

- 应用内不执行数据库迁移。
- 应用内不执行种子数据。
- 应用内不执行部署、服务器、容器或反向代理命令。
- 应用内不执行真实回填。
- 设置中不保存密钥。

## 安装教程

开发环境需要：

- Windows 10 或更高版本。
- 已安装 Node.js 和 npm。
- 已安装 Git。

拉取项目并安装依赖：

```bash
git clone https://github.com/hqwzhu/ENHE-EBOS.git
cd ENHE-EBOS
npm install
```

开发模式启动：

```bash
npm run electron:dev
```

构建生产版本：

```bash
npm run build
```

生成给用户安装的正式安装包：

```bash
npm run package:win
```

正式安装包输出位置：

```text
release/ENHE-经营系统操作台-安装包-1.0.0.exe
```

## 使用说明

1. 双击安装包并完成安装。
2. 打开桌面快捷方式“ENHE 经营系统操作台”。
3. 进入设置页，确认项目路径检查通过。
4. 回到首页总览，查看部署状态、上线检查和质量检查。
5. 如果已经真实发布外部渠道，进入外部数据页录入真实数据。
6. 进入命令运行页，只运行检查和演练命令。
7. 进入报告中心和风险中心，查看报告和下一步建议。

## 开发命令

```bash
npm install
npm run electron:dev
```

## Quality

```bash
npm run test
npm run lint
npm run typecheck
npm run build
```

## Windows Package

```bash
npm run package:win
```

## 开发者

- 开发者：ENHE
- 网站：[https://www.enhe-tech.com.cn](https://www.enhe-tech.com.cn)
