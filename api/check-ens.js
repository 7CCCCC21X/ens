// /api/check-ens.js
import { NextResponse } from 'next/server';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const addressesParam = searchParams.get('addresses');

  if (!addressesParam) {
    return NextResponse.json({ error: 'Missing addresses' }, { status: 400 });
  }

  const addresses = addressesParam
    .split(',')
    .map(a => a.trim().toLowerCase())
    .filter(Boolean);

  const results = {};
  for (const address of addresses) {
    try {
      const url = `https://etherscan.io/address/${address}`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      });

      if (res.status !== 200) {
        results[address] = null;
        continue;
      }

      const html = await res.text();
      const $ = cheerio.load(html);
      const title = $('title').text();

      if (title.includes('.eth')) {
        const ens = title.split('|')[0].trim();
        results[address] = ens;
      } else {
        results[address] = null;
      }
    } catch (err) {
      results[address] = null;
    }
  }

  return NextResponse.json({ results });
}
