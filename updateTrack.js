const fs = require('fs');
const path = require('path');

// Admin-only endpoint to update the JSON store.
// Requires POST with JSON body: { adminKey: '...', action: 'add'|'edit'|'delete', entry: { id, status, eta } }
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { adminKey, action, entry } = req.body || {};

  if (!process.env.ADMIN_KEY) return res.status(500).json({ error: 'ADMIN_KEY not configured' });
  if (!adminKey || adminKey !== process.env.ADMIN_KEY) return res.status(401).json({ error: 'Unauthorized' });

  if (!action || !['add','edit','delete'].includes(action)) return res.status(400).json({ error: 'Bad action' });

  const dataPath = path.join(__dirname, '..', 'data', 'tracking.json');
  let list = [];
  try {
    const raw = fs.readFileSync(dataPath, 'utf8');
    list = JSON.parse(raw || '[]');
  } catch (e) {
    // file may not exist - we'll create it
    list = [];
  }

  if (action === 'add') {
    if (!entry || !entry.id) return res.status(400).json({ error: 'entry.id required' });
    const exists = list.find(it => String(it.id).toUpperCase() === String(entry.id).toUpperCase());
    if (exists) return res.status(400).json({ error: 'ID already exists' });
    const now = new Date().toISOString();
    list.push({ id: entry.id, status: entry.status || 'Processing Order', eta: entry.eta || '-', updatedAt: now });
  } else if (action === 'edit') {
    if (!entry || !entry.id) return res.status(400).json({ error: 'entry.id required' });
    const idx = list.findIndex(it => String(it.id).toUpperCase() === String(entry.id).toUpperCase());
    if (idx === -1) return res.status(400).json({ error: 'ID not found' });
    list[idx].status = entry.status || list[idx].status;
    list[idx].eta = entry.eta || list[idx].eta;
    list[idx].updatedAt = new Date().toISOString();
  } else if (action === 'delete') {
    if (!entry || !entry.id) return res.status(400).json({ error: 'entry.id required' });
    list = list.filter(it => String(it.id).toUpperCase() !== String(entry.id).toUpperCase());
  }

  try {
    fs.writeFileSync(dataPath, JSON.stringify(list, null, 2), 'utf8');
    return res.status(200).json({ ok: true, list });
  } catch (err) {
    console.error('Write error', err);
    return res.status(500).json({ error: 'Failed to write data' });
  }
};
