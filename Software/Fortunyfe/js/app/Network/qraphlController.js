

/*
var express = require('express');
var reload = require('reload');
var compression = require('compression');
var graphqlHTTP = require('express-graphql');
var { buildSchema } = require('graphql');
var fetch = require('node-fetch');
var graphql = require('graphql.js');
var graph = graphql('https://graphql-pokemon.now.sh/');

console.log("i am here")

var query = graph(`{
    pokemon(name: "Pikachu") {
        attacks {
            special {
                name
            }
        }
    }
}`);


if (require.main === module) {
    query().then(
      res => console.log(JSON.stringify(res, null, 2)),
      err => console.error(err)
    );
  };
  console.log(query, graph)


/*var app = express();

var root = {
    hello : function na(user) {
        console.log(args.name)
        return fetch('https://www.instagram.com/'+  user.nombre+'/?__a=1')
    .then(response => response.text())
    .then(text => {
    console.log(text);
    }).catch(err => {
    console.error('fetch failed', err);
});
}
};
var app = express();
app.use('', graphqlHTTP({
schema: schema,
rootValue: root,
graphiql: true,
}));*/