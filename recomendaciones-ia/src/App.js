import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // Estados
  const [peliculas, setPeliculas] = useState([]);
  const [peliculasFiltradas, setPeliculasFiltradas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [modoDescripcion, setModoDescripcion] = useState(false);
  const [recomendacion, setRecomendacion] = useState('');

  // Cargar películas desde el backend al montar el componente
  useEffect(() => {
    fetch('/api/peliculas')
      .then(res => res.json())
      .then(data => {
        // Asegurarse de que data sea un array
        const peliculasArray = Array.isArray(data) ? data : [];
        setPeliculas(peliculasArray);
        setPeliculasFiltradas(peliculasArray);
      })
      .catch(err => {
        console.error('Error al obtener películas:', err);
        setPeliculas([]);
        setPeliculasFiltradas([]);
      });
  }, []);

  // Búsqueda tradicional por título o género
  const handleBuscar = (e) => {
    e.preventDefault();
    const texto = busqueda.toLowerCase();
    const resultado = peliculas.filter(p =>
      p.titulo?.toLowerCase().includes(texto) ||
      p.genero?.toLowerCase().includes(texto) ||
      p.titulo?.toLowerCase().startsWith(texto)
    );
    setPeliculasFiltradas(resultado);
    setRecomendacion('');
  };

  // Búsqueda por descripción con IA
  const handleBuscarPorDescripcion = async () => {
    try {
      const res = await fetch('/api/recomendaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Dame una recomendación basada en esta descripción: ${busqueda}.
                   Usa solo películas de este catálogo: ${peliculas.map(p => p.titulo).join(', ')}.`
        })
      });

      const data = await res.json();
      const recomendacionIA = data.recomendacion || '';
      setRecomendacion(recomendacionIA);

      // Filtrar las películas que aparecen en la recomendación
      const seleccionadas = peliculas.filter(p =>
        recomendacionIA.toLowerCase().includes(p.titulo?.toLowerCase())
      );

      setPeliculasFiltradas(Array.isArray(seleccionadas) ? seleccionadas : []);
    } catch (err) {
      console.error('Error con IA:', err);
      setPeliculasFiltradas([]);
    }
  };

  return (
    <div className="App">
      <h1>Catálogo de Películas</h1>

      {/* Formulario de búsqueda */}
      <form
        className="buscador"
        onSubmit={modoDescripcion ? (e) => { e.preventDefault(); handleBuscarPorDescripcion(); } : handleBuscar}
      >
        <input
          type="text"
          placeholder={modoDescripcion ? 'Describe la peli que buscas...' : 'Busca por título o género'}
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />

        {!modoDescripcion ? (
          <button type="submit">Buscar</button>
        ) : (
          <button type="button" onClick={handleBuscarPorDescripcion}>
            Buscar con IA
          </button>
        )}

        <button type="button" onClick={() => setModoDescripcion(!modoDescripcion)}>
          {modoDescripcion ? 'Modo tradicional' : 'Modo IA'}
        </button>
      </form>

      {/* Bloque de recomendación IA */}
      {recomendacion && (
        <div className="bloque-recomendaciones">
          <h2>IA sugiere:</h2>
          <p>{recomendacion}</p>
        </div>
      )}

      {/* Galería de películas */}
      <div className="grid">
        {Array.isArray(peliculasFiltradas) && peliculasFiltradas.length > 0 ? (
          peliculasFiltradas.map((p, i) => (
            <div className="tarjeta" key={i}>
              <img src={p.poster} alt={p.titulo} />
              <div className="info">
                <h3>{p.titulo}</h3>
                <p>{p.genero}</p>
                <span>{p.descripcion?.slice(0, 60)}...</span>
              </div>
            </div>
          ))
        ) : (
          <p>No hay películas para mostrar.</p>
        )}
      </div>
    </div>
  );
}

export default App;
