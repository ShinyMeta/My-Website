const express = require('express');
const path = require('path');

const app = express();
const staticRoot = path.resolve(__dirname, 'website_public');
const port = process.env.PORT || 8080;

// Static-only hosting: no API routes, no custom route handling.
app.use(express.static(staticRoot));

app.listen(port, () => {
  console.log(`http listening on port ${port}`);
});
