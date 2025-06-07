const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'tasks.json');

function readTasks() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function saveTasks(tasks) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
}

function serveStatic(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 404;
      res.end('Not found');
    } else {
      const ext = path.extname(filePath);
      const type = ext === '.js' ? 'text/javascript' : 'text/html';
      res.setHeader('Content-Type', type);
      res.end(data);
    }
  });
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const method = req.method || 'GET';

  if (parsedUrl.pathname === '/api/tasks' && method === 'GET') {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(readTasks()));
    return;
  }

  if (parsedUrl.pathname === '/api/tasks' && method === 'POST') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      const { title } = JSON.parse(body || '{}');
      if (!title) {
        res.statusCode = 400;
        res.end('Missing title');
        return;
      }
      const tasks = readTasks();
      const newTask = { title, completed: false, created_at: new Date().toISOString() };
      tasks.push(newTask);
      saveTasks(tasks);
      res.statusCode = 201;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(newTask));
    });
    return;
  }

  const completeMatch = parsedUrl.pathname.match(/^\/api\/tasks\/(\d+)\/complete$/);
  if (completeMatch && method === 'POST') {
    const id = parseInt(completeMatch[1], 10);
    const tasks = readTasks();
    if (tasks[id]) {
      tasks[id].completed = true;
      saveTasks(tasks);
      res.statusCode = 204;
    } else {
      res.statusCode = 404;
    }
    res.end();
    return;
  }

  const deleteMatch = parsedUrl.pathname.match(/^\/api\/tasks\/(\d+)$/);
  if (deleteMatch && method === 'DELETE') {
    const id = parseInt(deleteMatch[1], 10);
    const tasks = readTasks();
    if (tasks[id]) {
      tasks.splice(id, 1);
      saveTasks(tasks);
      res.statusCode = 204;
    } else {
      res.statusCode = 404;
    }
    res.end();
    return;
  }

  // Serve frontend
  if (parsedUrl.pathname === '/' || parsedUrl.pathname === '/index.html') {
    return serveStatic(path.join(__dirname, 'index.html'), res);
  }
  if (parsedUrl.pathname.startsWith('/src/')) {
    return serveStatic(path.join(__dirname, parsedUrl.pathname), res);
  }

  res.statusCode = 404;
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
