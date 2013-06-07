assert = require('assert');
vows = require('vows');
request = require('request');
app = require('../../smileplug');

PORT = 3001;
BASE_URL = "http://localhost:" + PORT;

HEADERS_JSON = {
    'Content-Type' : 'application/json'
};

HEADERS_CSV = {
    'Content-Type' : 'text/csv'
};

HEADERS_ENCODED = {
    'Content-Type' : 'application/x-www-form-urlencoded'
};

var csv = "question,choice1,choice2,choice3,choice4,has_image,answers\n 日本で２番目に高い山は？,富士山,八甲田山,北岳,奥高千穂岳,,Choice3\n 原爆が最初に投下された都市,バクダッド,広島,チェルノブイリ,長崎,,Choice2\n ドラえもんが生まれた年,1998,2001,2000,2012,,Choice4\n 阿蘇山がある県,熊本県,宮崎県,福岡県,鹿児島県,,Choice1\n 工藤静香のおニャン子会員番号,16,40,38,5,,Choice3\n ねぶた祭の開催都市,新潟,青森,山形,静岡,,Choice2\n ジャガイモの別名,セロリ,馬鈴薯,牛蒡,カリフラワー,,Choice2\n ひみつのアッコちゃんの作者,赤塚不二夫,石森章太郎,藤子不二雄,土田よしこ,,Choice1\n 松田聖子の出身地,埼玉,久留米,小樽,下関,,Choice2";
var suite = vows.describe('Tests "Questions as CSV"');

suite.addBatch({
    "startup" : function() {
        app.runServer(PORT);
    }
});

suite.addBatch({
    "A POST to /smile/question/csv with questions as csv" : {
        topic : function() {
            request({
                uri : BASE_URL + '/smile/question/csv',
                method : 'POST',
                headers : HEADERS_CSV,
                body : csv,
            }, this.callback);
        },
        "should respond with 200" : function(err, res, body) {
            assert.equal(res.statusCode, 200);
        },
        "should answer with ok" : function(err, res, body) {
            assert.equal(res.body, "OK");
        },
    }
});

suite.addBatch({
    "A GET to /smile/question should return a list containing the posted questions" : {
        topic : function() {
            request({
                uri : BASE_URL + '/smile/question',
                method : 'GET'
            }, this.callback);
        },
        "should have registered the questions" : function(err, res, body) {
            var obj = {};
            obj['teacher'] = [ {
                NAME : 'teacher',
                Q : '日本で２番目に高い山は？',
                O1 : '富士山',
                O2 : '八甲田山',
                O3 : '北岳',
                O4 : '奥高千穂岳',
                A : 'Choice3',
                TYPE : 'QUESTION'
            }, {
                NAME : 'teacher',
                Q : '原爆が最初に投下された都市',
                O1 : 'バクダッド',
                O2 : '広島',
                O3 : 'チェルノブイリ',
                O4 : '長崎',
                A : 'Choice2',
                TYPE : 'QUESTION'
            }, {
                NAME : 'teacher',
                Q : 'ドラえもんが生まれた年',
                O1 : '1998',
                O2 : '2001',
                O3 : '2000',
                O4 : '2012',
                A : 'Choice4',
                TYPE : 'QUESTION'
            }, {
                NAME : 'teacher',
                Q : '阿蘇山がある県',
                O1 : '熊本県',
                O2 : '宮崎県',
                O3 : '福岡県',
                O4 : '鹿児島県',
                A : 'Choice1',
                TYPE : 'QUESTION'
            }, {
                NAME : 'teacher',
                Q : '工藤静香のおニャン子会員番号',
                O1 : '16',
                O2 : '40',
                O3 : '38',
                O4 : '5',
                A : 'Choice3',
                TYPE : 'QUESTION'
            }, {
                NAME : 'teacher',
                Q : 'ねぶた祭の開催都市',
                O1 : '新潟',
                O2 : '青森',
                O3 : '山形',
                O4 : '静岡',
                A : 'Choice2',
                TYPE : 'QUESTION'
            }, {
                NAME : 'teacher',
                Q : 'ジャガイモの別名',
                O1 : 'セロリ',
                O2 : '馬鈴薯',
                O3 : '牛蒡',
                O4 : 'カリフラワー',
                A : 'Choice2',
                TYPE : 'QUESTION'
            }, {
                NAME : 'teacher',
                Q : 'ひみつのアッコちゃんの作者',
                O1 : '赤塚不二夫',
                O2 : '石森章太郎',
                O3 : '藤子不二雄',
                O4 : '土田よしこ',
                A : 'Choice1',
                TYPE : 'QUESTION'
            }, {
                NAME : 'teacher',
                Q : '松田聖子の出身地',
                O1 : '埼玉',
                O2 : '久留米',
                O3 : '小樽',
                O4 : '下関',
                A : 'Choice2',
                TYPE : 'QUESTION'
            } ];
            assert.equal(JSON.stringify(obj), res.body);
        },
    }
});

suite.addBatch({
    "shutdown" : function() {
        app.close();
    }
});

suite.run();
