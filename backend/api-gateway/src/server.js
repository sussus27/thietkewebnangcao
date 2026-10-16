const express = require('express');

const accountRoutes = require('./routes/account.route');
const streamingRoutes = require('./routes/streaming.route');
const uploadRoutes = require('./routes/upload.route');
const musicRoutes = require('./routes/music.route');

const app = express();

app.use('/api', accountRoutes);
app.use('/api', streamingRoutes);
app.use('/api', uploadRoutes);
app.use('/api', musicRoutes);

const PORT = 4000;

app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});