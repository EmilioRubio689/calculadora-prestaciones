import React, { useState } from 'react';
import jsPDF from 'jspdf';
import dayjs from 'dayjs';

const usuariosPermitidos = [{ usuario: "admin", contrasena: "1234" }];

function App() {
  const [autenticado, setAutenticado] = useState(false);
  const [credenciales, setCredenciales] = useState({ usuario: "", contrasena: "" });
  const [datos, setDatos] = useState({
    fechaInicio: '', fechaFin: '', salario: '', anio: '2024', tipoActividad: 'noAgricola',
    retenciones: 0, bono14Pagado: false, aguinaldoPagado: false, vacacionesGozadas: false,
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

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text("Resumen de Cálculo de Prestaciones", 10, 10);
    const lines = [
      `Días trabajados: ${resultado.diasTrabajados}`,
      `Bono 14: Q${resultado.bono14.toFixed(2)}`,
      `Aguinaldo: Q${resultado.aguinaldo.toFixed(2)}`,
      `Vacaciones: Q${resultado.vacaciones.toFixed(2)}`,
      `Indemnización: Q${resultado.indemnizacion.toFixed(2)}`,
      `Otros bonos: Q${resultado.otrosBonos.toFixed(2)}`,
      `Total: Q${resultado.total.toFixed(2)}`
    ];
    lines.forEach((line, i) => doc.text(line, 10, 20 + (i * 10)));
    doc.save("prestaciones.pdf");
  };

  const copiarResultados = () => {
    const texto = `
Días trabajados: ${resultado.diasTrabajados}
Bono 14: Q${resultado.bono14.toFixed(2)}
Aguinaldo: Q${resultado.aguinaldo.toFixed(2)}
Vacaciones: Q${resultado.vacaciones.toFixed(2)}
Indemnización: Q${resultado.indemnizacion.toFixed(2)}
Otros bonos: Q${resultado.otrosBonos.toFixed(2)}
Total: Q${resultado.total.toFixed(2)}
    `;
    navigator.clipboard.writeText(texto);
    alert("Resultados copiados al portapapeles");
  };

  if (!autenticado) {
    return (
      <div style={{ padding: '2rem' }}>
        <h2>Iniciar sesión</h2>
        <input placeholder="Usuario" onChange={e => setCredenciales({ ...credenciales, usuario: e.target.value })} />
        <input type="password" placeholder="Contraseña" onChange={e => setCredenciales({ ...credenciales, contrasena: e.target.value })} />
        <button onClick={login}>Entrar</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Calculadora de Prestaciones</h1>
      <label>Fecha inicio:</label><input type="date" onChange={e => setDatos({ ...datos, fechaInicio: e.target.value })} /><br />
      <label>Fecha fin:</label><input type="date" onChange={e => setDatos({ ...datos, fechaFin: e.target.value })} /><br />
      <label>Salario:</label><input type="number" onChange={e => setDatos({ ...datos, salario: e.target.value })} /><br />

      <label>¿Pagó Bono 14?</label>
      <input type="radio" name="b14" onChange={() => setDatos({ ...datos, bono14Pagado: true })} />Sí
      <input type="radio" name="b14" onChange={() => setDatos({ ...datos, bono14Pagado: false })} />No<br />

      <label>¿Pagó Aguinaldo?</label>
      <input type="radio" name="aguinaldo" onChange={() => setDatos({ ...datos, aguinaldoPagado: true })} />Sí
      <input type="radio" name="aguinaldo" onChange={() => setDatos({ ...datos, aguinaldoPagado: false })} />No<br />

      <label>¿Gozó vacaciones?</label>
      <input type="radio" name="vacaciones" onChange={() => setDatos({ ...datos, vacacionesGozadas: true })} />Sí
      <input type="radio" name="vacaciones" onChange={() => setDatos({ ...datos, vacacionesGozadas: false })} />No<br />

      <label>¿Fue despido injustificado?</label>
      <input type="radio" name="injustificado" onChange={() => setDatos({ ...datos, indemnizacionInjustificada: true })} />Sí
      <input type="radio" name="injustificado" onChange={() => setDatos({ ...datos, indemnizacionInjustificada: false })} />No<br />

      <label>Retenciones arbitrarias:</label>
      <input type="number" onChange={e => setDatos({ ...datos, retenciones: e.target.value })} /><br />

      <label>Agregar bono:</label>
      <input type="number" value={datos.nuevoBono} onChange={e => setDatos({ ...datos, nuevoBono: e.target.value })} />
      <button onClick={agregarBono}>Agregar</button><br />

      <button onClick={calcular}>Calcular</button>

      {resultado && (
        <div style={{ marginTop: '1rem' }}>
          <p>Días trabajados: {resultado.diasTrabajados}</p>
          <p>Bono 14: Q{resultado.bono14.toFixed(2)}</p>
          <p>Aguinaldo: Q{resultado.aguinaldo.toFixed(2)}</p>
          <p>Vacaciones: Q{resultado.vacaciones.toFixed(2)}</p>
          <p>Indemnización: Q{resultado.indemnizacion.toFixed(2)}</p>
          <p>Otros bonos: Q{resultado.otrosBonos.toFixed(2)}</p>
          <p><strong>Total: Q{resultado.total.toFixed(2)}</strong></p>
          <button onClick={exportarPDF}>Exportar a PDF</button>
          <button onClick={copiarResultados}>Copiar</button>
        </div>
      )}
    </div>
  );
}

export default App;