// A tiny neighbourhood flower shop and project workshop, built from geometry and canvas labels.
export function buildHardware(ctx){
  const {THREE,scene,mat,box,cyl,tube,panel,label,glow,rng}=ctx;
  const group=new THREE.Group();group.name='OUGAONE flower shop and project workshop';scene.add(group);
  const lights=[],glowMaterials=[],unlitPanels=[],glassStreakMaterials=[],doors=[],lampMeshes=[];
  const cream=mat('#d8cbb7'),creamLight=mat('#eadcc3'),plasterShade=mat('#b6a895');
  const burgundy=mat('#596f62'),redShade=mat('#465a50'),brickRed=mat('#78917a');
  const bronze=mat('#443d3a'),metal=mat('#9c9b95'),steel=mat('#b6b4a5'),wood=mat('#b69c76');
  const dark=mat('#363d43'),shelf=mat('#c3b79b'),paper=mat('#e7ddc2');
  const B=(w,h,d,x,y,z,m,outline=true,parent=group)=>box(w,h,d,x,y,z,m,outline,parent);
  const C=(rt,rb,h,x,y,z,m,segments=12,outline=false,parent=group)=>cyl(rt,rb,h,x,y,z,m,segments,outline,parent);
  const T=(pts,r,m,parent=group)=>tube(pts,r,m,parent);
  const P=(w,h,x,y,z,draw,opts={})=>{const o=panel(w,h,x,y,z,draw,{parent:group,...opts});unlitPanels.push(o);return o;};
  const L=(w,h,x,y,z,text,bg='#e7dcc0',fg='#67493f',opts={})=>{const o=label(w,h,x,y,z,text,bg,fg,{parent:group,...opts});unlitPanels.push(o);return o;};
  const emissive=(color,power=1)=>{const m=mat(color,{emissive:color,emissiveIntensity:power});glowMaterials.push(m);return m;};
  const light=(color,power,dist,x,y,z)=>{const l=new THREE.PointLight(color,power,dist,2);l.position.set(x,y,z);group.add(l);lights.push(l);return l;};
  const halo=(x,y,z,color,size,opacity)=>{const o=glow(x,y,z,color,size,opacity);lampMeshes.push(o);return o;};

  // Foundation and two stacked storeys follow the compact proportions of the reference.
  B(5.56,.13,4.43,-1.10,.435,-1.48,mat('#a39786'));
  B(5.37,.075,4.13,-1.10,.53,-1.48,mat('#c2b29a'),false);
  B(5.4,2.13,.14,-1.1,1.56,-3.57,redShade);
  B(.16,2.13,4.1,-3.73,1.56,-1.48,burgundy);
  // Leave the entrance clear down to its step instead of running the window
  // plinth through the doorway and through customers' legs.
  B(3.012,.29,.21,-2.324,.68,.64,burgundy);
  B(1.022,.29,.21,1.119,.68,.64,burgundy);
  B(.21,.29,4.23,1.61,.68,-1.43,burgundy);
  B(5.5,.30,4.3,-1.1,2.82,-1.47,burgundy);
  B(5.50,.055,4.35,-1.1,2.988,-1.47,brickRed,false);
  B(5.29,.12,4.10,-1.1,3.01,-1.48,wood,false);
  B(5.34,2.27,.17,-1.1,4.18,-3.56,cream);
  B(.17,2.27,4.16,-3.71,4.18,-1.48,cream);
  B(5.46,.18,4.32,-1.1,5.40,-1.47,plasterShade);
  B(5.15,.04,4.03,-1.1,5.50,-1.47,new THREE.MeshLambertMaterial({color:'#a59c8e'}),false);
  // Parapet is an open rim; the flat roof remains a real inset surface.
  for(const z of [-3.68,.74])B(5.73,.32,.20,-1.1,5.64,z,plasterShade);
  for(const x of [-3.87,1.67])B(.20,.32,4.52,x,5.64,-1.47,plasterShade);
  for(const z of [-3.69,.75])B(5.77,.07,.23,-1.1,5.83,z,creamLight,false);
  for(const x of [-3.88,1.68])B(.23,.07,4.58,x,5.83,-1.47,creamLight,false);
  for(const x of [-2.9,-1.25,.40])B(.01,.008,3.92,x,5.525,-1.46,mat('#91897f'),false);
  C(.23,.25,.80,-2.94,5.94,-2.72,mat('#8c8375'),14,true);
  C(.33,.33,.12,-2.94,6.26,-2.72,cream,14,true);
  C(.235,.235,.12,-2.94,6.40,-2.72,dark,14,false);
  C(.34,.34,.20,-2.94,6.55,-2.72,creamLight,8,true);
  B(.61,.05,.53,.64,5.56,-2.90,mat('#8b8378'));
  B(.07,.025,.20,.80,5.604,-2.90,bronze,false);

  // Cream upstairs front: broad workshop window with bronze mullions.
  B(.29,2.26,.24,-3.66,4.18,.57,cream);
  B(1.19,2.26,.24,1.02,4.18,.57,cream);
  B(4.12,.38,.24,-1.51,3.23,.57,cream);
  B(4.12,.39,.24,-1.51,5.14,.57,cream);
  B(4.11,.10,.36,-1.51,3.475,.66,creamLight);
  const glass=new THREE.MeshPhysicalMaterial({color:'#dbe4dd',transparent:true,opacity:.055,roughness:.22,metalness:.03,depthWrite:false,side:THREE.DoubleSide});
  function glaze(w,h,x,y,z,ry=0,parent=group){
    const o=new THREE.Mesh(new THREE.PlaneGeometry(w,h),glass);o.position.set(x,y,z);o.rotation.y=ry;parent.add(o);
    const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,
      uniforms:{time:{value:0},wetness:{value:1}},
      vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:`varying vec2 v;uniform float time;uniform float wetness;
        float h(float n){return fract(sin(n*57.43)*8437.1);}void main(){float k=floor(v.x*40.);float r=h(k);
        float trail=mod(v.y-fract(r-time*(.017+r*.033))+1.,1.);float path=fract(v.x*40.+sin(v.y*16.+k)*.08);
        float a=(1.-smoothstep(.018,.052,abs(path-(.2+r*.6))))*(1.-smoothstep(0.,.28,trail))*.19*wetness;
        gl_FragColor=vec4(.78,.88,.90,a);}`});
    const streak=new THREE.Mesh(o.geometry,m);streak.position.copy(o.position);streak.position.x+=Math.sin(ry)*.006;streak.position.z+=Math.cos(ry)*.006;streak.rotation.copy(o.rotation);parent.add(streak);glassStreakMaterials.push(m);return o;
  }
  function frontFrame(w,h,x,y,z,subdivide=true){
    for(const dx of [-w/2,w/2])B(.085,h+.08,.105,x+dx,y,z,bronze);
    for(const dy of [-h/2,h/2])B(w+.09,.085,.105,x,y+dy,z,bronze);
    if(subdivide){B(w,.073,.105,x,y+.31,z,bronze);for(const dx of [-w*.28,w*.28])B(.072,h,.105,x+dx,y,z,bronze);}
  }
  glaze(3.92,1.57,-1.51,4.29,.72);frontFrame(3.94,1.60,-1.51,4.29,.728);
  // Two tall side windows with divided lights.
  B(.23,2.28,.35,1.53,4.18,.47,cream);
  B(.23,2.28,.35,1.53,4.18,-3.44,cream);
  B(.23,2.28,.63,1.53,4.18,-1.48,cream);
  B(.23,.43,4.0,1.53,3.25,-1.48,cream);
  B(.23,.32,4.0,1.53,5.20,-1.48,cream);
  for(const z of [-.49,-2.46]){
    glaze(1.26,1.67,1.67,4.29,z,Math.PI/2);
    for(const dz of [-.66,.66])B(.11,1.78,.072,1.68,4.29,z+dz,bronze);
    for(const y of [3.43,4.60,5.14])B(.11,.07,1.37,1.68,y,z,bronze);
    B(.11,1.69,.062,1.68,4.29,z,bronze);
    B(.37,.09,1.48,1.69,3.39,z,creamLight);
  }
  // Slight raised brick/scoring detail; neutral rather than noisy texture.
  const bricks=[[-3.53,4.72,.51],[-3.39,3.65,.35],[.65,4.90,.59],[.94,3.61,.56],[1.3,4.31,.33]];
  for(const [x,y,w] of bricks)B(w,.07,.016,x,y,.702,plasterShade,false);
  for(const [z,y,d] of [[.21,4.74,.38],[-1.43,4.61,.48],[-3.12,3.87,.55],[-1.47,3.66,.38]])B(.016,.073,d,1.662,y,z,plasterShade,false);
  for(let row=0;row<7;row++){
    B(.011,.011,4.01,-3.822,.82+row*.25,-1.47,redShade,false);
    B(5.18,.011,.011,-1.1,.82+row*.25,-3.653,brickRed,false);
    for(let n=0;n<5;n++)B(.012,.23,.012,-3.823,.94+row*.25,-3.43+n*.89+(row%2)*.44,redShade,false);
  }

  // Burgundy ground-floor posts enclose almost uninterrupted shop glazing.
  for(const x of [-3.63,-.91,.70,1.48])B(.24,1.90,.26,x,1.72,.63,burgundy);
  B(5.40,.12,.24,-1.1,2.64,.63,brickRed);
  for(const [w,x] of [[2.44,-2.27],[.55,1.10]]){
    glaze(w,1.72,x,1.74,.775);frontFrame(w,1.76,x,1.74,.773,false);
    B(w+.13,.09,.34,x,.83,.73,redShade);
  }
  B(.24,1.91,.24,1.48,1.72,-3.44,burgundy);
  B(.24,1.91,.18,1.48,1.72,-1.46,burgundy);
  for(const z of [-.43,-2.47]){
    glaze(1.81,1.76,1.624,1.73,z,Math.PI/2);
    for(const dz of [-.92,.92])B(.09,1.87,.068,1.633,1.74,z+dz,bronze);
    for(const y of [.83,2.63])B(.09,.078,1.86,1.633,y,z,bronze);
  }
  // Double glass doors swing outward around their fixed left and right brass hinges.
  const hingeBrass=mat('#aa9470');
  for(let i=0;i<2;i++){
    const direction=i===0?-1:1,hingeX=i===0?-.79:.58,centreX=i===0?.3425:-.3425;
    const door=new THREE.Group();door.position.set(hingeX,0,.80);group.add(door);doors.push(door);
    door.name=i===0?'left outward hinged glass door':'right outward hinged glass door';
    door.userData.openDirection=direction;door.userData.closedAngle=0;door.userData.openAngle=THREE.MathUtils.degToRad(80);
    // Every part is local to its hinge so the glass, handles and notices turn together.
    glaze(.60,1.81,centreX,1.60,.005,0,door);
    for(const dx of [-.318,.318])B(.044,1.90,.063,centreX+dx,1.60,.002,bronze,true,door);
    for(const y of [.674,2.526])B(.68,.048,.063,centreX,y,.002,bronze,true,door);
    B(.043,.35,.043,i===0?.616:-.616,1.45,.072,steel,false,door);
    for(const y of [1.30,1.60])B(.039,.035,.065,i===0?.616:-.616,y,.046,steel,false,door);
    L(.28,.20,centreX,1.90,.039,'OUGAONE','#e7dac1','#91474c',{parent:door});
    L(.30,.11,centreX,1.68,.041,'BUILD & SHIP','#e8dbc4','#745e53',{parent:door});
    for(const y of [.92,1.60,2.28])C(.026,.026,.112,hingeX,y,.806,hingeBrass,10,true);
  }
  for(const x of [-.818,.608])B(.054,1.95,.079,x,1.60,.79,bronze);
  B(1.47,.10,.18,-.105,2.60,.79,bronze);
  B(1.37,.041,.145,-.105,.622,.79,steel,false);
  B(.11,.035,.045,-.105,2.674,.90,dark,false);
  B(1.51,.025,.69,-.105,.524,1.09,mat('#6a6660'));
  for(let x=-.79;x<.59;x+=.085)B(.020,.012,.58,x,.543,1.10,mat('#8c7e6a'),false);

  // A permanent striped rain awning shelters the outward-swinging entrance doors.
  const awning={x:-.105,width:2.35,zBack:.86,zFront:1.76,yBack:2.85,yFront:2.73};
  const awningGroup=new THREE.Group();awningGroup.name='entrance-red-white-awning';group.add(awningGroup);
  const stripeMaterials=[mat('#718976'),mat('#eee2c8')];
  const awningAngle=Math.atan2(awning.yBack-awning.yFront,awning.zFront-awning.zBack);
  const awningDepth=Math.hypot(awning.zFront-awning.zBack,awning.yBack-awning.yFront);
  const stripeWidth=awning.width/10;
  for(let i=0;i<10;i++){
    const x=awning.x-awning.width/2+stripeWidth*(i+.5),m=stripeMaterials[i%2];
    const stripe=B(stripeWidth,.029,awningDepth,x,(awning.yBack+awning.yFront)/2-.015,(awning.zBack+awning.zFront)/2,m,false,awningGroup);
    stripe.rotation.x=awningAngle;
    const hem=new THREE.Shape();
    hem.moveTo(-stripeWidth/2,0);hem.lineTo(stripeWidth/2,0);hem.lineTo(stripeWidth/2,-.045);
    hem.quadraticCurveTo(0,-.115,-stripeWidth/2,-.045);hem.closePath();
    const valance=new THREE.Mesh(new THREE.ExtrudeGeometry(hem,{depth:.016,bevelEnabled:false,curveSegments:8}),m);
    valance.position.set(x,awning.yFront,awning.zFront-.006);valance.castShadow=true;valance.receiveShadow=true;awningGroup.add(valance);
  }
  const awningMetal=mat('#66554a');
  B(awning.width+.06,.042,.04,awning.x,awning.yBack-.033,awning.zBack,awningMetal,false,awningGroup);
  B(awning.width+.02,.022,.025,awning.x,awning.yFront-.025,awning.zFront-.015,awningMetal,false,awningGroup);
  for(const side of [-1,1]){
    const x=awning.x+side*(awning.width/2-.022);
    T([[x,2.735,.835],[x,2.71,1.03],[x,2.687,1.67]],.016,awningMetal,awningGroup);
    T([[x,2.40,.819],[x,2.70,1.48],[x,2.71,1.63]],.015,awningMetal,awningGroup);
    B(.07,.25,.04,x,2.58,.817,awningMetal,false,awningGroup);
  }

  // All brand faces use the same lowercase OUGAONE wordmark.
  const signBox=B(2.80,.66,.18,awning.x,3.205,.893,emissive('#eee0c6',.16));
  const signPanel=P(2.67,.56,awning.x,3.205,.989,(c,W,H)=>{
    c.fillStyle='#f0e3cc';c.fillRect(0,0,W,H);c.strokeStyle='#934750';c.lineWidth=H*.055;c.strokeRect(H*.035,H*.035,W-H*.07,H-H*.07);
    c.fillStyle='#97464d';c.textAlign='center';c.textBaseline='middle';c.font=`800 ${H*.78}px Arial,sans-serif`;c.fillText('OUGAONE',W/2,H*.50);
  });
  // Perpendicular little bracket sign mirrors the reference's vertical lightbox.
  B(.36,.105,.16,-3.87,4.76,.66,bronze);B(.36,.105,.16,-3.87,3.66,.66,bronze);
  B(.49,1.17,.15,-4.00,4.19,.78,bronze);
  B(.39,1.03,.10,-4.00,4.19,.821,emissive('#edddbf',.30),false);
  P(.37,.99,-4.00,4.19,.878,(c,W,H)=>{
    c.fillStyle='#ede0c4';c.fillRect(0,0,W,H);c.fillStyle='#95454c';c.textAlign='center';c.textBaseline='middle';c.save();c.translate(W/2,H/2);c.rotate(-Math.PI/2);c.font=`800 ${W*.62}px Arial,sans-serif`;c.fillText('OUGAONE',0,0);c.restore();
  });
  L(1.05,.29,1.746,2.91,-2.11,'OUGAONE','#ddc9ac','#893f48',{rotY:Math.PI/2});

  // Hardware stock uses real silhouettes, repeated small packages are instanced.
  const matrices=new Map(),instances=[];
  function stock(w,h,d,x,y,z,m,rz=0){
    const key=[w,h,d,m.uuid].join('|');if(!matrices.has(key))matrices.set(key,{geometry:new THREE.BoxGeometry(w,h,d),material:m,list:[]});
    const o=new THREE.Object3D();o.position.set(x,y,z);o.rotation.z=rz;o.updateMatrix();matrices.get(key).list.push(o.matrix.clone());
  }
  function ring(x,y,z,r,thick,material,parent=group,arc=Math.PI*2){
    const o=new THREE.Mesh(new THREE.TorusGeometry(r,thick,6,18,arc),material);o.position.set(x,y,z);parent.add(o);return o;
  }
  function wrench(x,y,z,size=1,angle=0,parent=group){
    const g=new THREE.Group();g.position.set(x,y,z);g.rotation.z=angle;g.scale.setScalar(size);parent.add(g);
    B(.065,.48,.038,0,0,0,steel,false,g);
    const head=ring(0,.255,.01,.115,.034,steel,g,Math.PI*1.60);head.rotation.z=Math.PI*.20;
    ring(0,-.245,.012,.068,.029,steel,g);
    B(.017,.26,.040,0,-.02,.009,metal,false,g);return g;
  }
  function hammer(x,y,z,size=1,angle=0,parent=group){
    const g=new THREE.Group();g.position.set(x,y,z);g.rotation.z=angle;g.scale.setScalar(size);parent.add(g);
    B(.061,.49,.055,0,0,0,mat('#a67753'),false,g);B(.065,.16,.067,0,-.15,0,mat('#714c3f'),false,g);
    B(.24,.091,.085,-.018,.245,0,steel,true,g);B(.067,.12,.076,-.16,.28,0,metal,false,g);return g;
  }
  function pliers(x,y,z,size=1,angle=0,parent=group){
    const g=new THREE.Group();g.position.set(x,y,z);g.rotation.z=angle;g.scale.setScalar(size);parent.add(g);
    const red=mat('#a74d44');
    for(const s of [-1,1]){const h=B(.053,.27,.055,s*.058,-.105,0,red,false,g);h.rotation.z=s*-.18;const a=B(.045,.22,.039,s*.044,.11,0,steel,false,g);a.rotation.z=s*.25;}
    C(.052,.052,.06,0,.025,0,metal,10,false,g).rotation.x=Math.PI/2;return g;
  }
  function screwdriver(x,y,z,size=1,angle=0,parent=group){
    const g=new THREE.Group();g.position.set(x,y,z);g.rotation.z=angle;g.scale.setScalar(size);parent.add(g);
    B(.060,.20,.051,0,-.13,0,mat('#d99d52'),false,g);B(.022,.31,.024,0,.12,0,steel,false,g);return g;
  }
  // A florist replaces the ground-floor tool stock while the upper workshop stays intact.
  const leaf=mat('#687c5d'),stem=mat('#58745e');
  const flowerColors=['#d97872','#e9c16e','#df9baa','#eee5d0','#9d8dbb','#e98e62'].map(c=>mat(c));
  const potColors=['#b87658','#d3c4a8','#718779','#9c8065'].map(c=>mat(c));
  const petalGeometry=new THREE.SphereGeometry(.065,7,5),centerGeometry=new THREE.SphereGeometry(.037,7,5);
  const stemGeometry=new THREE.CylinderGeometry(1,1,1,6),leafGeometry=new THREE.BoxGeometry(1,1,1);
  const flowerParts=new Map(),flowerDummy=new THREE.Object3D(),flowerCenter=mat('#d9ad58');
  function flowerPart(geometry,material,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){
    const key=geometry.uuid+material.uuid;
    if(!flowerParts.has(key))flowerParts.set(key,{geometry,material,matrices:[]});
    flowerDummy.position.set(x,y,z);flowerDummy.rotation.set(rx,ry,rz);flowerDummy.scale.set(sx,sy,sz);flowerDummy.updateMatrix();
    flowerParts.get(key).matrices.push(flowerDummy.matrix.clone());
  }
  function flowerHead(x,y,z,color,s=1){
    for(let i=0;i<5;i++){
      const a=i*Math.PI*2/5;
      flowerPart(petalGeometry,color,x+Math.cos(a)*.061*s,y+.008*s,z+Math.sin(a)*.061*s,.78*s,s,.58*s,0,-a,0);
    }
    flowerPart(centerGeometry,flowerCenter,x,y+.018*s,z,s,s,s);
  }
  function bouquet(x,z,baseY=.62,scale=1,count=6){
    const pot=C(.19*scale,.23*scale,.28*scale,x,baseY+.14*scale,z,potColors[Math.floor(rng()*potColors.length)],9,true);
    C(.195*scale,.195*scale,.035*scale,x,baseY+.275*scale,z,mat('#8d755b'),10,false);
    for(let i=0;i<count;i++){
      const a=i*Math.PI*2/count+(.2-rng()*.4),lean=(.10+rng()*.13)*scale;
      const fx=x+Math.cos(a)*lean,fz=z+Math.sin(a)*lean,fh=(.47+rng()*.26)*scale;
      flowerPart(stemGeometry,stem,x+Math.cos(a)*lean*.38,baseY+.28*scale+fh*.50,z+Math.sin(a)*lean*.38,.013*scale,fh,.013*scale,0,0,Math.cos(a)*.16);
      flowerPart(leafGeometry,leaf,x+Math.cos(a+.55)*lean*.56,baseY+.43*scale+fh*.24,z+Math.sin(a+.55)*lean*.56,.13*scale,.038*scale,.055*scale,0,-a,.34);
      flowerHead(fx,baseY+.28*scale+fh,fz,flowerColors[Math.floor(rng()*flowerColors.length)],scale*.78);
    }
    return pot;
  }
  function displayTable(x,z,w=1.32,d=.70){
    B(w,.075,d,x,.84,z,wood);B(w+.08,.045,d+.08,x,.895,z,mat('#d5c4a6'),false);
    for(const dx of [-w*.42,w*.42])for(const dz of [-d*.37,d*.37])B(.065,.46,.065,x+dx,.59,z+dz,bronze,false);
  }
  // Low tables and a back-wall display keep the original shop's open, walkable floor plan.
  for(const x of [-3.35,-2.27,-1.19,.97]){
    B(.045,1.72,.045,x,1.45,-3.12,wood,false);
    B(.045,1.72,.045,x+.88,1.45,-3.12,wood,false);
    for(const y of [.86,1.43,2.0]){
      B(.92,.045,.48,x+.44,y,-3.12,shelf,false);
      bouquet(x+.22,-3.07,y+.03,.53,4);
      bouquet(x+.68,-3.07,y+.03,.53,4);
    }
  }
  L(1.20,.24,-1.12,2.42,-2.81,'鲜花 · 花束','#e8ddc8','#60745e',{fontSize:48});
  displayTable(-2.45,-1.30,1.30,.70);displayTable(-.45,-1.30,1.30,.70);
  bouquet(-2.78,-1.30,.93,.76,7);bouquet(-2.10,-1.30,.93,.76,6);
  bouquet(-.78,-1.30,.93,.76,7);bouquet(-.10,-1.30,.93,.76,6);
  // Front-window buckets make the flower-shop purpose legible from the street.
  for(const x of [-3.15,-2.50,-1.85,.55,1.18,1.83])bouquet(x,.28,.60,.70,5);
  // A wrapping counter and a compact checkout occupy the right wall.
  B(1.20,.78,.62,.91,.98,-.36,wood);B(1.29,.075,.70,.91,1.41,-.36,mat('#d5c4a6'));
  B(.78,.035,.018,.91,1.12,-.039,mat('#81917c'),false);
  L(.70,.18,.91,1.14,-.024,'花束包装','#f0e6d2','#60745e',{fontSize:42});
  const register=B(.29,.20,.052,.86,1.56,-.02,bronze);register.rotation.x=-.18;
  B(.23,.14,.018,.86,1.57,.012,mat('#a8c0a1'),false);
  // Paper rolls, ribbon spools and seedling trays add florist-specific work details.
  for(let i=0;i<3;i++){
    C(.075,.075,.30,.35+i*.19,1.10,-.47,mat(['#eee4d0','#dba5a0','#9cae8c'][i]),12,true).rotation.z=Math.PI/2;
    C(.035,.035,.31,.35+i*.19,1.10,-.47,wood,10,false).rotation.z=Math.PI/2;
  }
  B(1.05,.08,.54,-.66,.64,.02,mat('#b99c76'));
  for(let i=0;i<6;i++)bouquet(-1.08+(i%3)*.34,-.02+Math.floor(i/3)*.18,.70,.38,3);
  L(.78,.16,-.66,1.46,.20,'TODAY · FRESH FLOWERS','#e7dcc5','#637660',{fontSize:36});

  for(const {geometry,material,matrices} of flowerParts.values()){
    const mesh=new THREE.InstancedMesh(geometry,material,matrices.length);mesh.name='flower-shop-botanical-detail';
    matrices.forEach((matrix,i)=>mesh.setMatrixAt(i,matrix));mesh.instanceMatrix.needsUpdate=true;
    mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);
  }

  // Upstairs workshop: oversized wrench on display, cabinet, workbench and crates.
  B(1.40,.68,.56,-2.48,3.46,-.29,wood);B(1.49,.075,.64,-2.48,3.838,-.29,shelf);
  wrench(-2.10,4.13,.20,1.40,.30);hammer(-1.61,4.03,-.33,1.05,-.31);
  B(.57,.52,.66,-.59,3.44,-.22,mat('#b29472'));B(.51,.48,.65,.03,3.42,-.22,mat('#a58c71'));
  B(.62,.05,.70,-.59,3.72,-.22,wood);B(.56,.05,.69,.03,3.68,-.22,wood);
  for(let i=0;i<4;i++)stock(.038,.40,.012,-.82+i*.14,3.45,.121,mat('#836e58'));
  // An upstairs rack sits behind the freestanding display wrench.
  const upperRack=new THREE.Group();group.add(upperRack);
  for(const x of [-2.85,-.83])B(.059,1.50,.46,x,3.80,-2.97,wood,false,upperRack);
  for(const y of [3.10,3.55,4.02,4.49])B(2.06,.057,.48,-1.84,y,-2.97,shelf,true,upperRack);
  for(let row=0;row<3;row++)for(let i=0;i<7;i++){
    const x=-2.69+i*.28,y=3.28+row*.47,z=-2.86;
    stock(.22,.29,.25,x,y,z,mat(['#b5956d','#a7735c','#88928a'][(row+i)%3]));stock(.12,.056,.006,x,y,-2.731,paper);
  }
  B(.83,1.27,.48,.73,3.73,-2.80,mat('#8d9489'));
  for(const y of [3.47,4.07]){B(.035,.38,.026,.34,y,-2.55,bronze,false);B(.031,.07,.06,.51,y,-2.53,metal,false);}
  B(1.52,.07,.67,.69,3.82,-1.52,wood);for(const z of [-1.76,-1.27])B(.07,.68,.07,1.27,3.43,z,bronze,false);
  B(.44,.20,.31,.68,3.965,-1.52,mat('#9b7862'));B(.14,.04,.05,.68,4.084,-1.52,bronze,false);
  ring(.99,4.04,-1.63,.13,.023,mat('#776b52'));ring(.99,4.04,-1.63,.10,.020,mat('#776b52'));
  L(.72,.40,-.18,4.42,-3.40,'OUGAONE\nPROJECT LAB','#d8c3a1','#93544a');

  // Ceiling fixture meshes and all artificial emission are returned for time switching.
  const warmLamp=emissive('#ffe0a4',1.15);
  for(const [x,z] of [[-2.25,-1.62],[.52,-1.69]]){
    B(1.17,.085,.24,x,2.61,z,bronze,false);B(1.04,.017,.19,x,2.552,z,warmLamp,false);
  }
  for(const x of [-2.50,-.14]){B(.66,.05,.22,x,5.245,-1.03,bronze,false);B(.59,.025,.16,x,5.211,-1.03,warmLamp,false);}
  light('#ffd6a0',9.2,7,-2.07,2.14,-.35);light('#ffe0ad',5.7,6,.59,2.01,-1.28);
  light('#ffdcab',7.6,6,-1.66,4.40,-.18);light('#ffd095',2.2,4,-.27,2.44,1.08);
  halo(awning.x,3.22,1.04,'#ffdca6',3.0,.055);halo(-.15,1.37,.88,'#ffd9a0',2.15,.042);

  // Exterior utility details on solid left/back walls.
  B(1.06,1.74,.11,-2.57,1.48,-3.68,mat('#988f7d'));
  for(const x of [-3.13,-2.01])B(.06,1.84,.04,x,1.49,-3.751,bronze,false);
  B(1.15,.10,.32,-2.57,2.46,-3.77,redShade);
  B(.04,.20,.08,-2.91,1.48,-3.76,steel,false);
  L(.44,.13,-2.57,2.04,-3.75,'OUGAONE','#d5c5a8','#81464a',{rotY:Math.PI});
  T([[-3.85,5.48,-3.31],[-3.90,5.30,-3.32],[-3.90,.76,-3.32],[-4.02,.51,-3.40]],.035,mat('#827c71'));
  T([[1.66,5.49,-3.30],[1.72,5.33,-3.34],[1.72,.64,-3.34]],.033,mat('#8b8272'));
  B(.085,.55,.41,-3.86,2.17,-2.68,mat('#8d978e'));
  for(let i=0;i<6;i++)B(.015,.027,.31,-3.912,2.02+i*.053,-2.68,bronze,false);
  T([[-3.91,1.86,-2.67],[-3.93,1.02,-2.67],[-3.93,.70,-2.98]],.017,metal);
  P(.89,.68,-3.826,1.70,-1.57,(c,W,H)=>{
    c.fillStyle='#dac8aa';c.fillRect(0,0,W,H);c.strokeStyle='#867661';c.lineWidth=H*.035;c.strokeRect(0,0,W,H);
    c.fillStyle='#92464a';c.font=`800 ${H*.17}px Arial`;c.textAlign='center';c.fillText('OUGAONE',W/2,H*.23);
    for(let i=0;i<3;i++){c.fillStyle=['#b8b695','#bc9277','#9da69d'][i];c.fillRect(W*(.07+i*.31),H*.34,W*.24,H*.55);c.fillStyle='#756853';for(let r=0;r<5;r++)c.fillRect(W*(.09+i*.31),H*(.42+r*.08),W*.19,H*.017);}
  },{rotY:-Math.PI/2});
  for(const batch of matrices.values()){
    const mesh=new THREE.InstancedMesh(batch.geometry,batch.material,batch.list.length);batch.list.forEach((m,i)=>mesh.setMatrixAt(i,m));mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);instances.push(mesh);
  }
  const growthFloors=[];
  const featureUpgrades=[];
  let growthLevel=0;
  const floorLabels=['PLAN','DESIGN','WEB','API','DATA','TEST','TOOLS','STORAGE','PREVIEW','LAUNCH'];
  for(let index=0;index<10;index++){
    const floor=new THREE.Group();floor.name='project-growth-floor-'+(index+1);group.add(floor);
    const bottom=5.88+index*1.52,top=bottom+1.42;
    const concrete=mat(index%2?'#c9b9a1':'#d8c8af'),glassGlow=emissive(index%2?'#b6d0c6':'#d8c8a8',.45);
    B(5.28,.13,4.04,-1.1,bottom,-1.47,concrete,true,floor);
    B(5.30,.08,4.08,-1.1,top,-1.47,mat('#75695a'),false,floor);
    for(const x of [-3.68,1.48])B(.13,1.28,.15,x,bottom+.70,.62,bronze,false,floor);
    for(const x of [-3.68,1.48])B(.13,1.28,.15,x,bottom+.70,-3.55,bronze,false,floor);
    B(5.16,.10,.15,-1.1,bottom+.10,.62,concrete,false,floor);
    B(5.16,.10,.15,-1.1,bottom+.10,-3.55,concrete,false,floor);
    B(.10,.10,4.16,-3.68,bottom+.10,-1.47,concrete,false,floor);
    B(.10,.10,4.16,1.48,bottom+.10,-1.47,concrete,false,floor);
    B(.08,1.05,.035,-1.1,bottom+.70,.70,glassGlow,false,floor);
    B(.08,1.05,.035,-1.1,bottom+.70,-3.62,glassGlow,false,floor);
    B(.035,1.05,3.95,-3.76,bottom+.70,-1.47,glassGlow,false,floor);
    B(.035,1.05,3.95,1.56,bottom+.70,-1.47,glassGlow,false,floor);
    L(1.65,.28,-1.1,bottom+.72,.75,'OUGAONE · '+floorLabels[index],'#eee4d0','#6d493b',{parent:floor});
    floor.visible=false;growthFloors.push(floor);
  }
  function setProgress(value){
    const progress=Math.max(0,Math.min(100,Number(value)||0));
    const count=Math.floor(progress/10);
    growthLevel=count;
    growthFloors.forEach((floor,index)=>{floor.visible=index<count;});
    return 5.88+count*1.52;
  }
  function setFeatureProgress(value){
    const count=Math.max(0,Math.floor(Number(value)||0));
    while(featureUpgrades.length<count){
      const index=featureUpgrades.length;
      const ornament=new THREE.Group();
      const column=index%12,row=Math.floor(index/12);
      const x=-3.52+column*.44,y=5.97+row*.16;
      B(.075,.30,.07,x,y,.81,mat('#8b7358'),false,ornament);
      B(.045,.16,.075,x,y,.858,emissive('#e6c78f',.72),false,ornament);
      group.add(ornament);featureUpgrades.push(ornament);
    }
    featureUpgrades.forEach((ornament,index)=>{ornament.visible=index<count;ornament.position.y=growthLevel*1.52;});
  }
  return {group,lights,glowMaterials,unlitPanels,glassStreakMaterials,doors,lampMeshes,signPanel,signBox,awning,awningGroup,roofTop:5.50,roofBounds:{x:-1.10,z:-1.47,w:5.22,d:4.06},setProgress,setFeatureProgress};
}
