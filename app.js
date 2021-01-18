const http = require("http"); 
const url = require("url"); 
const fs = require("fs");   
const mime = require("mime-types");
const { Client } = require("pg"); 
const sanitizer = require("string-sanitizer");


const client = new Client({
    user: "postgres",
    host: "localhost",
    database: "",
    password: "1234",
    port: 5432,
});

client.connect();

let port = 550;

http.createServer((req, res) => {

    let q = url.parse(req.url, true);

    if (q.pathname.startsWith("/api/")) {

        let body = "";  
        let args = q.pathname.substring(5, q.pathname.length).split("/");
        let requestName = args[0];
        args.splice(0, 1);
          
        switch (req.method) {

            case "GET": //  ---==="GET"===---         
                switch (requestName) {

                    case "blogs":                 
                        client.query("select * from blogs_small;", (err, result) => {
                            return queryCheck(err, result, res, true); 
                        });
                        break;

                    case "blog":
                        
                        client.query(`select * from blogs_small where id = ${sanitizer.sanitize(args[0])}`, (err, result) => {
                            return queryCheck(err, result, res, false);
                        });
                        break;

                    case "blogWhole":
                        client.query(`select * from blog_whole where id_blog = ${args[0]};`, (err, result) => {
                            return queryCheck(err, result, res, true);
                        });
                    break;

                    case "quotes":
                        client.query(`select * from quotes`, (err, result) => {
                            return queryCheck(err, result, res, true);
                        });
                    break;    
                }
                break;

            case "POST":  //  ---==="POST"===---
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
                                    return queryCheck1(err, result, res, 2);
                                });
                                break;
                            
                            
                            case "loginUser":
                                
                                if (body.login === "admin" && body.password === "1234") {
                                    res.writeHead(200, mime.contentType("test.json"));
                                    res.write(JSON.stringify({msg: "success"}));
                                }
                                else {
                                    res.writeHead(401, mime.contentType("test.json"));
                                    res.write(JSON.stringify({error: "wrong password!"}));
                                }
                                return res.end();
                                break;
                            
                            case "quote":
                                client.query(`
                                insert into quotes (text, author) values ('${body.text}', '${body.author}');     
                                SELECT * from quotes where id = currval('quotes_id_seq');`, (err, result) => { 
                                return queryCheck1(err, result, res, 1);
                                });
                                break;
                          
                        }
                    }
                });    
                
                break;
            
            case "PUT":  //  ---==="PUT"===---  
                body = "";
                req.on("data", (data) => { body += data; });
                req.on("end", () => {
                    if (body === "") {
                        body = null;
                    } else {
                        body = JSON.parse(body);
                        switch (requestName) {
                            case "blog":                             
                                client.query(`update blogs_small SET title='${body.title}', text='${body.text}' WHERE id=${body.id}; 
                                              SELECT * from blogs_small where id = ${body.id};`, (err, result) => { 
                                    return queryCheck1(err, result, res, 1);
                                });
                                break;   
                            
                            case "blogWhole":
                                client.query(`update blog_whole SET text='${body.textWhole}' WHERE id_blog=${body.id}; 
                                              SELECT * from blog_whole where id_blog = ${body.id};`, (err, result) => { 
                                    return queryCheck1(err, result, res, 1);
                                });
                                break;

                            case "quote":
                                client.query(`update quotes SET text='${body.text}', author='${body.author}' WHERE id=${body.id}; 
                                              SELECT * from quotes where id = ${body.id};`, (err, result) => { 
                                    return queryCheck1(err, result, res, 1);
                                });
                                break;

                                
                                
                        }
                    }
                });               
                break;
                         
            case "DELETE": //  ---==="DELETE"===---
                
                switch (requestName) {
                    case "blog":
                        client.query(`delete from blog_whole where id_blog = ${args[0]};
                                      delete from blogs_small where id = ${args[0]}; `, (err, result) => {
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

                        case "quote":
                        client.query(`delete from quotes where id = ${args[0]};`, (err, result) => {
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


function queryCheck(err, result, res, writeAll) {
    if (err) {
        res.writeHead(404, mime.contentType("test.json"));
        res.write(JSON.stringify({error: "chyba databazy!"}));
    } else {
        res.writeHead(200, mime.contentType("test.json"));
        res.write(JSON.stringify(writeAll ? result.rows : result.rows[0]));                        
    }
    return res.end();
}

function queryCheck1(err, result, res, numberRes) {
    if (err) {
        res.writeHead(404, mime.contentType("test.json"));
        res.write(JSON.stringify({error: "chyba databazy!"}));
    } else {
        res.writeHead(200, mime.contentType("test.json"));
        res.write(JSON.stringify(result[numberRes].rows[0]));               
    }
    return res.end();
}