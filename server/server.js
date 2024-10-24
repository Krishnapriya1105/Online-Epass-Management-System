const mongoose = require('mongoose');
const http = require('http');
const fs = require('fs');

// Connect to MongoDB without deprecated options
mongoose.connect('mongodb://127.0.0.1:27017/local')
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error: ', err));

// Define schema and model without regno and cgpa
const passSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    purpose: String,
    date: { type: Date, default: Date.now },
    status: { type: String, default: 'Pending' }  // status can be 'Pending', 'Approved', or 'Rejected'
});

const stud = mongoose.model('stud', passSchema);

// Create HTTP server
const server = http.createServer((req, res) => {
    // Serve static files
    if (req.url === '/' || req.url === '/index.html') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        fs.createReadStream('index.html').pipe(res);
    } else if (req.url === '/register.html') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        fs.createReadStream('register.html').pipe(res);
    } else if (req.url === '/style.css') {
        res.writeHead(200, { 'Content-Type': 'text/css' });
        fs.createReadStream('style.css').pipe(res);
    } else if (req.method === 'POST' && req.url === '/signup') {
        let body = '';

        // Collect the data sent by the form
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            // Parse the form data
            const params = new URLSearchParams(body);
            const name = params.get('name');
            const email = params.get('email');
            const password = params.get('password');
            const purpose = params.get('purpose');
            const date = new Date();

            // Create a new pass request
            const newPass = new stud({
                name,
                email,
                password,
                purpose,
                date
            });

            // Save the pass request in the database
            newPass.save()
                .then(() => {
                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    res.end('Pass request submitted successfully!');
                })
                .catch(err => {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('Error submitting pass request: ' + err.message);
                });
        });
    } else {
        // Handle 404 - Not Found
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
});

// Start the server
const PORT = 8000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
