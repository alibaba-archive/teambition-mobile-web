/// <reference path="../interface/teambition.d.ts" />
module teambition {
  'use strict';

  export interface IEmojiParser {
    replaceMd: (mdStr: any) => string;
    replace: (str: string) => string;
  }

  angular.module('teambition').factory('emojiParser', () => {
    const ALL_EMOJIS = [
      {
        'src': 'd_hehe',
        'content': '[微笑]'
      }, {
        'src': 'd_xixi',
        'content': '[嘻嘻]'
      }, {
        'src': 'd_haha',
        'content': '[哈哈]'
      }, {
        'src': 'd_aini',
        'content': '[爱你]'
      }, {
        'src': 'd_wabishi',
        'content': '[挖鼻]'
      }, {
        'src': 'd_chijing',
        'content': '[吃惊]'
      }, {
        'src': 'd_yun',
        'content': '[晕]'
      }, {
        'src': 'd_lei',
        'content': '[泪]'
      }, {
        'src': 'd_chanzui',
        'content': '[馋嘴]'
      }, {
        'src': 'd_zhuakuang',
        'content': '[抓狂]'
      }, {
        'src': 'd_heng',
        'content': '[哼]'
      }, {
        'src': 'd_keai',
        'content': '[可爱]'
      }, {
        'src': 'd_nu',
        'content': '[怒]'
      }, {
        'src': 'd_han',
        'content': '[汗]'
      }, {
        'src': 'd_haixiu',
        'content': '[害羞]'
      }, {
        'src': 'd_shuijiao',
        'content': '[睡]'
      }, {
        'src': 'd_qian',
        'content': '[钱]'
      }, {
        'src': 'd_touxiao',
        'content': '[偷笑]'
      }, {
        'src': 'd_xiaoku',
        'content': '[笑cry]'
      }, {
        'src': 'd_doge',
        'content': '[doge]'
      }, {
        'src': 'd_miao',
        'content': '[喵喵]'
      }, {
        'src': 'd_ku',
        'content': '[酷]'
      }, {
        'src': 'd_shuai',
        'content': '[衰]'
      }, {
        'src': 'd_bizui',
        'content': '[闭嘴]'
      }, {
        'src': 'd_bishi',
        'content': '[鄙视]'
      }, {
        'src': 'd_huaxin',
        'content': '[色]'
      }, {
        'src': 'd_guzhang',
        'content': '[鼓掌]'
      }, {
        'src': 'd_beishang',
        'content': '[悲伤]'
      }, {
        'src': 'd_sikao',
        'content': '[思考]'
      }, {
        'src': 'd_shengbing',
        'content': '[生病]'
      }, {
        'src': 'd_qinqin',
        'content': '[亲亲]'
      }, {
        'src': 'd_numa',
        'content': '[怒骂]'
      }, {
        'src': 'd_taikaixin',
        'content': '[太开心]'
      }, {
        'src': 'd_landelini',
        'content': '[白眼]'
      }, {
        'src': 'd_youhengheng',
        'content': '[右哼哼]'
      }, {
        'src': 'd_zuohengheng',
        'content': '[左哼哼]'
      }, {
        'src': 'd_xu',
        'content': '[嘘]'
      }, {
        'src': 'd_weiqu',
        'content': '[委屈]'
      }, {
        'src': 'd_tu',
        'content': '[吐]'
      }, {
        'src': 'd_kelian',
        'content': '[可怜]'
      }, {
        'src': 'd_dahaqi',
        'content': '[哈欠]'
      }, {
        'src': 'd_jiyan',
        'content': '[挤眼]'
      }, {
        'src': 'd_shiwang',
        'content': '[失望]'
      }, {
        'src': 'd_ding',
        'content': '[顶]'
      }, {
        'src': 'd_yiwen',
        'content': '[疑问]'
      }, {
        'src': 'd_kun',
        'content': '[困]'
      }, {
        'src': 'd_ganmao',
        'content': '[感冒]'
      }, {
        'src': 'd_baibai',
        'content': '[拜拜]'
      }, {
        'src': 'd_heixian',
        'content': '[黑线]'
      }, {
        'src': 'd_yinxian',
        'content': '[阴险]'
      }, {
        'src': 'd_dalian',
        'content': '[打脸]'
      }, {
        'src': 'd_shayan',
        'content': '[傻眼]'
      }, {
        'src': 'f_hufen',
        'content': '[互粉]'
      }, {
        'src': 'l_xin',
        'content': '[心]'
      }, {
        'src': 'l_shangxin',
        'content': '[伤心]'
      }, {
        'src': 'd_zhutou',
        'content': '[猪头]'
      }, {
        'src': 'd_xiongmao',
        'content': '[熊猫]'
      }, {
        'src': 'd_tuzi',
        'content': '[兔子]'
      }, {
        'src': 'h_woshou',
        'content': '[握手]'
      }, {
        'src': 'h_zuoyi',
        'content': '[作揖]'
      }, {
        'src': 'h_zan',
        'content': '[赞]'
      }, {
        'src': 'h_ye',
        'content': '[耶]'
      }, {
        'src': 'h_good',
        'content': '[good]'
      }, {
        'src': 'h_ruo',
        'content': '[弱]'
      }, {
        'src': 'h_buyao',
        'content': '[NO]'
      }, {
        'src': 'h_ok',
        'content': '[ok]'
      }, {
        'src': 'h_haha',
        'content': '[haha]'
      }, {
        'src': 'h_lai',
        'content': '[来]'
      }, {
        'src': 'h_quantou',
        'content': '[拳头]'
      }, {
        'src': 'f_v5',
        'content': '[威武]'
      }, {
        'src': 'w_xianhua',
        'content': '[鲜花]'
      }, {
        'src': 'o_zhong',
        'content': '[钟]'
      }, {
        'src': 'w_fuyun',
        'content': '[浮云]'
      }, {
        'src': 'o_feiji',
        'content': '[飞机]'
      }, {
        'src': 'w_yueliang',
        'content': '[月亮]'
      }, {
        'src': 'w_taiyang',
        'content': '[太阳]'
      }, {
        'src': 'w_weifeng',
        'content': '[微风]'
      }, {
        'src': 'w_xiayu',
        'content': '[下雨]'
      }, {
        'src': 'f_geili',
        'content': '[给力]'
      }, {
        'src': 'f_shenma',
        'content': '[神马]'
      }, {
        'src': 'o_weiguan',
        'content': '[围观]'
      }, {
        'src': 'o_huatong',
        'content': '[话筒]'
      }, {
        'src': 'd_aoteman',
        'content': '[奥特曼]'
      }, {
        'src': 'd_shenshou',
        'content': '[草泥马]'
      }, {
        'src': 'f_meng',
        'content': '[萌]'
      }, {
        'src': 'f_jiong',
        'content': '[囧]'
      }, {
        'src': 'f_zhi',
        'content': '[织]'
      }, {
        'src': 'o_liwu',
        'content': '[礼物]'
      }, {
        'src': 'f_xi',
        'content': '[喜]'
      }, {
        'src': 'o_weibo',
        'content': '[围脖]'
      }, {
        'src': 'o_yinyue',
        'content': '[音乐]'
      }, {
        'src': 'o_lvsidai',
        'content': '[绿丝带]'
      }, {
        'src': 'o_dangao',
        'content': '[蛋糕]'
      }, {
        'src': 'o_lazhu',
        'content': '[蜡烛]'
      }, {
        'src': 'o_ganbei',
        'content': '[干杯]'
      }, {
        'src': 'd_nanhaier',
        'content': '[男孩儿]'
      }, {
        'src': 'd_nvhaier',
        'content': '[女孩儿]'
      }, {
        'src': 'd_feizao',
        'content': '[肥皂]'
      }, {
        'src': 'o_zhaoxiangji',
        'content': '[照相机]'
      }, {
        'src': 'd_lang',
        'content': '[浪]'
      }, {
        'src': 'w_shachenbao',
        'content': '[沙尘暴]'
      }, {
        'src': 'd_zuiyou',
        'content': '[最右]'
      }
    ];
    const START_TOKEN = '[';
    const END_TOKEN = ']';
    const EMOJI_STATE = 'emoji';
    const NORMAL_STATE = 'normal';

    let scanString = (str: string, callback: (key: string) => string) => {
      let result = '';
      let emojiKey = '';
      let state = NORMAL_STATE;
      for (let index = 0; index < str.length; index++) {
        let token = str.charAt(index);
        if (token === START_TOKEN) {
          emojiKey = token;
          state = EMOJI_STATE;
        }else if (token === END_TOKEN && state === EMOJI_STATE) {
          result += callback(emojiKey + token);
          emojiKey = '';
          state = NORMAL_STATE;
        }else if (state === EMOJI_STATE) {
          emojiKey += token;
        }else {
          result += token;
        }
      }
      return result;
    };

    return {
      replaceMd: (mdStr: string) => {
        if (mdStr && mdStr.length) {
          let emojiMap = {};
          angular.forEach(ALL_EMOJIS, (emoji: {src: string, content: string}) => {
            emojiMap[emoji.content] = emoji.src;
          });
          return scanString(mdStr, (key: string) => {
            let src = emojiMap[key];
            if (src) {
              return ` ![emoji](${cdnHost}/teambition/images/emoji/${src}@2x.png) `;
            }else {
              return key;
            }
          });
        }else {
          return mdStr;
        }
      },
      replace: (str: string) => {
        if (str.length) {
          let emojiMap = {};
          angular.forEach(ALL_EMOJIS, (emoji: {src: string, content: string}) => {
            emojiMap[emoji.content] = emoji.src;
          });
          return scanString(str, (key: string) => {
            let src = emojiMap[key];
            if (src) {
              return `<img class='emoji' src='${cdnHost}/teambition/images/emoji/${src}@2x.png' alt='${key}'/>`;
            }else {
              return key;
            }
          });
        }else {
          return str;
        }
      }
    };
  });
}
