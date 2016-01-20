'use strict';

require('voxel-engine-stackgl')({
  pluginLoaders: {
    'voxel-bedrock': require('voxel-bedrock'),
    'voxel-flatland': require('./gen')
  },
  pluginOpts: {
    'voxel-engine-stackgl': {generateChunks: false},
    'game-shell-fps-camera': {position: [-4, -40, -5], rotationX:15*Math.PI/180, rotationY:135*Math.PI/180 },

    'voxel-bedrock': {},
    'voxel-flatland': {block: 'bedrock'}
  }});
