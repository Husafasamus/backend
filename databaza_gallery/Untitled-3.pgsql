

--SHOW  data_directory;
--insert into photo_gallery (photo, text) values (pg_read_binary_file('cat.jpg'),'picture');

-- create table blogs_small (
--     id serial primary key,
--     title text,
--     text text
-- );


-- create table blog_whole (
--     id_blog integer primary key,
--     text text,
--     CONSTRAINT fk_blog_whole 
--         FOREIGN KEY (id_blog)
--             REFERENCES blogs_small (id) 
-- );


-- insert into blogs_small select * from blogs_small;

select * from blogs_small;
select * from blog_whole;


-- insert into blog_whole select id, '' from blogs_small;
-- select * from blog_whole;

--select * from photo_gallery;

--select * from blogs_small;