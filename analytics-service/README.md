# OUGAONE 项目数据 Worker

Worker 只负责向独立展示页提供聚合项目数据。计划源默认是 OUGAONE 主仓库 `docs/PLAN.md`，被访问时自动读取并缓存 30 秒；GitHub 代码指标每日更新；自托管 Umami 汇总每 5 分钟更新。

部署前先创建 Cloudflare KV namespace，并把 namespace ID 写入 `wrangler.jsonc`。按需要配置 `GITHUB_REPOSITORY`、`PLAN_SOURCE_URL`、`PUBLIC_SITE_ORIGIN`、`UMAMI_BASE_URL` 和 `UMAMI_WEBSITE_ID`。Umami API 凭据使用 `wrangler secret put UMAMI_API_KEY` 设置；公开仓库可选 `GITHUB_TOKEN` 以提高 GitHub API 限额。

发布 Worker 后，将其 `/project.json` URL 配置为静态页构建变量 `PROJECT_DATA_URL`。没有 Umami 配置时 Worker 会明确返回访问数据不可用，不会产生模拟访问量。
