import http from 'node:http';
const PORT = 3000;

const server = http.createServer((req, res) => {
    console.log(req)

    if
    res.writeHead(200);
    res.end("gi~i`m anseungjin");
   
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
