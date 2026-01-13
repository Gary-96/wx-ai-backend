const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// 👇 【重要】这里填你在硅基流动 (SiliconFlow) 申请的 sk- 开头的 Key
// 必须保留引号！
const API_KEY = 'sk-slqcohtdnfbnbxooekhluhqkuaiwkyfftomogzqvnyyaddse'; 

app.post('/generate', async (req, res) => {
  try {
    const { topic, style } = req.body;
    console.log(`收到请求：${topic} - ${style}`);

    const response = await axios.post('https://api.siliconflow.cn/v1/chat/completions', {
        model: "deepseek-ai/DeepSeek-V3", // ✅ 硅基流动专用名字
        messages: [
          {"role": "system", "content": "你是一个资深小红书运营，请写出emoji丰富、分段清晰、语气夸张的爆款文案。"},
          {"role": "user", "content": `请用${style}的语气，写一篇关于"${topic}"的笔记。`}
        ],
        stream: false,
        max_tokens: 512
      }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      timeout: 10000 // 设置10秒超时
    });

    const aiText = response.data.choices[0].message.content;
    res.send({ code: 0, data: aiText });

  } catch (error) {
    // 打印真实错误，不再隐藏
    console.error("AI报错:", error.response ? error.response.data : error.message);
    res.send({ code: -1, error: "服务繁忙，请检查Key或余额" });
  }
});

const port = process.env.PORT || 80;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
