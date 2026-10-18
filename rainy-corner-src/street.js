export function buildStreet(ctx) {
  const { THREE, scene, mat, box, cyl, tube, panel, label, glow } = ctx;
  const metal = mat('#33424d');
  const dark = mat('#182936');
  const steel = mat('#859aa2');
  const ivory = mat('#dddaca');
  const charcoal = mat('#28343b');
  const pale = mat('#b7c7ca');
  const teal = mat('#2e797d');
  const coral = mat('#a95850');
  const yellow = mat('#dfb96e');
  const white = mat('#e0e6d7');
  const black = mat('#152129');
  const rubber = mat('#253139');
  const chrome = mat('#a0b4b8');
  const cyanLit = mat('#b8ecdc', { emissive: '#79d8bb', intensity: .48 });
  const warmLit = mat('#fff0c2', { emissive: '#ffd891', intensity: .75 });
  const clear = mat('#679fa7', { transparent: true, opacity: .48 });
  // Lift each complete prop, including its labels, cables and light sprites.
  function groundSection(offset) {
    const first = scene.children.length;
    return () => {
      for (let i = first; i < scene.children.length; i++) scene.children[i].position.y += offset;
    };
  }

  // A practical umbrella stand: folded umbrellas have faceted cloth and hooks.
  const groundUmbrellas = groundSection(.20);
  const rackX = -4.18;
  const rackZ = 1.14;
  box(.56, .055, .285, rackX, .205, rackZ, dark, true);
  for (const x of [rackX - .235, rackX + .235]) {
    for (const z of [rackZ - .112, rackZ + .112]) cyl(.013, .013, .46, x, .435, z, chrome, 8);
  }
  tube([[rackX-.255,.63,rackZ-.13],[rackX+.255,.63,rackZ-.13],[rackX+.255,.63,rackZ+.13],[rackX-.255,.63,rackZ+.13],[rackX-.255,.63,rackZ-.13]], .014, chrome);
  const umbrellaMats = [mat('#668493'), mat('#ad7979'), mat('#9eac95'), mat('#d4d7c6')];
  for (let i = 0; i < 4; i++) {
    const x = rackX - .17 + i * .115;
    const z = rackZ + (i % 2 ? .04 : -.025);
    const body = cyl(.027, .067, .55, x, .53, z, umbrellaMats[i], 7, false);
    body.rotation.z = (i - 1.5) * .035;
    cyl(.009, .009, .76, x, .57, z, chrome, 6);
    const pts = [];
    for (let j = 0; j <= 10; j++) {
      const a = Math.PI * j / 10;
      pts.push([x + .035 - .035 * Math.cos(a), .954 + .035 * Math.sin(a), z]);
    }
    tube(pts, .01, i === 3 ? ivory : dark);
    box(.048, .018, .047, x, .635, z, dark, false);
  }
  groundUmbrellas();

  // A small city bicycle, with actual wheel rings, spokes and frame tubing.
  const bike = new THREE.Group();
  scene.add(bike);
  bike.position.set(-4.64, .33, 1.54);
  bike.rotation.z = -.045;
  const bikePaint = mat('#9b6c58');
  function bt(points, radius, material = bikePaint) { return tube(points, radius, material, bike); }
  const rear = [-.35,.38,0];
  const front = [.42,.38,0];
  for (const cx of [-.35,.42]) {
    const tire = new THREE.Mesh(new THREE.TorusGeometry(.315, .028, 6, 28), rubber);
    tire.position.set(cx,.38,0); bike.add(tire);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(.281,.009,5,28), chrome);
    rim.position.copy(tire.position); bike.add(rim);
    const hub = cyl(.033,.033,.065,cx,.38,0,chrome,10,false,bike);
    hub.rotation.x = Math.PI/2;
    for (let s=0;s<10;s++) {
      const a = s*Math.PI*2/10;
      bt([[cx,.38,.015],[cx+Math.cos(a)*.277,.38+Math.sin(a)*.277,.015]],.004,steel);
    }
    // A slender arc of painted mudguard hugs the tyre.
    const arc = [];
    for (let j=0;j<=16;j++) {
      const a = .05 + Math.PI*.94*j/16;
      arc.push([cx+Math.cos(a)*.349,.38+Math.sin(a)*.349,0]);
    }
    bt(arc,.017,ivory);
  }
  const crank = [-.075,.38,0];
  const seatJoint = [-.19,.76,0];
  const head = [.21,.76,0];
  bt([rear,seatJoint,crank,rear],.021);
  bt([seatJoint,head,crank],.023);
  bt([head,[.27,.90,0]],.025);
  bt([[.25,.79,-.035],[.43,.38,-.035]],.018,chrome);
  bt([[.25,.79,.035],[.43,.38,.035]],.018,chrome);
  bt([seatJoint,[-.23,.88,0]],.016,chrome);
  box(.22,.055,.145,-.235,.902,0,dark,true,bike);
  bt([[.27,.88,0],[.26,1.02,0],[.245,1.04,-.145]],.015,chrome);
  bt([[.26,1.02,0],[.245,1.04,.145]],.015,chrome);
  bt([[.245,1.04,-.145],[.19,1.035,-.17]],.022,dark);
  bt([[.245,1.04,.145],[.19,1.035,.17]],.022,dark);
  const gear = cyl(.065,.065,.032,crank[0],crank[1],.033,dark,14,false,bike);
  gear.rotation.x = Math.PI/2;
  bt([[-.35,.38,.055],[-.075,.445,.055],[-.01,.38,.055],[-.075,.315,.055],[-.35,.38,.055]],.009,steel);
  bt([[-.075,.38,.045],[-.005,.295,.09]],.011,chrome);
  box(.085,.019,.064,-.005,.288,.09,dark,false,bike);
  bt([[-.10,.39,0],[-.24,.035,.095]],.012,steel);
  // Wire basket, light and rear rack provide the everyday neighborhood detail.
  box(.245,.035,.275,.40,.90,0,metal,false,bike);
  for (const x of [.275,.525]) for (const z of [-.135,.135]) bt([[x,.91,z],[x,1.105,z]],.009,steel);
  for (let row=0;row<4;row++) {
    const y=.936+row*.052;
    bt([[.275,y,-.135],[.525,y,-.135],[.525,y,.135],[.275,y,.135],[.275,y,-.135]],.006,steel);
  }
  for(let j=1;j<5;j++) {
    const x=.275+j*.05;
    bt([[x,.92,-.135],[x,1.1,-.135]],.005,steel);
    bt([[x,.92,.135],[x,1.1,.135]],.005,steel);
  }
  box(.30,.024,.16,-.39,.765,0,steel,false,bike);
  bt([[-.52,.77,-.06],[-.35,.42,-.06]],.012,steel);
  bt([[-.52,.77,.06],[-.35,.42,.06]],.012,steel);
  const cycleLamp = cyl(.036,.036,.055,.55,.77,0,warmLit,10,false,bike);
  cycleLamp.rotation.z = -Math.PI/2;
  box(.025,.055,.075,-.67,.48,0,coral,false,bike);

  // Bent-neck neighborhood lamp with a warm, soft pool of light.
  const groundLamp = groundSection(.20);
  const lampX=3.02, lampZ=2.05;
  cyl(.13,.16,.14,lampX,.23,lampZ,dark,10,true);
  cyl(.075,.087,3.72,lampX,2.11,lampZ,metal,10,true);
  cyl(.087,.087,.065,lampX,3.81,lampZ,steel,10);
  tube([[lampX,3.96,lampZ],[lampX,4.15,lampZ],[lampX+.09,4.22,lampZ],[lampX+.29,4.22,lampZ],[lampX+.36,4.13,lampZ]],.045,metal);
  box(.55,.12,.29,lampX+.36,4.09,lampZ,metal,true);
  box(.48,.035,.246,lampX+.36,4.018,lampZ,warmLit,false);
  glow(lampX+.36,3.99,lampZ,'#ffd69a',.55,.12);
  const lampLight=new THREE.PointLight('#ffcf8b',2.6,7.4,2);
  lampLight.position.set(lampX+.36,3.93,lampZ);
  scene.add(lampLight);
  // A small address plate attached low enough to keep the silhouette clean.
  label(.25,.29,lampX+.003,2.47,lampZ+.085,'三丁目\n  7', '#364a59','#cbd5ca');
  groundLamp();

  // Both poles and every cable stay in the rear alley, clear of the shop.
  const groundPoles = groundSection(.11);
  const concrete = mat('#778b92');
  function utilityPole(x,z,height) {
    const pole = cyl(.085,.127,height,x,.15+height/2,z,concrete,10,true);
    pole.name = 'rear-utility-pole';
    cyl(.165,.165,.14,x,.24,z,dark,10);
    for(const y of [1.02,2.02,height-.52]) cyl(.128,.128,.045,x,y,z,dark,10);
    box(.115,.11,1.10,x,height-.17,z,metal,true);
    for(const dz of [-.41,0,.41]) {
      cyl(.021,.022,.19,x,height-.02,z+dz,steel,8);
      for(let j=0;j<3;j++) cyl(.045,.045,.034,x,height+.022+j*.037,z+dz,ivory,10);
    }
    box(.23,.33,.15,x,height-1.20,z+.14,metal,true);
    tube([[x+.12,height-1.05,z+.16],[x+.20,height-.6,z+.18],[x,height-.27,z+.1]],.013,dark);
  }
  const rightPole = { x: 4.12, z: -5.16, height: 5.34 };
  const leftPole = { x: -5.08, z: -5.24, height: 4.94 };
  utilityPole(rightPole.x, rightPole.z, rightPole.height);
  utilityPole(leftPole.x, leftPole.z, leftPole.height);
  for(const dz of [-.41,0,.41]) {
    const points=[];
    for(let j=0;j<=24;j++) {
      const t=j/24;
      points.push([
        rightPole.x + (leftPole.x-rightPole.x)*t,
        rightPole.height + .12 + (leftPole.height-rightPole.height)*t - Math.sin(Math.PI*t)*.49,
        rightPole.z + (leftPole.z-rightPole.z)*t + dz,
      ]);
    }
    const cable = tube(points,.013,dark);
    cable.name = 'rear-power-cable';
  }
  label(.22,.37,rightPole.x-.001,1.85,rightPole.z+.139,'町内\n防犯', '#e4dbbc','#445d65');
  groundPoles();

  // Subtle traffic signal at the turn, with independent illuminated lenses.
  const groundSignal = groundSection(.11);
  const signalX=4.83, signalZ=3.99;
  cyl(.088,.109,.13,signalX,.23,signalZ,dark,10,true);
  cyl(.045,.055,2.43,signalX,1.41,signalZ,steel,10,true);
  tube([[signalX,2.65,signalZ],[signalX,2.81,signalZ],[signalX-.15,2.86,signalZ]],.035,steel);
  box(.79,.28,.20,signalX-.15,2.79,signalZ,metal,true);
  const signalMaterials = [
    mat('#82cfaf',{emissive:'#51b397',intensity:.65}),
    mat('#bd9259',{emissive:'#e5b455',intensity:.08}),
    mat('#a34f50',{emissive:'#da635c',intensity:.08}),
  ];
  for(let i=0;i<3;i++) {
    const x=signalX-.40+i*.25;
    const bezel=cyl(.107,.107,.033,x,2.79,signalZ+.111,dark,14);
    bezel.rotation.x=Math.PI/2;
    const lens=cyl(.082,.082,.036,x,2.79,signalZ+.133,signalMaterials[i],14);
    lens.rotation.x=Math.PI/2;
    box(.207,.035,.23,x,2.913,signalZ+.145,metal,false);
    box(.03,.148,.19,x-.099,2.855,signalZ+.135,metal,false);
    box(.03,.148,.19,x+.099,2.855,signalZ+.135,metal,false);
  }
  label(.49,.13,signalX-.15,2.50,signalZ+.065,'一方通行  →','#416279','#e3e6cd');
  groundSignal();

  // Short white rails trace the side road, with dark feet and reflectors.
  const groundRails = groundSection(.11);
  const railMat=mat('#bccbca');
  function guardRail(z0,z1) {
    const x=5.58;
    for(const z of [z0,z1]) {
      cyl(.076,.095,.08,x,.195,z,dark,9);
      cyl(.041,.049,.72,x,.59,z,railMat,9,true);
      cyl(.052,.052,.035,x,.967,z,ivory,9);
    }
    for(const y of [.53,.84]) tube([[x,y,z0],[x,y,z1]],.035,railMat);
    for(const z of [z0,z1]) box(.018,.091,.07,x-.045,.80,z,yellow,false);
  }
  guardRail(-1.16,.90);
  guardRail(2.59,4.51);
  groundRails();

  // Local direction signs point to nearby Shunde neighbourhoods.
  const groundSigns = groundSection(.21);
  cyl(.032,.038,2.12,3.13,1.14,-.39,steel,9,true);
  const destinations=[
    ['容桂街道  →',2.03,'#2e797d','#e6e8d6'],
    ['大福基  ←',1.80,'#536e62','#eee5ce'],
    ['穗香  ↑',1.57,'#8d6955','#f0e3c9'],
    ['红旗  →',1.34,'#687c85','#e8eadb'],
  ];
  for(const [text,y,bg,fg] of destinations){
    box(.99,.19,.035,3.13,y,-.39,teal,true);
    label(.93,.15,3.13,y,-.365,text,bg,fg);
  }
  const mirror=new THREE.Mesh(new THREE.SphereGeometry(.175,18,10,0,Math.PI*2,0,Math.PI/2),mat('#98bac0'));
  mirror.rotation.x=Math.PI/2;
  mirror.position.set(3.13,2.47,-.33); scene.add(mirror);
  const mirrorRim=new THREE.Mesh(new THREE.TorusGeometry(.176,.018,6,24),coral);
  mirrorRim.position.set(3.13,2.47,-.32); scene.add(mirrorRim);
  box(.42,.11,.037,3.13,2.24,-.39,ivory,true);
  label(.36,.074,3.13,2.24,-.365,'减速慢行','#dddaca','#526779');
  groundSigns();

  // The alley board mirrors tasks marked in progress on the live OUGAONE plan.
  const groundBoard = groundSection(.10);
  const boardX=-5.24,boardZ=-.57;
  for(const x of [boardX-.27,boardX+.27]) box(.045,1.10,.055,x,.72,boardZ,metal,true);
  box(.66,.77,.075,boardX,1.09,boardZ,dark,true);
  let activeTasks=null;
  const drawTasks=(c,w,h)=>{
    c.fillStyle='#bcc7b5';c.fillRect(0,0,w,h);
    c.fillStyle='#385e67';c.fillRect(0,0,w,h*.18);
    c.fillStyle='#f0e7d0';c.font=`bold ${h*.092}px sans-serif`;c.textAlign='center';c.textBaseline='middle';
    c.fillText('计划 · 进行中',w*.5,h*.09);
    c.textAlign='left';
    const tasks=activeTasks?.slice(0,3)||[];
    const fit=(value,maxWidth)=>{
      let text=String(value);
      while(text&&c.measureText(text).width>maxWidth)text=text.slice(0,-1);
      return text===String(value)?text:text.slice(0,-1)+'…';
    };
    if(!tasks.length){
      c.fillStyle='#385e67';c.font=`bold ${h*.075}px sans-serif`;
      c.fillText(activeTasks===null?'计划数据暂不可用':'当前没有进行中的任务',w*.07,h*.50);
      c.fillStyle='#788775';c.font=`${h*.045}px sans-serif`;
      c.fillText(activeTasks===null?'正在等待自动重试':'计划数据每分钟自动更新',w*.07,h*.64);
      return;
    }
    const rowH=h*.245;
    tasks.forEach((task,index)=>{
      const y=h*.20+index*rowH;
      c.fillStyle=index%2?'#e4e4d1':'#e9ddb8';
      c.fillRect(w*.045,y,w*.91,rowH-h*.018);
      c.fillStyle='#8b5348';c.font=`bold ${h*.052}px sans-serif`;
      c.fillText(fit(task.id||'',w*.82),w*.075,y+h*.068);
      c.fillStyle='#3e554d';c.font=`bold ${h*.052}px sans-serif`;
      const title=fit(task.title||'',w*.82);
      c.fillText(title,w*.075,y+h*.151);
    });
    c.fillStyle='#546d5c';c.font=`${h*.038}px sans-serif`;
    c.fillText('点击查看计划状态',w*.07,h*.96);
  };
  const notice=panel(.57,.67,boardX,1.09,boardZ+.041,(c,w,h)=>drawTasks(c,w,h));
  function setActiveTasks(tasks){
    activeTasks=Array.isArray(tasks)?tasks.filter(task=>task&&typeof task.title==='string').slice(0,3):null;
    const canvas=notice.material.map.image;
    drawTasks(canvas.getContext('2d'),canvas.width,canvas.height);
    notice.material.map.needsUpdate=true;
  }
  box(.73,.07,.22,boardX,1.515,boardZ,metal,true);
  groundBoard();

  notice.userData.interactive='plan-status';
  return { signalMaterials, lampLight, noticeBoard:notice, setActiveTasks };
}
