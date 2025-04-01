export default async function handler(req, res) {
  const { addresses } = req.query;

  if (!addresses) {
    return res.status(400).json({ error: "Missing addresses" });
  }

  const list = addresses.split(',').map(a => a.trim()).filter(a => /^0x[a-fA-F0-9]{40}$/.test(a));
  const results = {};

  for (const address of list) {
    try {
      const html = await fetch(`https://etherscan.io/address/${address}`).then(res => res.text());
      const match = html.match(/<title>(.*?) \| Address/i);
      const title = match?.[1] || '';
      results[address] = title.toLowerCase().endsWith('.eth') ? title : '';
    } catch (e) {
      results[address] = 'Error';
    }
  }

  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({ results });
}
