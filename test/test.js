require('dotenv').config();
const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiEach = require('chai-each');
chai.use(chaiHttp);
chai.use(chaiEach);
const should = chai.should();

const KEY = process.env.TOKEN
const HOST = 'https://api.hh.ru'

// Внимание: неизвестные параметры и параметры с ошибкой в названии игнорируются
// При указании параметров пагинации (page, per_page) работает ограничение:
// глубина возвращаемых результатов не может быть больше 2000.
// Например, возможен запрос per_page=10&page=199 (выдача с 1991 по 2000 вакансию),
// но запрос с per_page=10&page=200 вернёт ошибку (выдача с 2001 до 2010 вакансию).

describe('GET /vacancies?text=%1', function() {
    this.timeout(10000);
    it('positive full value', function(done) {
        chai.request(HOST)
            .get(encodeURI('/vacancies?text=JavaScript'))
            .set('Authorization', 'Bearer ' + KEY)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.found.should.be.greaterThan(0);
                done();
            });
    });
    it('positive part value (search expression)', function(done) {
        chai.request(HOST)
            .get(encodeURI('/vacancies?text=JavaSc*'))
            .set('Authorization', 'Bearer ' + KEY)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.found.should.be.greaterThan(0);
                done();
            });
    });
    it('positive pair value', function(done) {
        chai.request(HOST)
            .get(encodeURI('/vacancies?text="!JavaScript !разработчик"&search_field=name'))
            .set('Authorization', 'Bearer ' + KEY)
            .end((err, res) => {
                const result = res.body.items.reduce(function (result, item) {
                    let testValue = item.name.toLowerCase()
                    return result && testValue.includes('javascript') && testValue.includes('разработчик')
                }, true)
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.found.should.be.greaterThan(0);
                should.equal(true, result)
                done();
            });
    });
    it('positive search logic expression', function(done) {
        chai.request(HOST)
            .get(encodeURI('/vacancies?text=!JavaScript OR !Python&search_field=name'))
            .set('Authorization', 'Bearer ' + KEY)
            .end((err, res) => {
                const result = res.body.items.reduce(function (result, item) {
                    let testValue = item.name.toLowerCase()
                    return result && (testValue.includes('javascript') || testValue.includes('python'))
                }, true)
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.found.should.be.greaterThan(0);
                should.equal(true, result)
                done();
            });
    });
    it('negative value', function(done) {
        chai.request(HOST)
            .get(encodeURI('/vacancies?text=Пррамст'))
            .set('Authorization', 'Bearer ' + KEY)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.found.should.be.equal(0);
                done();
            });
    });
    it('empty value', function(done) {
        chai.request(HOST)
            .get(encodeURI('/vacancies?text='))
            .set('Authorization', 'Bearer ' + KEY)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.found.should.be.greaterThan(0);
                done();
            });
    });
    it('test sql injection', function(done) {
        chai.request(HOST)
            .get(encodeURI("/vacancies?text=''+SUBSTRING(@@version,1,10)"))
            .set('Authorization', 'Bearer ' + KEY)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.found.should.be.equal(0);
                done();
            });
    });
});
