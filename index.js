const express = require('express');
const axios = require('axios');
const jimp = require('jimp');

const app = express();

app.get('/convert', async (req, res) => {
    try {
        const imageUrl = req.query.url;
        
        // NOVO: Pega o tamanho da URL. Se não tiver, o padrão é 16 (protege seu script antigo)
        const size = parseInt(req.query.size) || 16; 

        if (!imageUrl) return res.status(400).json({ error: "URL ausente" });

        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
            }
        });

        const imageBuffer = Buffer.from(response.data);
        let image = await jimp.read(imageBuffer);

        // Cria uma camada de fundo branco
        let whiteBg = new jimp(image.getWidth(), image.getHeight(), 0xFFFFFFFF);
        whiteBg.composite(image, 0, 0);

        // Redimensiona usando a variável "size"
        whiteBg.resize(size, size);

        let pixelMatrix = [];

        for (let y = 0; y < size; y++) {
            let row = [];
            for (let x = 0; x < size; x++) {
                const colorHex = whiteBg.getPixelColor(x, y);
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
