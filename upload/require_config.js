(function () {
    var baseurl = "script/";
    require.config({
        paths: {
            "jquery": baseurl+"jquery",
            "underscore": baseurl+"underscore",
            "backbone": baseurl+"backbone",
            "uploadImg":baseurl+"imgUpLoad",
            "index":baseurl+"index",
            "showImages":baseurl+"showImages",
             "F":baseurl+"fastclick"
        },
        shim: {
            'underscore': {
                exports: '_'
            },
            'backbone': {
                deps: ['underscore', 'jquery'],
                exports: 'Backbone'
            },

            F: {
                deps: ['jquery'],
                exports: 'Fastclick'
            },
        }
    });

})();
