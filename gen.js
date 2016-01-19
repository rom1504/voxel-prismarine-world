'use strict';

var ndarray = require('ndarray');

module.exports = function(game, opts) {
  return new Flatland(game, opts);
};
module.exports.pluginInfo = {
  loadAfter: ['voxel-registry']
};
var World=require("prismarine-world");
var Chunk = require('prismarine-chunk')("1.8");
var Vec3=require("vec3");

function Flatland(game, opts) {

  var diamondSquare=require("diamond-square")({seed:Math.floor(Math.random()*Math.pow(2, 31))});
  this.world=new World(diamondSquare);
  this.game = game;

  this.registry = game.plugins.get('voxel-registry');
  if (!this.registry) throw new Error('voxel-flatland requires voxel-registry plugin');

  this.block = opts.block;
  if (!this.block) throw new Error('voxel-flatland requires block option');

  this.enable();
}

Flatland.prototype.enable = function() {
  this.game.voxels.on('missingChunk', this.onMissingChunk = this.missingChunk.bind(this));
};

Flatland.prototype.disable = function() {
  this.game.voxels.removeListener('missingChunk', this.onMissingChunk);
};




Flatland.prototype.missingChunk = function(position) {
  console.log('missingChunk',position);

  console.log(position[1])
  var pY=position[1]+2;
  if (pY < 0) return; // everything below y=0 is air

  var blockIndex = this.registry.getBlockIndex(this.block);
  if (!blockIndex) {
    throw new Error('voxel-flatland unable to find block of name: '+this.block);
  };

  var width = this.game.chunkSize;
  var pad = this.game.chunkPad;
  var arrayType = this.game.arrayType;

  var buffer = new ArrayBuffer((width+pad) * (width+pad) * (width+pad) * arrayType.BYTES_PER_ELEMENT);
  var voxelsPadded = ndarray(new arrayType(buffer), [width+pad, width+pad, width+pad]);
  var h = pad >> 1;
  var voxels = voxelsPadded.lo(h,h,h).hi(width,width,width);
  var parts=[[0,0],[0,1],[1,0],[1,1]];
  Promise.all(parts.map(part => {
    this.world.getColumn(position[0]*2+part[0],position[2]*2+part[1])
      .then(column => {
        var pos=new Vec3(0,0,0);
        let x,y,z;
        for (pos.x = 0,x=part[0]*16; pos.x < 16, x<(part[0]+1)*16; ++pos.x,x++) {
          for (pos.z = 0,z=part[1]*16; pos.z < 16, z<(part[1]+1)*16; ++pos.z,z++) {
            for (pos.y = pY*this.game.chunkSize,y=0; pos.y < (pY+1)*this.game.chunkSize,y<this.game.chunkSize; ++pos.y,y++) {
              voxels.set(x,y,z, column.getBlockType(pos)==0 ? 0 : blockIndex);
            }
          }
        }
      });
  }))
  .then(() => {
    var chunk = voxelsPadded;
    chunk.position = position;

    console.log('about to showChunk',chunk);
    this.game.showChunk(chunk);
  });

};