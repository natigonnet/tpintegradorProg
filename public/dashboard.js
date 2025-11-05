(() => {
    let salones = [];
    const charts = { cap: null, price: null };
    const qs = (s) => document.querySelector(s);
  
    const els = {
      adminBadge: qs('#adminBadge'),
      adminSection: qs('#adminSection'),
      darkToggle: qs('#darkToggle'),
      kpiTotal: qs('#kpiTotal'),
      kpiCapacidad: qs('#kpiCapacidad'),
      kpiPromedio: qs('#kpiPromedio'),
      kpiCapProm: qs('#kpiCapProm'),
      tBody: qs('#salonesTable tbody'),
      loginOverlay: qs('#loginOverlay'),
      loginForm: qs('#loginForm'),
      loginUsuario: qs('#loginUsuario'),
      loginPassword: qs('#loginPassword'),
      loginBtn: qs('#loginBtn'),
      loginError: qs('#loginError'),
      logoutBtn: qs('#logoutBtn'),
      installBtn: qs('#installBtn'),
      reporteBtn: qs('#reporteBtn'),
      reporteFiltros: qs('#reporteFiltros'),
      runReporteBtn: qs('#runReporteBtn'),
      reportePanel: qs('#reportePanel'),
      reporteContenido: qs('#reporteContenido'),
    };
  
    const isDark = () => document.body.classList.contains('dark');
    const money = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 2 }).format(Number(n || 0));
    const setAdminUI = (logueado) => {
      els.adminBadge.textContent = logueado ? 'Admin conectado' : 'Invitado';
      els.adminBadge.style.borderColor = logueado ? 'var(--green)' : 'var(--edge)';
      els.adminSection.style.display = logueado ? 'block' : 'none';
    };
    const showLogin = () => els.loginOverlay.classList.add('show');
    const hideLogin = () => els.loginOverlay.classList.remove('show');
  
    async function cargarDatos() {
      if (charts.cap) { charts.cap.destroy(); charts.cap = null; }
      if (charts.price) { charts.price.destroy(); charts.price = null; }
  
      try {
        const resp = await fetch('/servicios/dashboard/salones');
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        const data = await resp.json();
        salones = data.datos || [];
  
        els.kpiTotal.textContent = salones.length;
        const totalCap = salones.reduce((s, x) => s + (parseInt(x.capacidad) || 0), 0);
        const totalImp = salones.reduce((s, x) => s + (parseFloat(x.importe) || 0), 0);
        const promImp = salones.length ? totalImp / salones.length : 0;
        const promCap = salones.length ? totalCap / salones.length : 0;
  
        els.kpiCapacidad.textContent = totalCap;
        els.kpiPromedio.textContent = money(promImp);
        els.kpiCapProm.textContent = Math.round(promCap);
  
        els.tBody.innerHTML = '';
        for (const s of salones) {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${s.salon_id}</td>
            <td>${s.titulo}</td>
            <td>${s.direccion}</td>
            <td>${s.capacidad}</td>
            <td>${money(s.importe)}</td>`;
          els.tBody.appendChild(tr);
        }
  
        crearGraficos();
      } catch (err) {
        console.error('Error al cargar datos:', err);
        alert('Error al cargar datos. Verifica la conexión.');
      }
    }
  
    function crearGraficos() {
      const labels = salones.map((s) => s.titulo);
      const capacidades = salones.map((s) => Number(s.capacidad || 0));
      const precios = salones.map((s) => Number(s.importe || 0));
  
      const gridColor = isDark() ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.12)';
      const tickColor = isDark() ? '#cfd8e3' : '#425466';
      const barBg = isDark() ? 'rgba(113,166,255,.35)' : 'rgba(173,216,230,.7)';
      const barBorder = isDark() ? 'rgba(113,166,255,.8)' : 'rgba(135,206,250,.8)';
      const lineBorder = isDark() ? 'rgba(111,207,151,1)' : 'rgba(46,204,113,1)';
      const lineFill = isDark() ? 'rgba(111,207,151,.15)' : 'rgba(46,204,113,.2)';
  
      const ctx1 = document.getElementById('capacidadChart').getContext('2d');
      charts.cap = new Chart(ctx1, {
        type: 'bar',
        data: { labels, datasets: [{ label: 'Capacidad', data: capacidades, backgroundColor: barBg, borderColor: barBorder, borderWidth: 1 }] },
        options: {
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: tickColor } },
            x: { grid: { display: false }, ticks: { color: tickColor } },
          },
          plugins: { legend: { labels: { color: tickColor } } },
        },
      });
  
      const ctx2 = document.getElementById('precioChart').getContext('2d');
      charts.price = new Chart(ctx2, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Precio ($)', data: precios, borderColor: lineBorder, backgroundColor: lineFill,
            borderWidth: 2, tension: .35, fill: true, pointRadius: 4, pointHoverRadius: 6
          }],
        },
        options: {
          maintainAspectRatio: false,
          scales: {
            y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: tickColor } },
            x: { grid: { display: false }, ticks: { color: tickColor } },
          },
          plugins: { legend: { labels: { color: tickColor } } },
        },
      });
    }
  
    async function hacerLogin(e) {
      e.preventDefault();
      els.loginError.textContent = '';
      els.loginBtn.disabled = true; els.loginBtn.textContent = 'Ingresando...';
      try {
        const usuario = els.loginUsuario.value.trim();
        const password = els.loginPassword.value;
        const r = await fetch('/servicios/dashboard/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usuario, password })
        });
        if (!r.ok) {
          const err = await r.json().catch(() => ({ mensaje: 'Credenciales inválidas' }));
          throw new Error(err.mensaje || 'Error al iniciar sesión');
        }
        const body = await r.json();
        localStorage.setItem('admin_token', body.token || '1');
        setAdminUI(true);
        hideLogin();
        await cargarDatos();
      } catch (e) {
        els.loginError.textContent = e.message || 'Error al iniciar sesión';
      } finally {
        els.loginBtn.disabled = false; els.loginBtn.textContent = 'Ingresar';
      }
    }
  
    function cerrarSesion() {
      localStorage.removeItem('admin_token');
      setAdminUI(false);
      showLogin();
    }
  
    els.installBtn.addEventListener('click', async () => {
      const token = localStorage.getItem('admin_token'); if (!token) return showLogin();
      if (!confirm('¿Instalar/Actualizar los procedimientos almacenados en la base de datos?')) return;
      try {
        els.installBtn.disabled = true; els.installBtn.textContent = 'Instalando...';
        const r = await fetch('/servicios/dashboard/instalar-sps', { method: 'POST', headers: { Authorization: 'Bearer ' + token } });
        const data = await r.json(); if (!r.ok) throw new Error(data.mensaje || 'Error desconocido');
        alert(data.mensaje || 'SPs instalados/actualizados correctamente');
      } catch (e) { alert(e.message || e); }
      finally { els.installBtn.disabled = false; els.installBtn.textContent = 'Instalar/Actualizar SPs en la BD'; }
    });
  
    els.reporteBtn.addEventListener('click', () => {
      const token = localStorage.getItem('admin_token'); if (!token) return showLogin();
      els.reporteFiltros.style.display = 'flex';
      els.reportePanel.style.display = 'block';
    });
  
    els.runReporteBtn.addEventListener('click', async () => {
      const token = localStorage.getItem('admin_token'); if (!token) return showLogin();
      const params = new URLSearchParams();
      const i = qs('#f_inicio').value; const f = qs('#f_fin').value;
      const s = qs('#f_salon').value;  const u = qs('#f_usuario').value;
      if (i) params.append('fecha_inicio', i);
      if (f) params.append('fecha_fin', f);
      if (s) params.append('salon_id', s);
      if (u) params.append('usuario_id', u);
  
      try {
        els.runReporteBtn.disabled = true; els.runReporteBtn.textContent = 'Generando...';
        const r = await fetch('/servicios/dashboard/reporte-reservas?' + params.toString(), { headers: { Authorization: 'Bearer ' + token } });
        const data = await r.json(); if (!r.ok) throw new Error(data.mensaje || 'Error generando informe');
        const filas = data.datos || [];
        if (!filas.length) { els.reporteContenido.textContent = 'No se encontraron registros.'; return; }
  
        const claves = Object.keys(filas[0]);
        let html = '<div class="table-wrap"><table class="report-table"><thead><tr>';
        for (const k of claves) html += `<th>${k}</th>`;
        html += '</tr></thead><tbody>';
        for (const fila of filas) {
          html += '<tr>';
          for (const k of claves) {
            let v = fila[k]; const kl = k.toLowerCase();
            if (v == null) v = '';
            else if (kl.includes('importe') || kl.includes('total') || kl.includes('precio')) v = money(v);
            else if (kl.includes('fecha')) { try { v = new Date(v).toISOString().slice(0, 10); } catch { } }
            html += `<td>${v}</td>`;
          }
          html += '</tr>';
        }
        html += '</tbody></table></div>';
        els.reporteContenido.innerHTML = html;
      } catch (e) {
        alert(e.message || e);
      } finally {
        els.runReporteBtn.disabled = false; els.runReporteBtn.textContent = 'Ejecutar';
      }
    });
  
    els.darkToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      crearGraficos();
      els.darkToggle.textContent = document.body.classList.contains('dark') ? '☀️ Modo claro' : '🌙 Modo oscuro';
    });
  
    els.loginForm.addEventListener('submit', hacerLogin);
    els.logoutBtn.addEventListener('click', cerrarSesion);
  
    window.addEventListener('DOMContentLoaded', async () => {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark');
        els.darkToggle.textContent = '☀️ Modo claro';
      }
      const token = localStorage.getItem('admin_token');
      if (token) { setAdminUI(true); await cargarDatos(); }
      else { setAdminUI(false); showLogin(); }
    });
  })();
  