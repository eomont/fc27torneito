import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, onSnapshot } from 'firebase/firestore';

// 1. REEMPLAZA ESTO CON TUS CLAVES DE FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyDCfSq7cmCSWMOtlyKq23WOxf6E-7NNU0o",
  authDomain: "fc27torneito-ccb63.firebaseapp.com",
  projectId: "fc27torneito-ccb63",
  storageBucket: "fc27torneito-ccb63.firebasestorage.app",
  messagingSenderId: "585558391120",
  appId: "1:585558391120:web:adb93fd7b7bcfbeb85d455"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function App() {
  const [vista, setVista] = useState('tabla');
  const [partidos, setPartidos] = useState([]);
  const [jugadores, setJugadores] = useState([]);
  const [resultadoReciente, setResultadoReciente] = useState(null);

  useEffect(() => {
    const unsubscribePartidos = onSnapshot(collection(db, 'partidos'), (snapshot) => {
      setPartidos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubscribeJugadores = onSnapshot(collection(db, 'jugadores'), (snapshot) => {
      setJugadores(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => { unsubscribePartidos(); unsubscribeJugadores(); };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-12">
      {/* Encabezado Premium */}
      <header className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white shadow-lg pb-6 pt-8 px-4 rounded-b-[2.5rem] mb-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-blue-500/20 px-4 py-1 rounded-full text-blue-200 text-xs font-bold tracking-widest mb-3 border border-blue-400/30">
            TEMPORADA OFICIAL
          </div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-6">
            LIGA MX <span className="text-blue-400">FC 27</span>
          </h1>
          
          {/* Navegación estilo píldora */}
          <nav className="flex justify-center gap-2 bg-slate-800/50 p-1.5 rounded-full mx-auto max-w-md backdrop-blur-sm border border-slate-700/50">
            <button onClick={() => setVista('tabla')} className={`flex-1 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${vista === 'tabla' ? 'bg-blue-600 shadow-md text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'}`}>🏆 Tabla</button>
            <button onClick={() => setVista('reportar')} className={`flex-1 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${vista === 'reportar' || vista === 'tarjeta' ? 'bg-blue-600 shadow-md text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'}`}>⚽ Reportar</button>
            <button onClick={() => setVista('admin')} className={`flex-1 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${vista === 'admin' ? 'bg-blue-600 shadow-md text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'}`}>⚙️ Admin</button>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4">
        {vista === 'tabla' && <VistaTablas partidos={partidos} jugadores={jugadores} />}
        {vista === 'reportar' && <VistaReportar jugadores={jugadores} setVista={setVista} setResultadoReciente={setResultadoReciente} />}
        {vista === 'tarjeta' && <TarjetaResultado resultado={resultadoReciente} setVista={setVista} />}
        {vista === 'admin' && <VistaAdmin />}
      </main>
    </div>
  );
}

function VistaTablas({ partidos, jugadores }) {
  const tabla = jugadores.map(j => {
    let pts = 0, pj = 0, gf = 0, gc = 0;
    partidos.forEach(p => {
      if (p.local === j.equipo) {
        pj++; gf += p.golesLocal; gc += p.golesVisitante;
        if (p.golesLocal > p.golesVisitante) pts += 3;
        else if (p.golesLocal === p.golesVisitante) pts += 1;
      }
      if (p.visitante === j.equipo) {
        pj++; gf += p.golesVisitante; gc += p.golesLocal;
        if (p.golesVisitante > p.golesLocal) pts += 3;
        else if (p.golesVisitante === p.golesLocal) pts += 1;
      }
    });
    return { ...j, pts, pj, gf, gc, dif: gf - gc };
  }).sort((a, b) => b.pts - a.pts || b.dif - a.dif);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">Clasificación General</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
            <tr>
              <th className="py-4 px-4 text-center w-12">#</th>
              <th className="py-4 px-4">Jugador</th>
              <th className="py-4 px-4">Equipo</th>
              <th className="py-4 px-3 text-center">PJ</th>
              <th className="py-4 px-3 text-center">DIF</th>
              <th className="py-4 px-4 text-center font-bold text-slate-800">PTS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tabla.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-8 text-slate-400">No hay equipos registrados aún.</td></tr>
            ) : tabla.map((fila, i) => (
              <tr key={i} className="hover:bg-blue-50/50 transition-colors">
                <td className="py-3 px-4 text-center font-bold text-slate-400">{i + 1}</td>
                <td className="py-3 px-4 font-semibold text-slate-800">{fila.nombre}</td>
                <td className="py-3 px-4">
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold">{fila.equipo}</span>
                </td>
                <td className="py-3 px-3 text-center text-slate-500">{fila.pj}</td>
                <td className="py-3 px-3 text-center text-slate-500">{fila.dif > 0 ? `+${fila.dif}` : fila.dif}</td>
                <td className="py-3 px-4 text-center font-black text-blue-600 text-base">{fila.pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function VistaReportar({ jugadores, setVista, setResultadoReciente }) {
  const [local, setLocal] = useState('');
  const [visitante, setVisitante] = useState('');
  const [golesLocal, setGolesLocal] = useState('');
  const [golesVisitante, setGolesVisitante] = useState('');
  const [anotadoresTexto, setAnotadoresTexto] = useState('');
  
  const guardarResultado = async (e) => {
    e.preventDefault();
    if (!local || !visitante || local === visitante) return alert('Selecciona equipos válidos diferentes.');
    if (golesLocal === '' || golesVisitante === '') return alert('Ingresa los goles.');
    
    const nuevoPartido = {
      local, visitante, 
      golesLocal: parseInt(golesLocal), 
      golesVisitante: parseInt(golesVisitante),
      anotadores: anotadoresTexto.split(',').map(a => a.trim()).filter(a => a)
    };

    await addDoc(collection(db, 'partidos'), nuevoPartido);
    setResultadoReciente(nuevoPartido);
    setVista('tarjeta');
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="bg-slate-50 p-6 border-b border-slate-100 text-center">
        <h2 className="text-xl font-bold text-slate-800">Registrar Marcador</h2>
        <p className="text-sm text-slate-500 mt-1">Ingresa el resultado final de tu partido</p>
      </div>
      
      <form onSubmit={guardarResultado} className="p-6 md:p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
          {/* Divisor VS solo visible en desktop */}
          <div className="hidden md:flex absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 text-white w-10 h-10 rounded-full items-center justify-center font-black text-sm z-10 shadow-lg border-4 border-white">VS</div>

          {/* Local */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 relative">
            <div className="absolute -top-3 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">LOCAL</div>
            <select className="w-full mt-2 p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-700 font-medium transition-all" value={local} onChange={e => setLocal(e.target.value)} required>
              <option value="">Elegir Equipo...</option>
              {jugadores.map(j => <option key={j.id} value={j.equipo}>{j.equipo} ({j.nombre})</option>)}
            </select>
            <input type="number" min="0" placeholder="0" className="w-full mt-4 p-4 text-4xl text-center bg-white border border-slate-200 rounded-xl font-black text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={golesLocal} onChange={e => setGolesLocal(e.target.value)} required/>
          </div>

          {/* Visitante */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 relative">
            <div className="absolute -top-3 left-4 bg-slate-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">VISITANTE</div>
            <select className="w-full mt-2 p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-700 font-medium transition-all" value={visitante} onChange={e => setVisitante(e.target.value)} required>
              <option value="">Elegir Equipo...</option>
              {jugadores.map(j => <option key={j.id} value={j.equipo}>{j.equipo} ({j.nombre})</option>)}
            </select>
            <input type="number" min="0" placeholder="0" className="w-full mt-4 p-4 text-4xl text-center bg-white border border-slate-200 rounded-xl font-black text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={golesVisitante} onChange={e => setGolesVisitante(e.target.value)} required/>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Incidencias (Goleadores y Tarjetas)</label>
          <textarea 
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none" 
            rows="3" 
            placeholder="Ej: Rondón x2, Canales 🟨, Idrissi 🟥 (Sepáralos por comas)"
            value={anotadoresTexto}
            onChange={e => setAnotadoresTexto(e.target.value)}
          ></textarea>
        </div>

        <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 transform transition-transform active:scale-[0.98]">
          Guardar y Generar Tarjeta
        </button>
      </form>
    </div>
  );
}

function TarjetaResultado({ resultado, setVista }) {
  const tarjetaRef = useRef(null);

  const compartirWhatsApp = async () => {
    if (!tarjetaRef.current) return;
    const canvas = await html2canvas(tarjetaRef.current, { useCORS: true, backgroundColor: null, scale: 2 });
    
    canvas.toBlob(async (blob) => {
      const file = new File([blob], 'marcador.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ title: `Resultado: ${resultado.local} vs ${resultado.visitante}`, files: [file] });
        } catch (error) { console.log('Cancelado'); }
      } else {
        const link = document.createElement('a');
        link.download = 'marcador.png'; link.href = canvas.toDataURL(); link.click();
      }
    });
  };

  if (!resultado) return null;

  return (
    <div className="flex flex-col items-center">
      <div 
        ref={tarjetaRef} 
        className="w-full max-w-sm bg-slate-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden border border-slate-700"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1518605368461-1e1e38ce1542?auto=format&fit=crop&q=80&w=800")', backgroundSize: 'cover', backgroundPosition: 'center', backgroundBlendMode: 'overlay', backgroundColor: 'rgba(15, 23, 42, 0.9)' }}
      >
        <div className="text-center mb-8">
          <span className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full text-xs font-black tracking-[0.2em] text-white/90 shadow-sm">
            LIGA MX • FC 27
          </span>
        </div>
        
        <div className="flex justify-between items-center text-xl font-black mb-8 relative">
          <span className="w-[35%] text-right truncate text-white/90 drop-shadow-md pr-2">{resultado.local}</span>
          <div className="w-[30%] text-center flex flex-col items-center">
            <span className="text-5xl text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.4)] tracking-tighter">
              {resultado.golesLocal}-{resultado.golesVisitante}
            </span>
            <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest mt-2">Final</span>
          </div>
          <span className="w-[35%] text-left truncate text-white/90 drop-shadow-md pl-2">{resultado.visitante}</span>
        </div>

        {resultado.anotadores && resultado.anotadores.length > 0 && (
          <div className="bg-black/50 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-inner">
            <p className="font-bold text-white/40 text-[10px] uppercase tracking-wider mb-3">Reporte del partido</p>
            <ul className="space-y-2 text-sm font-medium text-white/90">
              {resultado.anotadores.map((a, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="opacity-80">⚽</span> {a}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <button onClick={compartirWhatsApp} className="mt-8 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-[#25D366]/30 flex items-center gap-3 transform transition-transform active:scale-95 w-full max-w-sm justify-center">
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 0 5.387 0 12.035c0 2.128.553 4.2 1.603 6.03L.416 24l6.113-1.605A11.97 11.97 0 0012.031 24c6.645 0 12.031-5.388 12.031-12.035S18.676 0 12.031 0zm0 22.015c-1.802 0-3.565-.486-5.113-1.405l-.367-.217-3.799.996 1.016-3.705-.238-.379A10.027 10.027 0 012.015 12.03c0-5.541 4.512-10.05 10.05-10.05 5.54 0 10.048 4.509 10.048 10.05s-4.508 10.05-10.048 10.05zm5.513-7.53c-.302-.152-1.787-.882-2.063-.983-.277-.101-.478-.152-.68.151-.201.303-.781.983-.957 1.185-.176.202-.353.227-.655.076-1.583-.787-2.618-1.5-3.6-3.21-.101-.176-.011-.271.14-.422.136-.136.302-.353.453-.53.151-.176.201-.302.302-.504.101-.202.05-.378-.025-.53-.076-.152-.68-1.637-.932-2.243-.245-.591-.494-.51-.68-.52-.176-.01-.377-.01-.579-.01-.201 0-.528.076-.804.378-.276.302-1.055 1.033-1.055 2.519s1.08 2.92 1.231 3.122c.151.201 2.13 3.25 5.16 4.558 1.942.836 2.68.756 3.183.635.539-.129 1.787-.73 2.038-1.436.252-.705.252-1.31.176-1.436-.076-.126-.277-.201-.579-.353z"/></svg>
        Enviar al Grupo de Ema
      </button>
      <button onClick={() => setVista('tabla')} className="mt-4 text-slate-500 font-medium hover:text-slate-800 transition-colors">
        Volver a las tablas
      </button>
    </div>
  );
}

function VistaAdmin() {
  const [pass, setPass] = useState('');
  const [nombre, setNombre] = useState('');
  const [equipo, setEquipo] = useState('');
  
  if (pass !== 'admin123') {
    return (
      <div className="max-w-sm mx-auto mt-12 bg-white p-8 rounded-2xl shadow-xl border border-slate-100 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🔒</div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Acceso Restringido</h2>
        <p className="text-sm text-slate-500 mb-6">Solo Ema puede configurar el torneo</p>
        <input type="password" placeholder="Contraseña de Admin" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-center font-bold tracking-widest transition-all mb-4" onChange={e => setPass(e.target.value)} />
      </div>
    );
  }

  const agregarJugador = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, 'jugadores'), { nombre, equipo });
    setNombre(''); setEquipo('');
    alert('✅ Participante agregado correctamente a la base de datos.');
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-slate-100">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
        <span className="text-2xl">⚙️</span>
        <h2 className="text-xl font-bold text-slate-800">Panel de Administración</h2>
      </div>
      
      <form onSubmit={agregarJugador} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nombre o ID del Jugador</label>
          <input type="text" placeholder="Ej. Edgar" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={nombre} onChange={e => setNombre(e.target.value)} required />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Equipo Liga MX</label>
          <input type="text" placeholder="Ej. Pachuca" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={equipo} onChange={e => setEquipo(e.target.value)} required />
        </div>
        <button type="submit" className="w-full mt-4 bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg transition-colors">
          + Inscribir Participante
        </button>
      </form>
    </div>
  );
}
