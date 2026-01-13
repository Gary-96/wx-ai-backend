const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// 👇 填你的 Key
const API_KEY = 'sk-slqcohtdnfbnbxooekhluhqkuaiwkyfftomogzqvnyyaddse'; 

app.post('/generate', async (req, res) => {
  try {
    const { topic, style } = req.body;
    console.log(`收到请求：${topic} - ${style}`);

    const response = await axios.post('https://api.siliconflow.cn/v1/chat/completions', {
        model: "deepseek-ai/DeepSeek-V3", 
        messages: [
          {"role": "system", "content": "你是一个资深小红书运营。请直接输出文案内容，不要输出'好的'等废话。控制在200字以内，重点突出，表情丰富。"},
          {"role": "user", "content": `请用${style}的语气，写一篇关于"${topic}"的笔记。`}
        ],
        stream: false,
        max_tokens: 300 // 🔥 限制生成长度：字数越少，速度越快！
      }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      timeout: 60000 // 🔥 超时改为 60秒！给 AI 足够的时间思考
    });

    const aiText = response.data.choices[0].message.content;
    res.send({ code: 0, data: aiText });

  } catch (error) {
    console.error("AI报错:", error.response ? error.response.data : error.message);
    const errorMsg = error.code === 'ECONNABORTED' ? 'AI思考超时，请重试' : '服务繁忙';
    res.send({ code: -1, error: errorMsg });
  }
});

const port = process.env.PORT || 80;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
