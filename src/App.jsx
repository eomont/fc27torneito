import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';

// BASE DE DATOS DE JUGADORES FC 27 - LIGA MX (Temporada 26/27)
const PLANTILLAS_FC27 = {
  "América": ["Luis Malagón", "Fernando Tapia", "Rodolfo Cota", "César Lugo", "Santiago Múñoz", "Santiago Ramos", "Israel Reyes", "Ramón Juárez", "Miguel Vázquez", "Franco Rossano", "Cristian Borja", "Dagoberto Espinoza", "Kevin Álvarez", "Emilio Lara", "Alan Cervantes", "Ricardo Cariño", "Ivan de la Cruz", "Erick Sánchez", "Carlos Álvarez", "Richard Sánchez", "Diego Valdés", "Brian Rodríguez", "Óscar Perea", "Javairo Dilrosun", "Zinedine González", "Henry Martín", "Miguel Borja"],
  "Cruz Azul": ["Kevin Mier", "Andrés Gudiño", "Ricardo Rodríguez", "Emmanuel Ochoa", "Willer Ditta", "Jesús Orozco Chiquete", "Alán Montes", "Gonzalo Piovi", "Raymundo Rubio", "Omar Campos", "Ralph Orquin", "Alan Mozo", "Erik Lira", "Amaury García", "Cristian Jiménez", "Jeremy Márquez", "Carlos Rodríguez", "Agustín Palavecino", "José Paradela", "Luka Romero", "Andrés Montaño", "Fernando Sámano", "Carlos Rotondi", "Amaury Morales", "Rogelio González", "Nicolás Ibáñez", "Christian Ebere", "Gabriel Fernández", "Jean Cabral", "Mateo Levy", "Bryan Gamboa"],
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
      <main className="max-w-4xl mx-auto px-4">
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
    const misPartidos = []; // Arreglo para guardar los partidos de este equipo
    
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
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left whitespace-nowrap">
