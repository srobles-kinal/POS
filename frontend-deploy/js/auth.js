/**
 * AutoParts GT - Auth Module (con Google Sign-In)
 */
const Auth = {
  getToken() { return sessionStorage.getItem('ap_token') },
  getUser() { const d = sessionStorage.getItem('ap_user'); return d ? JSON.parse(d) : null },
  setSession(token, user) { sessionStorage.setItem('ap_token', token); sessionStorage.setItem('ap_user', JSON.stringify(user)) },
  logout() { sessionStorage.removeItem('ap_token'); sessionStorage.removeItem('ap_user') },
  isLoggedIn() { return !!this.getToken() },
  isAdmin() { const u = this.getUser(); return u && u.rol === 'admin' },
  requireLogin() { if (!this.isLoggedIn()) { window.location.href = 'login.html'; return false } return true },
  requireAdmin() { if (!this.isLoggedIn()) { window.location.href = 'login.html'; return false } if (!this.isAdmin()) { window.location.href = 'tienda.html'; return false } return true },

  // Google Sign-In callback
  async handleGoogleCredential(response) {
    try {
      // Decodificar JWT de Google
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      const googleData = {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        sub: payload.sub
      };

      UI.showLoader();
      const result = await API.googleLogin(googleData);
      UI.hideLoader();

      if (result && result.success) {
        Auth.setSession(result.token, result.user);
        UI.toast('¡Bienvenido, ' + result.user.nombre + '!', 'success');
        const redirect = sessionStorage.getItem('ap_redirect');
        sessionStorage.removeItem('ap_redirect');
        setTimeout(() => {
          window.location.href = redirect || (result.user.rol === 'admin' ? 'dashboard.html' : 'tienda.html');
        }, 600);
      } else {
        UI.toast(result ? result.error : 'Error al iniciar con Google', 'error');
      }
    } catch (err) {
      UI.hideLoader();
      console.error('Google login error:', err);
      UI.toast('Error al procesar la autenticación de Google', 'error');
    }
  }
};

// Registrar callback global para Google
window.handleGoogleCredential = function(response) {
  Auth.handleGoogleCredential(response);
};
