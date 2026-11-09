import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';

// BASE DE DATOS DE JUGADORES FC 27 - LIGA MX (Temporada 26/27)
const PLANTILLAS_FC27 = {
  "América": ["Luis Malagón", "Fernando Tapia", "Rodolfo Cota", "César Lugo", "Santiago Múñoz", "Santiago Ramos", "Israel Reyes", "Ramón Juárez", "Miguel Vázquez", "Franco Rossano", "Cristian Borja", "Dagoberto Espinoza", "Kevin Álvarez", "Emilio Lara", "Alan Cervantes", "Ricardo Cariño", "Ivan de la Cruz", "Erick Sánchez", "Carlos Álvarez", "Richard Sánchez", "Diego Valdés", "Brian Rodríguez", "Óscar Perea", "Javairo Dilrosun", "Zinedine González", "Henry Martín", "Miguel Borja"],
  "Cruz azul": ["Kevin Mier", "Andrés Gudiño", "Ricardo Rodríguez", "Emmanuel Ochoa", "Willer Ditta", "Jesús Orozco Chiquete", "Alán Montes", "Gonzalo Piovi", "Raymundo Rubio", "Omar Campos", "Ralph Orquin", "Alan Mozo", "Erik Lira", "Amaury García", "Cristian Jiménez", "Jeremy Márquez", "Carlos Rodríguez", "Agustín Palavecino", "José Paradela", "Luka Romero", "Andrés Montaño", "Fernando Sámano", "Carlos Rotondi", "Amaury Morales", "Rogelio González", "Nicolás Ibáñez", "Christian Ebere", "Gabriel Fernández", "Jean Cabral", "Mateo Levy", "Bryan Gamboa"],
  "Chivas": ["Raúl Rangel", "Óscar Whalley", "Sebastián Liceaga", "Diego Campillo", "José Castillo", "Daniel Aguirre", "Luis Gabriel Rey", "Miguel Tapias", "Bryan González", "Richard Ledezma", "Miguel Gómez", "Omar Govea", "Fernando González", "Luis Romo", "Santiago Sandoval", "Efraín Álvarez", "Brian Gutiérrez", "Jordan Carrillo", "Kevin Castañeda", "Jonathan Pérez", "Roberto Alvarado", "Hugo Camberos", "Ricardo Marín", "Ángel Sepúlveda"],
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
      <main className="max-w-4xl mx-auto px-2 md:px-4">
        {vista === 'tabla' && <VistaTablas partidos={partidos} jugadores={jugadores} />}
        {vista === 'goleadores' && <VistaGoleadores partidos={partidos} jugadores={jugadores} />}
        {vista === 'resultados' && <VistaResultados partidos={partidos} jugadores={jugadores} />}
        {vista === 'reportar' && <VistaReportar jugadores={jugadores} setVista={setVista} setResultadoReciente={setResultadoReciente} />}
        {vista === 'tarjeta' && <TarjetaResultado resultado={resultadoReciente} jugadores={jugadores} setVista={setVista} />}
        {vista === 'admin' && <VistaAdmin partidos={partidos} db={db} />}
      </main>
    </div>
  );
}

function VistaTablas({ partidos, jugadores }) {
  const [expandido, setExpandido] = useState(null);
  
  const tabla = jugadores.map(j => {
    let pts = 0, pj = 0, gf = 0, gc = 0, pg = 0, pe = 0, pp = 0;
    const misPartidos = [];
    
    partidos.forEach(p => {
      if (p.local === j.equipo) {
        pj++; gf += p.golesLocal; gc += p.golesVisitante;
        if (p.golesLocal > p.golesVisitante) { pts += 3; pg++; }
        else if (p.golesLocal === p.golesVisitante) { pts += 1; pe++; }
        else pp++;
        misPartidos.push(p);
      }
      if (p.visitante === j.equipo) {
        pj++; gf += p.golesVisitante; gc += p.golesLocal;
        if (p.golesVisitante > p.golesLocal) { pts += 3; pg++; }
        else if (p.golesVisitante === p.golesLocal) { pts += 1; pe++; }
        else pp++;
        misPartidos.push(p);
      }
    });
    return { ...j, pts, pj, gf, gc, pg, pe, pp, dif: gf - gc, misPartidos };
  }).sort((a, b) => b.pts - a.pts || b.dif - a.dif || b.gf - a.gf);

  const toggleFila = (id) => {
    setExpandido(expandido === id ? null : id);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">🏆 Clasificación General</h2>
      </div>
      <div className="w-full">
        {tabla.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">No hay equipos registrados aún.</div>
        ) : (
          <div className="flex flex-col divide-y divide-slate-100">
            {/* ENCABEZADOS OPTIMIZADOS PARA MÓVIL */}
            <div className="flex text-[10px] sm:text-xs font-bold text-slate-500 bg-slate-50 py-3 px-2 sm:px-4 items-center">
              <div className="w-8 text-center">POS</div>
              <div className="flex-1 pl-2">MÁNAGER / EQUIPO</div>
              <div className="w-8 text-center">PJ</div>
              <div className="w-10 text-center">DIF</div>
              <div className="w-10 text-center text-slate-800">PTS</div>
              <div className="w-6 text-center"></div>
            </div>

            {tabla.map((fila, i) => {
              const isFirst = i === 0;
              const isLast = i === tabla.length - 1 && tabla.length > 1;
              const isExpanded = expandido === fila.id;
              
              return (
                <div key={fila.id} className="flex flex-col">
                  {/* FILA PRINCIPAL (SIEMPRE VISIBLE SIN SCROLL Y ALINEADA AL CENTRO VERTICALMENTE) */}
                  <div 
                    onClick={() => toggleFila(fila.id)}
                    className={`flex items-center py-2.5 px-2 sm:px-4 cursor-pointer hover:bg-blue-50/40 transition-colors ${isFirst ? 'bg-amber-50/30' : ''} ${isLast ? 'bg-red-50/10' : ''}`}
                  >
                    <div className={`w-8 text-center font-black ${isFirst ? 'text-amber-500 text-base' : 'text-slate-400 text-sm'}`}>
                      {i + 1}
                    </div>
                    
                    <div className="flex-1 pl-2 flex flex-col justify-center min-w-0">
                      <div className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-1.5 truncate leading-tight">
                        {fila.nombre} {isFirst && <span>👑</span>}
                      </div>
                      <div className="text-[10px] sm:text-xs text-slate-500 font-semibold truncate leading-tight">
                        {fila.equipo}
                      </div>
                    </div>
                    
                    <div className="w-8 text-center text-xs sm:text-sm font-medium text-slate-600">
                      {fila.pj}
                    </div>
                    
                    <div className={`w-10 text-center text-xs sm:text-sm font-bold ${fila.dif > 0 ? 'text-emerald-600' : fila.dif < 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                      {fila.dif > 0 ? `+${fila.dif}` : fila.dif}
                    </div>
                    
                    <div className="w-10 text-center font-black text-blue-600 text-base sm:text-lg">
                      {fila.pts}
                    </div>

                    <div className="w-6 text-center text-[10px] text-slate-400">
                      {isExpanded ? '🔽' : '▶️'}
                    </div>
                  </div>

                  {/* VISTA EXPANDIDA: ESTADÍSTICAS Y RESULTADOS HACIA ABAJO */}
                  {isExpanded && (
                    <div className="bg-slate-50/80 px-2 sm:px-4 py-4 border-t border-slate-100 shadow-inner">
                      
                      {/* Estadísticas detalladas */}
                      <div className="flex justify-between items-center bg-white rounded-lg border border-slate-200 shadow-sm p-3 mb-4 max-w-sm mx-auto">
                        <div className="text-center flex-1">
                          <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Ganados</div>
                          <div className="font-black text-slate-700">{fila.pg}</div>
                        </div>
                        <div className="w-px h-8 bg-slate-100"></div>
                        <div className="text-center flex-1">
                          <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Empatados</div>
                          <div className="font-black text-slate-700">{fila.pe}</div>
                        </div>
                        <div className="w-px h-8 bg-slate-100"></div>
                        <div className="text-center flex-1">
                          <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Perdidos</div>
                          <div className="font-black text-slate-700">{fila.pp}</div>
                        </div>
                        <div className="w-px h-8 bg-slate-100"></div>
                        <div className="text-center flex-1">
                          <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">GF-GC</div>
                          <div className="font-bold text-slate-600 text-xs mt-1">{fila.gf}-{fila.gc}</div>
                        </div>
                      </div>

                      {/* Historial de Partidos del Equipo */}
                      <div className="max-w-md mx-auto">
                        <h4 className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest mb-3 text-center border-b border-slate-200 pb-2">Historial de Resultados</h4>
                        
                        {fila.misPartidos.length === 0 ? (
                          <p className="text-sm text-center text-slate-400 italic py-2">Aún no ha jugado partidos.</p>
                        ) : (
                          <div className="space-y-2">
                            {fila.misPartidos.map((p, idx) => {
                              let bgClass = "bg-white border-slate-200";
                              let icon = "⬜";
                              let resultadoTexto = "EMPATE";
                              
                              if (p.local === fila.equipo) {
                                if (p.golesLocal > p.golesVisitante) { bgClass = "bg-emerald-50 border-emerald-100"; icon = "✅"; resultadoTexto = "VICTORIA"; }
                                else if (p.golesLocal < p.golesVisitante) { bgClass = "bg-rose-50 border-rose-100"; icon = "❌"; resultadoTexto = "DERROTA"; }
                              } else {
                                if (p.golesVisitante > p.golesLocal) { bgClass = "bg-emerald-50 border-emerald-100"; icon = "✅"; resultadoTexto = "VICTORIA"; }
                                else if (p.golesVisitante < p.golesLocal) { bgClass = "bg-rose-50 border-rose-100"; icon = "❌"; resultadoTexto = "DERROTA"; }
                              }

                              return (
                                <div key={idx} className={`p-3 rounded-xl border shadow-sm ${bgClass}`}>
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{p.jornada || 'Partido'}</span>
                                    <span className="text-[10px] font-black uppercase flex items-center gap-1">{icon} {resultadoTexto}</span>
                                  </div>
                                  
                                  <div className="flex justify-center items-center font-bold text-xs sm:text-sm">
                                    <span className={`flex-1 text-right truncate pr-2 ${p.local === fila.equipo ? 'text-blue-700 font-black' : 'text-slate-600'}`}>{p.local}</span>
                                    <span className="bg-white px-3 py-1 rounded shadow-sm border border-slate-100 text-slate-800 font-black tracking-widest">{p.golesLocal} - {p.golesVisitante}</span>
                                    <span className={`flex-1 text-left truncate pl-2 ${p.visitante === fila.equipo ? 'text-blue-700 font-black' : 'text-slate-600'}`}>{p.visitante}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
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

  const tablaGoleadores = Object.values(conteoGoles).sort((a, b) => b.goles - a.goles || a.jugadorFC.localeCompare(b.jugadorFC));
  const toggleExpandir = (id) => setExpandido(expandido === id ? null : id);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">⚽ Tabla de Goleadores</h2>
      </div>
      <div className="w-full">
        {tablaGoleadores.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">Aún no hay goles registrados.</div>
        ) : (
          <div className="flex flex-col divide-y divide-slate-100">
            <div className="flex text-[10px] sm:text-xs font-bold text-slate-500 bg-slate-50 py-3 px-2 sm:px-4 items-center">
              <div className="w-8 text-center">POS</div>
              <div className="flex-1 pl-2">JUGADOR (FC 27)</div>
              <div className="w-12 text-center">GOLES</div>
              <div className="w-6 text-center"></div>
            </div>

            {tablaGoleadores.map((fila, i) => (
              <React.Fragment key={fila.id}>
                <div 
                  onClick={() => toggleExpandir(fila.id)}
                  className="flex items-center py-3.5 px-2 sm:px-4 cursor-pointer hover:bg-blue-50/40 transition-colors"
                >
                  <div className="w-8 text-center font-black text-blue-500 text-sm">{i + 1}</div>
                  <div className="flex-1 pl-2 flex flex-col justify-center min-w-0">
                    <div className="font-bold text-slate-800 text-sm sm:text-base truncate">{fila.jugadorFC}</div>
                    <div className="text-[10px] sm:text-xs text-slate-500 font-semibold truncate mt-0.5">{fila.equipo} ({fila.manager})</div>
                  </div>
                  <div className="w-12 text-center font-black text-blue-600 text-base sm:text-lg">{fila.goles}</div>
                  <div className="w-6 text-center text-[10px] text-slate-400">{expandido === fila.id ? '🔽' : '▶️'}</div>
                </div>

                {expandido === fila.id && (
                  <div className="bg-slate-50/80 px-4 py-4 border-t border-slate-100 shadow-inner">
                    <div className="font-bold text-slate-600 text-[10px] uppercase tracking-wider mb-3 border-b border-slate-200 pb-2">⚽ Goles anotados contra:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries(fila.rivales).map(([rival, cant]) => {
                        const managerRival = jugadores.find(j => j.equipo === rival)?.nombre || 'Desconocido';
                        return (
                          <div key={rival} className="bg-white p-2.5 rounded-lg border border-slate-200 flex justify-between items-center shadow-sm">
                            <span className="text-slate-600 font-medium text-xs truncate pr-2">{rival} <span className="text-[9px] text-slate-400 block">({managerRival})</span></span>
                            <span className="font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{cant}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function VistaResultados({ partidos, jugadores }) {
  // Función para obtener el valor numérico de la jornada para ordenar
  const getPesoJornada = (jornadaStr) => {
    if (!jornadaStr) return 0;
    if (jornadaStr.includes('Jornada')) {
      return parseInt(jornadaStr.replace(/\D/g, '')) || 0;
    }
    if (jornadaStr === 'Cuartos de Final') return 100;
    if (jornadaStr === 'Semifinal') return 101;
    if (jornadaStr === 'Final') return 102;
    return 99; // Por si escriben algo diferente
  };

  // Ordenamos ascendente por jornada (Jornada 1 -> Jornada 17 -> Finales)
  // Si son de la misma jornada, se ordenan cronológicamente (el más viejo de esa jornada primero)
  const partidosOrdenados = [...partidos].sort((a, b) => {
    const pesoA = getPesoJornada(a.jornada);
    const pesoB = getPesoJornada(b.jornada);
    
    if (pesoA !== pesoB) {
      return pesoA - pesoB; 
    }
    return new Date(a.fecha || 0) - new Date(b.fecha || 0);
  });

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 p-4 border-b border-slate-100 text-center rounded-2xl shadow-sm bg-white mb-6">
        <h2 className="text-xl font-bold text-slate-800">📅 Resultados de la Temporada</h2>
      </div>

      {partidosOrdenados.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-slate-500 border border-slate-100">
          No hay partidos registrados todavía.
        </div>
      ) : partidosOrdenados.map((p, i) => {
        const managerLocal = jugadores.find(j => j.equipo === p.local)?.nombre || '';
        const managerVisitante = jugadores.find(j => j.equipo === p.visitante)?.nombre || '';

        return (
          <div key={p.id || i} className="bg-white rounded-2xl shadow-md border border-slate-100 p-5 flex flex-col relative overflow-hidden transition-all hover:shadow-lg">
            
            {p.jornada && (
              <div className="text-center text-xs font-bold text-blue-600 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">
                {p.jornada}
              </div>
            )}

            <div className="flex justify-between items-center mb-4 gap-2">
              <div className="w-[35%] text-right">
                <div className="font-black text-slate-800 text-sm md:text-base leading-tight">{p.local}</div>
                <div className="text-xs text-slate-400 font-semibold">{managerLocal}</div>
              </div>
              <div className="w-[30%] flex justify-center flex-shrink-0">
                <div className="w-full max-w-[90px] text-center font-black text-xl md:text-2xl text-white bg-slate-900 rounded-xl py-2 shadow-sm whitespace-nowrap">
                  {p.golesLocal} - {p.golesVisitante}
                </div>
              </div>
              <div className="w-[35%] text-left">
                <div className="font-black text-slate-800 text-sm md:text-base leading-tight">{p.visitante}</div>
                <div className="text-xs text-slate-400 font-semibold">{managerVisitante}</div>
              </div>
            </div>

            {p.anotadores && p.anotadores.length > 0 && (
              <div className="bg-slate-50 rounded-xl p-3.5 text-[11px] md:text-xs text-slate-600 border border-slate-100">
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
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

function TarjetaResultado({ resultado, jugadores, setVista }) {
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

  const managerLocal = jugadores.find(j => j.equipo === resultado.local)?.nombre || '';
  const managerVisitante = jugadores.find(j => j.equipo === resultado.visitante)?.nombre || '';

  return (
    <div className="flex flex-col items-center">
      <div 
        ref={tarjetaRef} 
        className="w-full max-w-sm bg-slate-950 text-white p-7 rounded-[2rem] shadow-2xl relative overflow-hidden border border-slate-800 flex flex-col" 
        style={{ 
          backgroundImage: 'url("https://images.unsplash.com/photo-1518605368461-1e1e38ce1542?auto=format&fit=crop&q=80&w=800")', 
          backgroundSize: 'cover', 
          backgroundPosition: 'center', 
          backgroundBlendMode: 'overlay', 
          backgroundColor: 'rgba(11, 16, 28, 0.96)' 
        }}
      >
        <div className="text-center mb-5 mt-1">
          <span className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] text-white shadow-sm uppercase">
            LIGA MX • {resultado.jornada || 'FC 27'}
          </span>
        </div>

        <div className="flex justify-between items-start gap-3 px-1 mb-4 text-center">
          <div className="flex-1 min-w-0">
            <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">LOCAL</span>
            <div className="font-black text-base md:text-lg text-white mt-2 leading-tight break-words">{resultado.local}</div>
            <div className="text-[11px] text-slate-400 font-bold truncate mt-0.5">({managerLocal})</div>
          </div>
          
          <div className="w-[10%] pt-6 font-black text-slate-500 text-xs tracking-widest flex-shrink-0">VS</div>
          
          <div className="flex-1 min-w-0">
            <span className="bg-slate-700/40 text-slate-300 border border-slate-700/50 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">VISITANTE</span>
            <div className="font-black text-base md:text-lg text-white mt-2 leading-tight break-words">{resultado.visitante}</div>
            <div className="text-[11px] text-slate-400 font-bold truncate mt-0.5">({managerVisitante})</div>
          </div>
        </div>

        <div className="bg-black/40 backdrop-blur-sm rounded-2xl py-3.5 px-6 border border-white/5 mb-5 flex flex-col items-center justify-center shadow-inner">
          <div className="text-4xl md:text-5xl font-black text-yellow-400 tracking-normal drop-shadow-[0_0_12px_rgba(250,204,21,0.3)] whitespace-nowrap">
            {resultado.golesLocal} <span className="text-white/65 mx-1 font-extrabold">-</span> {resultado.golesVisitante}
          </div>
          <span className="text-[9px] text-emerald-400 font-black uppercase tracking-widest mt-1.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Finalizado
          </span>
        </div>

        {resultado.anotadores && resultado.anotadores.length > 0 && (
          <div className="bg-black/55 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-lg flex-grow">
            <p className="font-bold text-slate-500 text-[10px] uppercase tracking-wider mb-2.5 border-b border-white/5 pb-1.5">REPORTE DEL PARTIDO</p>
            <ul className="space-y-2 text-xs font-semibold text-slate-200">
              {resultado.anotadores.map((a, i) => (
                <li key={i} className="flex items-center gap-2 leading-tight bg-white/[0.02] p-1 px-2 rounded-lg border border-white/[0.03]">
                  {a}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <button onClick={compartirWhatsApp} className="mt-8 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-[#25D366]/30 flex items-center gap-3 transform transition-transform active:scale-95 w-full max-w-sm justify-center">
        Enviar al Grupo de WhatsApp
      </button>
      <button onClick={() => setVista('tabla')} className="mt-4 text-slate-500 font-medium hover:text-slate-800 transition-colors mb-6">Volver a las tablas</button>
    </div>
  );
}

function VistaAdmin({ partidos, db }) {
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

  const eliminarPartido = async (id) => {
    if(window.confirm('¿Estás seguro de eliminar este partido? Esta acción no se puede deshacer y los puntos/goles se restarán automáticamente.')) {
      await deleteDoc(doc(db, 'partidos', id));
      alert('🗑️ Partido eliminado.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-slate-100">
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

      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-slate-100">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
          <span className="text-2xl">🗑️</span>
          <h2 className="text-xl font-bold text-slate-800">Eliminar Registros (Duplicados)</h2>
        </div>
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {partidos.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">No hay partidos registrados para eliminar.</p>
          ) : [...partidos].reverse().map((p) => (
            <div key={p.id} className="flex flex-col gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-blue-600 block mb-1">{p.jornada || 'Sin Jornada'}</span>
                  <span className="font-semibold text-slate-800 text-base">{p.local} {p.golesLocal} - {p.golesVisitante} {p.visitante}</span>
                  <span className="text-[10px] text-slate-500 font-medium block mt-1">
                    📅 {p.fecha ? new Date(p.fecha).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' }) : 'Fecha desconocida'}
                  </span>
                </div>
                <button onClick={() => eliminarPartido(p.id)} className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors shadow-sm flex-shrink-0">
                  Eliminar
                </button>
              </div>
              
              {p.anotadores && p.anotadores.length > 0 && (
                <div className="bg-white p-2.5 rounded-lg border border-slate-100 text-[10px] text-slate-600">
                  <ul className="list-disc pl-4 space-y-1">
                    {p.anotadores.map((a, j) => <li key={j}>{a}</li>)}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
