const dataEndpoint = typeof PROJECT_DATA_URL === 'string' && PROJECT_DATA_URL
  ? PROJECT_DATA_URL
  : './project.json';

export const projectMetrics = Object.freeze({ plan: null, code: null, traffic: null });

export async function loadProjectMetrics() {
  const response = await fetch(dataEndpoint, { cache: 'no-store', signal: AbortSignal.timeout(12000) });
  if (!response.ok) throw new Error(`项目数据暂不可用（${response.status}）`);
  const data = await response.json();
  if (data.schemaVersion !== 1) throw new Error('项目数据格式不匹配');
  return data;
}
