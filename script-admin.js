async function apiPost(body) {
  const res = await fetch('/api/updateTrack', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return res.json();
}

document.getElementById('btnLogin').addEventListener('click', async () => {
  const key = document.getElementById('adminKey').value.trim();
  if (!key) { document.getElementById('loginStatus').textContent = 'Enter password'; return; }
  sessionStorage.setItem('ADMIN_KEY', key);
  document.getElementById('loginSection').style.display = 'none';
  document.getElementById('editor').style.display = 'block';
  loadList();
});

async function loadList() {
  try {
    const r = await fetch('/data/tracking.json');
    if (!r.ok) { document.querySelector('#listTable tbody').innerHTML = '<tr><td colspan="4">No entries</td></tr>'; return; }
    const list = await r.json();
    const tbody = document.querySelector('#listTable tbody');
    tbody.innerHTML = '';
    list.forEach(item=>{
      const row = document.createElement('tr');
      row.innerHTML = `<td>${item.id}</td><td>${item.status}</td><td>${item.eta || '-'}</td><td>${item.updatedAt || ''}</td>`;
      tbody.appendChild(row);
    });
  } catch(e) {
    document.querySelector('#listTable tbody').innerHTML = '<tr><td colspan="4">Failed to load</td></tr>';
  }
}

document.getElementById('btnRefresh').addEventListener('click', loadList);

document.getElementById('btnAdd').addEventListener('click', async ()=>{
  const id = document.getElementById('entryId').value.trim();
  const status = document.getElementById('entryStatus').value;
  const eta = document.getElementById('entryEta').value.trim() || '-';
  const key = sessionStorage.getItem('ADMIN_KEY');
  if (!id) return alert('Enter ID');
  const resp = await apiPost({ adminKey: key, action: 'add', entry: { id, status, eta } });
  if (resp.ok) { alert('Added'); loadList(); }
  else alert(resp.error || 'Failed');
});

document.getElementById('btnEdit').addEventListener('click', async ()=>{
  const id = document.getElementById('entryId').value.trim();
  const status = document.getElementById('entryStatus').value;
  const eta = document.getElementById('entryEta').value.trim() || '-';
  const key = sessionStorage.getItem('ADMIN_KEY');
  if (!id) return alert('Enter ID');
  const resp = await apiPost({ adminKey: key, action: 'edit', entry: { id, status, eta } });
  if (resp.ok) { alert('Edited'); loadList(); }
  else alert(resp.error || 'Failed');
});

document.getElementById('btnDelete').addEventListener('click', async ()=>{
  const id = document.getElementById('entryId').value.trim();
  const key = sessionStorage.getItem('ADMIN_KEY');
  if (!id) return alert('Enter ID');
  if (!confirm('Delete ' + id + '?')) return;
  const resp = await apiPost({ adminKey: key, action: 'delete', entry: { id } });
  if (resp.ok) { alert('Deleted'); loadList(); }
  else alert(resp.error || 'Failed');
});
