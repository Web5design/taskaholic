var redis = require('redis');

var client = redis.createClient();

var Task = function Task(description) {
  this.description = description;
  this.tags = [];
  this.id = null;
}
Task.prototype.save = function(done) {
  self = this;
  client.incr('task:id', function(error, id) {
    self.id = id;
    var multi = client.multi();
    multi.hmset('task:' + self.id, self);
    for (i in self.tags) {
      multi.sadd('tasks', self.id);
      multi.sadd('task:tag:' + self.tags[i], self.id);
    }
    multi.exec(function(error, results) {
      console.log('Task #' + self.id + ' "' + self.description + '" saved.');
      if (done) {
        done();
      }
    });
  })
}
Task.prototype.load = function(id, done) {
  var self = this;
  data = client.hmget('task:' + id, function(error, data) {
    if (error) {
      throw new Error()
    }
    for (i in data) {
      self[i] = data[i];
    }
    done(self);
  });
}
Task.prototype.addTag = function(tag) {
  this.tags.push(tag);
}

var item  = new Task('I have things to do');
item.addTag('sports');
item.addTag('news');
item.save(function() {
  console.log('This item was SAVED yo!');
});
