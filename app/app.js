const express = require('express');
const os = require('os');
// 
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// 
const app = express();
app.get('/', (req, res) => {
  return res.status(200).send(`
  <div>
    <h2> sample application </h2>
    <h2> Hostname : ${os.hostname()} </h2>
  </div>
  `);
});

app.get('/:reqpath', (req, res) => {
    return res.status(200).send(`
    <div style="background-color:${req.params.reqpath}">
      <h2> sample application </h2>
      <h2> Hostname : ${os.hostname()} </h2>
      <h2> RequestPath : ${req.params.reqpath} </h2>
    </div>
    `);
  });

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);