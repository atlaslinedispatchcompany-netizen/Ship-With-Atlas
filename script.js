// Updated script.js - uses /api/contact and /api/track
document.addEventListener('DOMContentLoaded', function(){
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async function(e){
      e.preventDefault();
      const fd = new FormData(contactForm);
      const body = {
        name: fd.get('name'),
        email: fd.get('email'),
        message: fd.get('message')
      };
      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify(body)
        });
        if (res.ok) {
          alert('Message sent. Thank you!');
          contactForm.reset();
        } else {
          const j = await res.json().catch(()=>({}));
          alert('Failed to send message: ' + (j.error || 'Server error'));
        }
      } catch (err) {
        alert('Network error - could not send message.');
      }
    });
  }

  const trackForm = document.getElementById('trackForm');
  if (trackForm) {
    trackForm.addEventListener('submit', async function(e){
      e.preventDefault();
      const input = document.getElementById('trackInput').value || '';
      const ids = input.split(',').map(s=>s.trim()).filter(Boolean);
      if (ids.length === 0) return alert('Enter at least 1 tracking ID');
      try {
        const res = await fetch('/api/track', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ ids })
        });
        if (!res.ok) { alert('Failed to fetch tracking'); return; }
        const json = await res.json();
        const out = document.getElementById('trackResults');
        out.innerHTML = '';
        json.data.forEach(item => {
          const div = document.createElement('div');
          div.innerHTML = `<strong>${item.id}</strong> — ${item.status} ${item.eta ? '('+item.eta+')' : ''} <span style="color:#666;font-size:12px">[${item.source}]</span>`;
          out.appendChild(div);
        });
      } catch (e) {
        alert('Network error');
      }
    });
  }
});
