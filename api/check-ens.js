export const config = {
  runtime: 'nodejs'  // ⬅️ 强制使用 Node.js runtime，避免 Edge 报错
};

import fetch from 'node-fetch';
import cheerio from 'cheerio';

export default async function handler(req, res) {
  const { addresses } = req.query;
  if (!addresses) {
    return res.status(400).json({ error: "Missing addresses parameter" });
  }

  const results = {};
  const addressList = addresses.split(',').map(a => a.trim()).filter(Boolean);

  for (const address of addressList) {
    try {
      const url = `https://etherscan.io/address/${address}`;
      const resp = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      });

      const html = await resp.text();
      const $ = cheerio.load(html);
      const title = $('title').text();

      if (title.includes('.eth')) {
        const ens = title.split('|')[0].trim();
        results[address] = ens;
      } else {
        results[address] = '';
      }
    } catch (e) {
      results[address] = '';
    }
  }

  return res.status(200).json({ results });
}
