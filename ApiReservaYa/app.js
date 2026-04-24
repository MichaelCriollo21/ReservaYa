require('dotenv').config();
const express = require('express');
const cors = require('cors');
const reservaRoutes = require('./routes/reservaRoutes');
const mesaRoutes = require('./routes/mesaRoutes');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use('/api/reservas', reservaRoutes);
app.use('/api/mesas', mesaRoutes);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});