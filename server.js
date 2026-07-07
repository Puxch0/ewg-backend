import express from "express";
import { HttpsProxyAgent } from "https-proxy-agent";

const app = express();
const PORT = process.env.PORT || 3000;

// Tu proxy residencial Webshare
const proxy = "http://lwtpddyu:omq5azezd0c7@9.142.198.187:5854/";
const agent = new HttpsProxyAgent(proxy);

app.get("/api/ewg", async (req, res) => {
  const zip = req.query.zip;

  if (!zip) {
    return res.status(400).json({ error: "ZIP requerido" });
  }

  const url = `https://www.ewg.org/tapwater/ajax/search-contaminants.php?zip=${zip}`;

  try {
    const response = await fetch(url, {
      agent,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36",
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "X-Requested-With": "XMLHttpRequest",
        "Referer": `https://www.ewg.org/tapwater/search-results.php?zip=${zip}`
      }
    });

    const text = await response.text();

    if (text.startsWith("<")) {
      return res.status(403).json({
        error: "EWG devolvió HTML en lugar de JSON",
        detalle: text.substring(0, 200)
      });
    }

    const data = JSON.parse(text);

    res.json({
      zip,
      contaminantes: data.contaminants || []
    });

  } catch (err) {
    res.status(500).json({
      error: "Error al consultar EWG vía proxy residencial",
      detalle: err.toString()
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
