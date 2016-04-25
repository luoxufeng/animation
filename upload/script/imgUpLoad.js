define(function() {
    var TIME_OUT=600000;//超时时间
    var EasyUpload = function(el, options) {
        this.counter = 0;
        this.target = typeof el == 'object' ? el : $(el);
        this.options = {
            form: $('form')[0],
            url: '', //post url,
            data: {},
            type: 0,            //0产品图片 1商家头像
            onAbort: null, //中断上传
            onError: null,
            onLoadStart: null,
            onProgress: null, //进度显示
            onLoad: null,
            onLoadEnd: null
        };

        for (var i in options) {
            this.options[i] = options[i];
        }

        window.URL = window.URL || window.webkitURL;
        
    }

    EasyUpload.prototype = {

        tempFiles: [],
        /**
        * 没有base64数据，需要再用filereader来读取的，一般是网页调用
        * limit       上传上限数量
        *
        */
        upload: function(limit, limitCallback, typeCallback) { //开始上传文件
            var _files = this.target.get(0).files;
            if (_files.length > limit) {
                if (limitCallback) {
                    limitCallback();
                }
            } else {
                this._getFiles(_files, typeCallback);
                this._sendFiles();
            }
        },
        /**
        * 已拿到base64数据，一般是hybrid调用的方法
        * imageDatas  base64数据的数组
        * limit       上传上限数量
        *
        */
        uploadBase64: function(imageDatas,limit, limitCallback, typeCallback){
            if (imageDatas.length > limit) {
                if (limitCallback) {
                    limitCallback();
                }
            } else {
                this._fileUploadBase64(imageDatas);
            }       
        },
        //读取实际文件，一般是网页调用
        _getFiles: function(files, typeCallback) {
            this.tempFiles = [];
            if (!files) {
                alert('没选择文件...');
            } else {
                var imageType = /.jpeg|.png|.gif|.jpg/;
                var fileMaxSize = 5000000;
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    //fixed by ling 有些浏览器没有file.type，这些浏览器只用大小来限制一下。。。
                    if ( (file.size>=fileMaxSize) || ( file.type && !file.type.match(imageType)) ) {
                        if (typeCallback) {
                            typeCallback();
                        }
                        continue;
                    }
                    var src = window.URL.createObjectURL(file);
                    window.URL.revokeObjectURL(this.src);
                    file.src = src;
                    console.log("file.src="+src);
                    this.tempFiles.push(file);
                }
            }
            return this.tempFiles;
        },

        _sendFiles: function() { //执行上传
            for (var i = 0; i < this.tempFiles.length; i++) {
                // var date = '' + new Date().getTime(),
                //     timer = date.substring(1, 3) + date.substring(9);
                this._fileUpload(this.tempFiles[i]);
            }
        },

        //hybrid端调用具体上传逻辑
        _fileUploadBase64: function(files) {
            var that = this;
                xhr = new XMLHttpRequest();

            xhr.onreadystatechange = function() {
                if (xhr.readyState === 1) { //开始上传时触发
                    if (that.options.onLoadStart) that.options.onLoadStart.call(that);
                }else if(xhr.readyState === 4){
                    clearTimeout(that.timeOut);
                    //alert(xhr.responseText)
                    if (that.options.onLoad) {
                        that.options.onLoad(null, xhr.responseText,files[that.counter]);
                    }
                    that.counter++;

                    if (that.counter >= files.length) {
                        if (that.options.onLoadEnd) 
                            that.options.onLoadEnd(files.length);
                        that.counter = 0;
                    }else if(that.counter < files.length) {
                        // var jsonData = JSON.stringify({
                        //     Head: that.options.data,
                        //     ImageData: files[that.counter]
                        // });
                        // xhr.open("POST", that.options.url, true);
                        // xhr.readyState = 0;
                        // xhr.send(jsonData);
                        that._fileUploadBase64(files);
                    }
                }
            }
            this._checkTimeout(xhr);
            xhr.open("POST", that.options.url, true);
            xhr.setRequestHeader("Content-Type","application/json"); 

            var jsonData = JSON.stringify({
                Head: that.options.data,
                Picdata: files[that.counter],
                TypeID: 1,
                AppID: 1,
                BSync: false
            });
            xhr.send(jsonData);

            return that;
        },

        /**
         * 设置超时
         * @param  {[type]} xhr [description]
         * @return {[type]}     [description]
         */
        _checkTimeout:function(xhr){
            var that = this;
            this.timeOut = setTimeout(function(){
                if (xhr)  
                    xhr.abort();
                if(that.options.onTimeout){
                    that.options.onTimeout(that);
                    that._clear();
                }
            },TIME_OUT);
        },

        //web端调用具体上传逻辑
        _fileUpload: function(file) {
            var that = this,
                reader = new FileReader(),
                xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 1) { //开始上传时触发
                    if (that.options.onLoadStart) that.options.onLoadStart.call(that);
                }else if(xhr.readyState === 4){
                    if (that.counter >= that.tempFiles.length) {
                        if (that.options.onLoadEnd) 
                            that.options.onLoadEnd(that.tempFiles.length);
                        that.counter = 0;
                    }
                    clearTimeout(that.timeOut);
                }
            }
            this._checkTimeout(xhr);
            xhr.open("POST", that.options.url, true);
            xhr.setRequestHeader("Content-Type","application/json"); 

            reader.readAsDataURL(file);
            reader.onload = function(evt) {
                var target = evt.target;
                var trueData = target.result.replace(/^(data:){1}\w+\/{1}\w+(;base64,){1}/, '');
                trueData = trueData.replace('data:base64,','');
                var jsonData = JSON.stringify({
                    Head: that.options.data,
                    Picdata: trueData,
                    TypeID: 1,
                    AppID: 1,
                    BSync: false
                });
                xhr.send(jsonData);
            };
            xhr.timeout = TIME_OUT;
            xhr.ontimeout = function(event){
                if(that.options.onTimeout){
                    that.options.onTimeout(that);
                    that._clear();
                }
        　　}
            xhr.onabort = function() {};
            xhr.onerror = function() {};
            xhr.onloadstart = function() {}; //不可用的
            xhr.onprogress = function() {}; //不可用的
            xhr.onload = function(response) {
                var res = response.currentTarget.response;
                if (that.options.onLoad) {
                    that.options.onLoad(file, res);
                }
            };
            xhr.onloadend = function() {
                that.counter++
                if (that.counter === that.tempFiles.length) {
                    if (that.options.onLoadEnd) that.options.onLoadEnd(that.tempFiles.length);
                    that.counter = 0;
                }
            };

            return that;
        },

        /**
         * 清除前一次内容
         * @return {[type]} [description]
         */
        _clear:function(){
            this.counter = 0;
        }
    };

    return EasyUpload;

});
