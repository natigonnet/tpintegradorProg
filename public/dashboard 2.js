/**
 * Módulo principal del Dashboard
 * Gestiona la interfaz de usuario y las interacciones con el backend
 */
(() => {
  // Variables globales del módulo
  let listaSalones = [];
  const graficos = { capacidad: null, precio: null };
  
  // Función auxiliar para seleccionar elementos del DOM
  const seleccionarElemento = (selector) => document.querySelector(selector);
  
  // Referencias a elementos del DOM
  const elementosDOM = {
    badgeAdmin: seleccionarElemento('#adminBadge'),
    seccionAdmin: seleccionarElemento('#adminSection'),
    toggleTema: seleccionarElemento('#darkToggle'),
    kpiTotal: seleccionarElemento('#kpiTotal'),
    kpiCapacidad: seleccionarElemento('#kpiCapacidad'),
    kpiPromedio: seleccionarElemento('#kpiPromedio'),
    kpiCapProm: seleccionarElemento('#kpiCapProm'),
    cuerpoTabla: seleccionarElemento('#salonesTable tbody'),
    overlayLogin: seleccionarElemento('#loginOverlay'),
    formularioLogin: seleccionarElemento('#loginForm'),
    inputUsuario: seleccionarElemento('#loginUsuario'),
    inputPassword: seleccionarElemento('#loginPassword'),
    botonLogin: seleccionarElemento('#loginBtn'),
    mensajeError: seleccionarElemento('#loginError'),
    botonCerrarSesion: seleccionarElemento('#logoutBtn'),
    botonInstalarSPs: seleccionarElemento('#installBtn'),
    botonReporte: seleccionarElemento('#reporteBtn'),
    filtrosReporte: seleccionarElemento('#reporteFiltros'),
    botonEjecutarReporte: seleccionarElemento('#runReporteBtn'),
    panelReporte: seleccionarElemento('#reportePanel'),
    contenidoReporte: seleccionarElemento('#reporteContenido'),
  };
  
  /**
   * Verifica si el tema oscuro está activo
   */
  const esTemaOscuro = () => document.body.classList.contains('dark');
  
  /**
   * Formatea un número como moneda en pesos argentinos
   */
  const formatearMoneda = (numero) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 2
    }).format(Number(numero || 0));
  };
  
  /**
   * Actualiza la interfaz de usuario según el estado de autenticación
   */
  const actualizarInterfazAdmin = (estaLogueado) => {
    elementosDOM.badgeAdmin.textContent = estaLogueado ? 'Admin conectado' : 'Invitado';
    elementosDOM.badgeAdmin.style.borderColor = estaLogueado ? 'var(--green)' : 'var(--edge)';
    elementosDOM.seccionAdmin.style.display = estaLogueado ? 'block' : 'none';
  };
  
  /**
   * Muestra el modal de login
   */
  const mostrarLogin = () => elementosDOM.overlayLogin.classList.add('show');
  
  /**
   * Oculta el modal de login
   */
  const ocultarLogin = () => elementosDOM.overlayLogin.classList.remove('show');
  
  /**
   * Carga los datos de salones desde el backend
   */
  async function cargarDatosSalones() {
    // Destruir gráficos existentes antes de crear nuevos
    if (graficos.capacidad) {
      graficos.capacidad.destroy();
      graficos.capacidad = null;
    }
    if (graficos.precio) {
      graficos.precio.destroy();
      graficos.precio = null;
    }
    
    try {
      const respuesta = await fetch('/servicios/dashboard/salones');
      if (!respuesta.ok) {
        throw new Error('HTTP ' + respuesta.status);
      }
      const datos = await respuesta.json();
      listaSalones = datos.datos || [];
      
      // Actualizar KPIs
      elementosDOM.kpiTotal.textContent = listaSalones.length;
      const capacidadTotal = listaSalones.reduce((suma, salon) => 
        suma + (parseInt(salon.capacidad) || 0), 0);
      const importeTotal = listaSalones.reduce((suma, salon) => 
        suma + (parseFloat(salon.importe) || 0), 0);
      const promedioImporte = listaSalones.length ? importeTotal / listaSalones.length : 0;
      const promedioCapacidad = listaSalones.length ? capacidadTotal / listaSalones.length : 0;
      
      elementosDOM.kpiCapacidad.textContent = capacidadTotal;
      elementosDOM.kpiPromedio.textContent = formatearMoneda(promedioImporte);
      elementosDOM.kpiCapProm.textContent = Math.round(promedioCapacidad);
      
      // Actualizar tabla
      elementosDOM.cuerpoTabla.innerHTML = '';
      for (const salon of listaSalones) {
        const fila = document.createElement('tr');
        fila.innerHTML = `
          <td>${salon.salon_id}</td>
          <td>${salon.titulo}</td>
          <td>${salon.direccion}</td>
          <td>${salon.capacidad}</td>
          <td>${formatearMoneda(salon.importe)}</td>`;
        elementosDOM.cuerpoTabla.appendChild(fila);
        }
  
        crearGraficos();
    } catch (error) {
      console.error('Error al cargar datos:', error);
        alert('Error al cargar datos. Verifica la conexión.');
      }
    }
  
  /**
   * Crea los gráficos de capacidad y precios
   */
    function crearGraficos() {
    // Destruir gráficos existentes antes de crear nuevos
    if (graficos.capacidad) {
      graficos.capacidad.destroy();
      graficos.capacidad = null;
    }
    if (graficos.precio) {
      graficos.precio.destroy();
      graficos.precio = null;
    }
    
    const etiquetas = listaSalones.map((salon) => salon.titulo);
    const capacidades = listaSalones.map((salon) => Number(salon.capacidad || 0));
    const precios = listaSalones.map((salon) => Number(salon.importe || 0));
    
    const colorGrid = esTemaOscuro() ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.12)';
    const colorTick = esTemaOscuro() ? '#cfd8e3' : '#425466';
    const colorFondoBarras = esTemaOscuro() ? 'rgba(113,166,255,.35)' : 'rgba(173,216,230,.7)';
    const colorBordeBarras = esTemaOscuro() ? 'rgba(113,166,255,.8)' : 'rgba(135,206,250,.8)';
    const colorBordeLinea = esTemaOscuro() ? 'rgba(111,207,151,1)' : 'rgba(46,204,113,1)';
    const colorRellenoLinea = esTemaOscuro() ? 'rgba(111,207,151,.15)' : 'rgba(46,204,113,.2)';
    
    // Gráfico de barras - Capacidad
    const canvasCapacidad = document.getElementById('capacidadChart');
    const contextoCapacidad = canvasCapacidad.getContext('2d');
    graficos.capacidad = new Chart(contextoCapacidad, {
        type: 'bar',
      data: {
        labels: etiquetas,
        datasets: [{
          label: 'Capacidad',
          data: capacidades,
          backgroundColor: colorFondoBarras,
          borderColor: colorBordeBarras,
          borderWidth: 1
        }]
      },
        options: {
          maintainAspectRatio: false,
          scales: {
          y: {
            beginAtZero: true,
            grid: { color: colorGrid },
            ticks: { color: colorTick }
          },
          x: {
            grid: { display: false },
            ticks: { color: colorTick }
          }
        },
        plugins: {
          legend: { labels: { color: colorTick } }
        }
      }
    });
    
    // Gráfico de línea - Precios
    const canvasPrecio = document.getElementById('precioChart');
    const contextoPrecio = canvasPrecio.getContext('2d');
    graficos.precio = new Chart(contextoPrecio, {
        type: 'line',
        data: {
        labels: etiquetas,
          datasets: [{
          label: 'Precio ($)',
          data: precios,
          borderColor: colorBordeLinea,
          backgroundColor: colorRellenoLinea,
          borderWidth: 2,
          tension: 0.35,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
        },
        options: {
          maintainAspectRatio: false,
          scales: {
          y: {
            beginAtZero: true,
            grid: { color: colorGrid },
            ticks: { color: colorTick }
          },
          x: {
            grid: { display: false },
            ticks: { color: colorTick }
          }
        },
        plugins: {
          legend: { labels: { color: colorTick } }
        }
      }
    });
  }
  
  /**
   * Maneja el proceso de inicio de sesión
   */
  async function procesarLogin(evento) {
    evento.preventDefault();
    elementosDOM.mensajeError.textContent = '';
    elementosDOM.botonLogin.disabled = true;
    elementosDOM.botonLogin.textContent = 'Ingresando...';
    
    try {
      const usuario = elementosDOM.inputUsuario.value.trim();
      const password = elementosDOM.inputPassword.value;
      
      const respuesta = await fetch('/servicios/dashboard/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usuario, password })
        });
      
      if (!respuesta.ok) {
        const datosError = await respuesta.json().catch(() => ({ mensaje: 'Credenciales inválidas' }));
        throw new Error(datosError.mensaje || 'Error al iniciar sesión');
      }
      
      const datosRespuesta = await respuesta.json();
      if (!datosRespuesta.token) {
        throw new Error('No se recibió token del servidor');
      }
      localStorage.setItem('admin_token', datosRespuesta.token);
      actualizarInterfazAdmin(true);
      ocultarLogin();
      await cargarDatosSalones();
    } catch (error) {
      elementosDOM.mensajeError.textContent = error.message || 'Error al iniciar sesión';
    } finally {
      elementosDOM.botonLogin.disabled = false;
      elementosDOM.botonLogin.textContent = 'Ingresar';
    }
  }
  
  /**
   * Cierra la sesión del administrador
   */
    function cerrarSesion() {
      localStorage.removeItem('admin_token');
    actualizarInterfazAdmin(false);
    mostrarLogin();
  }
  
  /**
   * Instala los procedimientos almacenados en la base de datos
   */
  elementosDOM.botonInstalarSPs.addEventListener('click', async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      mostrarLogin();
      return;
    }
    
    if (!confirm('¿Instalar/Actualizar los procedimientos almacenados en la base de datos?')) {
      return;
    }
    
    try {
      elementosDOM.botonInstalarSPs.disabled = true;
      elementosDOM.botonInstalarSPs.textContent = 'Instalando...';
      
      const respuesta = await fetch('/servicios/dashboard/instalar-sps', {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token }
      });
      
      const datos = await respuesta.json();
      if (!respuesta.ok) {
        throw new Error(datos.mensaje || 'Error desconocido');
      }
      
      alert(datos.mensaje || 'SPs instalados/actualizados correctamente');
    } catch (error) {
      alert(error.message || error);
    } finally {
      elementosDOM.botonInstalarSPs.disabled = false;
      elementosDOM.botonInstalarSPs.textContent = 'Instalar/Actualizar SPs en la BD';
    }
  });
  
  /**
   * Muestra los filtros del reporte
   */
  elementosDOM.botonReporte.addEventListener('click', () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      mostrarLogin();
      return;
    }
    elementosDOM.filtrosReporte.style.display = 'flex';
    elementosDOM.panelReporte.style.display = 'block';
  });
  
  /**
   * Genera el reporte de reservas con los filtros seleccionados
   */
  elementosDOM.botonEjecutarReporte.addEventListener('click', async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      mostrarLogin();
      return;
    }
    
    const parametros = new URLSearchParams();
    const fechaInicio = seleccionarElemento('#f_inicio').value.trim();
    const fechaFin = seleccionarElemento('#f_fin').value.trim();
    const salonId = seleccionarElemento('#f_salon').value.trim();
    const usuarioId = seleccionarElemento('#f_usuario').value.trim();
    
    // Validar formato de fechas si están presentes (deben ser YYYY-MM-DD)
    if (fechaInicio) {
      // Verificar que la fecha tenga formato válido
      const fechaInicioDate = new Date(fechaInicio);
      if (isNaN(fechaInicioDate.getTime())) {
        throw new Error('La fecha de inicio no tiene un formato válido. Use el formato YYYY-MM-DD');
      }
      parametros.append('fecha_inicio', fechaInicio);
    }
    
    if (fechaFin) {
      // Verificar que la fecha tenga formato válido
      const fechaFinDate = new Date(fechaFin);
      if (isNaN(fechaFinDate.getTime())) {
        throw new Error('La fecha de fin no tiene un formato válido. Use el formato YYYY-MM-DD');
      }
      parametros.append('fecha_fin', fechaFin);
    }
    
    // Validar que fecha_inicio no sea posterior a fecha_fin
    if (fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      if (inicio > fin) {
        throw new Error('La fecha de inicio no puede ser posterior a la fecha de fin');
      }
    }
    
    // Solo agregar parámetros si tienen valor
    if (salonId && salonId !== '') parametros.append('salon_id', salonId);
    if (usuarioId && usuarioId !== '') parametros.append('usuario_id', usuarioId);
    
    try {
      elementosDOM.botonEjecutarReporte.disabled = true;
      elementosDOM.botonEjecutarReporte.textContent = 'Generando...';
      
      const respuesta = await fetch('/servicios/dashboard/reporte-reservas?' + parametros.toString(), {
        headers: { 
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        }
      });
      
      const datos = await respuesta.json();
      if (!respuesta.ok) {
        // Si el error es 401, el token puede haber expirado
        if (respuesta.status === 401) {
          localStorage.removeItem('admin_token');
          actualizarInterfazAdmin(false);
          mostrarLogin();
          throw new Error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        }
        throw new Error(datos.mensaje || 'Error generando informe');
      }
      
      const filas = datos.datos || [];
      if (!filas.length) {
        elementosDOM.contenidoReporte.textContent = 'No se encontraron registros.';
        return;
      }
      
      // Generar tabla HTML con los resultados
        const claves = Object.keys(filas[0]);
        let html = '<div class="table-wrap"><table class="report-table"><thead><tr>';
      for (const clave of claves) {
        html += `<th>${clave}</th>`;
      }
        html += '</tr></thead><tbody>';
      
        for (const fila of filas) {
          html += '<tr>';
        for (const clave of claves) {
          let valor = fila[clave];
          const claveMinuscula = clave.toLowerCase();
          
          if (valor == null) {
            valor = '';
          } else if (claveMinuscula.includes('importe') || claveMinuscula.includes('total') || claveMinuscula.includes('precio')) {
            valor = formatearMoneda(valor);
          } else if (claveMinuscula.includes('fecha')) {
            try {
              valor = new Date(valor).toISOString().slice(0, 10);
            } catch (error) {
              // Mantener el valor original si hay error al formatear
            }
          }
          html += `<td>${valor}</td>`;
        }
        html += '</tr>';
      }
      html += '</tbody></table></div>';
      elementosDOM.contenidoReporte.innerHTML = html;
    } catch (error) {
      alert(error.message || error);
    } finally {
      elementosDOM.botonEjecutarReporte.disabled = false;
      elementosDOM.botonEjecutarReporte.textContent = 'Ejecutar';
    }
  });
  
  /**
   * Alterna entre tema claro y oscuro
   */
  elementosDOM.toggleTema.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      crearGraficos();
    elementosDOM.toggleTema.textContent = document.body.classList.contains('dark')
      ? '☀️ Modo claro'
      : '🌙 Modo oscuro';
    });
  
  // Event listeners
  elementosDOM.formularioLogin.addEventListener('submit', procesarLogin);
  elementosDOM.botonCerrarSesion.addEventListener('click', cerrarSesion);
  
  /**
   * Inicialización cuando el DOM está listo
   */
    window.addEventListener('DOMContentLoaded', async () => {
    // Detectar preferencia de tema del sistema
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark');
      elementosDOM.toggleTema.textContent = '☀️ Modo claro';
      }
    
    // Verificar si hay token guardado
      const token = localStorage.getItem('admin_token');
    if (token) {
      actualizarInterfazAdmin(true);
      await cargarDatosSalones();
    } else {
      actualizarInterfazAdmin(false);
      mostrarLogin();
    }
    });
  })();
  