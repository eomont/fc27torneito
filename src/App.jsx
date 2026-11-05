import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, onSnapshot } from 'firebase/firestore';

// BASE DE DATOS DE JUGADORES FC 27 - LIGA MX (Temporada 26/27)
const PLANTILLAS_FC27 = {
  "America": ["Luis Malagón", "Fernando Tapia", "Rodolfo Cota", "César Lugo", "Santiago Múñoz", "Santiago Ramos", "Israel Reyes", "Ramón Juárez", "Miguel Vázquez", "Franco Rossano", "Cristian Borja", "Dagoberto Espinoza", "Kevin Álvarez", "Emilio Lara", "Alan Cervantes", "Ricardo Cariño", "Ivan de la Cruz", "Erick Sánchez", "Carlos Álvarez", "Richard Sánchez", "Diego Valdés", "Brian Rodríguez", "Óscar Perea", "Javairo Dilrosun", "Zinedine González", "Henry Martín", "Miguel Borja"],
  "Cruz Azul": ["Kevin Mier", "Andrés Gudiño", "Ricardo Rodríguez", "Emmanuel Ochoa", "Willer Ditta", "Jesús Orozco Chiquete", "Alán Montes", "Gonzalo Piovi", "Raymundo Rubio", "Omar Campos", "Ralph Orquin", "Alan Mozo", "Erik Lira", "Amaury García", "Cristian Jiménez", "Jeremy Márquez", "Carlos Rodríguez", "Agustín Palavecino", "José Paradela", "Luka Romero", "Andrés Montaño", "Fernando Sámano", "Carlos Rotondi", "Amaury Morales", "Rogelio González", "Nicolás Ibáñez", "Christian Ebere", "Gabriel Fernández", "Jean Cabral", "Mateo Levy", "Bryan Gamboa"],
  "Chivas": ["Hormigol","Raúl Rangel", "Óscar Whalley", "Sebastián Liceaga", "Diego Campillo", "José Castillo", "Daniel Aguirre", "Luis Gabriel Rey", "Miguel Tapias", "Bryan González", "Richard Ledezma", "Miguel Gómez", "Omar Govea", "Fernando González", "Luis Romo", "Santiago Sandoval", "Efraín Álvarez", "Brian Gutiérrez", "Jordan Carrillo", "Kevin Castañeda", "Jonathan Pérez", "Roberto Alvarado", "Hugo Camberos", "Ricardo Marín", "Ángel Sepúlveda"],
  "Toluca": ["Hugo González", "Luis García", "Ronaldo Beltrán", "David Skrem", "Federico Pereira", "Bruno Méndez", "Everardo López", "Luan", "Antonio Briseño", "Brian García", "Jesús Gallardo", "Santiago Simón", "Diego Barbosa", "Franco Romero", "Fernando Arce", "Marcel Ruiz", "Erick Gutiérrez", "Nicolás Castro", "Víctor Guzmán", "Alexis Vega", "Pável Pérez", "Helinho", "Jesús Angulo", "Federico Viñas", "Paulinho", "Iván López", "Jorge Díaz Price", "Oswaldo Virgen"],
  "Tigres": ["Nahuel Guzmán", "Felipe Rodríguez", "Antonio Carrera", "Joaquim", "Alan Franco", "Jesús Angulo", "Rafael Guerrero", "Marco Farfán", "Osvaldo Rodríguez", "Francisco Reyes", "Fernando Ordóñez", "Jesús Garza", "Vladimir Loroña", "Rômulo", "César Araújo", "Henrique Simeoae", "Fernando Gorriarán", "Juan Pablo Vigón", "Juan Brunetta", "Marcelo Flores", "Emiliano Gómez", "Diego Sánchez", "Mauro Lainez", "Jaidyn Contreras", "Diego Lainez", "Ozziel Herrera", "Rodrigo Aguirre", "Ricardo Monreal", "Guillermo Martínez"],
  "Monterrey": ["Luis Cárdenas", "Esteban Andrada", "César Ramos", "Víctor Guzmán", "Carlos Salcedo", "César Bustos", "Gerardo Arteaga", "Alonso Aceves", "Luis Reyes", "Ricardo Chávez", "Érick Aguirre", "Stefan Medina", "Javier Casillas", "Fidel Ambriz", "César Garza", "Jorge Rodríguez", "Orbelín Pineda", "Iker Fimbres", "Óliver Torres", "Sebastián Rodríguez", "Paxon Ruffin", "Lucas Ocampos", "Luca Orellano", "Jesús Corona", "Hugo Cuypers", "Diego Rossi", "Roberto de la Rosa", "Uros Djurdjevic"],
  "Tijuana": ["Antonio Rodríguez", "Salim Hernández", "Alejandro Gómez", "Jackson Porozo", "Unai Bilbao", "Alan Vega", "Pablo Ortiz", "Rafael Fernández", "Aarón Mejía", "Iván Tona", "Ángel Zapata", "Frank Boya", "Ignacio Rivero", "Ramiro Árciga", "Gilberto Mora", "Aldahir Pérez", "Yael Padilla", "Adonis Preciado", "Francisco González", "Diego Abreu", "Mourad El Ghezouani", "Shamar Nicholson", "Elias Manoel"],
  "Pumas": ["Keylor Navas", "Pablo Lara", "Miguel Paul", "Nathan Silva", "Rubén Duarte", "Ángel Azuaje", "Tony Leone", "Álvaro Angulo", "Cristian Calderón", "Rodrigo López", "Pablo Bennevendo", "Jesús Rivas", "Pablo Monroy", "Santiago Trigos", "Pedro Vite", "Adalberto Carrasquilla", "Víctor Arteaga", "Sebastián Córdova", "Israel Luna", "Ángel Rico", "César Huerta", "Luciano Herrera", "Uriel Antuna", "Alan Medina", "Robert Morales", "Jariel", "José Juan Macías", "Santiago López"],
  "Atlas": ["Camilo Vargas", "Antonio Sánchez", "Juan José Purata", "Adonis Frías", "Gaddi Aguirre", "Manuel Capasso", "Adrián Mora", "Rivaldo Lozano", "Jorge Rodríguez", "Milton Valenzuela", "Jorge Sánchez", "Víctor Ríos", "Paulo Ramírez", "Édgar Zaldívar", "Aldo Rocha", "Elías Montiel", "Luis Esteves", "Arturo González", "Kevin Zenón", "Sergio Hernández", "Duk", "Luis Gamboa", "Florián Monzón", "Ryan Mmaee"],
  "León": ["Óscar García", "Julio González", "Jhohan Romaña", "Valentín Gauthier", "Juan Guevara", "Sebastián Vegas", "Paul Bellón", "Salvador Reyes", "Abraham Villegas", "Iván Moreno", "Bryan Colula", "David Ramírez", "Rodrigo Echeverría", "José Rodríguez", "Sebastián Fierro", "Fernando Beltrán", "Ángel Estrada", "Luis Valadez", "Ismael Díaz", "Daniel Arcila", "Juan Domínguez", "Edgar Guerra", "Jordi Cortizo", "Diber Cambindo", "Alfonso Alvarado", "Santiago Londoño"],
  "Atlante": ["Jordan García", "Óscar Jiménez", "Roberto Barragán", "Aarón Quirós", "Diego Magaña", "Luis Sánchez", "Nico Carrera", "Eduardo Tercero", "Cristóbal Alfaro", "Walter Clar", "Armando Escobar", "Ari Contreras", "Walter Portales", "Hardy Meza", "Eugenio Pizzuto", "Martín Fernández", "Leonardo Mejía", "Jhojan Julio", "Maximiliano García", "Javier Ibarra", "Octavio Vázquez", "Christian Bermúdez", "Martín Sarrafiore", "Luis Calzadilla", "Edgar Jiménez", "Daniel González", "Gilberto Adame", "Luis Puente", "Jairón Charcopa", "Joaquín Moxica"],
  "Puebla": ["Daniel Gutiérrez", "Jesús Rodríguez", "Facundo Almada", "Eduardo Navarro", "José Pachuca", "Juan Pablo Vargas", "Ángel Leyva", "Fernando Monárrez", "Jair Díaz", "Óscar Villa", "Iker Moreno", "Alberto Herrera", "Alonso Ramírez", "Lucas Camilo", "Eduardo Armenta", "Sergio Sanabria", "Mathías Tomás", "Omar Moreno", "Carlos Baltazar", "Alejandro Organista", "Raúl Castillo", "Heriberto Jurado", "Kevin Velasco", "Brayan Garnica", "Eduardo Mustre", "Ignacio Maestro Puch", "Luifer Hernández"],
  "Querétaro": ["José Hernández", "Guillermo Allison", "Lucas Abascia", "Diego Reyes", "Carlos Villanueva", "Paulo Victor", "Daniel Parra", "Bayron Duarte", "Sergio García Brothers", "Santiago Homenchenko", "Bernardo Parra", "Carlo García", "Érik Dueñas", "Álex Alcalá", "Muno Martínez", "Jesús Arellano", "Juan Robles", "Denilson Muñoz", "Enzo Giménez", "Iker Benito", "Waldo Madrid", "Alí Ávila", "Mateo Coronel", "Eduardo Pérez"],
  "Pachuca": ["Carlos Moreno", "José Eulogio", "Sergio Barreto", "Jorge Berlanga", "Eduardo Bauermann", "Pedro Budib", "Francisco Venegas", "Mauricio Isais", "Carlos Sánchez", "Sebastián Santos", "Christian Rivera", "Lenin Rodríguez", "Alán Bautista", "Andrés Arroyo", "Rodolfo Pizarro", "Oussama Idrissi", "Kenedy", "Alexéi Domínguez", "Nicolás Vallejo", "Adrián Alcaraz", "Illian Hernández", "Salomón Rondón"],
  "Atlético de San Luis": ["Andrés Sánchez", "César López", "Gibrán Lajud", "Eduardo Águila", "Robson Bambu", "Miguel García", "Benjamín Galindo", "Juanpe", "Lucas Esteves", "Aldo Cruz", "Román Torres", "Johan Caicedo", "Roberto Meraz", "Sébastien Salles-Lamonge", "Óscar Macías", "Sebastián Pérez Bouquet", "David Rodríguez", "Rafa Llorente", "Benjamín Galdames", "Anderson Duarte", "Jesús Medina", "João Pedro", "Santiago Muñoz", "Leonardo Flores", "Felipe Mora", "Ronaldo Nájera"],
  "Necaxa": ["Javier Orantes", "Christopher Andrade", "Luis Jiménez", "Naves", "Agustín Oliveros", "Alexis Peña", "Raúl Martínez", "Francisco Méndez", "Diego Ochoa", "Carlos Vargas", "Emilio Martínez", "Pedro Pedraza", "Danny Leyva", "Lorenzo Faravelli", "Kevin Rosero", "Mauro Zaleta", "Javier Ruiz", "Juan Torres", "Matías Espíndola", "Israel Tello", "Rogelio Cortéz", "Emilio Rodríguez", "Owen González", "Julián Carranza", "Juan Valencia", "Misael Pedroza"],
  "Juárez": ["Sebastián Jurado", "Benny Díaz", "Guillermo Ruíz", "Gilberto Sepúlveda", "Jesús Murillo", "Haret Ortega", "Daniel Piña", "Bryan Romero", "Alejandro Mayorga", "Eder López", "Francisco Nevárez", "Javier Aquino", "Denzell García", "Rodrigo Dourado", "Lucas Romero", "Said Godínez", "Leonardo Rodríguez", "Monchu", "Guilherme Castilho", "Juan Sigala", "José Luis Rodríguez", "Madson", "Raymundo Fulgencio", "Ricardinho", "Jairo Torres", "Óscar Estupiñán", "Luca Martínez Dupuy", "Ettson Ayón"],
  "Santos Laguna": ["Carlos Acevedo", "Héctor Holguín", "Bruno Amione", "Franco Pardo", "Efraín Orona", "Felipe Sánchez", "Geovanni Pérez", "Emmanuel Echeverría", "Kevin Picón", "Mauricio Cuevas", "José Abella", "Aldo López", "Salvador Mariscal", "Javier Güémez", "Pedro Aquino", "Facundo Cáseres", "Nelson Cedillo", "Ezequiel Bullaude", "Fran Villalba", "Luis Gómez", "Joshua Mancha", "Kevin Palacios", "Diego González", "Ramiro Sordo", "Diego Medina", "Lucas Di Yorio", "Eduardo Aguirre", "Esteban Lozano", "Tahiel Jiménez"]
};

// CONFIGURACIÓN DE FIREBASE
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
      <header className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white shadow-lg pb-6 pt-8 px-4 rounded-b-[2.5rem] mb-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-blue-500/20 px-4 py-1 rounded-full text-blue-200 text-xs font-bold tracking-widest mb-3 border border-blue-400/30">
            TEMPORADA OFICIAL
          </div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-6">
            LIGA MX <span className="text-blue-400">FC 27</span>
          </h1>
          <nav className="flex flex-wrap justify-center gap-1.5 bg-slate-800/50 p-2 rounded-2xl mx-auto max-w-3xl backdrop-blur-sm border border-slate-700/50">
            <button onClick={() => setVista('tabla')} className={`px-3 py-2.5 rounded-xl text-[11px] sm:text-sm font-semibold transition-all duration-300 flex-grow ${vista === 'tabla' ? 'bg-blue-600 shadow-md text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'}`}>🏆 General</button>
            <button onClick={() => setVista('goleadores')} className={`px-3 py-2.5 rounded-xl text-[11px] sm:text-sm font-semibold transition-all duration-300 flex-grow ${vista === 'goleadores' ? 'bg-blue-600 shadow-md text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'}`}>⚽ Goleadores</button>
            <button onClick={() => setVista('resultados')} className={`px-3 py-2.5 rounded-xl text-[11px] sm:text-sm font-semibold transition-all duration-300 flex-grow ${vista === 'resultados' ? 'bg-blue-600 shadow-md text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'}`}>📅 Resultados</button>
            <button onClick={() => setVista('reportar')} className={`px-3 py-2.5 rounded-xl text-[11px] sm:text-sm font-semibold transition-all duration-300 flex-grow ${vista === 'reportar' || vista === 'tarjeta' ? 'bg-blue-600 shadow-md text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'}`}>📝 Reportar</button>
            <button onClick={() => setVista('admin')} className={`px-3 py-2.5 rounded-xl text-[11px] sm:text-sm font-semibold transition-all duration-300 flex-grow ${vista === 'admin' ? 'bg-blue-600 shadow-md text-white' : 'text-slate-300 hover:text-white hover:bg-slate-700/50'}`}>⚙️ Admin</button>
          </nav>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4">
        {vista === 'tabla' && <VistaTablas partidos={partidos} jugadores={jugadores} />}
        {vista === 'goleadores' && <VistaGoleadores partidos={partidos} jugadores={jugadores} />}
        {vista === 'resultados' && <VistaResultados partidos={partidos} jugadores={jugadores} />}
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
        <h2 className="text-lg font-bold text-slate-800">🏆 Clasificación General</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
            <tr>
              <th className="py-4 px-4 text-center w-12 font-black text-slate-700">POS</th>
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
                <td className="py-3 px-4 text-center font-black text-blue-500">{i + 1}</td>
                <td className="py-3 px-4 font-semibold text-slate-800">{fila.nombre}</td>
                <td className="py-3 px-4"><span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold">{fila.equipo}</span></td>
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

function VistaGoleadores({ partidos, jugadores }) {
  const [expandido, setExpandido] = useState(null);
  const conteoGoles = {};

  partidos.forEach(p => {
    const sumarGol = (jugador, equipo, cantidad) => {
      const key = `${jugador}-${equipo}`;
      if (!conteoGoles[key]) {
        const owner = jugadores.find(j => j.equipo === equipo)?.nombre || 'Desconocido';
        conteoGoles[key] = { id: key, jugadorFC: jugador, equipo: equipo, manager: owner, goles: 0, rivales: {} };
      }
      conteoGoles[key].goles += cantidad;
      const rival = p.local === equipo ? p.visitante : p.local;
      conteoGoles[key].rivales[rival] = (conteoGoles[key].rivales[rival] || 0) + cantidad;
    };

    if (p.incidencias) {
      p.incidencias.forEach(inc => {
        if (inc.tipo === '⚽ Gol' && inc.jugador) {
          sumarGol(inc.jugador, inc.equipo, inc.cantidad ? parseInt(inc.cantidad) : 1);
        }
      });
    } else if (p.anotadores) {
      p.anotadores.forEach(a => {
        if (a.startsWith('⚽')) {
          const match = a.match(/⚽ (.*?)(?: x(\d+))? \((.*?)\)/);
          if (match) {
            const cant = match[2] ? parseInt(match[2]) : 1;
            sumarGol(match[1].trim(), match[3].trim(), cant);
          }
        }
      });
    }
  });

  const tablaGoleadores = Object.values(conteoGoles).sort((a, b) => b.goles - a.goles);
  const toggleExpandir = (id) => setExpandido(expandido === id ? null : id);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">⚽ Tabla de Goleadores</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
            <tr>
              <th className="py-4 px-4 text-center w-12 font-black text-slate-700">POS</th>
              <th className="py-4 px-4">Jugador (FC 27)</th>
              <th className="py-4 px-4 text-center font-bold text-slate-800">Goles</th>
              <th className="py-4 px-4">Equipo Liga MX</th>
              <th className="py-4 px-4">Mánager</th>
              <th className="py-4 px-4 text-center">Víctimas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tablaGoleadores.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-8 text-slate-400">Aún no hay goles registrados.</td></tr>
            ) : tablaGoleadores.map((fila, i) => (
              <React.Fragment key={fila.id}>
                <tr className="hover:bg-blue-50/50 transition-colors">
                  <td className="py-3 px-4 text-center font-black text-blue-500">{i + 1}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{fila.jugadorFC}</td>
                  <td className="py-3 px-4 text-center font-black text-blue-600 text-base">{fila.goles}</td>
                  <td className="py-3 px-4"><span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold">{fila.equipo}</span></td>
                  <td className="py-3 px-4 font-medium text-blue-600">{fila.manager}</td>
                  <td className="py-3 px-4 text-center">
                    <button onClick={() => toggleExpandir(fila.id)} className="text-xs bg-slate-200 hover:bg-blue-200 text-blue-700 font-bold py-1.5 px-3 rounded-lg transition-colors">
                      {expandido === fila.id ? 'Ocultar' : 'Ver más'}
                    </button>
                  </td>
                </tr>
                {expandido === fila.id && (
                  <tr className="bg-slate-50/80">
                    <td colSpan="6" className="py-4 px-6 text-sm border-b border-slate-200 shadow-inner">
                      <div className="font-bold text-slate-600 mb-2">⚽ Goles anotados contra:</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {Object.entries(fila.rivales).map(([rival, cant]) => {
                          const managerRival = jugadores.find(j => j.equipo === rival)?.nombre || 'Desconocido';
                          return (
                            <div key={rival} className="bg-white p-2 rounded border border-slate-200 flex justify-between items-center shadow-sm">
                              <span className="text-slate-600 font-medium truncate pr-2">{rival} <span className="text-[10px] text-slate-400">({managerRival})</span></span>
                              <span className="font-black text-blue-600">{cant}</span>
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function VistaResultados({ partidos, jugadores }) {
  const partidosInvertidos = [...partidos].reverse();

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 p-4 border-b border-slate-100 text-center rounded-2xl shadow-sm bg-white mb-6">
        <h2 className="text-xl font-bold text-slate-800">📅 Resultados de la Temporada</h2>
      </div>

      {partidosInvertidos.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-slate-500 border border-slate-100">
          No hay partidos registrados todavía.
        </div>
      ) : partidosInvertidos.map((p, i) => {
        const managerLocal = jugadores.find(j => j.equipo === p.local)?.nombre || '';
        const managerVisitante = jugadores.find(j => j.equipo === p.visitante)?.nombre || '';

        return (
          <div key={i} className="bg-white rounded-2xl shadow-md border border-slate-100 p-5 flex flex-col relative overflow-hidden transition-all hover:shadow-lg">
            
            {p.jornada && (
              <div className="text-center text-xs font-bold text-blue-600 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">
                {p.jornada}
              </div>
            )}

            <div className="flex justify-between items-center mb-4">
              <div className="w-[35%] text-right">
                <div className="font-black text-slate-800 text-sm md:text-base">{p.local}</div>
                <div className="text-xs text-slate-500 font-medium">{managerLocal}</div>
              </div>
              <div className="w-[30%] flex justify-center">
                <div className="w-full max-w-[80px] text-center font-black text-2xl text-white bg-slate-900 rounded-xl py-1.5 shadow-sm">
                  {p.golesLocal} - {p.golesVisitante}
                </div>
              </div>
              <div className="w-[35%] text-left">
                <div className="font-black text-slate-800 text-sm md:text-base">{p.visitante}</div>
                <div className="text-xs text-slate-500 font-medium">{managerVisitante}</div>
              </div>
            </div>

            {p.anotadores && p.anotadores.length > 0 && (
              <div className="bg-slate-50 rounded-xl p-3 text-[11px] md:text-xs text-slate-600 border border-slate-100">
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                  {p.anotadores.map((a, j) => (
                    <li key={j} className="flex items-center gap-1.5 font-medium">{a}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )
      })}
    </div>
  );
}

function VistaReportar({ jugadores, setVista, setResultadoReciente }) {
  const [jornada, setJornada] = useState('');
  const [local, setLocal] = useState('');
  const [visitante, setVisitante] = useState('');
  const [golesLocal, setGolesLocal] = useState('');
  const [golesVisitante, setGolesVisitante] = useState('');
  const [incidencias, setIncidencias] = useState([]);
  
  const agregarIncidencia = () => {
    if (!local && !visitante) return alert('Selecciona los equipos primero');
    setIncidencias([...incidencias, { equipo: local || visitante, tipo: '⚽ Gol', jugador: '', cantidad: 1 }]);
  };

  const actualizarIncidencia = (index, campo, valor) => {
    const nuevas = [...incidencias];
    nuevas[index][campo] = valor;
    if (campo === 'equipo') nuevas[index].jugador = '';
    setIncidencias(nuevas);
  };

  const eliminarIncidencia = (index) => {
    setIncidencias(incidencias.filter((_, i) => i !== index));
  };

  const guardarResultado = async (e) => {
    e.preventDefault();
    if (!jornada) return alert('Por favor selecciona la Jornada del partido.');
    if (!local || !visitante || local === visitante) return alert('Selecciona equipos válidos diferentes.');
    if (golesLocal === '' || golesVisitante === '') return alert('Ingresa los goles.');
    
    const anotadoresMapeados = incidencias.map(inc => {
      const cantStr = (inc.tipo === '⚽ Gol' && inc.cantidad > 1) ? ` x${inc.cantidad}` : '';
      return `${inc.tipo.split(' ')[0]} ${inc.jugador}${cantStr} (${inc.equipo})`;
    });

    const nuevoPartido = {
      jornada,
      local, visitante, 
      golesLocal: parseInt(golesLocal), golesVisitante: parseInt(golesVisitante),
      anotadores: anotadoresMapeados,
      incidencias: incidencias,
      fecha: new Date().toISOString()
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
        
        <div className="mb-2">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 text-center">Jornada del Partido</label>
          <select className="w-full max-w-xs mx-auto block p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 font-bold text-center" value={jornada} onChange={e => setJornada(e.target.value)} required>
            <option value="">Seleccionar Jornada...</option>
            {[...Array(17).keys()].map(num => <option key={num + 1} value={`Jornada ${num + 1}`}>Jornada {num + 1}</option>)}
            <option value="Cuartos de Final">Cuartos de Final</option>
            <option value="Semifinal">Semifinal</option>
            <option value="Final">Final</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
          <div className="hidden md:flex absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 text-white w-10 h-10 rounded-full items-center justify-center font-black text-sm z-10 shadow-lg border-4 border-white">VS</div>
          
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 relative">
            <div className="absolute -top-3 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">LOCAL</div>
            <select className="w-full mt-2 p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 font-medium" value={local} onChange={e => setLocal(e.target.value)} required>
              <option value="">Elegir Equipo...</option>
              {jugadores.map(j => <option key={j.id} value={j.equipo}>{j.equipo} ({j.nombre})</option>)}
            </select>
            <div className="mt-4">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 text-center">Cantidad de goles</label>
              <select className="w-full p-4 text-4xl text-center bg-white border border-slate-200 rounded-xl font-black text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" value={golesLocal} onChange={e => setGolesLocal(e.target.value)} required>
                <option value="" disabled>-</option>
                {[...Array(21).keys()].map(num => <option key={num} value={num}>{num}</option>)}
              </select>
            </div>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 relative">
            <div className="absolute -top-3 left-4 bg-slate-700 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">VISITANTE</div>
            <select className="w-full mt-2 p-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 font-medium" value={visitante} onChange={e => setVisitante(e.target.value)} required>
              <option value="">Elegir Equipo...</option>
              {jugadores.map(j => <option key={j.id} value={j.equipo}>{j.equipo} ({j.nombre})</option>)}
            </select>
            <div className="mt-4">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 text-center">Cantidad de goles</label>
              <select className="w-full p-4 text-4xl text-center bg-white border border-slate-200 rounded-xl font-black text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" value={golesVisitante} onChange={e => setGolesVisitante(e.target.value)} required>
                <option value="" disabled>-</option>
                {[...Array(21).keys()].map(num => <option key={num} value={num}>{num}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6">
          <label className="block text-sm font-bold text-slate-700 mb-4">Eventos del Partido</label>
          <div className="space-y-3">
            {incidencias.map((inc, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-2 items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                <select value={inc.equipo} onChange={e => actualizarIncidencia(index, 'equipo', e.target.value)} className="w-full md:w-1/4 p-2 text-sm bg-white border border-slate-200 rounded-lg outline-none">
                  {local && <option value={local}>{local}</option>}
                  {visitante && <option value={visitante}>{visitante}</option>}
                </select>
                
                <select value={inc.tipo} onChange={e => actualizarIncidencia(index, 'tipo', e.target.value)} className="w-full md:w-1/4 p-2 text-sm bg-white border border-slate-200 rounded-lg outline-none font-bold">
                  <option value="⚽ Gol">⚽ Gol</option>
                  <option value="🟨 Tarjeta Amarilla">🟨 Tarjeta Amarilla</option>
                  <option value="🟥 Tarjeta Roja">🟥 Tarjeta Roja</option>
                </select>
                
                <select value={inc.jugador} onChange={e => actualizarIncidencia(index, 'jugador', e.target.value)} className="w-full md:w-2/4 p-2 text-sm bg-white border border-slate-200 rounded-lg outline-none">
                  <option value="">Seleccionar Jugador...</option>
                  {(PLANTILLAS_FC27[inc.equipo] || ['Plantilla no registrada']).map((jug, i) => (
                    <option key={i} value={jug}>{jug}</option>
                  ))}
                </select>

                {inc.tipo === '⚽ Gol' && (
                  <div className="w-full md:w-28 flex flex-col">
                    <label className="text-[10px] font-bold text-slate-500 uppercase text-center mb-1">Cantidad de goles</label>
                    <select 
                      value={inc.cantidad || 1} 
                      onChange={e => actualizarIncidencia(index, 'cantidad', parseInt(e.target.value) || 1)} 
                      className="w-full p-2 text-sm bg-white border border-slate-200 rounded-lg outline-none text-center font-bold text-blue-600"
                    >
                      {Array.from({ length: 20 }, (_, i) => i + 1).map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </div>
                )}

                <button type="button" onClick={() => eliminarIncidencia(index)} className="w-full md:w-auto px-3 py-2 mt-2 md:mt-0 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 font-bold self-end md:self-auto">X</button>
              </div>
            ))}
          </div>
          <button type="button" onClick={agregarIncidencia} className="mt-4 w-full border-2 border-dashed border-blue-300 text-blue-600 font-bold py-3 rounded-xl hover:bg-blue-50 transition-colors">
            + Añadir Evento al Reporte
          </button>
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
        try { await navigator.share({ title: `Resultado: ${resultado.local} vs ${resultado.visitante}`, files: [file] }); } 
        catch (error) { console.log('Cancelado'); }
      } else {
        const link = document.createElement('a'); link.download = 'marcador.png'; link.href = canvas.toDataURL(); link.click();
      }
    });
  };
  if (!resultado) return null;
  return (
    <div className="flex flex-col items-center">
      <div ref={tarjetaRef} className="w-full max-w-sm bg-slate-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden border border-slate-700" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1518605368461-1e1e38ce1542?auto=format&fit=crop&q=80&w=800")', backgroundSize: 'cover', backgroundPosition: 'center', backgroundBlendMode: 'overlay', backgroundColor: 'rgba(15, 23, 42, 0.9)' }}>
        <div className="text-center mb-8"><span className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] text-white/90 shadow-sm uppercase">LIGA MX • {resultado.jornada || 'FC 27'}</span></div>
        <div className="flex justify-between items-center text-xl font-black mb-8 relative">
          <span className="w-[35%] text-right truncate text-white/90 drop-shadow-md pr-2">{resultado.local}</span>
          <div className="w-[30%] text-center flex flex-col items-center">
            <span className="text-5xl text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.4)] tracking-tighter">{resultado.golesLocal}-{resultado.golesVisitante}</span>
            <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest mt-2">Final</span>
          </div>
          <span className="w-[35%] text-left truncate text-white/90 drop-shadow-md pl-2">{resultado.visitante}</span>
        </div>
        {resultado.anotadores && resultado.anotadores.length > 0 && (
          <div className="bg-black/50 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-inner">
            <p className="font-bold text-white/40 text-[10px] uppercase tracking-wider mb-3">Reporte del partido</p>
            <ul className="space-y-2 text-sm font-medium text-white/90">
              {resultado.anotadores.map((a, i) => (<li key={i} className="flex items-center gap-2">{a}</li>))}
            </ul>
          </div>
        )}
      </div>
      <button onClick={compartirWhatsApp} className="mt-8 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-[#25D366]/30 flex items-center gap-3 transform transition-transform active:scale-95 w-full max-w-sm justify-center">
        Enviar al Grupo de WhatsApp
      </button>
      <button onClick={() => setVista('tabla')} className="mt-4 text-slate-500 font-medium hover:text-slate-800 transition-colors">Volver a las tablas</button>
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
        <button type="submit" className="w-full mt-4 bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg transition-colors">+ Inscribir Participante</button>
      </form>
    </div>
  );
}
