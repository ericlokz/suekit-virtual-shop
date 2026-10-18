const DAY = 86400000;
const CACHE_KEY = 'project-metrics-v1';
const STATUS_KEYS = { '待开始': 'notStarted', '进行中': 'inProgress', '待验收': 'awaitingReview', '完成': 'completed', '阻塞': 'blocked' };
const SOURCE_PATHS = ['apps/web/', 'apps/api/'];

function cells(line) {
  return line.trim().slice(1, -1).split('|').map((value) => value.trim());
}

export function parsePlan(markdown, updatedAt) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const summary = { total: 0, notStarted: 0, inProgress: 0, awaitingReview: 0, completed: 0, blocked: 0 };
  const groups = [];
  let section = '';
  let candidateCount = 0;
  let featureCount = 0;
  let completedFeatureCount = 0;
  let sawFormal = false;
  let sawCandidate = false;
  for (let index = 0; index < lines.length; index++) {
    const heading = /^## \d+\. (.+)$/.exec(lines[index] || '');
    if (heading) section = heading[1];
    if (!lines[index]?.trim().startsWith('|') || cells(lines[index])[0] !== 'ID') continue;
    const header = cells(lines[index]);
    const isFormal = header[1] === '任务与实际产物';
    const isCandidate = header[1] === '候选能力';
    if (!isFormal && !isCandidate) continue;
    if (isFormal) sawFormal = true;
    if (isCandidate) sawCandidate = true;
    const group = isFormal ? { title: section, summary: { total: 0, notStarted: 0, inProgress: 0, awaitingReview: 0, completed: 0, blocked: 0 } } : null;
    if (group) groups.push(group);
    index += 2;
    while (lines[index]?.trim().startsWith('|')) {
      const row = cells(lines[index]);
      const id = row[0] || '';
      const status = row.at(-1) || '';
      if (isFormal ? !/^(?:PLAN|P|A|U|F|B|S)-\d+$/.test(id) : !/^C-\d+$/.test(id)) throw new Error('计划表格包含无法识别的任务');
      const key = STATUS_KEYS[status];
      if (!key) throw new Error('计划表格包含无法识别的状态');
      if (isFormal) {
        summary.total++; summary[key]++; group.summary.total++; group.summary[key]++;
        const feature = /^F-(\d+)$/.exec(id);
        if (feature && Number(feature[1]) >= 9) {
          featureCount++;
          if (key === 'completed') completedFeatureCount++;
        }
      }
      else candidateCount++;
      index++;
    }
    index--;
  }
  if (!sawFormal || !sawCandidate || !summary.total) throw new Error('计划表格不完整');
  return { updatedAt, summary, groups, candidateCount, features: { total: featureCount, completed: completedFeatureCount } };
}

export function aggregatePlan(value, updatedAt) {
  if (!value?.summary || !Array.isArray(value.groups) || !Array.isArray(value.candidates)) throw new Error('计划 API 响应格式不匹配');
  const summary = value.summary;
  for (const key of ['total', ...Object.values(STATUS_KEYS)]) {
    if (!Number.isSafeInteger(summary[key]) || summary[key] < 0) throw new Error('计划 API 汇总无效');
  }
  const featureTasks = value.groups.flatMap((group) => group.tasks).filter((task) => {
    const match = /^F-(\d+)$/.exec(task.id || '');
    return match && Number(match[1]) >= 9;
  });
  return {
    updatedAt,
    summary,
    groups: value.groups.map((group) => ({
      title: String(group.title).slice(0, 100),
      summary: {
        total: group.tasks.length,
        ...Object.fromEntries(Object.values(STATUS_KEYS).map((key) => [key, group.tasks.filter((task) => STATUS_KEYS[task.status] === key).length])),
      },
    })),
    candidateCount: value.candidates.length,
    features: { total: featureTasks.length, completed: featureTasks.filter((task) => task.status === '完成').length },
  };
}

async function readPlan(env, fetcher = fetch) {
  const url = env.PLAN_API_URL || env.PLAN_SOURCE_URL;
  if (!url) throw new Error('请配置 OUGAONE 的 PLAN_API_URL（/api/plan）');
  const cacheKey = new Request('https://plan-cache.invalid/' + encodeURIComponent(url));
  const cache = caches.default;
  const cached = await cache.match(cacheKey);
  if (cached) return cached.json();
  const response = await fetcher(url, { headers: { Accept: env.PLAN_API_URL ? 'application/json' : 'text/plain', 'Cache-Control': 'no-cache' }, signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error('计划来源暂不可用（' + response.status + '）');
  const updatedAt = new Date().toISOString();
  const contentType = response.headers.get('content-type') || '';
  const progress = contentType.includes('application/json')
    ? aggregatePlan(await response.json(), updatedAt)
    : parsePlan(await response.text(), updatedAt);
  const result = { plan: progress };
  await cache.put(cacheKey, new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=30' } }));
  return result;
}

function githubHeaders(env) {
  const headers = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'OUGAONE-Project-Progress' };
  if (env.GITHUB_TOKEN) headers.Authorization = 'Bearer ' + env.GITHUB_TOKEN;
  return headers;
}

async function githubJson(path, env, fetcher) {
  const response = await fetcher('https://api.github.com' + path, { headers: githubHeaders(env), signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error('GitHub 数据暂不可用（' + response.status + '）');
  return response.json();
}

export async function loadCode(env, now, fetcher = fetch) {
  const repository = env.GITHUB_REPOSITORY || 'ericlokz/OUGAONE';
  const prefix = '/repos/' + repository;
  const repo = await githubJson(prefix, env, fetcher);
  const tree = await githubJson(prefix + '/git/trees/' + encodeURIComponent(repo.default_branch) + '?recursive=1', env, fetcher);
  if (tree.truncated) throw new Error('GitHub 文件清单不完整');
  const files = tree.tree.filter((item) => item.type === 'blob' && SOURCE_PATHS.some((path) => item.path.startsWith(path)));
  const since = new Date(now - 30 * DAY).toISOString();
  const commits = await githubJson(prefix + '/commits?path=apps&since=' + encodeURIComponent(since) + '&per_page=30', env, fetcher);
  const dailyMap = new Map();
  let sourceCommits = 0;
  for (const commit of commits) {
    const detail = await githubJson(prefix + '/commits/' + commit.sha, env, fetcher);
    const date = (detail.commit?.author?.date || detail.commit?.committer?.date || '').slice(0, 10);
    if (!date) continue;
    const totals = dailyMap.get(date) || { additions: 0, deletions: 0 };
    let touchedSource = false;
    for (const file of detail.files || []) {
      if (!SOURCE_PATHS.some((path) => file.filename.startsWith(path))) continue;
      touchedSource = true;
      totals.additions += file.additions || 0;
      totals.deletions += file.deletions || 0;
    }
    if (touchedSource) {
      sourceCommits++;
      dailyMap.set(date, totals);
    }
  }
  const daily = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(now - (29 - index) * DAY).toISOString().slice(0, 10);
    return { date, label: date.slice(5), ...(dailyMap.get(date) || { additions: 0, deletions: 0 }) };
  });
  return {
    files: files.length,
    bytes: files.reduce((sum, file) => sum + (Number.isSafeInteger(file.size) ? file.size : 0), 0),
    commits: sourceCommits,
    additions: daily.reduce((sum, row) => sum + row.additions, 0),
    deletions: daily.reduce((sum, row) => sum + row.deletions, 0),
    daily,
  };
}

export async function loadTraffic(env, now, fetcher = fetch) {
  if (!env.UMAMI_BASE_URL || !env.UMAMI_WEBSITE_ID || !env.UMAMI_API_KEY) throw new Error('Umami 尚未配置');
  const base = env.UMAMI_BASE_URL.replace(/\/$/, '');
  const startAt = now - 30 * DAY;
  const headers = { Authorization: 'Bearer ' + env.UMAMI_API_KEY, Accept: 'application/json' };
  const read = async (route) => {
    const response = await fetcher(base + '/api/websites/' + encodeURIComponent(env.UMAMI_WEBSITE_ID) + '/' + route, { headers, signal: AbortSignal.timeout(12000) });
    if (!response.ok) throw new Error('Umami 数据暂不可用（' + response.status + '）');
    return response.json();
  };
  const [stats, series] = await Promise.all([
    read('stats?startAt=' + startAt + '&endAt=' + now),
    read('pageviews?startAt=' + startAt + '&endAt=' + now + '&unit=day'),
  ]);
  const rows = Array.isArray(series) ? series : series.pageviews || [];
  const daily = rows.map((row) => {
    const date = new Date(row.x).toISOString().slice(0, 10);
    return { date, label: date.slice(5), pageviews: Number(row.y) || 0 };
  });
  return { visitors: Number(stats.visitors) || 0, pageviews: Number(stats.pageviews) || 0, visits: Number(stats.visits) || 0, daily };
}

export async function refresh(env, now = Date.now(), fetcher = fetch) {
  const errors = {};
  const [code, traffic] = await Promise.all([
    loadCode(env, now, fetcher).catch((error) => { errors.code = error.message; return null; }),
    loadTraffic(env, now, fetcher).catch((error) => { errors.traffic = error.message; return null; }),
  ]);
  const snapshot = { schemaVersion: 1, observedAt: new Date(now).toISOString(), code, traffic, errors };
  await env.PROJECT_CACHE.put(CACHE_KEY, JSON.stringify(snapshot));
  return snapshot;
}

export async function refreshTraffic(env, now = Date.now(), fetcher = fetch) {
  const snapshot = await env.PROJECT_CACHE.get(CACHE_KEY, 'json') || { schemaVersion: 1, code: null, traffic: null, errors: {} };
  try {
    snapshot.traffic = await loadTraffic(env, now, fetcher);
    delete snapshot.errors?.traffic;
  } catch (error) {
    snapshot.errors = { ...(snapshot.errors || {}), traffic: error.message };
  }
  snapshot.observedAt = new Date(now).toISOString();
  await env.PROJECT_CACHE.put(CACHE_KEY, JSON.stringify(snapshot));
  return snapshot;
}

function response(body, status, origin) {
  const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', Vary: 'Origin' };
  if (origin) headers['Access-Control-Allow-Origin'] = origin;
  return new Response(body === null ? null : JSON.stringify(body), { status, headers });
}

export default {
  async scheduled(controller, env, context) {
    context.waitUntil(controller.cron === '*/5 * * * *'
      ? refreshTraffic(env, controller.scheduledTime)
      : refresh(env, controller.scheduledTime));
  },
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');
    const allowed = new Set([env.PUBLIC_SITE_ORIGIN, 'http://127.0.0.1:8765', 'http://localhost:8765'].filter(Boolean));
    if (origin && !allowed.has(origin)) return response({ error: 'Origin not allowed' }, 403);
    if (url.pathname !== '/project.json') return response({ error: 'Not found' }, 404, origin);
    if (request.method !== 'GET' && request.method !== 'HEAD') return response({ error: 'Method not allowed' }, 405, origin);
    let snapshot = { schemaVersion: 1, observedAt: null, code: null, traffic: null, errors: {} };
    try {
      snapshot = await env.PROJECT_CACHE.get(CACHE_KEY, 'json') || snapshot;
    } catch {
      snapshot.errors.code = '项目统计缓存尚未初始化。';
    }
    try {
      const plan = await readPlan(env);
      snapshot.plan = plan.plan;
      delete snapshot.errors.plan;
    } catch (error) {
      snapshot.errors.plan = error.message;
    }
    return request.method === 'HEAD' ? response(null, 200, origin) : response(snapshot, 200, origin);
  },
};
