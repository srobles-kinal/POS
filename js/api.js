/**
 * AutoParts GT - API Client
 */
const API = {
  async request(action, data = {}, method = 'POST') {
    const token = Auth.getToken();
    const url = CONFIG.API_BASE_URL + '?action=' + action + (token ? '&token=' + token : '');
    try {
      const opts = { method, headers: { 'Content-Type': 'text/plain' }, redirect: 'follow' };
      if (method === 'POST') opts.body = JSON.stringify(data);
      UI.showLoader();
      const res = await fetch(url, opts);
      const result = await res.json();
      UI.hideLoader();
      if (result.error && (result.code === 401 || String(result.error).includes('No autorizado'))) {
        Auth.logout(); window.location.href = 'login.html'; return null;
      }
      return result;
    } catch (err) {
      UI.hideLoader();
      console.error('API Error:', err);
      UI.toast('Error de conexión. Verifica tu internet.', 'error');
      return { success: false, error: 'Error de conexión' };
    }
  },
  login(e, p) { return this.request('login', { email: e, password: p }) },
  googleLogin(d) { return this.request('googleLogin', d) },
  register(n, e, t, p) { return this.request('register', { nombre: n, email: e, telefono: t, password: p }) },
  logout() { return this.request('logout') },
  getUsers() { return this.request('getUsers') },
  updateUserRole(id, r) { return this.request('updateUserRole', { userId: id, role: r }) },
  toggleUserStatus(id) { return this.request('toggleUserStatus', { userId: id }) },
  getBodegas() { return this.request('getBodegas') },
  createBodega(d) { return this.request('createBodega', d) },
  updateBodega(id, d) { return this.request('updateBodega', { id, ...d }) },
  deleteBodega(id) { return this.request('deleteBodega', { id }) },
  getCategorias() { return this.request('getCategorias') },
  createCategoria(d) { return this.request('createCategoria', d) },
  updateCategoria(id, d) { return this.request('updateCategoria', { id, ...d }) },
  getMarcas() { return this.request('getMarcas') },
  createMarca(d) { return this.request('createMarca', d) },
  getProductos() { return this.request('getProductos') },
  createProducto(d) { return this.request('createProducto', d) },
  updateProducto(id, d) { return this.request('updateProducto', { id, ...d }) },
  deleteProducto(id) { return this.request('deleteProducto', { id }) },
  buscarVehiculo(m, mo, a) { return this.request('buscarVehiculo', { marca: m, modelo: mo, anio: a }) },
  getInventario(b) { return this.request('getInventario', { bodega_id: b }) },
  setInventario(d) { return this.request('setInventario', d) },
  transferirInventario(d) { return this.request('transferirInventario', d) },
  getMovimientos(f) { return this.request('getMovimientos', f || {}) },
  getCart() { return this.request('getCart') },
  addToCart(p, c) { return this.request('addToCart', { producto_id: p, cantidad: c }) },
  updateCartItem(i, c) { return this.request('updateCartItem', { item_id: i, cantidad: c }) },
  removeFromCart(i) { return this.request('removeFromCart', { item_id: i }) },
  clearCart() { return this.request('clearCart') },
  checkout(d) { return this.request('checkout', d) },
  getOrdenes(t) { return this.request('getOrdenes', { todas: t }) },
  updateOrdenEstado(id, e) { return this.request('updateOrdenEstado', { orden_id: id, estado: e }) },
  getDashboard() { return this.request('getDashboard') },
  getCatalogo() { return this.request('getCatalogo') },
};
