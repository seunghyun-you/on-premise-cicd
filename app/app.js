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
  res.render('index', { hostname: os.hostname() });
});

app.get('/color/:reqpath', (req, res) => {
  return res.status(200).send(`
    <html>
      <body>
        <div style="background-color:${req.params.reqpath}">
          <h2> sample application </h2>
          <h2> Hostname : ${os.hostname()} </h2>
          <h2> RequestPath : ${req.params.reqpath} </h2>
        </div>
      </body>
    </html>
  `);
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

    return res.status(200).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Access Information</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
          }
          h2 {
            color: #333;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
            font-weight: bold;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          tr:hover {
            background-color: #f1f1f1;
          }
        </style>
      </head>
      <body>
        <h2>Access Information Dashboard</h2>
        <h3>Hostname: ${os.hostname()}</h3>
        <h4>Database connection successful!</h4>
        
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>OS</th>
              <th>CPU</th>
              <th>Memory</th>
              <th>Host IP</th>
              <th>Host Port</th>
              <th>VM IP</th>
              <th>VM Port</th>
              <th>Protocol</th>
              <th>Notes</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        
        <p>Total records: ${result.rowCount}</p>
      </body>
      </html>
    `);
  } catch (err) {
    console.error('Database connection error:', err);
    return res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
          }
          .error {
            color: red;
            background-color: #ffeeee;
            padding: 15px;
            border-radius: 5px;
            border: 1px solid #ffcccc;
          }
        </style>
      </head>
      <body>
        <h2>Sample application</h2>
        <h3>Hostname: ${os.hostname()}</h3>
        <div class="error">
          <h3>Database connection failed!</h3>
          <p>Error: ${err.message}</p>
        </div>
      </body>
      </html>
    `);
  }
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);