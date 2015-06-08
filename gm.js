var fs = require('fs');
var path = require('path');
var gm = require('gm');
var gear = require('gearjs');
var dir = process.argv[2];
var opt = process.argv[3];

function addZero(file, count){
  var name = file.replace(path.extname(file), '');
  var res = name;
  for(var i = 0; i < count - name.length; i++){
    res = '0' + res;
  }
  res += path.extname(file);
  return res;
}

//isgap - 是否间隔删除
function Resize(list, isgap){
  var count = 0;
  var next = function(){
    var file = list.shift();
    if(!file){
      return;
    }
    else{
      gm(file)
      .options({imageMagick: true})
      // .resize(640, 425)
      .crop(445, 445, 0, 0)
      .write(dir + '/' + '0_' + count + '.JPG', function(err){
        if(!err){
          console.log('  INFO : ' + file + ' resize done!');
          count++;

          if(isgap){
            list.shift(); //间隔删除图片
          }
          next();
        }
        else{
          console.log(err);
        }
      });
    }
  }
  next();
}

function ZoomIn(list){
  var count = 0;
  var next = function(){
    var file = list.shift();
    if(!file){
      return;
    }
    else{
      gm(file)
      .options({imageMagick: true})
      .size(function(err, size){
        this.resize(size.width/2, size.height/2);
        this.write(file, function(err){
          if(!err){
            console.log('  INFO : ' + file + ' resize done!', size);
            count++;

            next();
          }
          else{
            console.log(err);
          }
        });
      });
    }
  }
  next();
}

function Rename(list){
  var count = 0;
  var next = function(){
    var file = list.shift();
    if(!file){
      return;
    }
    else{
      var basename = path.basename(file)
                      // .replace('0_', '')
                      // .replace('VVS2-', '')
                      // .replace('VS2-', '')
                      // .replace('SI2-', '')
                      // .replace('SI1-1-', '')
                      // .replace('SI1-2-', '')
                      // .replace('SI2-2-', '')
                      .replace('VVS1-1-', '');
      basename = addZero(basename, 3);
      console.log(basename);
      gm(file)
      .options({imageMagick: true})
      .write(dir + '/' + basename, function(err){
        if(!err){
          console.log('  INFO : ' + file + ' rename done!');
          count++;

          fs.unlinkSync(file);
          next();
        }
        else{
          console.log(err);
        }
      });
    }
  }
  next();
}

if(!dir){
  console.log('  Error : input images directory');
}
else{
  var files = fs.readdirSync(dir);
  var queue = [];
  gear._.each(files, function(file){
    var ext = path.extname(file);
    var file = dir + '/' + file;
    if(['.JPG'].indexOf(ext.toUpperCase()) != -1){
      queue.push(file);
    }
  });

  switch(opt){
    case '-rn'://rename
      Rename(queue);
      break;
    case '-gr'://gap remove
      Resize(queue, true);
      break;
    case '-zi':
      ZoomIn(queue);
      break;
    default:
      Resize(queue);
      break;
  }

  return;
}