const express = require('express');
const os = require('os');
const { Pool } = require('pg');
// 
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

//
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'test',
  password: process.env.DB_PASSWORD || 'test1234',
  database: process.env.DB_NAME || 'node'
});

// 
const app = express();
app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/', (req, res) => {
  res.status(200).render('index', { hostname: os.hostname() });
});

app.get('/color/:reqpath', (req, res) => {
  res.status(200).render('color-path', { 
    reqpath: req.params.reqpath,
    hostname: os.hostname()
  });
});

app.get('/db', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM access_information');

    let tableRows = '';
    result.rows.forEach(row => {
      tableRows += `
        <tr>
          <td>${row.id}</td>
          <td>${row.name}</td>
          <td>${row.os || ''}</td>
          <td>${row.cpu || ''}</td>
          <td>${row.memory || ''}</td>
          <td>${row.host_ip}</td>
          <td>${row.host_port}</td>
          <td>${row.vm_ip}</td>
          <td>${row.vm_port}</td>
          <td>${row.protocol || ''}</td>
          <td>${row.notes || ''}</td>
          <td>${row.created_at ? new Date(row.created_at).toLocaleString() : ''}</td>
        </tr>
      `;
    });

    res.status(200).render('db', { 
      hostname: os.hostname(),
      tableRows: tableRows,
      totalRecords: result.rowCount
    });

  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).render('error', { 
      hostname: os.hostname(),
      error: err.message
    });
  }
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);