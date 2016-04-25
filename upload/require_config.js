(function () {
    var baseurl = "script/";
    require.config({
        paths: {
            "jquery": baseurl+"jquery",
            "underscore": baseurl+"underscore",
            "backbone": baseurl+"backbone",
            "uploadImg":baseurl+"imgUpLoad",
            "index":baseurl+"index"
        },
        shim: {
            'underscore': {
                exports: '_'
            },
            'backbone': {
                deps: ['underscore', 'jquery'],
                exports: 'Backbone'
            }
        }
    });

})();
