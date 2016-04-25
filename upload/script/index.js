define(['jquery', 'underscore','backbone','uploadImg'],function($, _, Backbone,EasyUpload){

     var imageView=Backbone.View.extend({
     	el:$("body"),
     	events:{
           "click .js_img_upload":"imgUpLoad"
     	},
     	initialize:function(){
          this.render();
     	},

     	render:function(){
          this.initUpload();
     	},

     	 initUpload: function () {
            var _this = this;
            if (typeof FileReader === 'undefined') {
                alert('抱歉，你的浏览器不支持图片上传');
                $('#uploadForm').hide();
            } else {
                _this.easyUpload = null;
                _this.easyUpload = new EasyUpload('.js_img_upload', {
                    form: $('#uploadForm'),
                    url: "http://m.ctrip.com/restapi/soa2/11270/LPPhotoUpload",
                    data: function () {
                        function getAuth() {
                            var auth = localStorage.getItem('USERINFO', "Auth");
                            return auth;
                        };
                        return {
                            "syscode": "09",
                            "lang": "01",
                            "auth": getAuth(),
                            "cver": "1.0"
                        }
                    }(),
                    type: 1,
                    onAbort: function () {  },
                    onError: function () {  },
                    onTimeout: function (obj) {
                       alert("请求失败，请重试");
                    },
                    onLoadStart: function () {
                       
                    },
                    onProgress: function () { },
                    onLoad: function (file, response, base64data) {
                        var res = $.parseJSON(response);
                        if (res.ResponseStatus.Ack == "Success") {
                            /*file.src 为图片地址 res.ImageId为图片ID*/
                            if (file !== null && file.src !== null) {
                                var oLi = document.createElement('li');
                                var oImg = document.createElement('img');
                                console.log(file.src);
                                oImg.src = file.src;
                                oImg.style.width = '50px';
                                oImg.style.height = '50px';
                                oImg.className = 'upload_img';
                                oImg.setAttribute("data-id",res.Result);
                                oLi.className = "img_temp";
                                oLi.appendChild(oImg);
                                oLi.imageid = res.Result;
                                var oUl = document.getElementById('uploadul');
                                $('.upload_photo .text').hide();
                                oUl.appendChild(oLi);
                            } else if (base64data !== null) {
                                $('.upload_photo .text').hide();
                                $('#uploadul').append('<li class="img_temp"><img class="upload_img" src="' + 'data:image/png;base64,' + base64data + '" style="height:50px; width:50px;"  data-id="' + res.Result+'"></li>');
                                $('#uploadul li').last()[0].imageid = res.Result;
                            }
                        } else {
                            alert("请求失败，请重试");
                        };

                       // $('.').attr('data-id', res.ImageId);
                       // Lizard.hideLoading();
                        var n = document.getElementById('uploadul').children.length;
                        if (n > 5) {
                            $('.js_upload_photo').css('display', 'none');
                        };
                    }
                });
            }
        },

        imgUpLoad:function(e){
        	var _this=this,
        	  max=5,
        	  n=document.getElementById("uploadul").children.length-1,
        	  dis=max-n;

        	  _this.easyUpload.upload(dis,function(){
        	  	 alert("最多只可以上传5张图片");
        	  },function(){
        	  	alert("当前上传的图片格式不正确");
        	  });
        }
     });
    return imageView;
});