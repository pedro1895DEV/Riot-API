const http = require('http');
const https = require('https');

const apiUrlAbsolut = 'https://br1.api.riotgames.com/lol/league/v4/entries/by-summoner/RQcxTL0owni36WDXE3LHl7XCgi-l4fWDE5QuT0CXAQxm9A';
const apiUrlTakeshi = 'https://br1.api.riotgames.com/lol/league/v4/entries/by-summoner/-loWOZ49td71-5QuxKb0mCgv-f7SyRZPulX6Y9YLNfqP';
const apiKey = 'RGAPI-7390c776-d778-46f0-8409-c9e3fb0fa3ee';

function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            headers: {
                'X-Riot-Token': apiKey,
            },
        };

        const req = https.request(url, options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                const jsonData = JSON.parse(data);
                resolve(jsonData[0]);
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}

const server = http.createServer(async (req, res) => {
    if (req.method === 'GET' && req.url === '/elo') {
        try {
            const absolutData = await makeRequest(apiUrlAbsolut);
            const takeshiData = await makeRequest(apiUrlTakeshi);

            const response = {
                absolut: {
                    leaguePoints: absolutData.leaguePoints,
                    tier: absolutData.tier,
                },
                takeshi: {
                    leaguePoints: takeshiData.leaguePoints,
                    tier: takeshiData.tier,
                },
                difference: absolutData.leaguePoints - takeshiData.leaguePoints,
            };

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(response));
        } catch (error) {
            console.error('Erro na requisição:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Erro ao buscar os dados de elo.' }));
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Rota não encontrada.' }));
    }
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
