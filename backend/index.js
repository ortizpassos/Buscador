const express = require('express');
const cors = require('cors');
const fs = require('fs');
const buscarProdutos = require('./buscarProdutos'); // vamos criar esse arquivo
const buscarProdutosPuppeteer = require('./buscarProdutosPuppeteer');


const app = express();
const PORT = 5000;
const SITES_FILE = 'sites.json';

app.use(cors());
app.use(express.json());

// Lê e escreve sites cadastrados
function lerSites() {
  if (!fs.existsSync(SITES_FILE)) return [];
  return JSON.parse(fs.readFileSync(SITES_FILE));
}
function salvarSites(sites) {
  fs.writeFileSync(SITES_FILE, JSON.stringify(sites, null, 2));
}

// Endpoints CRUD sites
app.get('/api/sites', (req, res) => res.json(lerSites()));

app.post('/api/sites', (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL obrigatória' });

  const sites = lerSites();
  if (sites.includes(url)) return res.status(409).json({ error: 'Site já cadastrado' });

  sites.push(url);
  salvarSites(sites);
  res.json({ success: true });
});

// Endpoint de busca
app.get('/buscar', async (req, res) => {
  const termo = req.query.termo;
  if (!termo) return res.status(400).json({ error: 'Termo obrigatório' });

  const sites = lerSites();
  const resultados = [];

  for (const urlBase of sites) {
    try {
      const url = urlBase.replace('{termo}', encodeURIComponent(termo));
      console.log(`Buscando em: ${url}`);
      const produtos = await buscarProdutosPuppeteer(url);
      console.log(`Encontrados ${produtos.length} produtos em ${url}`);
      resultados.push(...produtos);
    } catch (error) {
      console.error(`Erro ao buscar em ${urlBase}: ${error.message}`);
    }
  }

  res.json(resultados);
});


//app.listen(PORT, () => console.log(`API funcionando em http://localhost:${PORT}`));
