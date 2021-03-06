/**
 * ply-model
 *
 * Wraps THREE.PLYLoader.
 */
THREE.PLYLoader = require('../../lib/PLYLoader');

/**
 * Loads, caches, resolves geometries.
 *
 * @member cache - Promises that resolve geometries keyed by `src`.
 */
module.exports.System = AFRAME.registerSystem('ply-model', {
  init: function () {
    this.cache = {};
  },

  /**
   * @returns {Promise}
   */
  getOrLoadGeometry: function (src, skipCache) {
    const cache = this.cache;
    const cacheItem = cache[src];

    if (!skipCache && cacheItem) {
      return cacheItem;
    }

    cache[src] = new Promise(function (resolve) {
      const loader = new THREE.PLYLoader();
      loader.load(src, function (geometry) {
        resolve(geometry);
      });
    });
    return cache[src];
  },
});

module.exports.Component = AFRAME.registerComponent('ply-model', {
  schema: {
    skipCache: {type: 'boolean', default: false},
    src: {type: 'asset'}
  },

  init: function () {
    this.model = null;
  },

  update: function () {
    const data = this.data;
    const el = this.el;

    if (!data.src) {
      console.warn('[%s] `src` property is required.', this.name);
      return;
    }

    // Get geometry from system, create and set mesh.
    this.system.getOrLoadGeometry(data.src, data.skipCache).then((geometry) => {
      const model = createModel(geometry);
      el.setObject3D('mesh', model);
      el.emit('model-loaded', {format: 'ply', model: model});
    });
  },

  remove: function () {
    if (this.model) { this.el.removeObject3D('mesh'); }
  }
});

function createModel (geometry) {
  return new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
    color: 0xFFFFFF,
    shading: THREE.FlatShading,
    vertexColors: THREE.VertexColors,
    shininess: 0
  }));
}
