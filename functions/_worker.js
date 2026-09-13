export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // API routes
    if (url.pathname.startsWith('/api/')) {
      return api(request, env, url);
    }

    // Static assets with proper charset
    const res = await env.ASSETS.fetch(request);
    const ct = res.headers.get('content-type') || '';
    const newHeaders = new Headers(res.headers);

    if (ct.includes('text/html') && !ct.includes('charset')) {
      newHeaders.set('content-type', 'text/html; charset=utf-8');
    } else if (ct.includes('text/css') && !ct.includes('charset')) {
      newHeaders.set('content-type', 'text/css; charset=utf-8');
    } else if (ct.includes('javascript') && !ct.includes('charset')) {
      newHeaders.set('content-type', 'application/javascript; charset=utf-8');
    } else if (ct.includes('image/svg') && !ct.includes('charset')) {
      newHeaders.set('content-type', 'image/svg+xml; charset=utf-8');
    }

    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: newHeaders
    });
  }
};

async function api(req, env, u) {
  // questions GET
  if (u.pathname === '/api/questions' && req.method === 'GET') {
    const st = u.searchParams.get('status') || 'approved';
    const { results } = await env.DB.prepare(
      'SELECT id,name,question,answer,status,created_at FROM questions WHERE status=? ORDER BY id DESC'
    ).bind(st).all();
    return j(results);
  }
  // questions POST
  if (u.pathname === '/api/questions' && req.method === 'POST') {
    const b = await req.json();
    if (!b.name || !b.question) return j({ error: 'invalid' }, 400);
    await env.DB.prepare('INSERT INTO questions(name,question) VALUES(?,?)')
      .bind(b.name.trim(), b.question.trim()).run();
    return j({ ok: true }, 201);
  }
  // login
  if (u.pathname === '/api/auth/login' && req.method === 'POST') {
    const b = await req.json();
    if (b.password !== env.ADMIN_PASSWORD) return j({ error: 'unauthorized' }, 401);
    const token = await hmac(env.SESSION_SECRET, 'admin');
    return new Response(JSON.stringify({ ok: true }), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Set-Cookie': `session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`
      }
    });
  }
  // logout
  if (u.pathname === '/api/auth/logout') {
    return new Response('{}', {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Set-Cookie': 'session=; Path=/; Max-Age=0'
      }
    });
  }
  // posts GET
  if (u.pathname === '/api/posts' && req.method === 'GET') {
    const slug = u.searchParams.get('slug');
    if (slug) {
      const p = await env.DB.prepare(
        "SELECT posts.*, categories.name_fa category FROM posts LEFT JOIN categories ON categories.id=posts.category_id WHERE posts.slug=? AND posts.status='published'"
      ).bind(slug).first();
      return p ? j(p) : j({ error: 'not found' }, 404);
    }
    const { results } = await env.DB.prepare(
      "SELECT posts.id,posts.slug,posts.title,posts.excerpt,posts.image_url,posts.created_at,categories.name_fa category FROM posts LEFT JOIN categories ON categories.id=posts.category_id WHERE posts.status='published' ORDER BY posts.id DESC"
    ).all();
    return j(results);
  }
  // posts write
  if (u.pathname === '/api/posts' && ['POST','PATCH','DELETE'].includes(req.method)) {
    if (!(await auth(req, env))) return j({ error: 'unauthorized' }, 401);
    const b = await req.json();
    if (req.method === 'POST') {
      await env.DB.prepare(
        'INSERT INTO posts(category_id,slug,title,excerpt,content,image_url,seo_title,meta_description,status) VALUES(?,?,?,?,?,?,?,?,?)'
      ).bind(b.category_id||null,b.slug,b.title,b.excerpt||'',b.content,b.image_url||'',b.seo_title||'',b.meta_description||'',b.status||'draft').run();
      return j({ ok: true }, 201);
    }
    if (req.method === 'PATCH') {
      await env.DB.prepare(
        'UPDATE posts SET category_id=?,slug=?,title=?,excerpt=?,content=?,image_url=?,seo_title=?,meta_description=?,status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?'
      ).bind(b.category_id||null,b.slug,b.title,b.excerpt||'',b.content,b.image_url||'',b.seo_title||'',b.meta_description||'',b.status||'draft',b.id).run();
      return j({ ok: true });
    }
    await env.DB.prepare('DELETE FROM posts WHERE id=?').bind(b.id).run();
    return j({ ok: true });
  }
  return j({ error: 'not found' }, 404);
}

async function auth(req, env) {
  const c = req.headers.get('Cookie') || '';
  const t = (c.match(/session=([^;]+)/) || [])[1];
  if (!t || !env.SESSION_SECRET) return false;
  const expected = await hmac(env.SESSION_SECRET, 'admin');
  return t === expected;
}

async function hmac(k, s) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(k),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const x = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(s));
  return [...new Uint8Array(x)].map(v => v.toString(16).padStart(2, '0')).join('');
}

function j(x, status = 200) {
  return new Response(JSON.stringify(x), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}
