import { createServer } from 'node:http';
import { aggregatePlan, loadCode, loadTraffic, parsePlan } from './project-worker.mjs';

const port = Number(process.env.PORT || 8787);
const state = { schemaVersion: 1, observedAt: null, plan: null, code: null, traffic: null, errors: {} };
const DAY = 86400000;
const attemptedAt = { plan: 0, code: 0, traffic: 0 };
let running = false;

async function refreshPlan() {
  const url = process.env.PLAN_API_URL || process.env.PLAN_SOURCE_URL;
  if (!url) throw new Error('请配置 OUGAONE 的 PLAN_API_URL（/api/plan）');
  const response = await fetch(url, { headers: { Accept: process.env.PLAN_API_URL ? 'application/json' : 'text/plain' }, signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`OUGAONE 计划数据暂不可用（${response.status}）`);
  const updatedAt = new Date().toISOString();
  const contentType = response.headers.get('content-type') || '';
  state.plan = contentType.includes('application/json')
    ? aggregatePlan(await response.json(), updatedAt)
    : parsePlan(await response.text(), updatedAt);
  delete state.errors.plan;
}

async function refreshCode() {
  state.code = await loadCode(process.env, Date.now());
  delete state.errors.code;
}

async function refreshTraffic() {
  state.traffic = await loadTraffic(process.env, Date.now());
  delete state.errors.traffic;
}

async function attempt(key, task) {
  try { await task(); }
  catch (error) { state[key] = null; state.errors[key] = error instanceof Error ? error.message : '数据暂不可用'; }
}

async function refreshDue() {
  if (running) return;
  running = true;
  const now = Date.now();
  const tasks = [];
  for (const [key, interval, task] of [
    ['plan', 30000, refreshPlan],
    ['code', DAY, refreshCode],
    ['traffic', 300000, refreshTraffic],
  ]) {
    if (now - attemptedAt[key] < interval) continue;
    attemptedAt[key] = now;
    tasks.push(attempt(key, task));
  }
  await Promise.all(tasks);
  state.observedAt = new Date().toISOString();
  running = false;
}

const server = createServer(async (request, response) => {
  if (request.url === '/health') {
    response.writeHead(200, { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' }).end('ok');
    return;
  }
  if (request.url !== '/project.json' || !['GET', 'HEAD'].includes(request.method || '')) {
    response.writeHead(404, { 'Content-Type': 'application/json', 'X-Content-Type-Options': 'nosniff' }).end('{"error":"Not found"}');
    return;
  }
  await refreshDue();
  response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  response.end(request.method === 'HEAD' ? undefined : JSON.stringify(state));
});

server.listen(port, process.env.HOST || '0.0.0.0');
setInterval(() => { void refreshDue(); }, 15000).unref();
