# OUGAONE 展示页数据服务

NAS 部署使用 `server.mjs` 和仓库根目录的 `compose.nas.yml`。服务在 NAS 内部读取 OUGAONE `GET /api/plan`（每 30 秒）、GitHub 源码统计（每日）和自托管 Umami 汇总（每 5 分钟），只向展示页返回聚合结果。

- `PLAN_API_URL` 必须指向 NAS 数据容器可访问的 OUGAONE `/api/plan` 完整 URL。
- `GITHUB_TOKEN` 用于私有仓库读取，只需只读权限；仅保存在 NAS 本地 `.env` 文件。
- `UMAMI_BASE_URL`、`UMAMI_WEBSITE_ID`、`UMAMI_API_KEY` 用于访问统计；留空时显示未接入。

不要把令牌、密码或 Umami API key 提交到仓库。数据 API 不发布宿主机端口，只由展示页容器通过内部网络访问。
