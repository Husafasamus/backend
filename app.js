//const express = require("express");
const http = require("http");
const url = require("url");
const fs = require("fs");
const mime = require("mime-types");
const { Client } = require("pg");

const client = new Client({
    user: "postgres",
    host: "localhost",
    database: "",
    password: "1234",
    port: 5432,
});

client.connect();

// client.query("select * from blogs_small;", (err, res) => {
//     if (err) {
//         console.log(err);

//     } else {
//         console.log(res);
//     }
//     console.log();
// });

function queryCheck(err, result, res) {
    if (err) {
        res.writeHead(404, mime.contentType("test.json"));
        res.write(JSON.stringify({error: "chyba databazy!"}));
    } else {
        res.writeHead(200, mime.contentType("test.json"));
        res.write(JSON.stringify(result.rows));                        
    }
    return res.end();
}


let port = 550;

http.createServer((req, res) => {
    let q = url.parse(req.url, true);

    if (q.pathname.startsWith("/api/")) {
        let body = "";  
        let args = q.pathname.substring(5, q.pathname.length).split("/");
        let requestName = args[0];
        args.splice(0, 1);
          

        switch (req.method) {
///////////////////////////////////////////////////////GET/////////////////////////////////////////////////////////////////////////////
            case "GET":
                switch (requestName) {
                    case "blogs":
                        client.query("select * from blogs_small;", (err, result) => {
                            return queryCheck(err, result, res); //dokoncit
                        });
                        break;
                    case "blog":
                        client.query(`select * from blogs_small where id = ${args[0]}`, (err, result) => {
                            if (err) {
                                res.writeHead(404, mime.contentType("test.json"));
                                res.write(JSON.stringify({error: "chyba databazy!"}));
                            } else {
                                res.writeHead(200, mime.contentType("test.json"));
                                res.write(JSON.stringify(result.rows[0]));
                            }
                            return res.end();
                        });
                        break;
                    case "blogWhole":
                        client.query(`select * from blog_whole where id_blog = ${args[0]};`, (err, result) => {
                            if (err) {
                                res.writeHead(404, mime.contentType("test.json"));
                                res.write(JSON.stringify({error: "chyba databazy!"}));
                            } else {
                                res.writeHead(200, mime.contentType("test.json"));
                                res.write(JSON.stringify(result.rows[0]));
                            }
                            return res.end();
                        });
                    
                    break;
                    
                      
                }
                break;
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            case "POST":
                body = "";
                req.on("data", (data) => {
                    body += data;
                });
                req.on("end", () => {
                    if (body === "") {
                        body = null;
                    } else {
                        body = JSON.parse(body);
                        switch (requestName) {
                            case "blog":                             
                                  client.query(`
                                    insert into blogs_small (title, text) values ('${body.title}', '${body.text}'); 
                                    insert into blog_whole values (currval('blogs_small_id_seq'), '${body.textWhole}');      
                                    SELECT * from blogs_small where id = currval('blogs_small_id_seq');`, (err, result) => { 
                                    if (err) {
                                        res.writeHead(404, mime.contentType("test.json"));
                                        res.write(JSON.stringify({error: "chyba databazy!"}));
                                    } else {
                                        res.writeHead(200, mime.contentType("test.json"));
                                        res.write(JSON.stringify(result[2].rows[0]));               
                                    }
                                    return res.end();
                                });
                                break;        
                        }
                    }
                });    
                
                break;
            
            case "PUT":
                body = "";
                req.on("data", (data) => {
                    body += data;
                });
                req.on("end", () => {
                    if (body === "") {
                        body = null;
                    } else {
                        body = JSON.parse(body);
                        switch (requestName) {
                            case "blog":                             
                                client.query(`update blogs_small SET title='${body.title}', text='${body.text}' WHERE id=${body.id}; SELECT * from blogs_small where id = ${body.id};`, (err, result) => { 
                                    if (err) {
                                        res.writeHead(404, mime.contentType("test.json"));
                                        res.write(JSON.stringify({error: "chyba databazy!"}));
                                    } else {
                                        res.writeHead(200, mime.contentType("test.json"));
                                        res.write(JSON.stringify(result[1].rows[0]));               
                                    }
                                    return res.end();
                                });
                                break;        
                        }
                    }
                });               
                break;
                
                
            case "DELETE":
                
                switch (requestName) {
                    case "blog":
                        client.query(`delete from blog_whole where id_blog = ${args[0]}; delete from blogs_small where id = ${args[0]}; `, (err, result) => {
                            if (err) {
                                res.writeHead(404, mime.contentType("test.json"));
                                res.write(JSON.stringify({error: "chyba databazy!"}));
                            } else {
                                res.writeHead(200, mime.contentType("test.json"));
                                res.write(JSON.stringify({result: "row deleted!"}));               
                            }
                            return res.end();
                        });
                        break;
                
                    default:
                        break; 
                }


                break;
        
            default:
                break;
        }




        
    
    } else {
        if (q.pathname === "/") {
            q.pathname += "index.html";
        }
        let fileName = "../frontend" + q.pathname;

        fs.readFile(fileName, (error, data) => {
            if (error) {
                res.writeHead(404, mime.contentType("test.html"));
                res.write("404 not found");
            } else {
                res.writeHead(200, mime.contentType(fileName));
                res.write(data);
            }

            return res.end();
        });
    }
}).listen(port);

console.log(`listening on port ${port}`);






/**
 * TO DO!
 * 1. sql injection
 */