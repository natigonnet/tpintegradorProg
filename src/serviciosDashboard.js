const API_BASE = process.env.API_BASE || "http://localhost:3000/api/v1";

export default class ServicioDashboard {
  static async obtenerSalones() {
    const r = await fetch(`${API_BASE}/salones`);
    if (!r.ok) throw new Error(`Falló obtenerSalones: HTTP ${r.status}`);
    return r.json();
  }

  static async iniciarSesion({ usuario, password }) {
    const r = await fetch(`${API_BASE}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, password }),
    });
    if (!r.ok) {
      let body;
      try { body = await r.json(); } catch { /* noop */ }
      const msg = body?.mensaje || `Falló iniciarSesion: HTTP ${r.status}`;
      const e = new Error(msg);
      e.codigo = r.status;
      throw e;
    }
    return r.json(); // { token: "..." }
  }

  static async instalarSPs(token) {
    const r = await fetch(`${API_BASE}/admin/instalar-sps`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await r.json().catch(() => ({}));
    if (!r.ok) {
      const e = new Error(body?.mensaje || `Falló instalarSPs: HTTP ${r.status}`);
      e.codigo = r.status;
      throw e;
    }
    return body;
  }

  static async generarReporte(params, token) {
    const qs = new URLSearchParams(params).toString();
    const r = await fetch(`${API_BASE}/admin/reporte-reservas?${qs}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await r.json().catch(() => ({}));
    if (!r.ok) {
      const e = new Error(body?.mensaje || `Falló generarReporte: HTTP ${r.status}`);
      e.codigo = r.status;
      throw e;
    }
    return body; // { datos: [...] }
  }
}
