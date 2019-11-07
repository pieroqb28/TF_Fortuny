var express = require('express');
var reload = require('reload');
var compression = require('compression');
var graphqlHTTP = require('express-graphql');
var { buildSchema } = require('graphql');
var fetch = require('node-fetch');
var app = express();


app.use(compression());
app.use(express.static(__dirname ));
app.get('/',function(request, response){
response.sendFile(__dirname + '/index.html');

});

// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
  type Query {
    hello(name: String): String
  }
`);

// The root provides a resolver function for each API endpoint
/*var root = {
   hello : function na(args) {
        console.log(args.name)
        //return fetch('https://www.instagram.com/graphql/query/?query_hash=56066f031e6239f35a904ac20c9f37d9&variables={"id":"566208041","include_reel":true,"fetch_mutual":true,"first":5000,"after":""}')
        return fetch('https://www.instagram.com/graphql/query/?query_hash=56066f031e6239f35a904ac20c9f37d9&variables={%22id%22:%22566208041%22,%22include_reel%22:true,%22fetch_mutual%22:true,%22first%22:5000,%22after%22:%22%22}')
    .then(response => response.text())
    .then(text => {
      console.log(text)
    }).catch(err => {
      console.error('fetch failed', err);
    });
    }
 /* hello: function(args) { 
      return ('https://www.instagram.com/' +  args.name+'/?__a=1');  
      console.log(response.json());  
      return response.json();
    
        
  }*/
//};
/*
var app = express();
app.use('', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
app.listen(4000);
console.log('Running a GraphQL API server at localhost:4000/graphql');*/
app.listen(3000, function(){

});