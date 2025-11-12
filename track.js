const fs = require('fs');
const path = require('path');

function deterministicStatus(id) {
  const last = id.trim().slice(-1);
  const d = parseInt(last, 10);
  if (isNaN(d)) return { status: 'In Transit', eta: '2-4 days' };
  if (d <= 1) return { status: 'Processing Order', eta: '1-2 days' };
  if (d <= 3) return { status: 'Picked Up', eta: '2-3 days' };
  if (d <= 5) return { status: 'In Transit', eta: '2-4 days' };
  if (d <= 7) return { status: 'Out for Delivery', eta: 'Today' };
  return { status: 'Delivered', eta: '-' };
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { ids } = req.body || {};
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'No tracking IDs provided' });
  }

  // Try to read editable overrides from data/tracking.json
  const dataPath = path.join(__dirname, '..', 'data', 'tracking.json');
  let overrides = [];
  try {
    const raw = fs.readFileSync(dataPath, 'utf8');
    overrides = JSON.parse(raw || '[]');
  } catch (e) {
    // ignore; file might not exist yet
  }

  const results = ids.map(id => {
    const upper = String(id).toUpperCase();
    const found = overrides.find(item => String(item.id).toUpperCase() === upper);
    if (found) {
      return {
        id: upper,
        status: found.status,
        eta: found.eta || '-',
        updatedAt: found.updatedAt || new Date().toISOString(),
        source: 'override'
      };
    }
    const det = deterministicStatus(upper);
    return {
      id: upper,
      status: det.status,
      eta: det.eta,
      updatedAt: new Date().toISOString(),
      source: 'deterministic'
    };
  });

  return res.status(200).json({ data: results });
};
