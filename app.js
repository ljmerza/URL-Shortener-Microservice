'use strict'

const express = require("express")
const fs = require('fs')
const shortid = require('shortid')
const pgp = require('pg-promise')()

const app = express()
const herokuUrl = 'https://polar-hollows-17117.herokuapp.com/'

const cn = {
    host: 'ec2-54-243-243-89.compute-1.amazonaws.com',
    port: 5432,
    database: '',
    user: '',
    password: ''
}
let db = pgp(cn)

app.use(express.static('.'))
app.get("/new/*", createUrl)
app.get('/:aID', getUrl)

app.get('/', function(req, res){
    res.set('content-type','text/html')
    res.send(fs.readFileSync(__dirname + '/index.html','utf8'))
})

app.listen(process.env.PORT || 80, function(){
	console.log('server listening')
})

function createUrl(req, res){
    db.one({
        name: "create-url",
        text: "INSERT INTO theurls(id, url) VALUES($1, $2) returning id, url",
        values: [shortid.generate(), req.params[0]]
     })
    .then(function(data){
        res.json({
            "original_url": herokuUrl + data.url,
            "short_url": herokuUrl + data.id
        })
    })
    .catch(function(error){
        res.end(error)
    })  
}

function getUrl (req, res){
    db.one({
        name: "get-url",
        text: "SELECT url FROM theurls WHERE id=$1", 
        values: [req.params.aID]
    })
    .then(function(data){
        if(!(/^http/.test(data.url))){
            res.redirect('http://'+data.url)
        }else{
            res.redirect(data.url)
        }
    })
    .catch(function(error){
        res.end(error)
    })
}
