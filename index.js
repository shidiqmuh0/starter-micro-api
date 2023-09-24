const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

// Middleware untuk mengizinkan CORS
app.use(cors());

// Endpoint untuk scraping
app.get("/scrape", async (req, res) => {
    try {
        const url = req.query.url;

        if (!url) {
            return res.status(400).json({ error: "URL parameter is missing" });
        }

        const response = await axios.get(url);
        if (response.status === 200) {
            const html = response.data;
            const $ = cheerio.load(html);

            const smokeUrl = $(".smokeurlrh");
            const strongElements = smokeUrl.find("strong");

            const result = [];

            strongElements.each((index, element) => {
                const strongText = $(element).text();
                const siblingLinks = $(element).nextAll("a");

                siblingLinks.each((index, siblingElement) => {
                    const link = $(siblingElement).attr("href");
                    const linkText = $(siblingElement).text();
                    result.push({ size: strongText, linkText, link });
                });
            });

            res.json(result);
        } else {
            res.status(response.status).json({ error: "Failed to fetch the URL" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
