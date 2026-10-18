# OUGAONE 项目生长记录

这是一个与 OUGAONE 主站分开的公开展示页。沿用上游的暖色微缩雨景风格，用三维建筑呈现项目的生长：正式计划每完成 10% 增加一层，计划中的每个已完成 F-09 及以后功能任务点亮一处建筑装饰。计划状态从 OUGAONE 主仓库的 `docs/PLAN.md` 自动读取；页面每分钟拉取一次，数据服务缓存计划最多 30 秒。

看板展示计划任务、功能交付、源码文件数与体积、近 30 日 Git 代码增删趋势，以及 Umami 最近 30 日访客数据。代码统计范围限定为 OUGAONE 新应用 `apps/web/` 和 `apps/api/`。源码体积不是行数；代码增删来自 GitHub 提交统计。

## 本地构建

```sh
cd rainy-corner-src
npm ci
npm run build
```

这会从 `rainy-corner-src/` 生成仓库根目录 `index.html`。本地静态预览读取根目录 `project.json`；未配置数据服务时，面板会显示等待接入状态。

## 计划自动同步和数据服务

`analytics-service/project-worker.mjs` 是 Cloudflare Worker 数据端点。默认计划源为：

`https://raw.githubusercontent.com/ericlokz/OUGAONE/main/docs/PLAN.md`

每次页面轮询都会请求 Worker；Worker 对计划源缓存 30 秒，因此 OUGAONE 的计划文件提交到 `main` 后，展示页通常在约一分钟内更新。若主站提供已部署的 `/api/plan`，可用 `PLAN_API_URL` 指向该 JSON API。

首次部署前：

1. 在 Cloudflare 新建 KV namespace，并把 ID 填入 `analytics-service/wrangler.jsonc` 的 `PROJECT_CACHE`。
2. 按需修改 `GITHUB_REPOSITORY`、`PLAN_SOURCE_URL` 和 `PUBLIC_SITE_ORIGIN`。`PLAN_API_URL` 可通过 Worker 环境变量设置。
3. 若要启用访问统计，配置自托管 Umami：设置 `UMAMI_BASE_URL` 与 `UMAMI_WEBSITE_ID`，再将 API 凭据作为 Worker secret `UMAMI_API_KEY` 保存。不要把密钥写入仓库或前端构建参数。
4. 发布 Worker 后，构建静态页时设置 `PROJECT_DATA_URL=https://<worker-host>/project.json`。若要记录展示页访问量，再设置 `UMAMI_SCRIPT_URL` 与 `UMAMI_WEBSITE_ID`；脚本 URL 和网站 ID 会写入生成的页面。

代码统计由 Cloudflare 定时任务每日刷新，Umami 统计每 5 分钟刷新；计划状态由页面请求即时读取。Worker 只返回聚合统计，不公开凭据。未配置 Umami 时访问量显示为待接入，不使用虚构数据。

## GitHub Pages 发布

仓库的 Pages 来源需要设为 **GitHub Actions**。推送到 `main` 后，`.github/workflows/pages.yml` 会重新构建并发布根页面与 `project.json`。部署 Worker 后，在仓库 Actions variables 设置 `PROJECT_DATA_URL`（Worker 的 `/project.json`）、`UMAMI_SCRIPT_URL` 和 `UMAMI_WEBSITE_ID`，再推送一次以启用动态数据端点和 Umami 前端跟踪。

## 上游授权与来源

本仓库是 [`yisu0830/suekit-virtual-shop`](https://github.com/yisu0830/suekit-virtual-shop) 的分支改造，保留其原创微缩场景并替换为 OUGAONE 项目展示内容。上游声明源码仅供非商业学习、研究及个人使用，禁止商业用途，包括收费服务和企业商业运营。该声明不覆盖第三方素材；使用者须分别遵守各素材的授权条款。
