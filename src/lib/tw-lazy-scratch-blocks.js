let _ScratchBlocks = null;

const isLoaded = () => !!_ScratchBlocks;

const get = () => {
    if (!isLoaded()) {
        throw new Error('scratch-blocks is not loaded yet');
    }
    return _ScratchBlocks;
};

const load = () => {
    if (_ScratchBlocks) {
        return Promise.resolve();
    }
    // Dry Eggs intentionally uses the horizontal/sideways block engine.
    // Import the shim directly so package metadata can never fall back to vertical blocks.
    return import(/* webpackChunkName: "sb" */ 'scratch-blocks/shim/horizontal.js')
        .then(m => {
            _ScratchBlocks = m.default;
            return _ScratchBlocks;
        });
};

export default {
    get,
    isLoaded,
    load
};
