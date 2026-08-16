const express = require('express');
const axios = require('axios');
const jimp = require('jimp');

const app = express();

app.get('/convert', async (req, res) => {
    try {
        const imageUrl = req.query.url;
        if (!imageUrl) return res.status(400).json({ error: "URL ausente" });

        // Simula um navegador real para evitar bloqueio de sites
        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
            }
        });

        // Converte os dados brutos para Buffer antes de passar para o Jimp
        const imageBuffer = Buffer.from(response.data);
        const image = await jimp.read(imageBuffer);

        // Redimensiona a imagem para 16x16 pixels
        image.resize(16, 16);

        let pixelMatrix = [];

        for (let y = 0; y < 16; y++) {
            let row = [];
            for (let x = 0; x < 16; x++) {
                const colorHex = image.getPixelColor(x, y);
                const { r, g, b } = jimp.intToRGBA(colorHex);
                row.push({ r, g, b });
            }
            pixelMatrix.push(row);
        }

        res.json(pixelMatrix);
    } catch (error) {
        res.status(500).json({ error: "Falha ao processar a imagem", motivo: error.message });
    }
});

module.exports = app;
