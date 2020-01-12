drop database if exists greatbay_DB;
create database greatbay_DB;
use greatbay_DB;
create table auctions (
	id int not null auto_increment primary key,
	item_name varchar(100) not null,
	category  varchar(45) not null,
	starting_bid int default 0,
	highest_bid int default 0
);
insert into auctions (item_name,category,starting_bid) values ("knife","cookware",20);
select * from auctions;
