var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var port = process.env.PORT || 8080; // 从环境变量读取
var mongoose = require('mongoose');
var _ = require('underscore');
var Movie = require('./models/movie');
var app = express();
var morgan = require('morgan');

mongoose.connect('mongodb://localhost/imooc')

// 使用 morgan 将请求日志打印到控制台
app.use(morgan('dev'));

app.set('views', './views/pages'); // 设置视图的根目录
app.set('view engine', 'jade'); // 设置默认的模板引擎
app.use(express.static(path.join(__dirname, 'public')));
// app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.locals.moment = require('moment');
app.listen(port); // 监听端口

// 路由
// index page
app.get('/', function(req, res){
  Movie.fetch(function(err, movies){
    if (err) {
      console.log(err);
    }
    res.render('index', {
      title: '首页',
      movies: movies
    });
  })
});

// detail page
app.get('/movie/:id', function(req, res){
  var id = req.params.id

  Movie.findById(id, function(err, movie){
    res.render('detail', {
      title: '电影: ' + movie.title + ' 详情',
      movie: movie
    });
  })
});

// admin page
app.get('/admin/movie', function(req, res){
  res.render('admin', {
    title: 'admin',
    movie: {
      title: '',
      director: '',
      country: '',
      year: '',
      poster: '',
      flash: '',
      summary: '',
      language: ''
    }
  });
});

// admin update movie
app.get('/admin/update/:id', function(req, res){
  var id = req.params.id
  if (id) {
    Movie.findById(id, function(err, movie){
      res.render('admin', {
        title: '编辑',
        movie: movie
      })
    })
  }
})

// admin post movie
app.post('/admin/movie/new', function(req,res){
  var movieObj = req.body.movie
  var id = req.body.movie._id
  // var id = movieObj._id;
  // var id;
  var _movie
  // console.log("debug: print id: " + id);
  if (id !== 'undefined'){
    Movie.findById(id, function(err, movie){
      if(err){
        console.log(err);
      }

      _movie = _.extend(movie, movieObj);
      _movie.save(function(err, movie){
        if (err){
          console.log(err);
        }
        res.redirect('/movie/' + movie._id);
      })
    });
  }
  else {
    _movie = new Movie({
      director: movieObj.director,
      title: movieObj.title,
      country: movieObj.country,
      language: movieObj.language,
      year: movieObj.year,
      poster: movieObj.poster,
      summary: movieObj.summary,
      flash: movieObj.flash,
    })
    _movie.save(function(err, movie){
      if (err){
        console.log(err);
      }
      // console.log("debug print: movie added");
      res.redirect('/movie/' + movie._id);
    })
  }
})

// list page
app.get('/admin/list', function(req, res){
  Movie.fetch(function(err, movies){
    if (err) {
      console.log(err);
    }
    res.render('list', {
      title: '电影列表',
      movies: movies
    });
  })
});

// delete movie
app.delete('/admin/list/:id', function(req, res){
  var id = req.params.id
  console.log("debug print: " + id);
  if (id){
    Movie.remove({_id: id}, function(err, movie){
      if (err){
        console.log(err)
      }
      else {
        res.json({success: 1})
      }
    })
  }
})

console.log('server started on port: ' + port);
