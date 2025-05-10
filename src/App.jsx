import React, { useState } from 'react';
import jsPDF from 'jspdf';
import dayjs from 'dayjs';

const usuariosPermitidos = [{ usuario: "admin", contrasena: "1234" }];

function App() {
  const [autenticado, setAutenticado] = useState(false);
  const [credenciales, setCredenciales] = useState({ usuario: "", contrasena: "" });
  const [datos, setDatos] = useState({
    fechaInicio: '', fechaFin: '', salario: '', retenciones: 0,
    bono14Pagado: null, aguinaldoPagado: null, vacacionesGozadas: null,
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

    const bono14 = datos.bono14Pagado
      ? salario * (diasUltimoAnio / 365)
      : salario * aniosTrabajados + salario * (diasUltimoAnio / 365);

    const aguinaldo = datos.aguinaldoPagado
      ? salario * (diasUltimoAnio / 365)
      : salario * aniosTrabajados + salario * (diasUltimoAnio / 365);

    const vacaciones = datos.vacacionesGozadas
      ? salarioDiario * (15 / 365) * diasUltimoAnio
      : salarioDiario * 15 * aniosTrabajados + salarioDiario * (15 / 365) * diasUltimoAnio;

    const indemnizacion = datos.indemnizacionInjustificada
      ? salario * aniosTrabajados + salario * (diasUltimoAnio / 365)
      : 0;

    const otrosBonos = datos.otrosBonos.reduce((acc, b) => acc + b, 0);
    const total = salario + bono14 + aguinaldo + vacaciones + indemnizacion + parseFloat(datos.retenciones) + otrosBonos;

    setResultado({ diasTrabajados, bono14, aguinaldo, vacaciones, indemnizacion, otrosBonos, total });
  };

  if (!autenticado) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Acceso</h2>
          <input className="w-full mb-3 p-2 border rounded" placeholder="Usuario" onChange={e => setCredenciales({ ...credenciales, usuario: e.target.value })} />
          <input type="password" className="w-full mb-3 p-2 border rounded" placeholder="Contraseña" onChange={e => setCredenciales({ ...credenciales, contrasena: e.target.value })} />
          <button onClick={login} className="bg-blue-600 text-white w-full py-2 rounded">Entrar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-6 rounded shadow-md max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Calculadora de Prestaciones Laborales</h1>

        <label className="block font-medium text-gray-700 mt-4">Fecha de inicio</label>
        <input type="date" className="w-full p-2 border rounded" onChange={e => setDatos({ ...datos, fechaInicio: e.target.value })} />

        <label className="block font-medium text-gray-700 mt-4">Fecha de finalización</label>
        <input type="date" className="w-full p-2 border rounded" onChange={e => setDatos({ ...datos, fechaFin: e.target.value })} />

        <label className="block font-medium text-gray-700 mt-4">Salario mensual (Q)</label>
        <input type="number" className="w-full p-2 border rounded" onChange={e => setDatos({ ...datos, salario: e.target.value })} />

        <label className="block font-medium text-gray-700 mt-4">Retenciones arbitrarias (Q)</label>
        <input type="number" className="w-full p-2 border rounded" onChange={e => setDatos({ ...datos, retenciones: e.target.value })} />

        <div className="mt-6">
          <p className="font-semibold text-gray-700">¿El patrono pagó Bono 14?</p>
          <label className="mr-4"><input type="radio" name="bono14" onChange={() => setDatos({ ...datos, bono14Pagado: true })} /> Sí</label>
          <label><input type="radio" name="bono14" onChange={() => setDatos({ ...datos, bono14Pagado: false })} /> No</label>
        </div>

        <div className="mt-2">
          <p className="font-semibold text-gray-700">¿El patrono pagó Aguinaldo?</p>
          <label className="mr-4"><input type="radio" name="aguinaldo" onChange={() => setDatos({ ...datos, aguinaldoPagado: true })} /> Sí</label>
          <label><input type="radio" name="aguinaldo" onChange={() => setDatos({ ...datos, aguinaldoPagado: false })} /> No</label>
        </div>

        <div className="mt-2">
          <p className="font-semibold text-gray-700">¿El trabajador gozó de vacaciones?</p>
          <label className="mr-4"><input type="radio" name="vacaciones" onChange={() => setDatos({ ...datos, vacacionesGozadas: true })} /> Sí</label>
          <label><input type="radio" name="vacaciones" onChange={() => setDatos({ ...datos, vacacionesGozadas: false })} /> No</label>
        </div>

        <div className="mt-4">
          <label className="font-semibold text-gray-700">¿Fue un despido injustificado?</label>
          <label className="block"><input type="checkbox" onChange={e => setDatos({ ...datos, indemnizacionInjustificada: e.target.checked })} /> Sí</label>
        </div>

        <div className="mt-4">
          <label className="block font-medium text-gray-700">Agregar otro bono (Q)</label>
          <input type="number" className="w-full p-2 border rounded mb-2" value={datos.nuevoBono} onChange={e => setDatos({ ...datos, nuevoBono: e.target.value })} />
          <button onClick={agregarBono} className="bg-gray-700 text-white px-4 py-2 rounded">Agregar bono</button>
        </div>

        <button onClick={calcular} className="bg-blue-600 text-white w-full mt-6 py-2 rounded">Calcular</button>

        {resultado && (
          <div className="mt-6 bg-gray-50 p-4 rounded border">
            <p>Días trabajados: {resultado.diasTrabajados}</p>
            <p>Bono 14: Q{resultado.bono14.toFixed(2)}</p>
            <p>Aguinaldo: Q{resultado.aguinaldo.toFixed(2)}</p>
            <p>Vacaciones: Q{resultado.vacaciones.toFixed(2)}</p>
            <p>Indemnización: Q{resultado.indemnizacion.toFixed(2)}</p>
            <p>Otros bonos: Q{resultado.otrosBonos.toFixed(2)}</p>
            <p className="font-bold text-lg mt-2">Total a pagar: Q{resultado.total.toFixed(2)}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;