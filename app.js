const express = require('express');
const open = require('open').default;

const app = express();
const PORT = 3000;

// Serve all static files (HTML, CSS, images) from the current directory
app.use(express.static(__dirname));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  open(`http://localhost:${PORT}`);
}); 
