const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// 你的 AI 接口地址 (DeepSeek)
const AI_API_URL = 'https://api.siliconflow.cn/v1/chat/completions';
const API_KEY = 'sk-slqcohtdnfbnbxooekhluhqkuaiwkyfftomogzqvnyyaddse'; // 去硅基流动后台复制

app.post('/generate', async (req, res) => {
  try {
    const { topic, style } = req.body;
    
    // --- 🔥 核心改动：这里就是“灵魂注入”的地方 ---
    
    // 1. 定义人设：根据用户选的风格，切换 AI 的面具
    let roleDescription = "";
    if (style === '毒舌吐槽') {
      roleDescription = `
        你是一个嘴巴很毒、眼光极准的互联网观察员。
        语气要求：犀利、反讽、一针见血，带点傲娇。
        常用词： "笑死"、"这就破防了？"、"也就是..."、"避雷"。
        任务：针对"${topic}"进行吐槽，要让读者觉得"骂得太对了"。
      `;
    } else if (style === '温柔治愈') {
      roleDescription = `
        你是一个拥有百万粉丝的情感博主，或者是深夜电台主播。
        语气要求：温暖、柔软、有画面感，像在和闺蜜轻声细语。
        常用词： "小确幸"、"治愈"、"拥抱"、"慢慢来"。
        任务：针对"${topic}"写一段治愈文案，安抚读者的焦虑。
      `;
    } else {
      // 默认为疯狂种草
      roleDescription = `
        你是一个购物狂魔，也是小红书带货女王。
        语气要求：情绪极其激动，感叹号要多！表现出"相见恨晚"的感觉。
        常用词： "绝绝子"、"按头安利"、"无限回购"、"氛围感拉满"。
        任务：针对"${topic}"进行疯狂推荐，让读者觉得"不买就是亏"。
      `;
    }

    // 2. 定义硬性规则 (SOP)：这决定了排版好不好看
    const systemPrompt = `
      ${roleDescription}
      
      【必须遵守的排版规则】：
      1. 标题：必须是"标题党"，包含数字、悬念或强烈情绪（单独一行）。
      2. 正文：多分段，每段不超过2行，阅读体验要轻松。
      3. 表情：全文必须穿插大量Emoji表情（🐱✨🔥），至少10个以上。
      4. 互动：结尾必须抛出一个问题，引导用户评论。
      5. 标签：文末自动生成5个相关的流量标签（#xxx）。
      
      请直接输出最终文案，不要说"好的"、"以下是文案"这种废话。
    `;

    console.log(`正在请求AI，风格：${style}，主题：${topic}`);

    // --- 发送请求 ---
    const response = await axios.post(AI_API_URL, {
        model: "deepseek-ai/DeepSeek-V3", // ✅ 必须一字不差
        messages: [
          // System: 设定后台规则
          {"role": "system", "content": systemPrompt},
          // User: 用户的具体输入
          {"role": "user", "content": `请写一篇关于"${topic}"的笔记。`}
        ],
        temperature: 1.3 // 🔥 把温度调高，让 AI 更活跃、更有创造力（默认是1.0）
      }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      }
    });

    const aiText = response.data.choices[0].message.content;
    res.send({ code: 0, data: aiText });

  } catch (error) {
    console.error("AI调用失败:", error);
    
    // 获取详细的错误信息
    const errorDetail = error.response ? JSON.stringify(error.response.data) : error.message;
    
    // 直接把错误发回给小程序，这样你就能在控制台看到了！
    res.send({ 
      code: -1, 
      error: 'AI拒绝服务: ' + errorDetail 
    });
  }
