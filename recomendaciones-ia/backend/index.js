const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const peliculasRouter = require('./routers/peliculas');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch((err) => console.error('❌ Error al conectar a MongoDB:', err));

// Usar la ruta de películas
app.use('/api/peliculas', peliculasRouter);

// (Tu ruta de /api/recomendaciones puede ir aquí también)

app.listen(4000, () => {
  console.log('🚀 Backend corriendo en http://localhost:4000');
});
