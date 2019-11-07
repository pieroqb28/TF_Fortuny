global.chai = require('chai');
global.expect = global.chai.expect;
global.supertest = require('supertest');
global.api = supertest('http://localhost:8051');
//global.app = require('../server');
//global.api = supertest(app);
global.tokenLogin = '';
global.usuarioAcceso = 'imagescode@gmail.com';
global.passAcceso = '123456';

