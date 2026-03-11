/**
 * AutoParts GT v2 — API Backend
 * Sistema POS para Repuestos Vehiculares
 * Google Sheets como base de datos
 */
const SS=SpreadsheetApp.getActiveSpreadsheet();
const SALT='AUTOPARTS_V2_SEC_2024';

function initializeSheets(){
  const sheets={
    'Usuarios':['id','nombre','email','telefono','avatar_url','password_hash','auth_provider','rol','estado','fecha_registro','ultimo_acceso'],
    'Bodegas':['id','nombre','descripcion','ubicacion','capacidad','estado','fecha_creacion','creado_por'],
    'Categorias':['id','nombre','descripcion','icono','imagen_url','estado','orden'],
    'Marcas':['id','nombre','logo_url','estado'],
    'Productos':['id','nombre','descripcion','numero_parte','sku','precio','precio_descuento','costo','categoria_id','marca_vehiculo','modelo_vehiculo','anio_desde','anio_hasta','marca_repuesto','condicion','imagen_url','galeria','destacado','estado','fecha_creacion'],
    'Inventario':['id','producto_id','bodega_id','cantidad','stock_minimo','stock_maximo','ubicacion_estante','ultima_actualizacion'],
    'MovimientosInventario':['id','producto_id','bodega_origen','bodega_destino','cantidad','tipo','referencia','usuario_id','fecha','notas'],
    'Carritos':['id','usuario_id','estado','fecha_creacion','fecha_actualizacion'],
    'CarritoItems':['id','carrito_id','producto_id','cantidad','precio_unitario','subtotal'],
    'Ordenes':['id','numero_orden','usuario_id','total','subtotal','impuesto','descuento','estado','metodo_pago','nit','nombre_factura','direccion_envio','departamento','municipio','telefono_contacto','notas','fecha_creacion','fecha_actualizacion'],
    'OrdenItems':['id','orden_id','producto_id','cantidad','precio_unitario','subtotal'],
    'Sesiones':['token','usuario_id','rol','fecha_creacion','fecha_expiracion'],
    'Banners':['id','titulo','subtitulo','imagen_url','link','activo','orden']
  };
  for(const[name,headers]of Object.entries(sheets)){let s=SS.getSheetByName(name);if(!s){s=SS.insertSheet(name);s.getRange(1,1,1,headers.length).setValues([headers]).setFontWeight('bold');s.setFrozenRows(1)}}
  // Admin
  const us=SS.getSheetByName('Usuarios');
  if(us.getDataRange().getValues().length<=1){
    us.appendRow([gid(),'Administrador','admin@autoparts.com','','',hashPw('admin123'),'email','admin','activo',new Date().toISOString(),'']);
  }
  // Categorías automotrices
  const cs=SS.getSheetByName('Categorias');
  if(cs.getDataRange().getValues().length<=1){
    [['Motor y Transmisión','Pistones, culatas, empaques, cajas, clutch','⚙️','',1],
     ['Frenos','Pastillas, discos, zapatas, cilindros, líquidos','🛑','',2],
     ['Suspensión y Dirección','Amortiguadores, rótulas, terminales, bujes','🔧','',3],
     ['Sistema Eléctrico','Alternadores, baterías, bujías, sensores','⚡','',4],
     ['Carrocería','Faros, espejos, bumpers, puertas, vidrios','🚗','',5],
     ['Filtros y Lubricantes','Aceites, filtros de aire, combustible','🛢️','',6],
     ['Refrigeración y A/C','Radiadores, termostatos, compresores','❄️','',7],
     ['Sistema de Escape','Mofles, catalizadores, tubos, sensores O2','💨','',8],
     ['Accesorios','Alarmas, forros, tapetes, luces LED','✨','',9]
    ].forEach(c=>cs.appendRow([gid(),c[0],c[1],c[2],c[3],'activa',c[4]]));
  }
  // Marcas
  const ms=SS.getSheetByName('Marcas');
  if(ms.getDataRange().getValues().length<=1){
    ['Toyota','Honda','Nissan','Mazda','Hyundai','Kia','Chevrolet','Ford','Suzuki','Mitsubishi','Volkswagen','BMW','Mercedes-Benz','Jeep','Isuzu','Subaru','Dodge','RAM'].forEach(m=>ms.appendRow([gid(),m,'','activa']));
  }
  // Banners de ejemplo
  const bn=SS.getSheetByName('Banners');
  if(bn.getDataRange().getValues().length<=1){
    bn.appendRow([gid(),'Frenos de Alta Calidad','Pastillas y discos para todas las marcas','','#',true,1]);
    bn.appendRow([gid(),'Envío a Todo Guatemala','Recibe tus repuestos en la puerta de tu casa','','#',true,2]);
    bn.appendRow([gid(),'Ofertas de Temporada','Hasta 30% de descuento en filtros y lubricantes','','#',true,3]);
  }
  return{success:true,message:'AutoParts GT v2 inicializado. Admin: admin@autoparts.com / admin123'};
}

// Utils
function gid(){return Utilities.getUuid().replace(/-/g,'').substring(0,16)}
function hashPw(p){return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,p+SALT).map(b=>('0'+(b&0xFF).toString(16)).slice(-2)).join('')}
function gToken(){return Utilities.getUuid()+'-'+Date.now()}
function gsd(n){const s=SS.getSheetByName(n);if(!s)return[];const d=s.getDataRange().getValues();if(d.length<=1)return[];const h=d[0];return d.slice(1).map(r=>{const o={};h.forEach((k,i)=>o[k]=r[i]);return o})}
function fi(n,k,v){return gsd(n).find(r=>r[k]===v)}
function fai(n,k,v){return gsd(n).filter(r=>r[k]===v)}
function ui(n,k,v,u){const s=SS.getSheetByName(n),d=s.getDataRange().getValues(),h=d[0],ki=h.indexOf(k);for(let i=1;i<d.length;i++){if(d[i][ki]===v){for(const[f,val]of Object.entries(u)){const ci=h.indexOf(f);if(ci>=0)s.getRange(i+1,ci+1).setValue(val)}return true}}return false}
function di(n,k,v){const s=SS.getSheetByName(n),d=s.getDataRange().getValues(),h=d[0],ki=h.indexOf(k);for(let i=d.length-1;i>=1;i--){if(d[i][ki]===v){s.deleteRow(i+1);return true}}return false}

// Auth
function authToken(t){if(!t)return null;const s=fi('Sesiones','token',t);if(!s)return null;if(new Date(s.fecha_expiracion)<new Date()){di('Sesiones','token',t);return null}return s}
function reqAuth(t,r){const s=authToken(t);if(!s)return{error:'No autorizado',code:401};if(r&&s.rol!==r&&s.rol!=='admin')return{error:'Permisos insuficientes',code:403};return s}

function login(email,password){
  const u=fi('Usuarios','email',email);
  if(!u||u.password_hash!==hashPw(password))return{success:false,error:'Credenciales inválidas'};
  if(u.estado!=='activo')return{success:false,error:'Cuenta desactivada'};
  const ss=SS.getSheetByName('Sesiones'),sd=ss.getDataRange().getValues();
  for(let i=sd.length-1;i>=1;i--)if(sd[i][1]===u.id)ss.deleteRow(i+1);
  const token=gToken(),now=new Date(),exp=new Date(now.getTime()+86400000);
  ss.appendRow([token,u.id,u.rol,now.toISOString(),exp.toISOString()]);
  ui('Usuarios','id',u.id,{ultimo_acceso:now.toISOString()});
  return{success:true,token,user:{id:u.id,nombre:u.nombre,email:u.email,rol:u.rol,avatar_url:u.avatar_url,telefono:u.telefono}};
}

// Google Sign-In
function googleLogin(googleData){
  const email=googleData.email,name=googleData.name,avatar=googleData.picture||'';
  let u=fi('Usuarios','email',email);
  if(!u){
    const id=gid();
    SS.getSheetByName('Usuarios').appendRow([id,name,email,'',avatar,'','google','cliente','activo',new Date().toISOString(),'']);
    u={id:id,nombre:name,email:email,rol:'cliente',avatar_url:avatar,telefono:''};
  } else {
    if(u.estado!=='activo')return{success:false,error:'Cuenta desactivada'};
    ui('Usuarios','id',u.id,{avatar_url:avatar,ultimo_acceso:new Date().toISOString()});
  }
  const ss=SS.getSheetByName('Sesiones'),sd=ss.getDataRange().getValues();
  for(let i=sd.length-1;i>=1;i--)if(sd[i][1]===u.id)ss.deleteRow(i+1);
  const token=gToken(),now=new Date(),exp=new Date(now.getTime()+86400000);
  ss.appendRow([token,u.id,u.rol||'cliente',now.toISOString(),exp.toISOString()]);
  return{success:true,token,user:{id:u.id,nombre:u.nombre||name,email:u.email||email,rol:u.rol||'cliente',avatar_url:u.avatar_url||avatar,telefono:u.telefono||''}};
}

function register(nombre,email,telefono,password){
  if(fi('Usuarios','email',email))return{success:false,error:'Email ya registrado'};
  if(!email||!password||!nombre)return{success:false,error:'Campos requeridos'};
  if(password.length<6)return{success:false,error:'Contraseña mínimo 6 caracteres'};
  const id=gid();SS.getSheetByName('Usuarios').appendRow([id,nombre,email,telefono||'','',hashPw(password),'email','cliente','activo',new Date().toISOString(),'']);
  return{success:true,message:'Registro exitoso'};
}
function logout(token){di('Sesiones','token',token);return{success:true}}
function getUsers(token){const a=reqAuth(token,'admin');if(a.error)return a;return{success:true,data:gsd('Usuarios').map(u=>({id:u.id,nombre:u.nombre,email:u.email,telefono:u.telefono,avatar_url:u.avatar_url,auth_provider:u.auth_provider,rol:u.rol,estado:u.estado,fecha_registro:u.fecha_registro}))}}
function updateUserRole(token,uid,r){const a=reqAuth(token,'admin');if(a.error)return a;ui('Usuarios','id',uid,{rol:r});return{success:true}}
function toggleUserStatus(token,uid){const a=reqAuth(token,'admin');if(a.error)return a;const u=fi('Usuarios','id',uid);if(!u)return{success:false,error:'No encontrado'};ui('Usuarios','id',uid,{estado:u.estado==='activo'?'inactivo':'activo'});return{success:true}}

// Bodegas
function createBodega(token,d){const a=reqAuth(token,'admin');if(a.error)return a;const id=gid();SS.getSheetByName('Bodegas').appendRow([id,d.nombre,d.descripcion||'',d.ubicacion||'',d.capacidad||0,'activa',new Date().toISOString(),a.usuario_id]);return{success:true,id}}
function getBodegas(token){const a=reqAuth(token);if(a.error)return a;return{success:true,data:gsd('Bodegas')}}
function updateBodega(token,id,d){const a=reqAuth(token,'admin');if(a.error)return a;ui('Bodegas','id',id,d);return{success:true}}
function deleteBodega(token,id){const a=reqAuth(token,'admin');if(a.error)return a;if(fai('Inventario','bodega_id',id).some(i=>i.cantidad>0))return{success:false,error:'Bodega tiene inventario'};ui('Bodegas','id',id,{estado:'inactiva'});return{success:true}}

// Categorías / Marcas
function createCategoria(token,d){const a=reqAuth(token,'admin');if(a.error)return a;const id=gid();SS.getSheetByName('Categorias').appendRow([id,d.nombre,d.descripcion||'',d.icono||'🔧',d.imagen_url||'','activa',d.orden||99]);return{success:true,id}}
function getCategorias(token){const a=reqAuth(token);if(a.error)return a;return{success:true,data:gsd('Categorias')}}
function updateCategoria(token,id,d){const a=reqAuth(token,'admin');if(a.error)return a;ui('Categorias','id',id,d);return{success:true}}
function getMarcas(token){const a=reqAuth(token);if(a.error)return a;return{success:true,data:gsd('Marcas')}}
function createMarca(token,d){const a=reqAuth(token,'admin');if(a.error)return a;const id=gid();SS.getSheetByName('Marcas').appendRow([id,d.nombre,d.logo_url||'','activa']);return{success:true,id}}

// Productos
function createProducto(token,d){const a=reqAuth(token,'admin');if(a.error)return a;const id=gid();SS.getSheetByName('Productos').appendRow([id,d.nombre,d.descripcion||'',d.numero_parte||'',d.sku||'',parseFloat(d.precio)||0,parseFloat(d.precio_descuento)||0,parseFloat(d.costo)||0,d.categoria_id||'',d.marca_vehiculo||'',d.modelo_vehiculo||'',d.anio_desde||'',d.anio_hasta||'',d.marca_repuesto||'',d.condicion||'nuevo',d.imagen_url||'',d.galeria||'',d.destacado||false,'activo',new Date().toISOString()]);return{success:true,id}}
function getProductos(token){const a=reqAuth(token);if(a.error)return a;const ps=gsd('Productos'),cs=gsd('Categorias'),inv=gsd('Inventario');return{success:true,data:ps.map(p=>{const c=cs.find(x=>x.id===p.categoria_id);const ss=inv.filter(i=>i.producto_id===p.id);return{...p,categoria_nombre:c?c.nombre:'Sin categoría',categoria_icono:c?c.icono:'🔧',stock_total:ss.reduce((s,i)=>s+(parseInt(i.cantidad)||0),0)}})}}
function updateProducto(token,id,d){const a=reqAuth(token,'admin');if(a.error)return a;ui('Productos','id',id,d);return{success:true}}
function deleteProducto(token,id){const a=reqAuth(token,'admin');if(a.error)return a;ui('Productos','id',id,{estado:'inactivo'});return{success:true}}

// Búsqueda vehicular
function buscarPorVehiculo(marca,modelo,anio){
  const ps=gsd('Productos').filter(p=>p.estado==='activo'),cs=gsd('Categorias'),inv=gsd('Inventario');
  let r=ps;
  if(marca)r=r.filter(p=>p.marca_vehiculo&&p.marca_vehiculo.toLowerCase().includes(marca.toLowerCase()));
  if(modelo)r=r.filter(p=>p.modelo_vehiculo&&p.modelo_vehiculo.toLowerCase().includes(modelo.toLowerCase()));
  if(anio){const a=parseInt(anio);r=r.filter(p=>{const d=parseInt(p.anio_desde)||0,h=parseInt(p.anio_hasta)||9999;return a>=d&&a<=h})}
  return{success:true,data:r.map(p=>{const c=cs.find(x=>x.id===p.categoria_id);const ss=inv.filter(i=>i.producto_id===p.id);const st=ss.reduce((s,i)=>s+(parseInt(i.cantidad)||0),0);return{id:p.id,nombre:p.nombre,descripcion:p.descripcion,numero_parte:p.numero_parte,precio:p.precio,precio_descuento:p.precio_descuento,categoria:c?c.nombre:'General',categoria_icono:c?c.icono:'🔧',marca_vehiculo:p.marca_vehiculo,modelo_vehiculo:p.modelo_vehiculo,anio_desde:p.anio_desde,anio_hasta:p.anio_hasta,marca_repuesto:p.marca_repuesto,condicion:p.condicion,imagen_url:p.imagen_url,destacado:p.destacado,disponible:st>0,stock:st}})}
}

// Inventario
function setInventario(token,pId,bId,cant,sMin,sMax,ub){const a=reqAuth(token,'admin');if(a.error)return a;const ex=gsd('Inventario').find(i=>i.producto_id===pId&&i.bodega_id===bId);if(ex){const s=SS.getSheetByName('Inventario'),d=s.getDataRange().getValues(),h=d[0];for(let i=1;i<d.length;i++){if(d[i][h.indexOf('producto_id')]===pId&&d[i][h.indexOf('bodega_id')]===bId){s.getRange(i+1,h.indexOf('cantidad')+1).setValue(cant);if(sMin!==undefined)s.getRange(i+1,h.indexOf('stock_minimo')+1).setValue(sMin);if(sMax!==undefined)s.getRange(i+1,h.indexOf('stock_maximo')+1).setValue(sMax);if(ub)s.getRange(i+1,h.indexOf('ubicacion_estante')+1).setValue(ub);s.getRange(i+1,h.indexOf('ultima_actualizacion')+1).setValue(new Date().toISOString());break}}}else{SS.getSheetByName('Inventario').appendRow([gid(),pId,bId,cant,sMin||0,sMax||999,ub||'',new Date().toISOString()])}regMov(pId,'',bId,cant,'ajuste','Ajuste',a.usuario_id);return{success:true}}
function getInventario(token,bId){const a=reqAuth(token);if(a.error)return a;let inv=gsd('Inventario');if(bId)inv=inv.filter(i=>i.bodega_id===bId);const ps=gsd('Productos'),bs=gsd('Bodegas');return{success:true,data:inv.map(i=>{const p=ps.find(x=>x.id===i.producto_id);const b=bs.find(x=>x.id===i.bodega_id);return{...i,producto_nombre:p?p.nombre:'?',numero_parte:p?p.numero_parte:'',producto_precio:p?p.precio:0,bodega_nombre:b?b.nombre:'?',alerta_stock:parseInt(i.cantidad)<=parseInt(i.stock_minimo)}})}}
function transferirInventario(token,pId,bO,bD,cant){const a=reqAuth(token,'admin');if(a.error)return a;const orig=gsd('Inventario').find(i=>i.producto_id===pId&&i.bodega_id===bO);if(!orig||parseInt(orig.cantidad)<cant)return{success:false,error:'Stock insuficiente'};const s=SS.getSheetByName('Inventario'),d=s.getDataRange().getValues(),h=d[0];for(let i=1;i<d.length;i++){if(d[i][h.indexOf('producto_id')]===pId&&d[i][h.indexOf('bodega_id')]===bO){s.getRange(i+1,h.indexOf('cantidad')+1).setValue(parseInt(orig.cantidad)-cant);break}}const dest=gsd('Inventario').find(i=>i.producto_id===pId&&i.bodega_id===bD);if(dest){const dd=s.getDataRange().getValues();for(let i=1;i<dd.length;i++){if(dd[i][h.indexOf('producto_id')]===pId&&dd[i][h.indexOf('bodega_id')]===bD){s.getRange(i+1,h.indexOf('cantidad')+1).setValue(parseInt(dest.cantidad)+cant);break}}}else{SS.getSheetByName('Inventario').appendRow([gid(),pId,bD,cant,0,999,'',new Date().toISOString()])}regMov(pId,bO,bD,cant,'transferencia','Transferencia',a.usuario_id);return{success:true}}
function regMov(pId,bO,bD,c,t,n,uId){SS.getSheetByName('MovimientosInventario').appendRow([gid(),pId,bO,bD,c,t,'',uId,new Date().toISOString(),n])}
function getMovimientos(token,f){const a=reqAuth(token,'admin');if(a.error)return a;let m=gsd('MovimientosInventario');if(f&&f.producto_id)m=m.filter(x=>x.producto_id===f.producto_id);return{success:true,data:m.reverse().slice(0,100)}}

// Carrito
function getOrCreateCart(token){const a=reqAuth(token);if(a.error)return a;let c=gsd('Carritos').find(x=>x.usuario_id===a.usuario_id&&x.estado==='activo');if(!c){const id=gid();SS.getSheetByName('Carritos').appendRow([id,a.usuario_id,'activo',new Date().toISOString(),new Date().toISOString()]);c={id}}const items=fai('CarritoItems','carrito_id',c.id);const ps=gsd('Productos');const ei=items.map(i=>{const p=ps.find(x=>x.id===i.producto_id);return{...i,producto_nombre:p?p.nombre:'?',numero_parte:p?p.numero_parte:'',producto_imagen:p?p.imagen_url:'',marca_vehiculo:p?p.marca_vehiculo:'',modelo_vehiculo:p?p.modelo_vehiculo:''}});return{success:true,data:{carrito_id:c.id,items:ei,total:ei.reduce((s,i)=>s+(parseFloat(i.subtotal)||0),0),cantidad_items:ei.length}}}
function addToCart(token,pId,cant){const a=reqAuth(token);if(a.error)return a;cant=parseInt(cant)||1;const p=fi('Productos','id',pId);if(!p||p.estado!=='activo')return{success:false,error:'Repuesto no disponible'};const actualPrice=p.precio_descuento&&parseFloat(p.precio_descuento)>0?parseFloat(p.precio_descuento):parseFloat(p.precio);const inv=gsd('Inventario').filter(i=>i.producto_id===pId);const stock=inv.reduce((s,i)=>s+(parseInt(i.cantidad)||0),0);if(stock<cant)return{success:false,error:'Stock insuficiente'};let c=gsd('Carritos').find(x=>x.usuario_id===a.usuario_id&&x.estado==='activo');if(!c){const cid=gid();SS.getSheetByName('Carritos').appendRow([cid,a.usuario_id,'activo',new Date().toISOString(),new Date().toISOString()]);c={id:cid}}const ex=gsd('CarritoItems').find(ci=>ci.carrito_id===c.id&&ci.producto_id===pId);if(ex){const nq=parseInt(ex.cantidad)+cant;if(nq>stock)return{success:false,error:'Stock insuficiente'};const s=SS.getSheetByName('CarritoItems'),d=s.getDataRange().getValues(),h=d[0];for(let i=1;i<d.length;i++){if(d[i][h.indexOf('id')]===ex.id){s.getRange(i+1,h.indexOf('cantidad')+1).setValue(nq);s.getRange(i+1,h.indexOf('subtotal')+1).setValue(nq*actualPrice);break}}}else{SS.getSheetByName('CarritoItems').appendRow([gid(),c.id,pId,cant,actualPrice,cant*actualPrice])}return{success:true,message:'Agregado al carrito'}}
function updateCartItem(token,iId,cant){const a=reqAuth(token);if(a.error)return a;if(cant<=0)return removeFromCart(token,iId);const it=fi('CarritoItems','id',iId);if(!it)return{success:false,error:'Item no encontrado'};const p=fi('Productos','id',it.producto_id);const price=p.precio_descuento&&parseFloat(p.precio_descuento)>0?parseFloat(p.precio_descuento):parseFloat(p.precio);const s=SS.getSheetByName('CarritoItems'),d=s.getDataRange().getValues(),h=d[0];for(let i=1;i<d.length;i++){if(d[i][h.indexOf('id')]===iId){s.getRange(i+1,h.indexOf('cantidad')+1).setValue(cant);s.getRange(i+1,h.indexOf('subtotal')+1).setValue(cant*price);break}}return{success:true}}
function removeFromCart(token,iId){const a=reqAuth(token);if(a.error)return a;di('CarritoItems','id',iId);return{success:true}}
function clearCart(token){const a=reqAuth(token);if(a.error)return a;const c=gsd('Carritos').find(x=>x.usuario_id===a.usuario_id&&x.estado==='activo');if(c)fai('CarritoItems','carrito_id',c.id).forEach(i=>di('CarritoItems','id',i.id));return{success:true}}

// Checkout
function checkout(token,metodo,nit,nombreFact,dir,depto,muni,tel,notas){
  const a=reqAuth(token);if(a.error)return a;
  const cart=getOrCreateCart(token);if(!cart.success||cart.data.items.length===0)return{success:false,error:'Carrito vacío'};
  const sub=cart.data.total,imp=sub*0.12,tot=sub+imp;
  const numOrden='AP-'+Date.now().toString(36).toUpperCase();
  const oid=gid();
  SS.getSheetByName('Ordenes').appendRow([oid,numOrden,a.usuario_id,tot,sub,imp,0,'pendiente',metodo||'efectivo',nit||'CF',nombreFact||'',dir||'',depto||'',muni||'',tel||'',notas||'',new Date().toISOString(),new Date().toISOString()]);
  for(const it of cart.data.items){SS.getSheetByName('OrdenItems').appendRow([gid(),oid,it.producto_id,it.cantidad,it.precio_unitario,it.subtotal]);descontarInv(it.producto_id,parseInt(it.cantidad),a.usuario_id)}
  clearCart(token);
  return{success:true,orden:{id:oid,numero:numOrden,total:tot,subtotal:sub,impuesto:imp}};
}
function descontarInv(pId,cant,uId){const inv=gsd('Inventario').filter(i=>i.producto_id===pId&&parseInt(i.cantidad)>0).sort((a,b)=>parseInt(b.cantidad)-parseInt(a.cantidad));let rest=cant;const s=SS.getSheetByName('Inventario'),d=s.getDataRange().getValues(),h=d[0];for(const r of inv){if(rest<=0)break;const disp=parseInt(r.cantidad),desc=Math.min(disp,rest);for(let i=1;i<d.length;i++){if(d[i][h.indexOf('id')]===r.id){s.getRange(i+1,h.indexOf('cantidad')+1).setValue(disp-desc);break}}regMov(pId,r.bodega_id,'',desc,'venta','Venta',uId);rest-=desc}}
function getOrdenes(token,todas){const a=reqAuth(token);if(a.error)return a;let o=gsd('Ordenes');if(!todas||a.rol!=='admin')o=o.filter(x=>x.usuario_id===a.usuario_id);const us=gsd('Usuarios'),ps=gsd('Productos');return{success:true,data:o.map(x=>{const u=us.find(y=>y.id===x.usuario_id);const its=fai('OrdenItems','orden_id',x.id).map(i=>{const p=ps.find(y=>y.id===i.producto_id);return{...i,producto_nombre:p?p.nombre:'?',numero_parte:p?p.numero_parte:''}});return{...x,usuario_nombre:u?u.nombre:'?',usuario_telefono:u?u.telefono:'',usuario_email:u?u.email:'',items:its}}).reverse()}}
function updateOrdenEstado(token,oid,estado){const a=reqAuth(token,'admin');if(a.error)return a;ui('Ordenes','id',oid,{estado,fecha_actualizacion:new Date().toISOString()});return{success:true}}

// Dashboard
function getDashboardData(token){const a=reqAuth(token,'admin');if(a.error)return a;const ps=gsd('Productos').filter(p=>p.estado==='activo'),bs=gsd('Bodegas').filter(b=>b.estado==='activa'),os=gsd('Ordenes'),inv=gsd('Inventario'),us=gsd('Usuarios');const now=new Date(),mo=os.filter(o=>{const f=new Date(o.fecha_creacion);return f.getMonth()===now.getMonth()&&f.getFullYear()===now.getFullYear()});const vm=mo.reduce((s,o)=>s+(parseFloat(o.total)||0),0);const al=inv.filter(i=>parseInt(i.cantidad)<=parseInt(i.stock_minimo));const oi=gsd('OrdenItems'),vpp={};oi.forEach(i=>{vpp[i.producto_id]=(vpp[i.producto_id]||0)+(parseInt(i.cantidad)||0)});const t5=Object.entries(vpp).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([pid,q])=>{const p=ps.find(x=>x.id===pid);return{nombre:p?p.nombre:'?',numero_parte:p?p.numero_parte:'',cantidad:q}});const vpd=[];for(let d=6;d>=0;d--){const dia=new Date(now);dia.setDate(dia.getDate()-d);const ds=dia.toISOString().split('T')[0];const vd=os.filter(o=>o.fecha_creacion&&o.fecha_creacion.split('T')[0]===ds);vpd.push({fecha:ds,total:vd.reduce((s,o)=>s+(parseFloat(o.total)||0),0),cantidad:vd.length})}const cs=gsd('Categorias');const pc=cs.map(c=>({nombre:c.nombre,icono:c.icono,cantidad:ps.filter(p=>p.categoria_id===c.id).length})).filter(c=>c.cantidad>0);return{success:true,data:{resumen:{total_productos:ps.length,total_bodegas:bs.length,total_ordenes:os.length,total_usuarios:us.length,ventas_mes:vm,ordenes_pendientes:os.filter(o=>o.estado==='pendiente').length},alertas_stock:al.length,top_productos:t5,ventas_por_dia:vpd,por_categoria:pc}}}

// Catálogo público
function getCatalogoPublico(){const ps=gsd('Productos').filter(p=>p.estado==='activo'),cs=gsd('Categorias').filter(c=>c.estado==='activa'),inv=gsd('Inventario'),ms=gsd('Marcas'),bn=gsd('Banners').filter(b=>b.activo);return{success:true,data:ps.map(p=>{const c=cs.find(x=>x.id===p.categoria_id);const ss=inv.filter(i=>i.producto_id===p.id);const st=ss.reduce((s,i)=>s+(parseInt(i.cantidad)||0),0);return{id:p.id,nombre:p.nombre,descripcion:p.descripcion,numero_parte:p.numero_parte,precio:p.precio,precio_descuento:p.precio_descuento,categoria:c?c.nombre:'General',categoria_icono:c?c.icono:'🔧',marca_vehiculo:p.marca_vehiculo,modelo_vehiculo:p.modelo_vehiculo,anio_desde:p.anio_desde,anio_hasta:p.anio_hasta,marca_repuesto:p.marca_repuesto,condicion:p.condicion,imagen_url:p.imagen_url,destacado:p.destacado,disponible:st>0,stock:st}}),categorias:cs.sort((a,b)=>(a.orden||99)-(b.orden||99)),marcas:ms.filter(m=>m.estado==='activa'),banners:bn.sort((a,b)=>(a.orden||99)-(b.orden||99))}}

// Router
function doGet(e){return handleRequest(e)}
function doPost(e){return handleRequest(e)}
function handleRequest(e){
  const p=e.parameter||{},action=p.action||'',token=p.token||'';
  let body={};try{if(e.postData&&e.postData.contents)body=JSON.parse(e.postData.contents)}catch(err){}
  let r;
  try{switch(action){
    case 'init':r=initializeSheets();break;
    case 'login':r=login(body.email||p.email,body.password||p.password);break;
    case 'googleLogin':r=googleLogin(body);break;
    case 'register':r=register(body.nombre,body.email,body.telefono,body.password);break;
    case 'logout':r=logout(token);break;
    case 'getUsers':r=getUsers(token);break;
    case 'updateUserRole':r=updateUserRole(token,body.userId,body.role);break;
    case 'toggleUserStatus':r=toggleUserStatus(token,body.userId);break;
    case 'createBodega':r=createBodega(token,body);break;
    case 'getBodegas':r=getBodegas(token);break;
    case 'updateBodega':r=updateBodega(token,body.id,body);break;
    case 'deleteBodega':r=deleteBodega(token,body.id);break;
    case 'createCategoria':r=createCategoria(token,body);break;
    case 'getCategorias':r=getCategorias(token);break;
    case 'updateCategoria':r=updateCategoria(token,body.id,body);break;
    case 'getMarcas':r=getMarcas(token);break;
    case 'createMarca':r=createMarca(token,body);break;
    case 'createProducto':r=createProducto(token,body);break;
    case 'getProductos':r=getProductos(token);break;
    case 'updateProducto':r=updateProducto(token,body.id,body);break;
    case 'deleteProducto':r=deleteProducto(token,body.id);break;
    case 'buscarVehiculo':r=buscarPorVehiculo(body.marca||p.marca,body.modelo||p.modelo,body.anio||p.anio);break;
    case 'setInventario':r=setInventario(token,body.producto_id,body.bodega_id,body.cantidad,body.stock_minimo,body.stock_maximo,body.ubicacion_estante);break;
    case 'getInventario':r=getInventario(token,body.bodega_id||p.bodega_id);break;
    case 'transferirInventario':r=transferirInventario(token,body.producto_id,body.bodega_origen,body.bodega_destino,body.cantidad);break;
    case 'getMovimientos':r=getMovimientos(token,body);break;
    case 'getCart':r=getOrCreateCart(token);break;
    case 'addToCart':r=addToCart(token,body.producto_id,body.cantidad);break;
    case 'updateCartItem':r=updateCartItem(token,body.item_id,body.cantidad);break;
    case 'removeFromCart':r=removeFromCart(token,body.item_id);break;
    case 'clearCart':r=clearCart(token);break;
    case 'checkout':r=checkout(token,body.metodo_pago,body.nit,body.nombre_factura,body.direccion,body.departamento,body.municipio,body.telefono,body.notas);break;
    case 'getOrdenes':r=getOrdenes(token,body.todas||p.todas);break;
    case 'updateOrdenEstado':r=updateOrdenEstado(token,body.orden_id,body.estado);break;
    case 'getDashboard':r=getDashboardData(token);break;
    case 'getCatalogo':r=getCatalogoPublico();break;
    default:r={success:false,error:'Acción no válida: '+action}}}
  catch(err){r={success:false,error:err.message}}
  return ContentService.createTextOutput(JSON.stringify(r)).setMimeType(ContentService.MimeType.JSON);
}
