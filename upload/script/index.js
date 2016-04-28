define(['jquery', 'underscore','backbone','uploadImg','showImages'],function($, _, Backbone,EasyUpload,ShowImages){

     var imageView=Backbone.View.extend({
     	el:$("body"),
     	events:{
           "change .js_img_upload":"imgUpLoad",
            "click .upload_img":"toDetailImage",
            'click .js_close': 'toClose',
            'click .dump': 'removeImg',
            "click #spanTest":"test",
            "click #btnTest":"test"
     	},
     	initialize:function(){
          this.render();
          // $("#uploadul").delegate(".upload_img","click",this.toDetailImage($(this)));
           // window.addEventListener('load', function () {
           //      FastClick.attach(document.body);
           //  }, false);
     	},

     	render:function(){
          this.initUpload();
           //触发键盘
            $("#content").on("click", function () {
                $(this).focus();
            })
            $("#content").trigger("click");
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
        },

        toDetailImage:function(e){
        	//alert("start");
           var el = e.currentTarget, self = this,
                uiscroller = $(el).parents('.upload_photos'),
                imgList = $(uiscroller).find(".upload_img"),

                imageIndex = imgList.index($(el)),
                ImageList = [],
                i;
            this.imgIndex = imageIndex;
            imgList.each(function () {
                var v = {};
                // var imgSrc = $(this).attr("data-src").replace(/_R_(300|600)_10000.jpg/g, ".jpg");
                var imgSrc = $(this).attr("src");
                // if (appAgent.isHybrid()) {
                //     v.url = encodeURIComponent(imgSrc);
                // } else {
                //     v.src = imgSrc;
                // }
                v.src=imgSrc;
                console.log("v.src="+imgSrc);
                ImageList.push(v);
            });



            var imageData = {
                "current_index": imageIndex + 1,
                "total_count": imgList.length
            };

            //配置轮播图
            var imgs = [];
            imgList.each(function () {
                // var imgSrc = $(this).attr("data-src").replace(/_R_(300|600)_10000.jpg/g, ".jpg");
                var imgSrc = $(this).attr("src");
                imgs.push(imgSrc);
            });

            //this.header.hide();
            ShowImages.init({
                "imgsUrl": imgs,
                "detail": "",
                "currentImg": imageIndex
            });
        },
         toClose: function (e) {
            //this.header.show();
            $(".appue_scale").css({
                "display": "none"
            });
            $(".appue_scale ul").html("");
        },
        removeImg: function (e) {
            var liList = this.$el.find("#uploadul li");
            liList.eq(this.imgIndex + 1).remove();
            this.toClose();
        },
        test:function(){
        	alert("test click");
        }
     });
    return imageView;
});