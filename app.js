
//const express = require("express");
const http = require("http");
const url = require("url");
const fs = require("fs");
const mime = require("mime-types");


http.createServer((req, res) => {
    let q = url.parse(req.url, true);

    if (q.pathname.startsWith("/api/")) {

        let response = {
            status: 200,
            massage: "ok",
            content: {
                text: "test",
                array: [1, 2, 3, 100, "hetero array sexualne"]
            }
        }
        res.writeHead(200, mime.contentType("test.json"));
        res.write(JSON.stringify(response));
        return res.end();

    } else {

        if (q.pathname === "/") {
            q.pathname += "index.html";
        }
        let fileName = "../frontend" + q.pathname;
        
        fs.readFile(fileName, (err, data) => {
            if (err) {
                res.writeHead(404, mime.contentType("test.html"));
                res.write("404 not found");          
            }
            res.writeHead(200, mime.contentType(fileName));
            res.write(data);      
    
            return res.end();
        });

    }

    
}).listen(550);

console.log("listening on port 550");