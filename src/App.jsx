import React, { useState } from 'react';
import jsPDF from 'jspdf';
import dayjs from 'dayjs';

const usuariosPermitidos = [{ usuario: "admin", contrasena: "1234" }];

function App() {
  const [autenticado, setAutenticado] = useState(false);
  const [credenciales, setCredenciales] = useState({ usuario: "", contrasena: "" });
  const [datos, setDatos] = useState({
    fechaInicio: '', fechaFin: '', salario: '', retenciones: 0,
    bono14Pagado: false, aguinaldoPagado: false, vacacionesGozadas: false,
    indemnizacionInjustificada: false, otrosBonos: [], nuevoBono: ''
  });
  const [resultado, setResultado] = useState(null);

  const login = () => {
    const valido = usuariosPermitidos.some(u =>
      u.usuario === credenciales.usuario && u.contrasena === credenciales.contrasena
    );
    setAutenticado(valido);
    if (!valido) alert("Credenciales incorrectas");
  };

  const agregarBono = () => {
    if (datos.nuevoBono) {
      setDatos(prev => ({
        ...prev,
        otrosBonos: [...prev.otrosBonos, parseFloat(prev.nuevoBono)],
        nuevoBono: ''
      }));
    }
  };

  const calcular = () => {
    const inicio = dayjs(datos.fechaInicio);
    const fin = dayjs(datos.fechaFin);
    const diasTrabajados = fin.diff(inicio, 'day');
    const aniosTrabajados = fin.diff(inicio, 'year');
    const diasUltimoAnio = fin.diff(inicio.add(aniosTrabajados, 'year'), 'day');
    const salario = parseFloat(datos.salario);
    const salarioDiario = salario / 30;

    const bono14 = datos.bono14Pagado ? salario * (diasUltimoAnio / 365) :
      salario * aniosTrabajados + salario * (diasUltimoAnio / 365);
    const aguinaldo = datos.aguinaldoPagado ? salario * (diasUltimoAnio / 365) :
      salario * aniosTrabajados + salario * (diasUltimoAnio / 365);
    const vacaciones = datos.vacacionesGozadas ?
      salarioDiario * (15 / 365) * diasUltimoAnio :
      salarioDiario * 15 * aniosTrabajados + salarioDiario * (15 / 365) * diasUltimoAnio;
    const indemnizacion = datos.indemnizacionInjustificada ?
      salario * aniosTrabajados + salario * (diasUltimoAnio / 365) : 0;

    const otrosBonos = datos.otrosBonos.reduce((acc, b) => acc + b, 0);
    const total = salario + bono14 + aguinaldo + vacaciones + indemnizacion + parseFloat(datos.retenciones) + otrosBonos;

    setResultado({ diasTrabajados, bono14, aguinaldo, vacaciones, indemnizacion, otrosBonos, total });
  };

  const estilos = {
    container: { backgroundColor: "#f4f4f5", minHeight: "100vh", padding: "2rem", fontFamily: "sans-serif" },
    card: { backgroundColor: "#fff", padding: "1.5rem", borderRadius: "8px", maxWidth: "700px", margin: "0 auto", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" },
    title: { fontSize: "1.5rem", fontWeight: "bold", color: "#1f2937", marginBottom: "1rem" },
    sectionTitle: { marginTop: "1rem", fontWeight: "bold", color: "#374151" },
    label: { display: "block", marginTop: "0.75rem", fontWeight: "500", color: "#4b5563" },
    input: { width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #d1d5db", marginTop: "0.25rem" },
    button: { marginTop: "1rem", backgroundColor: "#2563eb", color: "#fff", padding: "0.5rem 1rem", borderRadius: "4px", border: "none", cursor: "pointer" },
    result: { marginTop: "1rem", backgroundColor: "#f9fafb", padding: "1rem", borderRadius: "6px" }
  };

  if (!autenticado) {
    return (
      <div style={estilos.container}>
        <div style={estilos.card}>
          <h2 style={estilos.title}>Acceso Privado</h2>
          <label style={estilos.label}>Usuario</label>
          <input style={estilos.input} onChange={e => setCredenciales({ ...credenciales, usuario: e.target.value })} />
          <label style={estilos.label}>Contraseña</label>
          <input type="password" style={estilos.input} onChange={e => setCredenciales({ ...credenciales, contrasena: e.target.value })} />
          <button style={estilos.button} onClick={login}>Entrar</button>
        </div>
      </div>
    );
  }

  return (
    <div style={estilos.container}>
      <div style={estilos.card}>
        <h1 style={estilos.title}>Calculadora de Prestaciones</h1>

        <div>
          <label style={estilos.label}>Fecha de inicio</label>
          <input type="date" style={estilos.input} onChange={e => setDatos({ ...datos, fechaInicio: e.target.value })} />
          <label style={estilos.label}>Fecha de finalización</label>
          <input type="date" style={estilos.input} onChange={e => setDatos({ ...datos, fechaFin: e.target.value })} />
        </div>

        <div>
          <label style={estilos.label}>Salario mensual (Q)</label>
          <input type="number" style={estilos.input} onChange={e => setDatos({ ...datos, salario: e.target.value })} />
          <label style={estilos.label}>Retenciones arbitrarias (Q)</label>
          <input type="number" style={estilos.input} onChange={e => setDatos({ ...datos, retenciones: e.target.value })} />
        </div>

        <div>
          <p style={estilos.sectionTitle}>¿El patrono cumplió con lo siguiente?</p>
          <label><input type="checkbox" onChange={e => setDatos({ ...datos, bono14Pagado: e.target.checked })} /> Bono 14</label><br />
          <label><input type="checkbox" onChange={e => setDatos({ ...datos, aguinaldoPagado: e.target.checked })} /> Aguinaldo</label><br />
          <label><input type="checkbox" onChange={e => setDatos({ ...datos, vacacionesGozadas: e.target.checked })} /> Vacaciones</label><br />
        </div>

        <div>
          <p style={estilos.sectionTitle}>Despido</p>
          <label><input type="checkbox" onChange={e => setDatos({ ...datos, indemnizacionInjustificada: e.target.checked })} /> Fue injustificado</label>
        </div>

        <div>
          <label style={estilos.label}>Agregar otro bono (Q)</label>
          <input type="number" value={datos.nuevoBono} style={estilos.input} onChange={e => setDatos({ ...datos, nuevoBono: e.target.value })} />
          <button style={estilos.button} onClick={agregarBono}>Agregar bono</button>
        </div>

        <button style={estilos.button} onClick={calcular}>Calcular</button>

        {resultado && (
          <div style={estilos.result}>
            <p>Días trabajados: {resultado.diasTrabajados}</p>
            <p>Bono 14: Q{resultado.bono14.toFixed(2)}</p>
            <p>Aguinaldo: Q{resultado.aguinaldo.toFixed(2)}</p>
            <p>Vacaciones: Q{resultado.vacaciones.toFixed(2)}</p>
            <p>Indemnización: Q{resultado.indemnizacion.toFixed(2)}</p>
            <p>Otros bonos: Q{resultado.otrosBonos.toFixed(2)}</p>
            <p><strong>Total a pagar: Q{resultado.total.toFixed(2)}</strong></p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;