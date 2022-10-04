const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 8080;

app.use(express.static(__dirname));

app.get('/', (_, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
});

app.listen(port, '192.168.1.189');