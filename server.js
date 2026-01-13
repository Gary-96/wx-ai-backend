const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// 这里是 AI 的接口地址，以 DeepSeek 为例
const AI_API_URL = 'https://api.deepseek.com/chat/completions'; 
// 从环境变量获取 Key，不要直接写死在代码里，安全！
const API_KEY = process.env.AI_API_KEY; 

app.post('/generate', async (req, res) => {
  try {
    const { topic, style } = req.body; // 从小程序前端接收 topic(主题) 和 style(风格)
    
    // 构造提示词 (Prompt Engineering)
    const prompt = `你是一个资深小红书运营。请用"${style}"的风格，为主题"${topic}"写一篇爆款笔记。要求：标题吸引人，包含emoji，正文分段清晰。`;

    const response = await axios.post(AI_API_URL, {
        model: "deepseek-chat", // 模型名称
        messages: [
          {"role": "system", "content": "You are a helpful assistant."},
          {"role": "user", "content": prompt}
        ],
        stream: false
      }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      }
    });

    // 返回 AI 的结果
    const aiText = response.data.choices[0].message.content;
    res.send({ code: 0, data: aiText });

  } catch (error) {
    console.error(error);
    res.send({ code: -1, error: '生成失败，请稍后再试' });
  }
});

// 微信云托管通常监听 80 端口
const port = process.env.PORT || 80;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
