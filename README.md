# OUGAONE 项目生长记录

这是一个与 OUGAONE 主站分开的项目展示页。沿用上游的暖色微缩雨景风格，用三维建筑呈现项目的生长：正式计划每完成 10% 增加一层，计划中的每个已完成 F-09 及以后功能任务点亮一处建筑装饰。NAS 数据服务每 30 秒读取 OUGAONE 的 `/api/plan`；页面每分钟刷新。

看板展示计划任务、功能交付、源码文件数与体积、近 30 日 Git 代码增删趋势，以及 Umami 最近 30 日访客数据。代码统计范围限定为 OUGAONE 新应用 `apps/web/` 和 `apps/api/`。源码体积不是行数；代码增删来自 GitHub 提交统计。

## NAS 隔离部署

展示站使用独立 Docker Compose 项目，Web 只绑定 NAS loopback，数据 API 只在 Compose 内部网络可见。它不会改动 OUGAONE 主站的路由、容器、数据库或对象存储。

1. GitHub fork 的 `main` 是源码唯一来源。构建师从指定提交检出仓库，在 Linux/amd64 构建并标记 `ougaone-growth-showcase-api:<commit>` 与 `ougaone-growth-showcase-web:<commit>`。
2. 将两张镜像传到 NAS 并加载；NAS 只保留 Compose 清单和权限为 `600` 的运行 `.env`，不存源码副本。
3. 在 NAS `.env` 中设置 `SHOWCASE_TAG`、未占用的 `SHOWCASE_PORT` 和容器可访问的 `PLAN_API_URL`。私有 GitHub 仓库的源码指标需设置只读 `GITHUB_TOKEN`。访问统计配置自托管 Umami 的 `UMAMI_BASE_URL`、`UMAMI_WEBSITE_ID`、`UMAMI_API_KEY` 和前端脚本地址 `UMAMI_SCRIPT_URL`；留空时面板显示待接入。
4. 从 NAS 运行时目录启动已加载的镜像：

   ```sh
   docker-compose --env-file .env -p ougaone-growth-showcase -f compose.nas.yml up -d --no-build
   ```

页面端口绑定到 loopback，建议通过授权的 SSH tunnel 访问。确认访问控制、目录、端口及回滚策略后，才将它公开给访客。

## 本地构建

```sh
cd rainy-corner-src
npm ci
npm run build
```

这会从 `rainy-corner-src/` 生成仓库根目录 `index.html`。还没有配置数据服务时，面板会显示等待接入状态。

## 上游授权与来源

本仓库是 [`yisu0830/suekit-virtual-shop`](https://github.com/yisu0830/suekit-virtual-shop) 的分支改造，保留其原创微缩场景并替换为 OUGAONE 项目展示内容。上游声明源码仅供非商业学习、研究及个人使用，禁止商业用途，包括收费服务和企业商业运营。该声明不覆盖第三方素材；使用者须分别遵守各素材的授权条款。
