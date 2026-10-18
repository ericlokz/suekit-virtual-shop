const SVG_NS = 'http://www.w3.org/2000/svg';
const number = new Intl.NumberFormat('zh-CN');
const statuses = [['completed', '已完成'], ['inProgress', '进行中'], ['awaitingReview', '待验收'], ['blocked', '阻塞'], ['notStarted', '待开始']];
const planStatuses = [['完成', '已完成'], ['进行中', '进行中'], ['待验收', '待验收'], ['阻塞', '阻塞'], ['待开始', '待开始']];
const statusClass = { 完成: 'status-complete', 进行中: 'status-progress', 待验收: 'status-review', 阻塞: 'status-blocked', 待开始: 'status-pending' };

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function card(label, value, note) {
  const item = el('article', 'project-stat');
  item.append(el('p', 'project-stat-label', label), el('strong', 'project-stat-value', value), el('p', 'project-stat-note', note));
  return item;
}

function chart(rows, key, label) {
  const values = rows?.filter((row) => Number.isFinite(row?.[key]));
  if (!values?.length) return el('p', 'project-empty', '数据源接入后自动显示趋势。');
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 520 150'); svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', label);
  const max = Math.max(1, ...values.map((row) => row[key]));
  const points = values.map((row, index) => `${12 + index * 496 / Math.max(1, values.length - 1)},${126 - row[key] / max * 108}`).join(' ');
  const line = document.createElementNS(SVG_NS, 'polyline');
  line.setAttribute('points', points); line.setAttribute('fill', 'none'); line.setAttribute('stroke', 'currentColor'); line.setAttribute('stroke-width', '3'); line.setAttribute('stroke-linecap', 'round'); line.setAttribute('stroke-linejoin', 'round');
  svg.append(line);
  const copy = el('div', 'project-chart-labels');
  copy.append(el('span', '', values[0].label || ''), el('span', '', values.at(-1).label || ''));
  const box = el('div', 'project-chart'); box.append(svg, copy); return box;
}

function taskDetails(task, candidate = false) {
  const item = el('details', 'project-plan-task');
  const summary = el('summary', 'project-plan-task-summary');
  summary.append(el('code', '', task.id), el('span', `project-plan-status ${statusClass[task.status] || 'status-pending'}`, task.status), el('span', 'project-plan-task-title', task.title));
  item.append(summary);
  if (candidate) item.append(el('p', 'project-plan-question', task.question));
  else {
    const details = el('dl', 'project-plan-task-details');
    for (const [label, value] of [['依赖', task.dependencies || '无'], ['通过条件', task.acceptance || '—']]) {
      const row = el('div'); row.append(el('dt', '', label), el('dd', '', value)); details.append(row);
    }
    item.append(details);
  }
  return item;
}

function planDetails(plan, state) {
  const groups = (plan.groups || []).filter((group) => Array.isArray(group.tasks));
  const tasks = groups.flatMap((group) => group.tasks);
  const candidates = Array.isArray(plan.candidates) ? plan.candidates : [];
  const wrapper = el('details', 'project-plan-details');
  wrapper.open = state.open;
  wrapper.addEventListener('toggle', () => { state.open = wrapper.open; });
  wrapper.append(el('summary', 'project-plan-toggle', `查看完整计划 · ${number.format(tasks.length)} 项任务 · ${number.format(candidates.length)} 项待确认能力`));
  const controls = el('div', 'project-plan-controls');
  const search = el('input', 'project-plan-search');
  search.type = 'search'; search.placeholder = '搜索计划任务、依赖或验收条件'; search.setAttribute('aria-label', '搜索计划任务或候选能力'); search.value = state.query;
  const filter = el('select', 'project-plan-filter'); filter.setAttribute('aria-label', '按状态筛选计划任务');
  for (const [value, label] of [['全部', '全部状态'], ...planStatuses]) {
    const option = el('option', '', label); option.value = value; filter.append(option);
  }
  filter.value = state.status;
  controls.append(search, filter);
  const count = el('p', 'project-plan-result-count');
  const results = el('div', 'project-plan-results');
  function renderResults() {
    state.query = search.value; state.status = filter.value;
    const term = state.query.trim().toLocaleLowerCase('zh-CN');
    const match = (item) => (state.status === '全部' || item.status === state.status) && (!term || [item.id, item.title, item.status, item.dependencies, item.acceptance, item.question].some((value) => value?.toLocaleLowerCase('zh-CN').includes(term)));
    const visibleTaskCount = groups.reduce((sum, group) => sum + group.tasks.filter(match).length, 0);
    const visibleCandidates = candidates.filter(match);
    count.textContent = `显示 ${number.format(visibleTaskCount)} / ${number.format(tasks.length)} 项任务 · ${number.format(visibleCandidates.length)} / ${number.format(candidates.length)} 项候选能力`;
    results.replaceChildren();
    for (const group of groups) {
      const visible = group.tasks.filter(match);
      if (!visible.length) continue;
      const section = el('section', 'project-plan-group');
      const heading = el('div', 'project-plan-group-heading');
      heading.append(el('h4', '', group.title), el('span', '', `${number.format(visible.length)} / ${number.format(group.tasks.length)} 项`));
      section.append(heading);
      for (const task of visible) section.append(taskDetails(task));
      results.append(section);
    }
    if (visibleCandidates.length) {
      const section = el('section', 'project-plan-group project-plan-candidates');
      const heading = el('div', 'project-plan-group-heading');
      heading.append(el('h4', '', '待确认范围'), el('span', '', `${number.format(visibleCandidates.length)} 项 · 不计入正式任务进度`));
      section.append(heading);
      for (const candidate of visibleCandidates) section.append(taskDetails(candidate, true));
      results.append(section);
    }
    if (!visibleTaskCount && !visibleCandidates.length) results.append(el('p', 'project-empty', '没有匹配的计划内容，请调整关键词或状态。'));
    if (!tasks.length && !candidates.length) results.append(el('p', 'project-empty', '计划接口未提供任务明细。'));
  }
  search.addEventListener('input', renderResults); filter.addEventListener('change', renderResults);
  wrapper.append(controls, count, results);
  renderResults();
  return wrapper;
}

export function mountMetricsPanel(root, initialData = {}) {
  root.classList.add('metrics-panel');
  root.setAttribute('aria-label', 'OUGAONE 项目进度');
  const planUI = { open: false, query: '', status: '全部' };
  function render(data) {
    root.replaceChildren();
    const header = el('header', 'project-header');
    header.append(el('p', 'project-eyebrow', 'OUGAONE · PROJECT LOG'), el('h2', '', '从计划到产品'), el('p', 'project-intro', '记录每一步真实发生的变化。计划进度会自动同步主仓库。'));
    const updated = data.plan?.updatedAt ? new Date(data.plan.updatedAt) : null;
    header.append(el('p', 'project-updated', updated && !Number.isNaN(updated.getTime()) ? `计划同步于 ${new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeStyle: 'short' }).format(updated)}` : '正在连接项目计划…'));
    root.append(header);

    const summary = data.plan?.summary;
    const total = Number.isSafeInteger(summary?.total) ? summary.total : null;
    const done = Number.isSafeInteger(summary?.completed) ? summary.completed : null;
    root.append(el('p', 'project-section-label', '项目计划 · 主仓库实时数据'));
    const stats = el('div', 'project-stats');
    stats.append(card('计划任务', total === null ? '—' : number.format(total), '不含待确认能力'));
    stats.append(card('已完成', done === null ? '—' : number.format(done), total ? `${Math.round(done / total * 100)}% · 计划任务完成率` : '等待计划数据'));
    const features = data.plan?.features;
    stats.append(card('功能进度', features ? number.format(features.completed) + '/' + number.format(features.total) : '—', '每项交付解锁建筑细节'));
    root.append(stats);
    if (total === null) root.append(el('p', 'project-notice', data.errors?.plan || '计划数据暂不可用；恢复连接后会自动重试。'));
    const groups = data.plan?.groups || [];
    if (groups.length) {
      const section = el('section', 'project-section'); section.append(el('h3', '', '计划章节'));
      for (const group of groups) {
        const row = el('div', 'project-group');
        const counts = statuses.filter(([key]) => group.summary?.[key]).map(([key, label]) => `${label} ${number.format(group.summary[key])}`).join(' · ');
        row.append(el('span', '', group.title), el('span', 'project-group-count', `${number.format(group.summary.total || 0)} 项 · ${counts || '暂无任务'}`));
        section.append(row);
      }
      section.append(el('p', 'project-note', '待确认能力 ' + number.format(data.plan.candidateCount || 0) + ' 项；计划任务每完成 10% 增加一层，已交付功能逐项点亮建筑。'));
      section.append(el('p', 'project-note', '计划任务状态不等同于业务上线状态。'));
      root.append(section);
      if (data.plan.nextAction) {
        const next = el('section', 'project-next-action');
        next.append(el('span', 'project-next-label', '当前下一步'), el('p', '', data.plan.nextAction));
        root.append(next);
      }
      root.append(planDetails(data.plan, planUI));
    }

    const code = data.code;
    const codeSection = el('section', 'project-section'); codeSection.append(el('h3', '', '代码生长'), el('p', 'project-note', '只统计 OUGAONE 新项目 apps/web 与 apps/api。'));
    const codeStats = el('div', 'project-stats project-stats--compact');
    codeStats.append(card('源码文件', code ? number.format(code.files) : '—', '前后端新应用'));
    codeStats.append(card('源码体积', code ? `${(code.bytes / 1024).toFixed(0)} KB` : '—', 'GitHub 当前版本'));
    codeStats.append(card('近 30 日提交', code ? number.format(code.commits) : '—', '只含新应用路径'));
    codeSection.append(codeStats);
    if (code) {
      codeSection.append(el('p', 'project-code-diff', `近 30 日 +${number.format(code.additions)} / −${number.format(code.deletions)} 行`));
      codeSection.append(chart(code.daily, 'additions', '近 30 日代码新增行数'));
    } else codeSection.append(el('p', 'project-empty', data.errors?.code || '代码数据等待连接 GitHub。'));
    root.append(codeSection);

    const traffic = data.traffic;
    const trafficSection = el('section', 'project-section'); trafficSection.append(el('h3', '', '访客到访'), el('p', 'project-note', 'Umami 自托管统计 · 最近 30 天'));
    const trafficStats = el('div', 'project-stats project-stats--compact');
    trafficStats.append(card('访客', traffic ? number.format(traffic.visitors) : '—', '匿名去重访客'));
    trafficStats.append(card('浏览量', traffic ? number.format(traffic.pageviews) : '—', '页面浏览次数'));
    trafficStats.append(card('访问次数', traffic ? number.format(traffic.visits) : '—', '会话次数'));
    trafficSection.append(trafficStats);
    if (traffic) trafficSection.append(chart(traffic.daily, 'pageviews', '近 30 天每日浏览量'));
    else trafficSection.append(el('p', 'project-empty', data.errors?.traffic || '接入 Umami 后自动显示访问量。'));
    root.append(trafficSection);

    const footer = el('footer', 'project-footer');
    footer.append(el('span', '', '独立项目进度看板'), el('a', '', '查看 OUGAONE 仓库 ↗'));
    footer.querySelector('a').href = 'https://github.com/ericlokz/OUGAONE';
    footer.querySelector('a').target = '_blank'; footer.querySelector('a').rel = 'noopener noreferrer';
    root.append(footer);
  }
  render(initialData);
  return { update: render };
}
